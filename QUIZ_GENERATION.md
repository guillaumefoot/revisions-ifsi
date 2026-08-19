# Routine de generation des quiz IFSI

Ce document fixe la routine de production des fichiers JSON utilises par l'app de revision IFSI.

## Objectif

Convertir des supports pedagogiques fournis par l'utilisateur (cours, TD, corrections, notes) en fichiers JSON strictement compatibles avec l'application.

L'application lit des packs de quiz au format:

```json
{
  "title": "Titre du sujet",
  "subtitle": "Sous-titre",
  "questions": [
    {
      "question": "Question autonome",
      "options": ["Vrai", "Faux"],
      "correct": [1],
      "explanation": "C'est Faux car ..."
    }
  ]
}
```

## Protocole avant generation

Apres reception d'un ou plusieurs documents, ne jamais generer immediatement.

Repondre d'abord avec un accuse de reception court:

```text
Fichier(s) bien recu(s).
J'ai identifie les sources suivantes: ...
Volume cible propose: ...
Attente de ton GO pour generer le fichier JSON.
```

Ne lancer la generation qu'apres instruction explicite: `GO`, `Vas-y`, `Genere`, ou equivalent.

## Regles de source

- Utiliser exclusivement les documents fournis pour la generation.
- Ne jamais inventer une information medicale, un chiffre, une indication, une contre-indication ou une conduite a tenir absente des sources.
- En cas d'ambiguite ou de contradiction, preferer la formulation la plus prudente et signaler le point a verifier au lieu de combler avec des connaissances externes.
- Le cours officiel ou support professeur prime sur les notes et corrections.
- Les questions doivent etre autonomes, sans formulation du type "selon le texte".
- Conserver un ton medical, precis et adapte a une etudiante infirmiere.

## Priorites de traitement

### 1. Sanctuariser l'existant

- Ne jamais modifier le contenu pedagogique des QCM ou Vrai/Faux deja presents dans les supports.
- Conserver le nombre exact d'options d'origine.
- Ne pas forcer un ratio QCM/VF si le document source contient deja une structure d'exercices.

### 2. Convertir intelligemment les questions ouvertes

Pour une consigne du type "Citer 4 signes", ne pas conserver cette formulation dans l'intitule.

Preferer:

```text
Quels sont les signes cliniques de ... ?
```

Ajouter obligatoirement 1 ou 2 distracteurs plausibles quand la question ouverte devient un QCM.

### 3. Completer la couverture

Apres traitement des exercices existants:

- couvrir les notions du cours non encore interrogees ;
- eviter les doublons tant que toute la matiere utile n'est pas couverte ;
- pour les questions creees, viser un equilibre pedagogique entre QCM et Vrai/Faux quand le sujet s'y prete.

## Volume de questions

Le nombre de questions doit etre pilote par la densite du support, pas par un quota arbitraire.

Avant generation, proposer un volume cible:

- petit support ou fiche courte: 20 a 40 questions ;
- cours standard: 50 a 80 questions ;
- gros cours, plusieurs TD ou dossier de revision: 80 a 150 questions ;
- synthese multi-cours: decouper en plusieurs fichiers si le volume depasse environ 150 questions.

Si l'utilisateur donne un nombre cible, le respecter autant que possible.

Si le support contient deja beaucoup de QCM/VF existants, conserver ces questions puis completer seulement si des notions importantes ne sont pas couvertes.

## Regles de qualite

### Vrai/Faux

- Options attendues: `["Vrai", "Faux"]`.
- Si la bonne reponse est `Faux`, une `explanation` est obligatoire.
- Les faux doivent etre plausibles et utiles, pas absurdes.

### QCM

- Produire des QCM a reponse unique et des QCM a reponses multiples.
- Le tableau `correct` contient toujours des entiers correspondant aux index de `options`.
- Les propositions fausses doivent etre credibles.
- Eviter les formulations piegeuses gratuites: le piege doit tester une vraie confusion possible.

### Explications

Dans Codex, les quiz sont ecrits dans des fichiers: il n'est donc pas necessaire de limiter fortement les explications pour des raisons de performance conversationnelle.

Inclure une `explanation` courte, 1 a 2 phrases, dans la plupart des questions.

Elle est obligatoire quand:

- la reponse correcte est `Faux` ;
- la question est un piege ;
- le QCM a plusieurs bonnes reponses ;
- le QCM contient un distracteur important ;
- la correction aide a lever une confusion clinique.

Elle reste optionnelle uniquement pour:

- definitions tres simples ;
- vocabulaire ou traduction simple ;
- pure memorisation sans risque de confusion.

## Validation obligatoire

Avant publication, lancer:

```bash
node tools/validate-quizzes.js data/NOM_DU_QUIZ.json
```

Pour auditer aussi la playlist active:

```bash
node tools/validate-quizzes.js --catalog
```

Pour auditer tous les fichiers de `data`:

```bash
node tools/validate-quizzes.js --all
```

## Publication

Push direct sur `main` autorise si les changements concernent uniquement:

- un ou plusieurs fichiers `data/*.json` ;
- `quizzes.json` ;
- la validation est OK.

Utiliser une branche ou une PR si les changements touchent:

- `index.html` ;
- `sw.js` ;
- `manifest.json` ;
- le comportement offline/cache ;
- le moteur de scoring ou d'affichage.
