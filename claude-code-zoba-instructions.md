# Instructions Claude Code --- Optimisation, Sécurité et Efficacité du projet ZOBA

## 0. Mission

Tu es Claude Code, agent principal chargé d'améliorer et d'implémenter
le projet ZOBA.

Ta priorité n'est **pas de produire le plus de code possible**, mais de
produire le **minimum de code nécessaire, fiable, maintenable, sécurisé
et cohérent** avec l'architecture existante.

Le projet est un site React/Vite/TypeScript avec un backend
Node.js/Express/TypeScript/Mongoose/MongoDB. Le frontend contient encore
des dépendances Supabase, notamment pour les dons. Le backend possède
déjà les routes et modèles de dons côté MongoDB.

La documentation fournie décrit : - la structure frontend/backend et le
rôle des principaux fichiers ; - l'état actuel de l'intégration des dons
; - l'architecture recommandée pour Stripe Checkout ; - les variables
d'environnement ; - les routes, modèles, webhook et tests à mettre en
place.

**Sources de référence à respecter :** 1. `explain.md` : architecture et
fonctionnement du projet. 2. `implementation.md` : intégration Stripe et
état actuel des dons.

Ne suppose jamais qu'un élément existe réellement simplement parce qu'il
est mentionné dans la documentation : **inspecte d'abord le dépôt.**

------------------------------------------------------------------------

# 1. Règle fondamentale : inspecter avant de modifier

Avant toute modification :

1.  Lire le `README.md`.
2.  Lire les `package.json` frontend et backend.
3.  Inspecter l'arborescence utile.
4.  Ouvrir uniquement les fichiers directement concernés.
5.  Identifier les dépendances réellement installées.
6.  Vérifier les scripts disponibles.
7.  Vérifier l'état Git.
8.  Vérifier les imports et usages existants.
9.  Identifier les doublons ou anciennes implémentations.
10. Déterminer le plus petit ensemble de fichiers à modifier.

**Interdiction :** - ne pas réécrire un fichier entier sans nécessité
; - ne pas créer une nouvelle architecture si une architecture existante
convient ; - ne pas remplacer une technologie simplement parce qu'une
autre semble plus moderne ; - ne pas modifier des fichiers sans rapport
avec la tâche.

------------------------------------------------------------------------

# 2. Objectif de consommation minimale

Tu dois optimiser la consommation de tokens, de contexte, de temps et de
commandes.

## 2.1 Lecture intelligente

Ne lis pas tout le projet en permanence.

Utilise cette stratégie :

``` text
Question/Tâche
    ↓
Identifier les fichiers concernés
    ↓
Recherche ciblée
    ↓
Lecture des sections pertinentes
    ↓
Modification minimale
    ↓
Validation ciblée
```

Privilégie : - recherche par symbole ; - recherche par nom de fichier
; - recherche par route ; - recherche par import ; - lecture de petites
portions ; - comparaison avant/après.

Évite : - lire tous les fichiers ; - relire plusieurs fois le même
fichier ; - analyser des dossiers `node_modules`, build, cache ou
fichiers générés ; - demander du contexte déjà disponible.

------------------------------------------------------------------------

# 3. Utilisation efficace de Claude Code

Pour chaque tâche, commence mentalement par cette classification :

### Niveau A --- Petite modification

Exemples : - modifier un texte ; - corriger un type ; - ajouter un champ
; - corriger un import.

Action : - rechercher le symbole ; - ouvrir le fichier ; - modifier ; -
lancer le contrôle approprié.

### Niveau B --- Fonctionnalité locale

Exemples : - nouvelle route ; - nouveau composant ; - nouvelle page ; -
formulaire.

Action : - inspecter les fichiers liés ; - comprendre le flux existant
; - implémenter ; - tester uniquement le périmètre concerné.

### Niveau C --- Fonctionnalité critique

Exemples : - authentification ; - Stripe ; - dons ; - webhook ; - base
de données ; - sécurité.

Action : - cartographier le flux complet ; - identifier les dépendances
; - modifier progressivement ; - tester les cas nominaux et d'erreur ; -
vérifier les secrets et permissions ; - faire une revue finale.

------------------------------------------------------------------------

# 4. Ne jamais gaspiller du contexte

## À faire

Utiliser des recherches ciblées comme :

