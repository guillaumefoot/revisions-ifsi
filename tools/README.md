# Outils de generation IFSI

Ce dossier contient les garde-fous utilises pour produire et publier les quiz.

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
- explication obligatoire pour les Vrai/Faux dont la bonne reponse est `Faux`.

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
3. Generer un fichier `data/*.json`.
4. Lancer le validateur sur ce fichier.
5. Ajouter le fichier dans `quizzes.json` si le quiz doit apparaitre dans l'app.
6. Lancer `node tools/validate-quizzes.js --catalog`.
7. Publier sur GitHub si la validation est OK.
