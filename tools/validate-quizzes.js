#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const catalogPath = path.join(root, "quizzes.json");

const args = process.argv.slice(2);
const options = {
  all: args.includes("--all"),
  catalog: args.includes("--catalog"),
  warningsAsErrors: args.includes("--warnings-as-errors"),
};

const explicitFiles = args.filter((arg) => !arg.startsWith("--"));

const errors = [];
const warnings = [];
const stats = {
  files: 0,
  questions: 0,
  vf: 0,
  qcm: 0,
};

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${rel(filePath)}: JSON invalide (${error.message})`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOption(value) {
  return String(value).trim().toLowerCase();
}

function isTrueFalseQuestion(question) {
  if (!Array.isArray(question.options) || question.options.length !== 2) {
    return false;
  }

  const options = question.options.map(normalizeOption);
  return options.includes("vrai") && options.includes("faux");
}

function hasFalseAsCorrect(question) {
  const options = question.options.map(normalizeOption);
  const falseIndex = options.indexOf("faux");
  return falseIndex >= 0 && question.correct.includes(falseIndex);
}

function validateQuiz(filePath) {
  const json = readJson(filePath);
  if (!json) return;

  stats.files += 1;

  if (!isNonEmptyString(json.title)) {
    errors.push(`${rel(filePath)}: champ "title" absent ou vide`);
  }

  if (!isNonEmptyString(json.subtitle)) {
    warnings.push(`${rel(filePath)}: champ "subtitle" absent ou vide`);
  }

  if (!Array.isArray(json.questions)) {
    errors.push(`${rel(filePath)}: champ "questions" absent ou non tableau`);
    return;
  }

  if (json.questions.length === 0) {
    errors.push(`${rel(filePath)}: aucune question`);
    return;
  }

  const seenQuestions = new Map();

  json.questions.forEach((question, index) => {
    const prefix = `${rel(filePath)} question ${index + 1}`;
    stats.questions += 1;

    if (!question || typeof question !== "object" || Array.isArray(question)) {
      errors.push(`${prefix}: entree question invalide`);
      return;
    }

    if (!isNonEmptyString(question.question)) {
      errors.push(`${prefix}: champ "question" absent ou vide`);
    } else {
      const key = question.question.trim();
      if (seenQuestions.has(key)) {
        warnings.push(`${prefix}: doublon exact de la question ${seenQuestions.get(key)}`);
      } else {
        seenQuestions.set(key, index + 1);
      }
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`${prefix}: "options" doit contenir au moins 2 propositions`);
      return;
    }

    const normalizedOptions = question.options.map(normalizeOption);
    question.options.forEach((option, optionIndex) => {
      if (!isNonEmptyString(option)) {
        errors.push(`${prefix}: option ${optionIndex} absente ou vide`);
      }
    });

    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      warnings.push(`${prefix}: propositions dupliquees`);
    }

    if (!Array.isArray(question.correct) || question.correct.length === 0) {
      errors.push(`${prefix}: "correct" doit contenir au moins un index`);
    } else {
      const uniqueCorrect = new Set(question.correct);
      if (uniqueCorrect.size !== question.correct.length) {
        warnings.push(`${prefix}: index dupliques dans "correct"`);
      }

      question.correct.forEach((correctIndex) => {
        if (!Number.isInteger(correctIndex)) {
          errors.push(`${prefix}: index correct non entier (${correctIndex})`);
        } else if (correctIndex < 0 || correctIndex >= question.options.length) {
          errors.push(`${prefix}: index correct hors limites (${correctIndex})`);
        }
      });
    }

    const isVF = isTrueFalseQuestion(question);
    if (isVF) {
      stats.vf += 1;
      if (question.options.length !== 2) {
        errors.push(`${prefix}: Vrai/Faux doit avoir exactement 2 options`);
      }
      if (Array.isArray(question.correct) && question.correct.length !== 1) {
        errors.push(`${prefix}: Vrai/Faux doit avoir une seule bonne reponse`);
      }
      if (Array.isArray(question.correct) && hasFalseAsCorrect(question) && !isNonEmptyString(question.explanation)) {
        errors.push(`${prefix}: explication obligatoire quand la bonne reponse est "Faux"`);
      }
    } else {
      stats.qcm += 1;
    }

    if ("explanation" in question && question.explanation !== undefined && question.explanation !== null && typeof question.explanation !== "string") {
      errors.push(`${prefix}: "explanation" doit etre une chaine si le champ existe`);
    }
  });
}

function validateCatalog() {
  const catalog = readJson(catalogPath);
  if (!catalog) return [];

  if (!Array.isArray(catalog)) {
    errors.push(`${rel(catalogPath)}: le catalogue doit etre un tableau`);
    return [];
  }

  const files = [];
  const seenFiles = new Set();

  catalog.forEach((entry, index) => {
    const prefix = `${rel(catalogPath)} entree ${index + 1}`;

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${prefix}: entree invalide`);
      return;
    }

    ["file", "code", "name"].forEach((field) => {
      if (!isNonEmptyString(entry[field])) {
        errors.push(`${prefix}: champ "${field}" absent ou vide`);
      }
    });

    if (!isNonEmptyString(entry.subtitle)) {
      warnings.push(`${prefix}: champ "subtitle" absent ou vide`);
    }

    if (!isNonEmptyString(entry.icon)) {
      warnings.push(`${prefix}: champ "icon" absent ou vide`);
    }

    if (!isNonEmptyString(entry.file)) {
      return;
    }

    if (path.isAbsolute(entry.file) || entry.file.includes("..")) {
      errors.push(`${prefix}: chemin de fichier non autorise (${entry.file})`);
      return;
    }

    if (seenFiles.has(entry.file)) {
      warnings.push(`${prefix}: fichier deja reference (${entry.file})`);
    }
    seenFiles.add(entry.file);

    const filePath = path.join(root, entry.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`${prefix}: fichier introuvable (${entry.file})`);
      return;
    }

    files.push(filePath);
  });

  return files;
}

