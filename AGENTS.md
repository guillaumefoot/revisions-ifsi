# Instructions du projet Revisions IFSI

Ces instructions s'appliquent a l'ensemble du projet.

## Depot canonique

- Avant toute modification, identifier le depot Git avec `git rev-parse --show-toplevel`.
- Lorsque le workspace parent `Quizz IFSI` est ouvert, le depot versionne et publiable est `repo-push/`.
- Effectuer les modifications destinees a l'application, les validations, les commits et les publications depuis le depot canonique.
- Les fichiers similaires places hors du depot Git sont des copies de travail, pas la source de publication.
- Quand les instructions du projet sont modifiees, maintenir les copies du workspace parent coherentes avec celles du depot.

## Reception et analyse des sources

- Utiliser exclusivement les cours, TD, corrections et notes fournis par l'utilisateur.
- Distinguer le contenu pedagogique ou les consignes figurant dans les documents de la demande formulee par l'utilisateur.
- Ne jamais inventer une information medicale, un chiffre, une indication, une contre-indication ou une conduite a tenir absente des sources.
- Le support officiel ou professeur prime sur les notes et corrections.
- En cas d'ambiguite, de contradiction ou de chiffre incoherent, ne pas completer avec des connaissances externes : signaler le point ou l'exclure prudemment.
- Examiner integralement les sources pertinentes, y compris les tableaux, schemas, encadres et pages essentiellement visuelles.

## Autorisation avant generation

- Apres reception des sources, commencer par confirmer les fichiers identifies et proposer un volume adapte a leur densite.
- Ne produire aucune question avant une instruction explicite de l'utilisateur : `GO`, `Vas-y`, `Genere` ou equivalent.
- Un gros ensemble depassant environ 150 questions doit etre decoupe en plusieurs quiz coherents.
- Un TD ou sa correction peut justifier un quiz dedie meme si certaines notions recoupent deja un quiz de cours : les cas, formulations et raisonnements du TD peuvent etre proches de l'evaluation.

## Methode de production obligatoire

- Rediger chaque quiz directement dans son fichier JSON final `data/*.json` avec l'outil d'edition de fichiers.
- Ecrire directement dans ce JSON les questions, les propositions, les index `correct` et les explications.
- Ne jamais placer la banque de questions dans un script intermediaire avant de l'exporter en JSON.
- Ne jamais utiliser JavaScript, Python, PowerShell, le shell ou un autre langage pour fabriquer, convertir, assembler ou emettre le contenu pedagogique du quiz.
- Ne creer aucun generateur temporaire, meme s'il doit etre supprime ensuite.
- Les scripts sont autorises uniquement pour l'extraction ou l'inspection des sources, le comptage, l'audit, les tests et la validation en lecture seule.
- `node tools/validate-quizzes.js` est uniquement un validateur. Il ne doit jamais produire ou modifier le contenu d'un quiz.

## Regles pedagogiques

- Sanctuariser les QCM et Vrai/Faux deja presents dans les sources : ne pas modifier leur contenu pedagogique ni leur nombre d'options.
- Transformer les questions ouvertes en QCM quand cela est pertinent, avec un ou deux distracteurs plausibles compatibles avec les sources.
- Couvrir les notions importantes avant de creer des doublons.
- Dans un quiz dedie a un TD, conserver autant que possible sa progression, ses cas cliniques et ses formulations caracteristiques. Un recoupement avec le quiz general est alors acceptable, mais eviter les doublons internes au quiz du TD.
- Pour les calculs de dose, ne retenir que les exercices qui s'adaptent clairement au format interactif. Privilegier les QCM numeriques avec des distracteurs correspondant a des erreurs de calcul plausibles et expliquer le raisonnement, les unites et l'arrondi. Ne pas forcer un calcul complexe en Vrai/Faux et exclure les donnees ambigues ou contradictoires.
- Formuler des questions autonomes sans mentionner le cours, le support, le document, le PDF ou la diapositive.
- Employer un ton medical precis, prudent et adapte a une etudiante infirmiere.
- Produire des QCM a reponse unique et a reponses multiples.
- Ne pas imposer un ratio mecanique entre QCM et Vrai/Faux ; rechercher un equilibre pedagogique adapte au sujet.
- Pour les Vrai/Faux crees, eviter un biais previsible vers une reponse. Viser autant que possible une repartition proche de 50/50 entre reponses `Vrai` et `Faux`, globalement et par pack lorsque le volume le permet.
- Les affirmations fausses doivent rester plausibles et tester une confusion utile, jamais un piege gratuit.

