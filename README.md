# ZOBA — Site Web de la Zone Baptiste Agapé

**ZOBA** est le site officiel de la Zone Baptiste Agapé, gérée par la Convention Baptiste du Togo (CBT). Ce dépôt contient un frontend React/Vite/Tailwind et un backend Node/Express/MongoDB pour gérer l'information publique, les dons, les activités et l'administration.

## Fonctionnalités principales

### Site public

- Page d'accueil avec mission, statistiques (count-up animé), activités et actualités
- Page À propos et présentation des départements
- Page Activités avec inscriptions en ligne
- Section Actualités
- Galerie photo
- Formulaire de contact
- Page de dons
- Réseaux sociaux dans le footer (Facebook, Instagram, TikTok, YouTube, WhatsApp)

### Administration

- Gestion des activités (CRUD)
- Gestion des actualités (CRUD)
- Gestion de la galerie (CRUD)
- Gestion des membres du bureau
- Lecture et réponse aux contacts
- Gestion des abonnés newsletter
- Suivi des inscriptions aux activités
- Suivi des dons

## Stack technique

- Frontend : React 18, TypeScript, Vite
- UI : Tailwind CSS
- Backend : Node.js, Express.js, TypeScript
- Base de données : MongoDB via Mongoose
- Authentification : JWT
- Icônes : Lucide React

## Architecture du projet

```
zoba/
├── frontend/                # Frontend React (Vite)
│   ├── src/
│   │   ├── components/      # Navbar, Footer, éléments UI
│   │   ├── lib/              # Client API (src/lib/api.ts)
│   │   ├── pages/            # Pages publiques
│   │   │   └── admin/        # Interface d'administration
│   │   └── types/            # Types TypeScript
│   ├── index.html
│   └── package.json
├── backend/                 # Backend Node.js
│   ├── src/
│   │   ├── config/           # Configuration MongoDB
│   │   ├── middleware/       # Auth, validation, gestion d'erreurs
│   │   ├── models/           # Modèles Mongoose
│   │   ├── routes/           # Routes API Express
│   │   ├── services/         # Stripe, FedaPay, logique des dons
│   │   ├── utils/            # AppError, conversions de devise
│   │   ├── app.ts            # Express app (middlewares + routes)
│   │   └── server.ts         # Connexion MongoDB + démarrage du serveur
│   └── package.json
├── docs/                    # Documentation complémentaire
│   ├── explain.md
│   └── implementation.md
├── README.md
└── package.json             # Scripts d'orchestration racine
```

Toutes les données de l'application (activités, actualités, galerie, membres, contacts, abonnés, inscriptions, dons) sont stockées dans MongoDB via le backend Express. Le frontend n'accède jamais directement à la base de données.

## Prérequis

- Node.js >= 18
- npm
- MongoDB (local ou Atlas)

> **MongoDB Atlas** : si `MONGODB_URI` utilise le format `mongodb+srv://`, le driver effectue une requête DNS SRV pour résoudre les hôtes du cluster. Sur certains réseaux (VPN, pare-feu, box/FAI restrictifs), ces requêtes DNS SRV sont bloquées et la connexion échoue avec `querySrv ECONNREFUSED`. Solution : dans Atlas, section **Connect → Drivers**, récupérez la liste des hôtes du replica set (ou résolvez `_mongodb._tcp.<cluster>.mongodb.net` en SRV via `nslookup`/`Resolve-DnsName`) et utilisez plutôt le format standard, sans SRV : `mongodb://user:pass@host1:27017,host2:27017,host3:27017/db?replicaSet=...&authSource=admin&ssl=true`. Inconvénient : la liste d'hôtes est figée et doit être régénérée après un failover/une maintenance Atlas qui changerait les hôtes du cluster.

## Installation

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

## Configuration

### Backend

1. Copier le fichier d'exemple :

```bash
cp backend/.env.example backend/.env
```

2. Compléter `backend/.env` :

```env
MONGODB_URI=mongodb://localhost:27017/zoba
JWT_SECRET=un-secret-jwt-tres-securise
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

> Important : utilisez des valeurs de production uniques et ne partagez pas ce fichier. Le compte administrateur (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) est créé automatiquement au premier démarrage du backend **uniquement si ces deux variables sont définies** — sans elles, aucun admin par défaut n'est créé (voir `backend/src/config/database.ts`).

#### Paiements — Stripe et FedaPay (optionnel)

La page de dons propose, en plus de l'enregistrement manuel (Moov/Mixx/PayPal, chacun avec son propre panneau), deux passerelles de paiement réelles **intégrées directement sur la page** (pas de redirection) : Stripe via **Stripe Elements** (formulaire de carte) et FedaPay via son widget **Checkout.js** (Mobile Money). Chacune est indépendante : le backend démarre sans elles, seule la route `/checkout` échoue pour le fournisseur non configuré.

```env
# Stripe (carte bancaire, cle secrete cote backend uniquement)
STRIPE_SECRET_KEY=sk_test_votre_cle
STRIPE_WEBHOOK_SECRET=whsec_votre_secret