``` bash
rg "donations" src backend
rg "supabase" src backend
rg "Donation" backend/src
rg "auth" backend/src
```

Puis ouvrir seulement les fichiers nécessaires.

## À éviter

``` bash
cat $(find . -type f)
```

ou toute commande qui charge massivement le dépôt.

Exclure autant que possible :

``` text
node_modules
dist
build
.git
coverage
.cache
.vite
```

------------------------------------------------------------------------

# 5. Architecture à respecter

L'architecture documentée est organisée autour de :

``` text
Frontend
├── src/
│   ├── components/
│   ├── pages/
│   ├── pages/admin/
│   ├── lib/
│   └── types/

Backend
├── backend/
│   └── src/
│       ├── routes/
│       ├── models/
│       ├── middleware/
│       ├── config/
│       └── server.ts

Database
└── MongoDB
```

Le frontend est basé sur React + Vite + TypeScript + Tailwind.

Le backend est basé sur Node.js + Express + TypeScript + Mongoose +
MongoDB.

**Ne mélange pas les responsabilités :**

``` text
React
  ↓
API client
  ↓
Express route
  ↓
Validation / middleware
  ↓
Model Mongoose
  ↓
MongoDB
```

Le frontend ne doit pas accéder directement aux opérations sensibles du
backend.

------------------------------------------------------------------------

# 6. Règle importante concernant Supabase

La documentation indique une situation transitoire :

-   le backend possède déjà MongoDB ;
-   `Donation` existe côté MongoDB ;
-   la page `DonationsPage.tsx` utilise encore Supabase ;
-   l'administration peut également encore utiliser Supabase pour les
    dons.

Donc :

**Ne supprime pas Supabase immédiatement.**

Avant toute migration :

1.  rechercher tous les usages de Supabase ;
2.  identifier ceux qui concernent les dons ;
3.  identifier ceux qui concernent d'autres fonctionnalités ;
4.  vérifier si une migration complète est demandée ;
5.  ne supprimer les fichiers/dépendances Supabase que lorsqu'ils ne
    sont plus utilisés.

Objectif :

``` text
Pas de duplication accidentelle
Pas de données perdues
Pas de fonctionnalité cassée
```

Pour Stripe, la logique de paiement doit être centralisée dans le
backend Express.

------------------------------------------------------------------------

# 7. Architecture Stripe à privilégier

Utiliser **Stripe Checkout** pour la première intégration.

Flux attendu :

``` text
Utilisateur
   ↓
DonationsPage.tsx
   ↓
POST /api/donations/checkout
   ↓
Backend Express
   ↓
Créer Donation { status: "pending" }
   ↓
Créer Stripe Checkout Session
   ↓
Stripe
   ↓
Paiement
   ↓
Stripe Webhook
   ↓
POST /api/donations/webhook
   ↓
Vérification signature
   ↓
MongoDB
   ↓
Donation { status: "completed" }
```

Ne jamais considérer uniquement la redirection `success_url` comme
preuve définitive du paiement.

**La confirmation serveur via webhook est la source de vérité du statut
du paiement.**

------------------------------------------------------------------------

# 8. Stripe : règles de sécurité absolues

Ne jamais exposer :

``` text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
MONGODB_URI
JWT_SECRET
ADMIN_PASSWORD
```

dans le frontend.

Ne jamais écrire de secret réel dans : - Git ; - README ; - code source
; - logs ; - réponses API ; - messages d'erreur frontend.

Utiliser :

``` text
backend/.env
backend/.env.example
```

Le `.env.example` ne doit contenir que des valeurs fictives.

------------------------------------------------------------------------

# 9. Webhook Stripe : priorité maximale

Le webhook doit conserver le corps brut de la requête.

Ne pas laisser `express.json()` transformer le body avant le traitement
du webhook.

Architecture :

``` text
POST /api/donations/webhook
        ↓
express.raw({ type: "application/json" })
        ↓
stripe.webhooks.constructEvent(...)
        ↓
Validation signature
        ↓
Traitement événement
```

Ne jamais accepter un webhook simplement parce qu'il contient un
`donationId`.

La signature Stripe doit être vérifiée.

------------------------------------------------------------------------

# 10. Idempotence du webhook

Le webhook peut être reçu plusieurs fois.

