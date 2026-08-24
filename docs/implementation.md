# Implémentation Stripe pour Project Bolt

Ce document décrit une intégration Stripe complète pour le projet `project-bolt`. Il couvre l'état actuel de l'application, les changements à prévoir au backend et au frontend, les variables d'environnement nécessaires, ainsi que des recommandations de flux de paiement.

---

## 1. État actuel du projet

### 1.1 Backend

- Le backend est un serveur Express + TypeScript dans `backend/src/server.ts`.
- Il expose déjà des routes de donation dans `backend/src/routes/donation.routes.ts` :
  - `POST /api/donations` : enregistre un don dans MongoDB.
  - `GET /api/donations` : liste des dons (protégé par auth).
  - `PUT /api/donations/:id` : mise à jour d'un don.
  - `DELETE /api/donations/:id` : suppression d'un don.
  - `GET /api/donations/stats` : statistiques des dons complétés.

- Le modèle `backend/src/models/Donation.model.ts` gère :
  - `donorName`, `donorEmail`, `donorPhone`
  - `amount`, `currency`, `paymentMethod`
  - `transactionId`, `status` (`pending` | `completed` | `failed`)
  - `message`, timestamps

- La configuration backend charge les variables d'environnement via `dotenv`.
- `backend/.env.example` contient déjà des variables MongoDB, JWT, PORT, FRONTEND_URL et admin.

### 1.2 Frontend

- La page des dons se trouve dans `src/pages/DonationsPage.tsx`.
- Elle utilise actuellement Supabase pour insérer directement dans la table `donations` via :
  - `supabase.from('donations').insert(payload)`.
- Les méthodes de paiement affichées sont `Moov`, `Mixx` et `PayPal`, mais il n'y a pas de lien Stripe actif aujourd'hui.
- Le frontend contient un client Supabase dans `src/lib/supabase.ts`.

### 1.3 Architecture projet

- Frontend : React 18 + Vite + TypeScript + Tailwind.
- Backend : Node.js + Express + TypeScript + Mongoose + MongoDB.
- Le backend et le frontend ne partagent pas encore une route Stripe commune.
- Les dons sont actuellement stockés dans deux environnements distincts :
  - backend MongoDB pour les routes Express existantes
  - Supabase pour la page de dons actuelle

---

## 2. Objectif de l'intégration Stripe

Ajouter un flux de paiement Stripe afin de :

- permettre un vrai paiement en ligne
- lier le paiement à un don enregistré
- assurer la traçabilité des statuts (`pending`, `completed`, `failed`)
- protéger les clés privées côté serveur
- gérer les webhooks Stripe pour valider le paiement automatisé

---

## 3. Recommandations d'architecture Stripe

### 3.1 Choix du flux

Deux options sont possibles :

1. `Stripe Checkout` (recommandé) :
   - plus simple à implémenter
   - client redirigé vers une page Stripe hébergée
   - gère automatiquement l'UI de paiement et la 3D Secure

2. `Stripe PaymentElement` / `PaymentIntent` :
   - contrôle complet de l'UI de paiement dans le frontend
   - nécessite plus de code sur le frontend

Pour une première intégration, privilégier Stripe Checkout.

### 3.2 Flux recommandé

- Frontend : le visiteur sélectionne un montant, renseigne un email, puis demande le paiement.
- Frontend : POST vers une API backend Stripe (`/api/donations/checkout` ou `/api/donations/create-session`).
- Backend : crée une session Stripe Checkout avec la clé secrète Stripe.
- Stripe : redirige vers la page de paiement Stripe.
- Stripe : en cas de succès, redirige le client vers `success_url`.
- Stripe : en cas d'échec ou annulation, redirige vers `cancel_url`.
- Backend : webhook Stripe reçoit l'événement `checkout.session.completed` et met à jour le don dans MongoDB.

---

## 4. Variables d'environnement Stripe nécessaires

Ajouter dans `backend/.env` et `backend/.env.example` :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_SUCCESS_URL=http://localhost:5173/donations/success
STRIPE_CANCEL_URL=http://localhost:5173/donations/cancel
```

Explications :

- `STRIPE_SECRET_KEY` : clé secrète Stripe côté serveur.
- `STRIPE_WEBHOOK_SECRET` : secret de signature pour vérifier les webhooks.
- `STRIPE_SUCCESS_URL` : URL de redirection après paiement réussi.
- `STRIPE_CANCEL_URL` : URL de redirection après annulation.

> Note : si le frontend et le backend sont déployés séparément, adapter les URLs de redirection.

---

## 5. Changements backend à prévoir

### 5.1 Dépendances

Installer sur le backend :

```bash
cd backend
npm install stripe
```

Si vous souhaitez avoir des types TypeScript explicites, vous pouvez utiliser :

```bash
npm install -D @types/stripe
```

### 5.2 Configurer Stripe

Créer un fichier d'utilitaire Stripe, par exemple `backend/src/utils/stripe.ts` :

```ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15'
});