# FedaPay (Mobile Money / carte — Afrique de l'Ouest, cle secrete cote backend uniquement)
FEDAPAY_SECRET_KEY=sk_sandbox_votre_cle
FEDAPAY_WEBHOOK_SECRET=votre_secret_webhook
FEDAPAY_ENV=sandbox
```

Cote **frontend**, deux clés **publiques** (voir `frontend/.env.example`) sont nécessaires pour que les widgets s'affichent :

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
VITE_FEDAPAY_PUBLIC_KEY=pk_sandbox_votre_cle
```

> FedaPay Checkout.js exige que le domaine du site soit autorisé dans le dashboard FedaPay (section "Applications") — configuration à faire côté compte FedaPay, hors du code.

Flux commun aux deux : `POST /api/donations/checkout` crée un `Donation` en base avec `status: pending` (montant validé côté serveur), puis renvoie au frontend soit un `clientSecret` Stripe (monté dans `<PaymentElement>`), soit un `transactionId` FedaPay (donné au widget Checkout.js). Seul le webhook serveur (`POST /api/donations/webhook/stripe` ou `/fedapay`), signature vérifiée, fait passer le don à `completed` — jamais la confirmation du widget côté client.

Tester les webhooks en local avec le CLI Stripe :

```bash
stripe listen --forward-to localhost:5000/api/donations/webhook/stripe
stripe trigger payment_intent.succeeded
```

Pour FedaPay, exposer le port local (ex. `ngrok http 5000`) et configurer l'URL de webhook `https://<ngrok>/api/donations/webhook/fedapay` dans le dashboard FedaPay (mode sandbox).

> Consultez `docs/implementation.md` pour le contexte initial de l'intégration Stripe (le flux décrit y est désormais remplacé par Stripe Elements).

### Frontend

1. Copier le fichier d'exemple :

```bash
cp frontend/.env.example frontend/.env
```

2. Compléter `frontend/.env` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
VITE_FEDAPAY_PUBLIC_KEY=pk_sandbox_votre_cle
```

> Les variables `VITE_*` sont publiques (embarquées dans le bundle du navigateur) : n'y placez jamais de secret serveur. Les clés Stripe/FedaPay ci-dessus sont bien les clés **publiques** (jamais les clés secrètes).

## Démarrage local

```bash
# Terminal 1 : backend
cd backend && npm run dev

# Terminal 2 : frontend
cd frontend && npm run dev
```

Ou depuis la racine (scripts d'orchestration) :

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend : `http://localhost:5173`
- Backend API : `http://localhost:5000`

## Build production

```bash
# Depuis la racine
npm run build:frontend
npm run build:backend

# Backend : démarrage après build
cd backend && npm start
```

## Hébergement

- **Backend** → Render (`render.yaml` à la racine : service Node `zoba-api`, `rootDir: backend`, health check `/api/health`). Variables secrètes en `sync: false`, à saisir dans le dashboard.
- **Frontend** → Vercel (`frontend/vercel.json` : preset Vite + rewrite SPA vers `/index.html` pour react-router). Root Directory = `frontend`, `VITE_API_URL` = URL Render + `/api`.
- `FRONTEND_URL` (backend) doit contenir l'URL Vercel exacte — c'est ce qui pilote le CORS (plusieurs origines possibles, séparées par des virgules).

### Garder le backend Render actif (UptimeRobot)

Le plan gratuit Render met le service en veille après 15 min sans trafic (réveil ~30-50 s au 1er accès). Un ping périodique le garde éveillé :