Le code doit éviter de transformer ou recréer plusieurs fois le même
paiement.

Utiliser les identifiants Stripe disponibles :

``` text
stripeEventId
stripeCheckoutSessionId
stripePaymentIntentId
```

Avant une mise à jour sensible :

1.  vérifier l'événement ;
2.  identifier le don ;
3.  vérifier son état ;
4.  éviter les changements incohérents ;
5.  enregistrer l'identifiant de l'événement si nécessaire.

Exemple logique :

``` text
événement reçu
    ↓
signature valide ?
    ↓ non → 400
    ↓ oui
événement déjà traité ?
    ↓ oui → répondre 200
    ↓ non
mettre à jour le don
    ↓
enregistrer l'événement
```

------------------------------------------------------------------------

# 11. Montants Stripe

Attention aux unités Stripe.

Pour `XOF`, vérifier le comportement actuel de Stripe et utiliser
l'unité attendue par l'API.

Ne jamais supposer que toutes les devises utilisent les centimes.

Avant de modifier la logique :

``` text
currency
↓
minor unit
↓
Stripe unit_amount
```

Valider également :

-   montant \> 0 ;
-   montant raisonnable ;
-   devise autorisée ;
-   pas de valeur manipulée côté client sans validation serveur.

Le montant envoyé par le frontend doit toujours être **revalidé côté
backend**.

------------------------------------------------------------------------

# 12. Validation des entrées

Toute donnée reçue du frontend est considérée comme non fiable.

Pour :

``` text
amount
currency
donorName
donorEmail
donorPhone
message
```

vérifier :

-   présence ;
-   type ;
-   format ;
-   longueur ;
-   valeur acceptable.

Ne jamais faire confiance à :

``` ts
req.body.amount
```

sans validation.

Si une bibliothèque de validation existe déjà dans le projet,
réutilise-la.

Ne pas ajouter une nouvelle bibliothèque si une solution existante
suffit.

------------------------------------------------------------------------

# 13. API propre et minimale

Les routes documentées incluent :

``` text
POST   /api/donations
GET    /api/donations
PUT    /api/donations/:id
DELETE /api/donations/:id
GET    /api/donations/stats
POST   /api/donations/checkout
POST   /api/donations/webhook
```

Avant d'ajouter une route :

1.  vérifier qu'elle n'existe pas ;
2.  vérifier si une route existante peut être réutilisée ;
3.  conserver les conventions déjà utilisées ;
4.  éviter les doublons.

------------------------------------------------------------------------

# 14. Modèle Donation

Le modèle doit pouvoir suivre au minimum :

``` text
donorName
donorEmail
donorPhone
amount
currency
paymentMethod
transactionId
status
message
createdAt
updatedAt
```

Pour Stripe, les champs suivants peuvent être utilisés :

``` text
stripePaymentIntentId
stripeCheckoutSessionId
stripeEventId
```

Ne pas ajouter des champs inutiles simplement pour "faire complet".

Chaque champ doit avoir une utilité réelle.

------------------------------------------------------------------------

# 15. Frontend : règle de simplicité

Le frontend doit uniquement :

1.  récupérer les informations du don ;
2.  envoyer la demande au backend ;
3.  afficher le chargement ;
4.  gérer les erreurs ;
5.  rediriger vers Stripe ;
6.  afficher le résultat du retour.

Exemple :

``` text
Formulaire
   ↓
Validation UX
   ↓
POST backend
   ↓
session.url
   ↓
window.location.href
```

La logique Stripe secrète reste côté backend.

------------------------------------------------------------------------

# 16. Gestion des erreurs

Chaque appel important doit avoir un comportement d'erreur clair.

Frontend :

``` text
loading
success
error
```

Backend :

``` text
400 → données invalides
401/403 → non autorisé
404 → ressource absente
500 → erreur serveur
```

Ne pas afficher au client des erreurs internes comme :

``` text
MongoDB connection string
stack trace
Stripe secret
requête SQL/Mongo complète
```

------------------------------------------------------------------------

# 17. Performance frontend

Ne pas optimiser prématurément.

Avant d'ajouter :

``` text
memo
useMemo
useCallback
lazy loading
cache complexe
```

identifier d'abord un problème réel.

Priorités :

