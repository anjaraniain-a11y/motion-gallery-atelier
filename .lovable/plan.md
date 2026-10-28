# Médias Cloudinary

- Conserver le design et les réglages actuels du portfolio.
- Envoyer les nouvelles photos et vidéos du Studio vers Cloudinary avec le cloud `vdr0t4kc` et le preset unsigned `portfolio_upload`, puis enregistrer leur URL dans la base existante.
- Afficher automatiquement ces URL sur l’accueil et dans les projets, tout en conservant la lecture des anciens fichiers Lovable Cloud.
- Ajouter « Remplacer » pour changer un fichier sans perdre son titre, sa description, sa catégorie, son projet ou son ordre.
- Permettre de retirer un média du portfolio. Avec un preset unsigned seul, cette action ne supprime pas définitivement le fichier de Cloudinary.
- Vérifier les envois photo/vidéo, le remplacement, le retrait, la persistance et les contrôles de lecture.

## Détails techniques

- Envoi navigateur vers l’API unsigned Cloudinary, sans clé privée.
- Réutilisation du champ URL existant, sans modification de la structure de la base.
- Résolution partagée des URL externes et des anciens chemins de stockage.
- Tests ciblés des réponses d’envoi, des erreurs et de la compatibilité des médias existants.