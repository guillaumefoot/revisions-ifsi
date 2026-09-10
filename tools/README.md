# Outils de generation IFSI

Ce dossier contient les garde-fous utilises pour produire et publier les quiz.

## Limite d'utilisation des outils

Le contenu pedagogique est toujours redige directement dans le fichier final `data/*.json`.

Il est interdit d'utiliser un script JavaScript, Python, PowerShell ou shell pour construire une banque de questions puis generer, assembler ou exporter le JSON. Aucun generateur temporaire ne doit etre cree.

Les outils de ce dossier servent uniquement a valider des fichiers JSON deja rediges. `validate-quizzes.js` controle le contenu en lecture seule et ne constitue pas une methode de generation.

## Valider un nouveau quiz

```bash
node tools/validate-quizzes.js data/NOM_DU_QUIZ.json
```

La commande verifie:

- JSON valide ;
- presence de `title`, `subtitle`, `questions` ;
- structure de chaque question ;
- options non vides ;
- index `correct` valides ;
- doublons exacts de questions ;
- explication obligatoire pour les Vrai/Faux dont la bonne reponse est `Faux` ;
- absence de references au support source dans les questions et explications finales.

## Auditer la playlist active

```bash
node tools/validate-quizzes.js --catalog
```

Cette commande verifie `quizzes.json`, les fichiers qu'il reference, puis les quiz actifs.

Elle signale aussi les entrees de catalogue sans `icon`, car l'icone est utilisee pour l'affichage des cartes dans l'application.

## Auditer toute l'archive

```bash
node tools/validate-quizzes.js --all
```

Cette commande controle tous les fichiers `data/*.json`, y compris les anciens packs conserves en reference.

## Routine recommandee

1. Recevoir les cours/TD/corrections.
2. Attendre l'instruction `GO`.
3. Rediger directement les questions dans le fichier final `data/*.json`, sans script intermediaire.
4. Lancer le validateur en lecture seule sur ce fichier.
5. Ajouter le fichier dans `quizzes.json` si le quiz doit apparaitre dans l'app.
6. Lancer `node tools/validate-quizzes.js --catalog`.
7. Publier sur GitHub si la validation est OK.