export default stripe;
```

### 5.3 Nouvelle route de création de session

Dans `backend/src/routes/donation.routes.ts`, ajouter une route comme :

- `POST /api/donations/checkout`

Payload attendu côté client :

```json
{
  "amount": 15000,
  "currency": "XOF",
  "donorName": "John Doe",
  "donorEmail": "john@example.com"
}
```

Ce que la route doit faire :

- valider `amount`, `currency`, `donorName`, `donorEmail`
- créer un enregistrement `Donation` en base avec `status: 'pending'`
- appeler Stripe pour créer une `checkout.session`
- passer les métadonnées Stripe : `donationId`, `donorEmail`, `paymentMethod` = `Stripe`
- retourner `session.url` ou `session.id` au frontend

Exemple de logique :

```ts
router.post('/checkout', async (req, res) => {
  const { amount, currency, donorName, donorEmail } = req.body;
  if (!amount || !donorEmail) {
    return res.status(400).json({ message: 'Données du don manquantes' });
  }

  const donation = await Donation.create({
    donorName,
    donorEmail,
    amount,
    currency: currency || 'XOF',
    paymentMethod: 'Stripe',
    status: 'pending'
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: donation.currency.toLowerCase(),
          product_data: {
            name: `Don ZOBA - ${donorName}`,
            description: 'Soutien à Zone Baptiste Agapé'
          },
          unit_amount: donation.amount * 100 // si la devise l'exige
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
    metadata: {
      donationId: donation._id.toString(),
      donorEmail: donorEmail
    }
  });

  return res.json({ url: session.url });
});
```

> Attention : Stripe gère les montants selon la devise. Pour certaines devises comme `XOF`, il n'y a pas de décimales. Il faut vérifier si Stripe supporte la devise et adapter `unit_amount` en conséquence.

### 5.4 Webhook Stripe

Ajouter une route dédiée pour traiter les notifications Stripe :

- `POST /api/donations/webhook`

Fonctions attendues :

- vérifier la signature avec `stripe.webhooks.constructEvent`
- filtrer les événements `checkout.session.completed`
- récupérer `session.metadata.donationId`
- mettre à jour le don en base :
  - `status: 'completed'`
  - `transactionId: session.payment_intent` ou `session.payment_intent.id`
  - éventuellement `message: 'Paiement Stripe confirmé'`

Optionnel : gérer aussi `payment_intent.payment_failed` pour `status: 'failed'`.

Exemple de logique :

```ts
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const donationId = session.metadata?.donationId;
    if (donationId) {
      await Donation.findByIdAndUpdate(donationId, {
        status: 'completed',
        transactionId: session.payment_intent as string
      });
    }
  }

  return res.json({ received: true });
});
```

> Le middleware `express.json()` ne doit pas être appliqué à cette route webhook. Utiliser `express.raw({ type: 'application/json' })` pour conserver le corps brut.

### 5.5 Mise à jour du modèle Donation

Pour Stripe, ajouter les champs suivants dans `Donation.model.ts` si utile :

- `stripePaymentIntentId?: string`
- `stripeCheckoutSessionId?: string`
- `stripeEventId?: string`

Ces champs permettent d’identifier précisément le paiement Stripe.

### 5.6 Cohérence avec la page admin

- Si vous migrez la gestion des dons vers MongoDB/Express, l’administration doit aussi lire les dons depuis le backend.
- Aujourd’hui, l’admin utilise Supabase pour récupérer `donations` dans `src/pages/admin/AdminDashboard.tsx`.
- La cohérence complète nécessite soit :
  - migrer la page admin pour consulter `/api/donations`, soit
  - conserver Supabase uniquement si vous souhaitez garder une duplication des données.

---

## 6. Changements frontend à prévoir

### 6.1 Dépendances

Installer si nécessaire :

```bash
npm install @stripe/stripe-js
```

Pour un flux Checkout simple, `@stripe/stripe-js` suffit.

### 6.2 Adapter `DonationsPage.tsx`

Remplacer le `supabase.from('donations').insert(payload)` par un appel backend vers Stripe.

Exemple :

```ts
const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!finalAmount || finalAmount <= 0) return;
  setStatus('loading');

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donations/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: finalAmount,
      currency: 'XOF',
      donorName: donor.name,
      donorEmail: donor.email
    })
  });

  const data = await response.json();
  if (response.ok && data.url) {
    window.location.href = data.url;
    return;
  }

  setStatus('error');
};
```

### 6.3 Gestion du retour Stripe

- Créer une page front `donations/success` ou utiliser un composant `DonationsSuccess`.
- Créer une page front `donations/cancel` pour informer l’utilisateur.
- Ces pages peuvent être statiques ou simplement afficher l’état du paiement.

### 6.4 Différence avec le stockage Supabase actuel

Aujourd’hui, le frontend dépose directement les dons dans Supabase. Pour Stripe, il faut :

- soit continuer à stocker une copie dans Supabase
- soit utiliser uniquement MongoDB/Express pour les dons Stripe

Je recommande d’utiliser le backend Express pour garder la logique de paiement centralisée et sécurisée.

---

## 7. Configuration et tests

### 7.1 Configuration locale

- Créer ou mettre à jour `backend/.env`.
- Copier `backend/.env.example` si besoin.
- Ajouter les clés Stripe.

### 7.2 Tests avec Stripe CLI

Utiliser le Stripe CLI pour tester le webhook localement :

```bash
stripe listen --forward-to localhost:5000/api/donations/webhook
```

Puis émettre un événement de test :

```bash
stripe trigger checkout.session.completed
```

### 7.3 Cartes de test Stripe

Utiliser des cartes de test Stripe, par exemple :

- 4242 4242 4242 4242
- 4000 0025 0000 3155 (3D Secure requise)

---

## 8. Notes importantes pour Stripe + XOF

- Stripe supporte certaines devises sans décimales comme `XOF` ou `JPY`.
- Pour `XOF`, `unit_amount` doit être fourni en franc CFA (sans centimes) : `15000` signifie 15 000 XOF.
- Vérifier que votre compte Stripe est configuré pour accepter `XOF`.
- Si Stripe ne supporte pas votre devise de façon native dans votre région, vous pouvez utiliser `EUR` ou `USD` temporairement.

---

## 9. Exemple de modifications `.env.example`

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/zoba

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Admin credentials (for initial setup)
ADMIN_EMAIL=admin@zoba-cbt.org
ADMIN_PASSWORD=Zoba@2025!

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_SUCCESS_URL=http://localhost:5173/donations/success
STRIPE_CANCEL_URL=http://localhost:5173/donations/cancel
```