function collectAllDataFiles() {
  if (!fs.existsSync(dataDir)) {
    errors.push("data/: dossier introuvable");
    return [];
  }

  return fs
    .readdirSync(dataDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => path.join(dataDir, fileName));
}

function usage() {
  console.log(`Usage:
  node tools/validate-quizzes.js data/NOM_DU_QUIZ.json
  node tools/validate-quizzes.js --catalog
  node tools/validate-quizzes.js --all

Options:
  --warnings-as-errors  transforme les avertissements en erreurs`);
}

function main() {
  let filesToValidate = [];

  if (explicitFiles.length > 0) {
    filesToValidate = explicitFiles.map((file) => path.resolve(root, file));
  } else if (options.catalog) {
    filesToValidate = validateCatalog();
  } else if (options.all) {
    filesToValidate = collectAllDataFiles();
  } else {
    usage();
    process.exitCode = 1;
    return;
  }

  if (options.catalog && explicitFiles.length > 0) {
    validateCatalog();
  }

  const uniqueFiles = [...new Set(filesToValidate)];
  uniqueFiles.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      errors.push(`${rel(filePath)}: fichier introuvable`);
      return;
    }
    validateQuiz(filePath);
  });

  console.log(`Validation quiz IFSI`);
  console.log(`Fichiers: ${stats.files}`);
  console.log(`Questions: ${stats.questions}`);
  console.log(`Vrai/Faux: ${stats.vf}`);
  console.log(`QCM: ${stats.qcm}`);

  if (warnings.length > 0) {
    console.log(`\nAvertissements (${warnings.length})`);
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (errors.length > 0 || (options.warningsAsErrors && warnings.length > 0)) {
    console.log(`\nErreurs (${errors.length})`);
    errors.forEach((error) => console.log(`- ${error}`));
    if (options.warningsAsErrors && warnings.length > 0) {
      console.log("- Les avertissements sont traites comme des erreurs");
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nOK: validation reussie.");
}

main();
