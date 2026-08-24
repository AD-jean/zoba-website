# Explication simple du projet ZOBA

Bonjour petit explorateur ! 👶

Imagine que ce projet est une grande maison. Cette maison aide une organisation chrétienne appelée ZOBA à montrer qui elle est, ce qu’elle fait, et à garder les informations en ordre.

Cette maison a deux parties importantes :
- la partie de devant : c’est ce que les visiteurs voient
- la partie de derrière : c’est où les données sont gardées et traitées

---

## L’idée générale du projet

Ce site web sert à :
- montrer la présentation de l’organisation
- afficher les activités à venir
- publier les actualités
- montrer la galerie de photos
- permettre de contacter l’équipe
- recevoir des dons
- donner un espace administrateur pour gérer tout cela

Donc, c’est un peu comme une maison avec une grande porte d’entrée, un tableau d’affichage, une boîte à lettres, une salle du bureau, et une cuisine où tout est préparé.

---

## La structure du projet

Voici la grande famille du projet :

- [src/](src/) : la partie visible du site, comme la salle de visite
- [backend/](backend/) : la partie cachée, comme la cuisine et le bureau où tout est organisé
- [supabase/](supabase/) : le grand coffre où les données sont stockées
- les fichiers du haut : ce sont les petits outils qui aident la maison à fonctionner

---

## Rôle de chaque dossier

### [src/](src/)
C’est la partie du site que les gens voient dans leur navigateur.
C’est comme la salle de séjour de la maison.
Ici, on trouve les pages, les boutons, les menus, et tout ce qui rend le site joli et utile.

### [src/components/](src/components/)
C’est le groupe des pièces de décoration et d’outils réutilisables.
Par exemple, le menu du haut et le pied de page.

### [src/pages/](src/pages/)
C’est le groupe des pièces principales de la maison : chaque page du site.
Chaque fichier correspond à une page différente.

### [src/pages/admin/](src/pages/admin/)
C’est la petite pièce secrète réservée aux administrateurs.
Là, on peut gérer les informations du site.

### [src/lib/](src/lib/)
C’est la boîte à outils de communication.
Elle aide le site à parler avec le serveur et la base de données.

### [src/types/](src/types/)
C’est la petite fiche de règles.
Elle dit à TypeScript comment les données doivent être écrites.

### [backend/](backend/)
C’est la partie cachée du site.
C’est comme la cuisine et l’atelier où la nourriture et les objets sont préparés avant d’être servis.

### [backend/src/](backend/src/)
C’est le cœur du serveur.
Ici, on trouve les routes, les modèles de données, et la connexion à la base.

### [backend/src/routes/](backend/src/routes/)
C’est le bureau des livreurs.
Chaque fichier dit : “si quelqu’un veut telle chose, va ici”.

### [backend/src/models/](backend/src/models/)
C’est le musée des formes de données.
Chaque fichier explique la forme d’un type d’information : activité, article, don, etc.

### [backend/src/middleware/](backend/src/middleware/)
C’est un gardien de porte.
Il vérifie si une personne a le droit d’entrer.

### [backend/src/config/](backend/src/config/)
C’est le manuel de réglage.
Il dit comment se connecter à la base de données.

### [supabase/](supabase/)
C’est le grand coffre de rangement.
Il contient la structure de la base de données.

---

## Rôle de chaque fichier important

### Fichiers à la racine

- [package.json](package.json) : le carnet de courses du projet. Il dit quelles bibliothèques sont nécessaires.
- [package-lock.json](package-lock.json) : la liste exacte des achats pour ne pas perdre la trace.
- [README.md](README.md) : le guide du projet. C’est comme la notice de la maison.
- [vite.config.ts](vite.config.ts) : le petit chef d’orchestre qui aide à lancer le site en développement.
- [tailwind.config.js](tailwind.config.js) : le réglage du style visuel du site.
- [postcss.config.js](postcss.config.js) : un petit outil pour transformer les styles.
- [tsconfig.json](tsconfig.json) : les règles de TypeScript pour que le code reste propre.
- [tsconfig.app.json](tsconfig.app.json) : les règles spéciales pour l’application frontend.
- [tsconfig.node.json](tsconfig.node.json) : les règles spéciales pour le backend.
- [eslint.config.js](eslint.config.js) : le gardien qui vérifie si le code est bien écrit.
- [index.html](index.html) : la page HTML de départ, comme la porte d’entrée du site.
- [.gitignore](.gitignore) : la liste des choses à cacher quand on enregistre le projet.