1.  réduire les requêtes inutiles ;
2.  éviter les appels API répétés ;
3.  charger les images correctement ;
4.  éviter les composants inutilement lourds ;
5.  réutiliser les composants ;
6.  charger les pages lourdes à la demande si nécessaire.

------------------------------------------------------------------------

# 18. Performance backend

Priorités :

-   ne pas effectuer deux requêtes quand une suffit ;
-   sélectionner uniquement les données nécessaires ;
-   paginer les listes volumineuses ;
-   éviter les requêtes répétitives ;
-   ajouter des index MongoDB uniquement lorsqu'ils sont justifiés ;
-   éviter les traitements lourds dans une requête HTTP ;
-   réutiliser la connexion MongoDB.

Ne pas ajouter de cache complexe sans besoin réel.

------------------------------------------------------------------------

# 19. Sécurité générale

Vérifier au minimum :

### Authentification

-   routes admin protégées ;
-   JWT correctement vérifié si utilisé ;
-   mots de passe jamais stockés en clair ;
-   expiration des tokens si prévue ;
-   secrets dans `.env`.

### Autorisation

Un utilisateur authentifié n'est pas automatiquement administrateur.

Vérifier le rôle/permission avant :

``` text
POST admin
PUT admin
DELETE admin
GET statistiques privées
```

### CORS

Limiter CORS à l'origine frontend prévue en production.

Éviter :

``` text
Access-Control-Allow-Origin: *
```

pour des opérations sensibles.

### Données

Ne jamais retourner inutilement :

``` text
password
passwordHash
JWT secret
Stripe secrets
```

------------------------------------------------------------------------

# 20. Ne pas casser l'existant

Avant modification :

``` text
git status
```

Après modification :

``` text
git diff
```

Puis uniquement les tests nécessaires.

Si une modification crée beaucoup de changements inattendus :

**STOP.**

Analyser avant de continuer.

Ne pas "réparer" automatiquement des problèmes sans rapport avec la
tâche.

------------------------------------------------------------------------

# 21. Stratégie d'implémentation par petites étapes

Pour une fonctionnalité importante, travailler comme ceci :

## Étape 1 --- Audit

Produire mentalement :

``` text
Fichiers concernés
Dépendances
Routes existantes
Modèles existants
Risques
```

## Étape 2 --- Backend

Faire fonctionner :

``` text
Donation pending
↓
Stripe Checkout
```

## Étape 3 --- Webhook

Faire fonctionner :

``` text
Stripe
↓
Webhook
↓
Donation completed
```

## Étape 4 --- Frontend

Connecter :

``` text
Formulaire
↓
API
↓
Stripe
```

## Étape 5 --- Retour utilisateur

Ajouter :

``` text
success
cancel
error
```

## Étape 6 --- Administration

Vérifier que l'admin lit les données depuis la bonne source.

## Étape 7 --- Tests

Tester :

``` text
don normal
don invalide
paiement réussi
paiement annulé
paiement échoué
webhook invalide
webhook répété
route admin non autorisée
```

------------------------------------------------------------------------

# 22. Commandes : ne pas multiplier les exécutions

Avant de lancer une commande coûteuse, demander :

> Est-ce que cette commande apporte une information nécessaire ?

Regrouper les vérifications lorsque cela est possible.

Exemple :

``` bash
npm run lint && npm run build
```

plutôt que lancer inutilement plusieurs commandes identiques.

Mais ne pas sacrifier la sécurité ou la validation uniquement pour
économiser une commande.

------------------------------------------------------------------------

# 23. Dépendances

Avant :

``` bash
npm install package
```

vérifier :

1.  le package est-il déjà installé ?
2.  une dépendance existante peut-elle faire le travail ?
3.  est-ce réellement nécessaire ?
4.  la dépendance est-elle utilisée côté serveur ou frontend ?

Pour Stripe :

``` text
backend → stripe
frontend → @stripe/stripe-js uniquement si nécessaire
```

Pour Stripe Checkout avec redirection simple, ne pas ajouter inutilement
Payment Element ou d'autres packages Stripe.

------------------------------------------------------------------------

# 24. Documentation technique

Après une modification importante, mettre à jour uniquement la
documentation concernée.

Mettre à jour si nécessaire :

``` text
README.md
backend/.env.example
documentation technique
```

