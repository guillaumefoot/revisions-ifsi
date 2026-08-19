# Revisions IFSI

Application web de quiz pour accompagner les revisions en IFSI.

Le projet sert a transformer les supports de cours, TD et corrections en quiz interactifs, utilisables rapidement sur mobile ou ordinateur. L'objectif est de faciliter les revisions regulieres pendant le semestre, avec une liste de quiz active adaptee aux cours du moment.

## Application

L'application est une PWA statique hebergee via GitHub Pages:

https://guillaumefoot.github.io/revisions-ifsi/

Elle permet de:

- choisir un module de revision ;
- lancer des sessions de 5, 10, 20 questions ou tout le quiz ;
- melanger les questions et les propositions de QCM ;
- afficher une correction et, quand utile, une explication courte ;
- masquer localement les questions deja maitrisees ;
- conserver certains contenus en cache pour un usage hors ligne apres consultation.

## Structure du projet

```text
index.html       Interface et moteur de quiz
quizzes.json     Liste des quiz affiches dans l'application
data/*.json      Packs de questions
manifest.json    Configuration PWA
sw.js            Service worker et cache offline
icons/           Icones de l'application
```

Les anciens fichiers de quiz peuvent rester dans `data/` comme archive. Seuls les fichiers references dans `quizzes.json` apparaissent dans l'application.

## Format d'un quiz

Chaque pack de quiz est un fichier JSON:

```json
{
  "title": "Titre du quiz",
  "subtitle": "UE et sujet",
  "questions": [
    {
      "question": "Question autonome",
      "options": ["Vrai", "Faux"],
      "correct": [1],
      "explanation": "Explication courte de la correction."
    }
  ]
}
```

Le champ `correct` contient les index des bonnes reponses dans `options`.

## Generation des quiz

Les quiz sont generes a partir des supports fournis: cours, TD, corrections ou notes.

Principes de generation:

- ne pas inventer d'information absente des sources ;
- conserver les QCM et Vrai/Faux existants quand ils sont fournis ;
- transformer les questions ouvertes en QCM quand c'est pertinent ;
- ajouter des distracteurs plausibles, mais uniquement compatibles avec les sources ;
- privilegier des questions autonomes, utiles pour reviser sans relire le cours ;
- ajouter des explications courtes pour les erreurs, les pieges et les notions importantes.

Le fichier `quizzes.json` sert de playlist du semestre: il peut etre ajuste sans supprimer les anciens quiz archives.

## Publication

Pour de simples ajouts ou corrections de contenu JSON, les mises a jour peuvent etre poussees directement sur `main`.

Pour les changements de comportement de l'application, du cache offline ou de l'interface, une branche dediee est preferable.