### Fichiers du frontend

- [src/main.tsx](src/main.tsx) : la première porte qui s’ouvre quand le site démarre.
- [src/App.tsx](src/App.tsx) : la carte générale du site. Il dit quelle page s’affiche selon l’adresse du navigateur.
- [src/index.css](src/index.css) : la boîte de peinture du site. Elle contient les styles de base.
- [src/vite-env.d.ts](src/vite-env.d.ts) : un petit fichier pour dire à Vite comment comprendre certaines variables.

### Composants

- [src/components/Navbar.tsx](src/components/Navbar.tsx) : le menu du haut. C’est la barre qui aide à naviguer entre les pages.
- [src/components/Footer.tsx](src/components/Footer.tsx) : le pied de page. Il contient les liens utiles et le formulaire pour s’abonner à la newsletter.

### Pages publiques

- [src/pages/Home.tsx](src/pages/Home.tsx) : la page d’accueil. C’est la première page que l’on voit.
- [src/pages/AboutPage.tsx](src/pages/AboutPage.tsx) : la page “À propos”. Elle raconte qui est l’organisation.
- [src/pages/DepartmentsPage.tsx](src/pages/DepartmentsPage.tsx) : la page des départements.
- [src/pages/ActivitiesPage.tsx](src/pages/ActivitiesPage.tsx) : la page des activités.
- [src/pages/NewsPage.tsx](src/pages/NewsPage.tsx) : la page des actualités.
- [src/pages/GalleryPage.tsx](src/pages/GalleryPage.tsx) : la page de la galerie photo.
- [src/pages/ContactPage.tsx](src/pages/ContactPage.tsx) : la page de contact.
- [src/pages/DonationsPage.tsx](src/pages/DonationsPage.tsx) : la page de dons.

### Pages d’administration
 
- [src/pages/admin/AdminPage.tsx](src/pages/admin/AdminPage.tsx) : la porte d’entrée de la zone admin.
- [src/pages/admin/AdminLogin.tsx](src/pages/admin/AdminLogin.tsx) : la page de connexion pour l’administrateur.
- [src/pages/admin/AdminDashboard.tsx](src/pages/admin/AdminDashboard.tsx) : le tableau de bord où l’admin peut ajouter, modifier ou supprimer des informations.

### Bibliothèques et outils frontend

- [src/lib/api.ts](src/lib/api.ts) : le petit messager qui envoie les requêtes au backend.
- [src/lib/supabase.ts](src/lib/supabase.ts) : le pont qui relie le frontend à Supabase.

### Types de données

- [src/types/database.ts](src/types/database.ts) : la feuille de règles qui dit comment les données sont organisées.

### Backend

- [backend/package.json](backend/package.json) : le carnet de courses du serveur.
- [backend/tsconfig.json](backend/tsconfig.json) : les règles TypeScript du backend.
- [backend/src/server.ts](backend/src/server.ts) : le cœur du serveur. Il démarre l’application et branche toutes les routes.

### Configuration backend

- [backend/src/config/database.ts](backend/src/config/database.ts) : le fichier qui connecte le serveur à la base de données.

### Middleware backend

- [backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts) : le garde qui vérifie si quelqu’un est autorisé à accéder.

### Routes backend

