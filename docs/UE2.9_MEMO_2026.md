# Quiz du livret mémo UE 2.9 S5

Source utilisateur : `LIVRET MEMO 2.9.docx`, transmis par un lien Google Docs. Analyse du texte intégral, du tableau de nomenclature et des 30 illustrations intégrées. Le document original n'est pas reproduit dans le dépôt.

Production autorisée par le GO de l'utilisateur. Rédaction directe des trois fichiers JSON finaux ; aucun script de génération ou d'assemblage pédagogique.

## Répartition

| Quiz | Questions | QCM uniques | QCM multiples | Vrai | Faux |
| --- | ---: | ---: | ---: | ---: | ---: |
| Bases tumorales et diagnostic | 50 | 17 | 17 | 8 | 8 |
| Parcours du patient et traitements | 45 | 12 | 17 | 8 | 8 |
| Toxicités, complications et prévention | 55 | 12 | 23 | 10 | 10 |
| Total | 150 | 41 | 57 | 26 | 26 |

Aucun nouveau QCM n'a toutes ses propositions correctes. Les questions sont autonomes ; les réponses et les explications sont renseignées dans chaque fichier.

## Arbitrages de fidélité

Les passages ambigus, contradictoires, ou indiqués comme exemples à ne pas apprendre ont été écartés. Aucun complément médical externe n'a été ajouté.

- Marqueurs tumoraux : privilégier le suivi et les limites de spécificité ; ne pas retenir la formulation selon laquelle leur seule présence prouverait un cancer.
- Métastases : ne pas reprendre la qualification de tumeur secondaire « indépendante » de la tumeur primitive.
- Lymphœdème : conserver le mécanisme, les facteurs axillaires et la protection cutanée ; ne pas retenir les interdictions générales d'effort qui contredisent les conseils d'activité de l'illustration.
- Chimiothérapies : ne pas tester les associations médicamenteuses ou classifications douteuses, ni la distinction ambiguë entre cure et cycle.
- Polychimiothérapie : distinguer l'intérêt recherché de toute garantie universelle de diminution de la toxicité.
- Lyse tumorale et hypercalcémie : conserver les mécanismes, anomalies et complications non contradictoires ; exclure les traitements, normes et symptômes incohérents de certains encadrés.
- Ne pas généraliser l'emploi du froid à toute chimiothérapie.
- HPV : conserver vaccination et dépistage ; ne pas tester les calendriers chiffrés anciens de l'illustration.
- Immunothérapie : exclure la définition inexacte des anticorps monoclonaux, les exemples explicitement facultatifs et l'actualité thérapeutique datée.
- Ne pas créer de contenu spécifique pour les pathologies uniquement énumérées en fin de livret.

## Synthèse UE 2.9

Actualisation éditoriale manuelle de 13 questions à partir des trois banques validées : traitements, TEP, dépistage mammaire, syndrome main-pied, lyse tumorale, hypercalcémie et protection du bras à risque de lymphœdème. Des questions générales ou redondantes sont remplacées ; le volume reste de 100 questions, dont 70 QCM et 30 Vrai/Faux (15 Vrai, 15 Faux).

Les questions originales non concernées par cette sélection sont conservées. La synthèse reste la première entrée de l'UE et garde le type `synthesis`.

## Contrôles

- Validation des trois nouveaux fichiers et de la synthèse avec `--warnings-as-errors`.
- Validation du catalogue actif avec `--catalog --warnings-as-errors`.
- Audit en lecture seule des volumes, index de correction et répartitions Vrai/Faux.
- Contrôle `git diff --check` avant publication.
- Révision du cache pédagogique : 3 → 4.