Ne pas générer une énorme documentation inutile.

La documentation doit permettre à un autre développeur de comprendre :

``` text
quoi
pourquoi
où
comment lancer
comment tester
```

------------------------------------------------------------------------

# 25. Tests minimaux obligatoires

Avant de déclarer une fonctionnalité terminée :

### Frontend

``` text
npm run lint
npm run build
```

si ces scripts existent.

### Backend

Utiliser les scripts réellement présents dans `backend/package.json`.

Tester au minimum :

``` text
API démarre
MongoDB se connecte
route checkout répond
webhook répond
```

Pour Stripe :

``` bash
stripe listen --forward-to localhost:5000/api/donations/webhook
```

et utiliser les événements/cartes de test Stripe.

------------------------------------------------------------------------

# 26. Tests manuels Stripe

Vérifier :

### Cas 1 --- succès

``` text
formulaire
→ checkout
→ paiement test
→ webhook
→ MongoDB status = completed
```

### Cas 2 --- annulation

``` text
checkout
→ cancel
→ retour frontend
```

### Cas 3 --- données invalides

``` text
montant invalide
email invalide
données manquantes
```

### Cas 4 --- webhook invalide

``` text
signature incorrecte
→ requête rejetée
```

### Cas 5 --- webhook répété

``` text
même événement
→ aucune double validation
```

------------------------------------------------------------------------

# 27. Git : discipline

Avant :

``` bash
git status
```

Après :

``` bash
git diff
```

Ne jamais committer automatiquement sans demande explicite.

Ne jamais supprimer une branche ou réinitialiser l'historique sans
instruction explicite.

Ne jamais exécuter :

``` bash
git reset --hard
git clean -fd
```

sans autorisation explicite.

------------------------------------------------------------------------

# 28. Politique de modification

Chaque changement doit répondre à au moins une de ces catégories :

``` text
Bug
Sécurité
Fonctionnalité
Performance
Maintenabilité
Documentation
```

Si le changement ne correspond à rien de cela, ne pas le faire.

------------------------------------------------------------------------

# 29. Règle anti-sur-ingénierie

Ne pas transformer :

``` text
1 route
```

en :

``` text
12 services
8 repositories
4 factories
3 abstractions
```

sans besoin réel.

Préférer :

``` text
simple
lisible
testable
maintenable
```

L'abstraction doit résoudre un problème réel.

------------------------------------------------------------------------

# 30. Règle de cohérence

Toujours respecter les conventions déjà présentes :

-   nommage ;
-   structure des routes ;
-   structure des modèles ;
-   gestion des erreurs ;
-   format des réponses ;
-   style TypeScript ;
-   organisation des imports.

Ne pas introduire plusieurs styles concurrents.

------------------------------------------------------------------------

# 31. Règle TypeScript

Éviter :

``` ts
any
```

sauf nécessité justifiée.

Préférer :

``` ts
unknown
```

avec validation.

Typer :

``` text
request
response
Stripe event
Donation
API payload
```

Ne pas utiliser des assertions dangereuses comme :

``` ts
as Something
```

pour cacher une erreur de typage.

------------------------------------------------------------------------

# 32. Règle de réponse API

Conserver un format cohérent.

Exemple :

``` json
{
  "message": "..."
}
```

ou, lorsque nécessaire :

``` json
{
  "data": {},
  "message": "..."
}
```

Ne pas changer les formats existants sans vérifier les consommateurs
frontend.

------------------------------------------------------------------------

# 33. Checklist avant "terminé"

``` text
[ ] J'ai inspecté le code existant.
[ ] Je n'ai pas créé de doublon.
[ ] J'ai modifié uniquement les fichiers nécessaires.
[ ] Les secrets restent côté serveur.
[ ] Les entrées utilisateur sont validées.
[ ] Les routes sensibles sont protégées.
[ ] Le webhook Stripe vérifie sa signature.
[ ] Le webhook est idempotent.
[ ] Le statut du don est confirmé côté serveur.
[ ] Les erreurs sont correctement gérées.
[ ] Le frontend ne contient aucune clé secrète.
[ ] Les scripts lint/build/test disponibles ont été utilisés.
[ ] Le diff Git a été vérifié.
[ ] La documentation nécessaire est à jour.
[ ] Aucun changement hors sujet n'a été introduit.
```