- [backend/src/routes/auth.routes.ts](backend/src/routes/auth.routes.ts) : les routes pour la connexion de l’administrateur.
- [backend/src/routes/member.routes.ts](backend/src/routes/member.routes.ts) : les routes pour gérer les membres du bureau.
- [backend/src/routes/activity.routes.ts](backend/src/routes/activity.routes.ts) : les routes pour gérer les activités.
- [backend/src/routes/news.routes.ts](backend/src/routes/news.routes.ts) : les routes pour gérer les actualités.
- [backend/src/routes/gallery.routes.ts](backend/src/routes/gallery.routes.ts) : les routes pour gérer la galerie photo.
- [backend/src/routes/contact.routes.ts](backend/src/routes/contact.routes.ts) : les routes pour recevoir et lire les messages de contact.
- [backend/src/routes/subscriber.routes.ts](backend/src/routes/subscriber.routes.ts) : les routes pour gérer les abonnés à la newsletter.
- [backend/src/routes/registration.routes.ts](backend/src/routes/registration.routes.ts) : les routes pour gérer les inscriptions aux activités.
- [backend/src/routes/donation.routes.ts](backend/src/routes/donation.routes.ts) : les routes pour gérer les dons.

### Modèles backend

- [backend/src/models/Admin.model.ts](backend/src/models/Admin.model.ts) : la forme d’un administrateur.
- [backend/src/models/Member.model.ts](backend/src/models/Member.model.ts) : la forme d’un membre du bureau.
- [backend/src/models/Activity.model.ts](backend/src/models/Activity.model.ts) : la forme d’une activité.
- [backend/src/models/News.model.ts](backend/src/models/News.model.ts) : la forme d’un article d’actualité.
- [backend/src/models/Gallery.model.ts](backend/src/models/Gallery.model.ts) : la forme d’une image de galerie.
- [backend/src/models/Contact.model.ts](backend/src/models/Contact.model.ts) : la forme d’un message de contact.
- [backend/src/models/Subscriber.model.ts](backend/src/models/Subscriber.model.ts) : la forme d’un abonné à la newsletter.
- [backend/src/models/Registration.model.ts](backend/src/models/Registration.model.ts) : la forme d’une inscription.
- [backend/src/models/Donation.model.ts](backend/src/models/Donation.model.ts) : la forme d’un don.

### Base de données

- [supabase/migrations/20260627135024_zoba_initial_schema.sql](supabase/migrations/20260627135024_zoba_initial_schema.sql) : le fichier qui crée la structure initiale des tables de la base de données.

---

## Pourquoi le projet est organisé comme ça ?

Parce que les enfants comprennent mieux quand les choses sont rangées.

- les pages sont séparées pour ne pas tout mélanger
- les composants sont séparés pour réutiliser les menus et pieds de page
- le backend est séparé pour garder les données en sécurité
- les modèles décrivent les objets pour éviter les erreurs
- la base de données garde toutes les informations au même endroit

C’est un peu comme ranger ses jouets dans des boîtes différentes : un jeu dans une boîte, les livres dans une autre, et les crayons dans une troisième.

---

## En résumé très simple

Ce projet est un site web pour une organisation chrétienne.

- la partie visible sert à montrer les informations au public
- la partie admin sert à gérer ces informations
- le serveur sert à traiter les demandes
- la base de données sert à garder les données en sécurité

Donc, si on résume avec une image :

- le site = la maison
- les pages = les pièces
- le serveur = la cuisine et le bureau
- la base de données = le grand coffre à jouets des informations

## Suggestions pour apprendre encore plus

Si tu veux devenir fort avec ce projet, voici les meilleurs pas à suivre :

- Commence par apprendre React : les composants, les props et l’état.
- Apprends ensuite React Router : pour faire bouger entre les pages.
- Regarde comment fonctionne TypeScript : cela aide à éviter les erreurs.
- Comprends le backend avec Node.js et Express : c’est le cerveau du site.
- Apprends les bases de la base de données : ce que sont les tables, les lignes et les colonnes.
- Essaie de modifier une petite chose dans le projet, comme changer un texte ou ajouter un bouton.
- Puis essaie de créer une nouvelle page simple.
- Enfin, essaie de comprendre comment les données voyagent du frontend vers le backend.

## Petit défi pour toi

Essaie de répondre à ces questions :
- Quel fichier affiche la page d’accueil ?
- Quel fichier gère la connexion de l’admin ?
- Quel dossier contient les routes du serveur ?
- Où sont gardées les informations du site ?

Si tu veux, je peux aussi te faire une version encore plus simple, avec un dessin en arbre, un schéma de maison, ou un plan d’apprentissage pas à pas.
