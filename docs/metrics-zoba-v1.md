# Les chiffres qui disent la vérité — ZOBA v1

> `/metrics` (le skill) génère du code pour une stack Postgres/Drizzle/Next.js que
> ZOBA n'a pas, et des KPI d'abonnement (MRR, churn) sans objet ici. Ce document
> est l'équivalent **sans code** : ce qu'on regarde, où le lire dans
> l'administration existante, et le rituel hebdomadaire.
>
> Boucle de mesure de référence : `gtm-zoba-v1.md` §5. Ici on l'élargit à 5
> chiffres + 1 chiffre de santé.

**Marché (défauts UEMOA)** : Togo · FCFA, sans décimale · français · fuseau Africa/Lomé.

---

## Le « vrai » moment d'usage (activation)

Pour un produit SaaS, l'activation = « l'inscrit a vraiment utilisé le produit ».
Pour ZOBA, ce moment est : **un membre présente son billet à l'entrée d'une
activité et il est pointé** (`Registration.checkedIn = true`).

Tout ce qui est en amont (visite du site, inscription commencée) est de la vanité.
Ce chiffre n'est mesurable **que si les référents scannent réellement les QR à
l'entrée** — c'est donc aussi un test de la discipline terrain.

---

## Les 5 chiffres — relevé hebdomadaire (chaque lundi)

Tous se lisent dans **l'administration du site**. Aucun outil externe.

| # | Chiffre | Définition | Où le lire |
|---|---|---|---|
| 1 | **Inscriptions en ligne** | Nombre d'inscriptions créées (semaine + cumul), toutes activités | Admin › Inscriptions |
| 2 | **Taux de présence** | Billets pointés ÷ inscrits, pour les activités déjà passées dans la semaine | Admin › Inscriptions (champ « pointé » / `checkedIn`) |
| 3 | **Dons en ligne — montant** | Somme des dons **en ligne** au statut « complété » (Stripe + FedaPay), en FCFA (semaine + cumul) | Admin › Dons (filtre statut = complété, provider renseigné) |
| 4 | **Don moyen en ligne** | Chiffre 3 ÷ nombre de dons en ligne complétés | Admin › Dons |
| 5 | **Abonnés newsletter — croissance nette** | Nouveaux abonnés − désabonnements sur la semaine ; + total actifs | Admin › Abonnés |

### Le chiffre de santé (à surveiller, pas un objectif)

| Chiffre | Définition | Ce qu'il révèle |
|---|---|---|
| **Taux de paiement des dons initiés** | Dons « complété » ÷ (complété + en attente + échoué), sur les dons **en ligne** de la semaine | S'il chute brutalement → FedaPay/Stripe cassé, ou méfiance/friction Mobile Money. À regarder dès l'ouverture des dons en ligne. |

---

## Tableau à tenir

Une ligne par semaine, remplie le lundi.

| Semaine | Inscr. sem. | Inscr. cumul | Taux présence | Dons sem. (FCFA) | Dons cumul (FCFA) | Don moyen (FCFA) | Abonnés +/− | Abonnés total | Taux paiement dons | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| S3 | | | — | — | — | — | | | — | lancement culte + WhatsApp |
| S4 | | | | — | — | — | | | — | |
| S5 | | | | | | | | | | ouverture dons en ligne |
| S6 | | | | | | | | | | activation Facebook |
| … | | | | | | | | | | |

---

## Rituel hebdomadaire (10 min, lundi matin)

1. Ouvrir l'administration, relever les 6 valeurs ci-dessus.
2. Reporter dans le tableau, calculer les deltas vs semaine précédente.
3. Comparer aux **cibles de la semaine** du plan `gtm-zoba-v1.md` §4.
4. Appliquer les **critères d'arrêt / d'accélération** par canal (`gtm-zoba-v1.md` §5) :
   - < 50 inscriptions cumulées à S4 → geler la promo, refaire le parcours mobile.
   - Référents inactifs après 3 dimanches → changer les personnes.
   - < 400 000 FCFA de dons à S7 → mode d'emploi + témoignage Mobile Money.
   - Part diaspora des dons < 100 000 FCFA après 3 semaines de Facebook → couper le payant.
5. Envoyer les 6 chiffres + 1 phrase de commentaire dans le groupe WhatsApp des responsables.

Pas d'e-mail automatique (pas de cron sans ajout de code). Le « digest » = le
message WhatsApp du lundi.

---

## Si un jour tu veux automatiser (nécessite d'autoriser une modif de code)

Option **légère, en lecture seule**, cohérente avec la stack actuelle — **à ne
faire que si tu lèves la contrainte « pas de modif de structure »** :

- Une route `GET /api/stats/overview` (protégée admin) qui agrège les 6 chiffres
  **directement depuis les collections existantes** (`Registration`, `Donation`,
  `Subscriber`) — aucune nouvelle table, aucun événement à instrumenter, les
  données sont déjà là.
- Une carte « Tableau de bord » dans l'admin qui l'affiche, avec une mini-courbe
  sur 12 semaines.
- Optionnel : un envoi hebdo si `/add-cron` ou un worker est mis en place.

Ce serait ~1 fichier de service + 1 route + 1 vue admin. Rien à voir avec le
`app_event` / Postgres du skill `/metrics` standard. À décider explicitement.

---

## Ce que ce suivi ne dira PAS

- **Par quel canal** précisément vient chaque inscription / don : attribution
  grossière (voir `promote-tg-v1.md` §4). Pour le savoir il faudrait un outil de
  mesure web (aucun installé).
- Le comportement des visiteurs anonymes (pages vues, taux de rebond) : ça, c'est
  le rôle d'un Google Analytics / Plausible, pas de ce tableau.