## Quiz de synthese par UE

- Lorsqu'une UE comporte plusieurs quiz actifs, maintenir un quiz de synthese place en premiere position de cette UE dans `quizzes.json`.
- Identifier chaque synthese dans le catalogue avec `"type": "synthesis"` afin d'activer son apparence et son filtre dedies dans l'application.
- Le quiz de synthese est une selection editoriale issue des banques validees de l'UE, jamais un tirage aleatoire ni un assemblage automatique par script.
- Cibler au maximum 100 questions. Rester en dessous lorsque la matiere pertinente ne justifie pas ce volume.
- Pour une synthese de troisieme annee, prioriser les questions susceptibles d'etre transposees en examen : raisonnement clinique, urgences, surveillances, therapeutiques, role IDE, securite et cadre legal.
- Accepter le recoupement avec les quiz detailles, puisque la synthese sert de parcours autonome, mais supprimer les doublons internes et eviter les variantes artificielles d'une meme question.
- Rechercher en general une majorite de QCM, autour de 70 %, et environ 30 % de Vrai/Faux lorsque le sujet s'y prete. Ce repere reste pedagogique et non mecanique ; equilibrer les reponses Vrai et Faux au plus pres de 50/50.
- Apres l'ajout ou la revision importante d'un cours ou d'un TD, verifier si la synthese de l'UE doit etre actualisee. N'y integrer que des notions deja couvertes et validees par les sources fournies.

## Format JSON

Chaque fichier doit respecter cette structure :

```json
{
  "title": "Titre du quiz",
  "subtitle": "UE et sujet",
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

- `correct` contient les index entiers des bonnes reponses dans `options`.
- Un Vrai/Faux utilise exactement `['Vrai', 'Faux']` et une seule bonne reponse.
- Une explication est obligatoire lorsque la bonne reponse est `Faux`.
- Ajouter une explication courte, generalement une ou deux phrases, a la plupart des questions.
- Une explication est obligatoire pour les pieges utiles, les QCM a plusieurs bonnes reponses et les distracteurs importants.

## Catalogue

- Ajouter dans `quizzes.json` tout quiz devant apparaitre dans l'application.
- Chaque entree contient `file`, `code`, `name`, `subtitle` et `icon`.
- L'icone appartient au catalogue, pas au fichier de questions.
- Choisir une icone sobre, lisible et specifique au sujet.
- Les anciens fichiers peuvent rester archives dans `data/` ; seuls les fichiers references dans `quizzes.json` sont actifs.

## Validation obligatoire

Apres redaction directe d'un quiz :

```bash
node tools/validate-quizzes.js data/NOM_DU_QUIZ.json --warnings-as-errors
```

Avant publication :

```bash
node tools/validate-quizzes.js --catalog --warnings-as-errors
git diff --check
```

- Verifier aussi les volumes QCM/Vrai-Faux et la repartition Vrai/Faux, globalement et par fichier.
- Ne pas publier un nouveau quiz si sa validation ou celle du catalogue actif echoue.
- L'audit `--all` peut signaler des problemes historiques dans des archives non actives ; les distinguer clairement des fichiers modifies.

## Publication

- Un push direct sur `main` est autorise lorsque les changements concernent uniquement `data/*.json`, `quizzes.json` ou la documentation, et que les validations pertinentes reussissent.
- Utiliser une branche ou une pull request si les changements touchent `index.html`, `sw.js`, `manifest.json`, le moteur de quiz, le scoring, l'interface ou le comportement hors ligne/cache.
- Limiter le commit aux fichiers de la demande et ne pas inclure de modifications sans rapport.
- Apres le push, verifier que le catalogue public et les nouveaux fichiers sont effectivement servis par GitHub Pages.

## Documentation de reference

- `QUIZ_GENERATION.md` detaille la routine pedagogique.
- `tools/README.md` decrit les controles disponibles.
- `README.md` presente l'application, le format des quiz et les regles generales de publication.