1. Compte gratuit sur [uptimerobot.com](https://uptimerobot.com).
2. **Add New Monitor** :
   - **Type** : `Keyword`
   - **URL** : `https://<zoba-api>.onrender.com/api/health`
   - **Keyword type** : `exists` — **Keyword** : `ok`
   - **Monitoring interval** : `5 minutes`
3. Le monitor `Keyword` sur `"status":"ok"` reste UP tant que MongoDB est connecté, et bascule DOWN (alerte e-mail) si `/api/health` renvoie `503` (`"status":"degraded"`) — donc le ping sert aussi de supervision réelle, pas seulement de keep-alive.

> Un intervalle de 5 min sur un seul service ≈ 730 h/mois, dans l'enveloppe gratuite Render (750 instance-hours/mois pour un service).

## Administration

- URL : `/admin`
- Identifiants d'administration : définis dans `backend/.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`), créés automatiquement au démarrage du backend si ces variables sont renseignées.
- Authentification par JWT (7 jours d'expiration), envoyé en `Authorization: Bearer <token>` sur les routes protégées.

> Important : ne publiez pas les identifiants d'administration ni les secrets de configuration.

## API principale

Routes publiques (aucune authentification) sauf mention contraire ; routes admin marquées 🔒 (JWT requis).

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Connexion admin |
| GET | `/api/auth/verify` | Vérification du token admin |
| GET | `/api/members` | Liste des membres |
| GET | `/api/members/:id` | Détail d'un membre |
| POST / PUT / DELETE 🔒 | `/api/members[/:id]` | Gestion des membres |
| GET | `/api/activities` | Liste des activités |
| GET | `/api/activities/:id` | Détail d'une activité |
| POST / PUT / DELETE 🔒 | `/api/activities[/:id]` | Gestion des activités |
| GET | `/api/news` | Liste des actualités publiées (toutes si 🔒) |
| GET | `/api/news/:id` | Détail d'un article |
| POST / PUT / DELETE 🔒 | `/api/news[/:id]` | Gestion des actualités |
| GET | `/api/gallery` | Liste des photos |
| POST / PUT / DELETE 🔒 | `/api/gallery[/:id]` | Gestion de la galerie |
| POST | `/api/contacts` | Envoyer un message |
| GET 🔒 / PUT 🔒 /:id/read / DELETE 🔒 | `/api/contacts[/:id]` | Gestion des messages |
| POST | `/api/subscribers` | S'abonner à la newsletter |
| DELETE | `/api/subscribers/unsubscribe` | Se désabonner |
| GET 🔒 / PUT 🔒 / DELETE 🔒 | `/api/subscribers[/:id]` | Gestion des abonnés |
| POST | `/api/registrations` | S'inscrire à une activité |
| GET 🔒 / PUT 🔒 / DELETE 🔒 | `/api/registrations[/:id]` | Gestion des inscriptions |
| POST | `/api/donations` | Enregistrer un don (Moov/Mixx/PayPal, manuel) |
| POST | `/api/donations/checkout` | Créer un paiement Stripe (`clientSecret`) ou FedaPay (`transactionId`) — intégré en place, pas de redirection |
| POST | `/api/donations/webhook/stripe` | Webhook Stripe (signature vérifiée, corps brut) |
| POST | `/api/donations/webhook/fedapay` | Webhook FedaPay (signature vérifiée, corps brut) |
| GET 🔒 / PUT 🔒 / DELETE 🔒 | `/api/donations[/:id]` | Gestion des dons |
| GET 🔒 | `/api/donations/stats` | Statistiques des dons complétés |
| GET | `/api/health` | Health check — `200` si MongoDB est connecté, `503` sinon (reflète `mongoose.connection.readyState`) |

## Modèles principaux

- `Admin` — administrateurs
- `Member` — membres du bureau
- `Activity` — activités et événements
- `News` — actualités
- `Gallery` — images de la galerie
- `Contact` — messages de contact
- `Subscriber` — abonnés newsletter
- `Registration` — inscriptions aux événements
- `Donation` — dons (manuels ou via Stripe/FedaPay ; `provider`, `stripe*`, `fedapay*` renseignés uniquement pour les dons passés par une passerelle). Idempotence des webhooks garantie par un filtre `status: {$ne: 'completed'}` sur la mise à jour **et** des index uniques+sparse sur `stripePaymentIntentId`, `stripeEventId`, `fedapayTransactionId`, `fedapayEventId` (empêchent qu'un identifiant de paiement soit rattaché à deux dons distincts).

## Tests

Scripts réellement présents dans `backend/package.json` : `dev`, `build`, `start` (pas de script `test` — aucun framework de test automatisé n'est installé).

Vérification manuelle recommandée après toute modification backend :

```bash
cd backend && npm run build   # verification TypeScript
npm run dev                    # demarrage local (necessite MongoDB + backend/.env)
curl http://localhost:5000/api/health
```

Puis, avec un client HTTP (curl/Postman) : connexion admin, accès à une route protégée avec/sans token, CRUD sur un domaine, don manuel, don invalide (montant négatif, devise non supportée), `/api/donations/checkout`, et un webhook avec signature invalide (doit répondre 400).

## Notes importantes

- Le backend requiert MongoDB avant démarrage ; il refuse de démarrer si `MONGODB_URI` est absente.
- Ne jamais exposer de secrets (`JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET`, etc.) dans Git.
- Les fichiers `backend/.env` et `frontend/.env` doivent rester locaux et ne doivent pas être commités.
- La page de dons frontend est dans `frontend/src/pages/DonationsPage.tsx`.
- Les routes backend de donation sont dans `backend/src/routes/donation.routes.ts` (CRUD + checkout) et `backend/src/routes/donation.webhook.routes.ts` (webhooks, montés avant le parseur JSON pour préserver le corps brut).

## Documentation complémentaire

- `docs/implementation.md` : guide Stripe complet
- `docs/explain.md` : architecture et fonctionnement du projet
- `backend/.env.example` : variables d'environnement backend
- `frontend/.env.example` : variables d'environnement frontend

## Contribuer

1. Forker le repository
2. Créer une branche de fonctionnalité
3. Ajouter ou modifier du code
4. Ouvrir une pull request

---

Projet ZOBA — Zone Baptiste Agapé