------------------------------------------------------------------------

# 34. Format de compte-rendu après chaque tâche importante

À la fin, répondre de manière courte :

``` text
## Résultat

### Modifié
- fichier
- fichier

### Fonctionnalité
- ce qui a été ajouté/corrigé

### Sécurité
- contrôles effectués

### Tests
- commandes exécutées
- résultat

### À surveiller
- uniquement les problèmes réellement restants
```

Ne pas fournir une longue explication si la tâche est simple.

------------------------------------------------------------------------

# 35. Règle finale

Le meilleur résultat n'est pas :

> "J'ai modifié beaucoup de fichiers."

Le meilleur résultat est :

> "J'ai compris le système, modifié uniquement ce qui était nécessaire,
> sécurisé les points critiques, testé le changement et laissé le projet
> plus propre qu'avant."

**Priorité absolue :**

``` text
Comprendre
→ Planifier
→ Modifier peu
→ Tester
→ Vérifier
→ Documenter
```

Et non :

``` text
Lire tout
→ Tout modifier
→ Ajouter des dépendances
→ Espérer que ça fonctionne
```


# 36. PRIORITÉ SPÉCIALE — REMETTRE DE L'ORDRE DANS LE PROJET

## 36.1 Problème à résoudre

Le projet actuel est considéré comme **désorganisé** et la séparation frontend/backend n'est pas suffisamment claire.

La documentation décrit un dossier `backend/`, mais cette documentation ne garantit pas que l'état réel du dépôt correspond encore à cette structure.

**Claude Code doit donc faire un audit réel du dépôt avant toute réorganisation.**

L'objectif n'est pas seulement de faire fonctionner le projet.

L'objectif est que le développeur puisse ouvrir le projet et comprendre immédiatement :

```text
Frontend → ce que voit l'utilisateur
Backend → API et logique serveur
Database → données
Shared/Types → contrats partagés si nécessaire
Config → configuration
Docs → documentation
```

---

# 37. RÈGLE ABSOLUE — NE PAS DÉPLACER AU HASARD

Avant de déplacer un fichier :

1. rechercher tous ses imports ;
2. rechercher tous les chemins qui le référencent ;
3. vérifier s'il est utilisé par le frontend ;
4. vérifier s'il est utilisé par le backend ;
5. vérifier les scripts `package.json` ;
6. vérifier les variables d'environnement ;
7. vérifier les configurations Vite/TypeScript/ESLint ;
8. vérifier les routes ;
9. vérifier les chemins de build ;
10. vérifier les fichiers de déploiement s'ils existent.

Exemple :

```bash
rg "nom-du-fichier|ancien/chemin" .
```

**Ne jamais déplacer un fichier puis attendre que les erreurs indiquent ce qui était cassé.**

Il faut comprendre ses dépendances avant le déplacement.

---

# 38. ARCHITECTURE CIBLE

Si l'audit confirme que le projet mélange réellement frontend et backend, tendre progressivement vers cette structure :

```text
zoba/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── setup/
│
├── .gitignore
├── README.md
└── package.json
```

Cette structure est une **cible**, pas une permission de tout déplacer immédiatement.

Si le projet actuel fonctionne avec une autre structure saine, la conserver.

---

# 39. RESPONSABILITÉ DE CHAQUE DOSSIER

## `frontend/`

Contient uniquement ce qui concerne l'interface utilisateur.

Exemples :

```text
pages
components
hooks
services API
types frontend
styles
assets
```

Le frontend ne doit pas contenir :

```text
MongoDB
Mongoose
JWT secret
Stripe secret key
logique serveur
connexion directe à MongoDB
```

---

## `backend/`

Contient uniquement la logique serveur.

Exemples :

```text
routes
controllers
services
models
middleware
config
validation
Stripe
auth
MongoDB
```

Le backend ne doit pas contenir :

```text
React components
JSX
Tailwind UI
browser APIs
window.location
```

---

# 40. ROUTES ≠ LOGIQUE MÉTIER

Si le projet contient des routes trop grosses, ne pas tout laisser dans :

```text
routes/*.routes.ts
```

Tendre vers :

