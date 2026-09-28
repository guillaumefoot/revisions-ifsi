const SHELL_CACHE_NAME = "ifsi-quiz-v5.2";
const QUIZ_CACHE_NAME = "ifsi-quiz-content-v1";
const APP_SCOPE = "/revisions-ifsi/";
const APP_SHELL = [
  APP_SCOPE,
  `${APP_SCOPE}index.html`,
  `${APP_SCOPE}manifest.json`,
  `${APP_SCOPE}sw.js`,
  `${APP_SCOPE}icons/icon-192.png`,
  `${APP_SCOPE}icons/icon-512.png`,
  `${APP_SCOPE}quizzes.json`,
];

const inFlightQuizFetches = new Map();
const syncPorts = new Set();
let activeQuizSync = null;
let latestSyncState = null;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("ifsi-quiz-v") && key !== SHELL_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE_NAME));
    return;
  }

  if (url.pathname.startsWith(`${APP_SCOPE}data/`) && url.pathname.endsWith(".json")) {
    event.respondWith(quizCacheFirst(request, event));
    return;
  }

  if (url.pathname.endsWith(".json")) {
    event.respondWith(networkFirst(request, SHELL_CACHE_NAME));
    return;
  }

  event.respondWith(cacheFirst(request));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_ACTIVE_QUIZZES") return;

  const port = event.ports?.[0];
  if (!port) return;

  syncPorts.add(port);
  port.start?.();

  if (activeQuizSync) {
    if (latestSyncState) port.postMessage(latestSyncState);
    event.waitUntil(activeQuizSync);
    return;
  }

  activeQuizSync = syncActiveQuizzes(event.data.files, event.data.catalogUrl)
    .catch((error) => {
      publishSyncState({ type: "QUIZ_CACHE_ERROR", message: error.message });
    })
    .finally(() => {
      activeQuizSync = null;
      latestSyncState = null;
      syncPorts.clear();
    });

  event.waitUntil(activeQuizSync);
});

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === "navigate") {
      const fallback = await caches.match(`${APP_SCOPE}index.html`);
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const fresh = await fetch(request, { cache: "no-store" });
    if (!fresh.ok) throw new Error(`HTTP ${fresh.status}`);
    await cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    return cached || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function quizCacheFirst(request, event) {
  const cache = await caches.open(QUIZ_CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  if (cached) {
    event.waitUntil(fetchAndCacheQuiz(request.url).catch(() => null));
    return cached;
  }

  try {
    return await fetchAndCacheQuiz(request.url);
  } catch (error) {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function fetchAndCacheQuiz(url) {
  let job = inFlightQuizFetches.get(url);

  if (!job) {
    job = (async () => {
      const response = await fetchWithTimeout(url, { cache: "no-cache" }, 12000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const cache = await caches.open(QUIZ_CACHE_NAME);
      await cache.put(url, response.clone());
      return response;
    })().finally(() => inFlightQuizFetches.delete(url));

    inFlightQuizFetches.set(url, job);
  }

  const response = await job;
  return response.clone();
}

async function syncActiveQuizzes(files, catalogUrl) {
  const urls = [...new Set((Array.isArray(files) ? files : [])
    .map((file) => {
      try {
        return new URL(file, self.registration.scope);
      } catch (error) {
        return null;
      }
    })
    .filter((url) =>
      url &&
      url.origin === self.location.origin &&
      url.pathname.startsWith(`${APP_SCOPE}data/`) &&
      url.pathname.endsWith(".json")
    )
    .map((url) => url.href))];

  const probeUrl = new URL(catalogUrl || `${APP_SCOPE}quizzes.json`, self.location.origin);
  probeUrl.searchParams.set("offline_probe", String(Date.now()));

  try {
    const probe = await fetchWithTimeout(probeUrl.href, { cache: "no-store" }, 8000);
    if (!probe.ok) throw new Error(`HTTP ${probe.status}`);
  } catch (error) {
    publishSyncState({ type: "QUIZ_CACHE_OFFLINE" });
    return;
  }

  publishSyncState({ type: "QUIZ_CACHE_STARTED", completed: 0, total: urls.length });

  let cursor = 0;
  let completed = 0;
  const failures = [];
  const workerCount = Math.min(6, Math.max(1, urls.length));

  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        await fetchAndCacheQuiz(url);
      } catch (error) {
        failures.push(url);
      }

      completed += 1;
      publishSyncState({
        type: "QUIZ_CACHE_PROGRESS",
        completed,
        total: urls.length,
        failed: failures.length,
      });
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (failures.length === 0) {
    await removeInactiveQuizFiles(new Set(urls));
  }

  publishSyncState({
    type: "QUIZ_CACHE_COMPLETE",
    completed,
    total: urls.length,
    failed: failures.length,
  });
}

async function removeInactiveQuizFiles(activeUrls) {
  const cache = await caches.open(QUIZ_CACHE_NAME);
  const cachedRequests = await cache.keys();
  await Promise.all(
    cachedRequests
      .filter((request) => !activeUrls.has(request.url))
      .map((request) => cache.delete(request))
  );
}

function publishSyncState(message) {
  latestSyncState = message;
  syncPorts.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      syncPorts.delete(port);
    }
  });
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
