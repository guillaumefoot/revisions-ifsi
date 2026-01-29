const CACHE_NAME = "ifsi-quiz-v2.0";
const APP_SHELL = [
  "/revisions-ifsi/",
  "/revisions-ifsi/index.html",
  "/revisions-ifsi/manifest.json",
  "/revisions-ifsi/sw.js",
  "/revisions-ifsi/icons/icon-192.png",
  "/revisions-ifsi/icons/icon-512.png",
  "/revisions-ifsi/quizzes.json" // ton fichier qui liste les packs
];

// Install: cache l'app “de base”
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: nettoyage d'anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: JSON = network-first, le reste = cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // On ne gère que ton domaine (évite soucis avec CDNs externes)
  if (url.origin !== self.location.origin) return;

  // Network-first pour les JSON (packs/questions) => à jour si réseau, sinon cache
  if (url.pathname.endsWith(".json")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Cache-first pour le reste (app shell)
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  return cached || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req, { cache: "no-store" });
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    return cached || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}








