# Médias et projets entièrement dans Cloudinary

- Conserver le design et les réglages actuels du portfolio.
- Stocker les photos, vidéos et leurs informations (titre, description, catégorie, projet, ordre, visibilité, sélection accueil et format) dans Cloudinary `vdr0t4kc`, sans base Lovable pour les médias ou projets.
- Récupérer dynamiquement les médias et projets depuis Cloudinary pour l’accueil, les réalisations et le Studio, sans redéploiement après une modification.
- Ajouter « Remplacer » pour changer un fichier sans perdre son titre, sa description, sa catégorie, son projet ou son ordre.
- Permettre de supprimer définitivement un média de Cloudinary avec confirmation, et de gérer les projets même lorsqu’ils ne contiennent pas encore de fichiers.
- Protéger chaque ajout, modification, remplacement et suppression côté serveur. Conserver la connexion simple par mot de passe dans le Studio, mais remplacer sa vérification navigateur par une session protégée côté serveur.
- Prévoir le transfert des médias et projets existants vers Cloudinary, sans supprimer les originaux avant vérification réussie.
- Conserver les textes, couleurs et contacts avec leur fonctionnement actuel : seule la dépendance des médias et projets à Lovable Cloud est supprimée.
- Vérifier les envois photo/vidéo, les informations enregistrées, le remplacement, la suppression, les contrôles de lecture et le refus des opérations sans accès Studio.

## Détails techniques

- API Cloudinary appelée uniquement depuis le serveur pour les opérations privilégiées ; envois signés autorisés par le serveur, sans API Secret dans le navigateur.
- Métadonnées des médias dans Cloudinary et registre de projets stocké dans Cloudinary, afin de conserver les projets vides et leurs descriptions.
- Lecture publique limitée aux informations et médias affichés ; informations masquées accessibles uniquement au Studio autorisé.
- Mot de passe Studio et clé de session dans les secrets serveur ; session chiffrée avec cookie HttpOnly et vérification de session sur chaque opération protégée.
- Avant mise en œuvre : recueillir l’API Key et l’API Secret via le formulaire sécurisé (Cloudinary → Settings → API Keys). Le cloud name et le preset unsigned seuls ne permettent pas cette gestion sécurisée complète.
- Tests ciblés des métadonnées, autorisations, erreurs et opérations sur les médias, puis vérification réelle dans le Studio et sur le portfolio.