```text
routes/
    donation.routes.ts

controllers/
    donation.controller.ts

services/
    donation.service.ts
    stripe.service.ts

models/
    Donation.model.ts
```

Flux :

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Model
 ↓
MongoDB
```

Mais attention :

**ne pas créer des controllers/services abstraits uniquement pour respecter une architecture théorique.**

Pour une petite fonctionnalité, une route simple peut rester simple.

Introduire une séparation lorsqu'elle améliore réellement la lisibilité ou la maintenance.

---

# 41. FRONTEND : SÉPARER API ET UI

Éviter de mettre des appels `fetch()` complexes directement dans les composants.

Si plusieurs composants utilisent la même API, créer :

```text
frontend/src/services/
```

Par exemple :

```text
services/
├── api.ts
├── donation.service.ts
├── activity.service.ts
├── news.service.ts
└── auth.service.ts
```

Le composant doit ressembler davantage à :

```text
UI
 ↓
service
 ↓
API
```

et non :

```text
UI
 ↓
fetch complexe
 ↓
transformation
 ↓
gestion API
 ↓
UI
```

---

# 42. TYPESCRIPT : ORGANISER LES TYPES

Ne pas avoir un gigantesque :

```text
types.ts
```

qui contient tout le projet.

Séparer progressivement :

```text
frontend/src/types/
backend/src/types/
```

ou un dossier `shared/` uniquement si des types sont réellement partagés entre frontend et backend.

Exemple :

```text
shared/
└── types/
    └── donation.ts
```

Ne pas créer `shared/` juste pour quelques types qui ne sont pas réellement partagés.

---

# 43. CONFIGURATION

Toutes les configurations doivent être faciles à identifier.

Backend :

```text
backend/.env
backend/.env.example
backend/src/config/
```

Frontend :

```text
frontend/.env
frontend/.env.example
```

Les variables frontend doivent être explicitement considérées comme **publiques**.

Une variable `VITE_*` ne doit jamais contenir un secret serveur.

---

# 44. SUPABASE : NETTOYAGE PROGRESSIF

Le projet contient actuellement des traces de Supabase alors que le backend utilise MongoDB.

Claude Code doit déterminer précisément :

```text
Quels fichiers utilisent Supabase ?
Pourquoi ?
Quelles données ?
Peut-on migrer ?
```

Créer une cartographie :

```text
Supabase
├── donations → migration vers backend/MongoDB
├── autre fonctionnalité → conserver si nécessaire
└── inutilisé → supprimer après vérification
```

**Ne pas supprimer Supabase en bloc.**

La suppression ne doit intervenir qu'après avoir vérifié que plus aucune fonctionnalité utile ne dépend de cette technologie.

---

# 45. BASE DE DONNÉES

La base de données doit être accessible uniquement depuis le backend.

Architecture souhaitée :

```text
Frontend
   ❌
   │
   └──── MongoDB

Frontend
   │
   ↓
Backend API
   │
   ↓
MongoDB
```

Le frontend ne doit jamais recevoir :

```text
MONGODB_URI
```

ni accéder directement à MongoDB.

---

# 46. STRIPE DANS L'ARCHITECTURE

Stripe doit être placé côté backend.

Exemple :

```text
backend/src/
├── routes/
│   └── donation.routes.ts
│
├── controllers/
│   └── donation.controller.ts
│
├── services/
│   ├── donation.service.ts
│   └── stripe.service.ts
│
└── models/
    └── Donation.model.ts
```

Le frontend ne doit connaître que :

```text
POST /api/donations/checkout
```

et recevoir une URL de Checkout.

---

# 47. PLAN DE REFACTORING OBLIGATOIRE

Claude Code doit procéder en plusieurs phases.

## Phase 1 — Cartographie

Ne modifier aucun fichier.

Identifier :

```text
Frontend réel
Backend réel
Routes
Models
Services
Database
Supabase
Stripe
Auth
Configs
Types
Assets
Tests
```

Puis identifier les fichiers qui sont au mauvais endroit.

---

## Phase 2 — Proposition

Avant une grosse réorganisation, établir un plan court :

```text
1. déplacer X vers Y
2. déplacer A vers B
3. créer C
4. mettre à jour les imports
5. tester
```

Le plan doit rester proportionné.

---

## Phase 3 — Déplacement progressif

Déplacer par petits groupes cohérents.

Exemple :

```text
Étape A
Frontend