---

## 10. Points de vigilance

- Ne jamais exposer `STRIPE_SECRET_KEY` dans le frontend.
- Vérifier la devise Stripe avant le lancement.
- Protéger la route webhook avec la vérification de signature Stripe.
- Si le frontend utilise encore Supabase pour les dons, éviter la duplication non contrôlée des statuts.

---

## 11. Résumé des tâches d'implémentation

1. Installer `stripe` dans `backend`
2. Ajouter les variables d'environnement Stripe
3. Créer un utilitaire Stripe dans `backend/src/utils/stripe.ts`
4. Ajouter `POST /api/donations/checkout`
5. Ajouter `POST /api/donations/webhook`
6. Modifier le modèle `Donation.model.ts` pour suivre les IDs Stripe
7. Mettre à jour `src/pages/DonationsPage.tsx` pour appeler le backend
8. Créer des pages `success` et `cancel` côté frontend
9. Mettre à jour `backend/.env.example`
10. Tester avec Stripe CLI et cartes de test

---

## 12. Option de migration progressive

Si vous voulez déployer Stripe sans casser l’existant :

- garder la route Supabase actuelle comme option de secours
- ajouter un bouton `Payer avec Stripe` séparé
- migrer progressivement les dons Stripe vers le backend Express

---

## 13. Glossaire des champs donation

- `amount` : montant versé
- `currency` : devise du don (`XOF` recommandé)
- `paymentMethod` : `Stripe`, `PayPal`, `Moov`, etc.
- `transactionId` : ID Stripe du paiement
- `status` : `pending`, `completed`, `failed`
- `stripePaymentIntentId` : identifiant Stripe du PaymentIntent
- `stripeCheckoutSessionId` : identifiant Stripe de la session Checkout
- `stripeEventId` : identifiant de l'événement webhook Stripe