Étape B
Backend

Étape C
Services

Étape D
Configuration
```

Après chaque groupe :

```text
TypeScript
imports
build
```

---

## Phase 4 — Nettoyage

Après les déplacements :

- supprimer les fichiers réellement devenus inutiles ;
- supprimer les imports morts ;
- supprimer les dépendances inutilisées seulement après vérification ;
- mettre à jour les chemins ;
- mettre à jour README ;
- vérifier `.gitignore`.

---

# 48. NE PAS FAIRE UNE "BIG BANG MIGRATION"

Interdit de :

```text
déplacer 100 fichiers
+
réécrire l'architecture
+
changer MongoDB
+
changer Supabase
+
changer l'auth
+
ajouter Stripe
```

dans une seule opération.

Cela rend le debugging extrêmement difficile.

Préférer :

```text
organisation
↓
validation
↓
backend
↓
validation
↓
frontend
↓
validation
↓
Stripe
↓
validation
```

---

# 49. OBJECTIF PÉDAGOGIQUE

Le projet doit être suffisamment propre pour qu'un développeur junior puisse comprendre :

```text
Où est le frontend ?
Où est le backend ?
Où est la base de données ?
Où sont les routes ?
Où sont les modèles ?
Où sont les services ?
Où est l'auth ?
Où est Stripe ?
Où sont les appels API ?
Où sont les types ?
```

En moins de quelques minutes.

Si Claude Code crée une architecture tellement complexe qu'un débutant ne sait plus où chercher, **l'architecture est considérée comme ratée**, même si elle est techniquement valide.

---

# 50. README APRÈS RESTRUCTURATION

Le README doit contenir au minimum :

```text
# ZOBA

## Architecture

frontend/
backend/
docs/

## Installation

Frontend
Backend

## Variables d'environnement

Frontend
Backend

## Développement

lancer frontend
lancer backend

## API

principales routes

## Base de données

MongoDB

## Paiements

Stripe

## Administration

auth et dashboard
```

Ajouter un petit arbre :

```text
zoba/
├── frontend/
├── backend/
├── docs/
└── README.md
```

Le README devient la carte du projet.

---

# 51. RÈGLE "JE DOIS POUVOIR M'Y RETROUVER"

Pour chaque nouveau fichier, Claude Code doit pouvoir répondre :

> Pourquoi ce fichier est-il ici ?

Si la réponse n'est pas évidente, le fichier est probablement mal placé ou son nom n'est pas assez explicite.

Préférer :

```text
donation.service.ts
stripe.service.ts
auth.middleware.ts
```

à des noms vagues :

```text
helper.ts
utils2.ts
newFile.ts
logic.ts
testFinal.ts
```

---

# 52. FIN DE RESTRUCTURATION — RAPPORT OBLIGATOIRE

À la fin du refactoring, produire :

```text
## Architecture avant

résumé très court

## Architecture après

arbre principal

## Fichiers déplacés

liste

## Fichiers créés

liste

## Fichiers supprimés

liste + raison

## Dépendances supprimées

liste + raison

## Supabase

ce qui reste / ce qui a été migré

## Backend

où se trouvent maintenant :
- routes
- controllers
- services
- models
- middleware
- config

## Frontend

où se trouvent maintenant :
- pages
- composants
- services
- hooks
- types

## Vérifications

- lint
- build
- tests
- démarrage frontend
- démarrage backend

## Problèmes restants

uniquement les vrais problèmes
```

---

# 53. INSTRUCTION FINALE POUR CLAUDE CODE

**Ta première mission sur ce projet n'est pas d'ajouter des fonctionnalités.**

Ta première mission est :

```text
COMPRENDRE LE PROJET
        ↓
CARTOGRAPHIER LE PROJET
        ↓
SÉPARER CE QUI EST MÉLANGÉ
        ↓
RÉORGANISER PROGRESSIVEMENT
        ↓
VALIDER
        ↓
DOCUMENTer
```

Tu dois construire une base propre avant d'empiler de nouvelles fonctionnalités.

Le développeur doit pouvoir reprendre le projet après ton intervention et comprendre rapidement où se trouve chaque chose.

**Ne privilégie jamais une architecture "impressionnante" à une architecture claire.**
