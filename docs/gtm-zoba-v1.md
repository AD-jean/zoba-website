# Plan de lancement & d'adoption — ZOBA v1

> Adapté du cadre `/gtm`. ZOBA n'a pas de client payant : les « 100 premiers
> clients » sont remplacés par des **cibles d'usage concrètes** sur quatre
> objectifs choisis : adoption par les membres, dons en ligne, newsletter,
> rayonnement / nouveaux venus.
>
> **Marché (défauts UEMOA, pas de manifeste)** : Togo · FCFA, sans décimale ·
> français · fuseau Africa/Lomé.
>
> **Statut** : v1, à calibrer avec les chiffres réels de la zone (nombre
> d'églises, de fidèles adultes avec smartphone). Les cibles ci-dessous
> supposent **~800 fidèles adultes joignables par WhatsApp** — à ajuster.

---

## Pré-requis bloquants (à lever avant de lancer la partie « dons »)

| Bloquant | Impact | État |
|---|---|---|
| **Mobile Money (FedaPay) non configuré** | Aucun don en ligne possible → objectif 2 à l'arrêt | `FEDAPAY_SECRET_KEY` / `FEDAPAY_WEBHOOK_SECRET` à renseigner + URL webhook à déclarer dans le dashboard FedaPay |
| Connexion frontend ↔ backend | Site inutilisable si l'API n'est pas jointe | `VITE_API_URL` à repointer + Vite à redémarrer |
| Correctif sécurité 🔴 (force brute connexion admin) | Admin exposé avant ouverture publique | Corrigé sur la branche `worktree-security-hardening`, à fusionner |

Le lancement « adoption / activités » (objectif 1) peut démarrer sans le Mobile
Money ; la collecte en ligne datée (objectif 2) démarre **en semaine 5**, une
fois FedaPay opérationnel et testé en sandbox puis en réel.

---

## Phase 1 — Qui on vise en premier

### Cible principale — le fidèle régulier connecté
- **Qui** : membre adulte d'une église de la zone, présent au culte du dimanche,
  possède un smartphone et utilise WhatsApp tous les jours.
- **Douleur** : s'inscrire à une activité (retraite, séminaire, camp) se fait
  aujourd'hui sur une feuille papier ou via un responsable ; pas de confirmation,
  files d'attente, oublis. Donner suppose d'avoir de l'espèce sur soi le bon jour.
- **Pourquoi il signe en premier** : il est déjà là chaque dimanche, on peut lui
  parler en personne, et il a un motif immédiat (la prochaine activité).

### Cible secondaire — le proche & la diaspora
- **Qui** : famille de membres, Togolais de l'extérieur (France, Gabon, USA…),
  sympathisants qui suivent la zone sur Facebook/YouTube.
- **Douleur** : veulent soutenir (don) ou rester informés mais n'ont aucun canal
  simple ; l'argent passe par des intermédiaires.
- **Rôle** : moteur des **dons en ligne** et de l'**audience newsletter**, pas de
  l'inscription aux activités.

### Cible tertiaire — le nouveau venu
- **Qui** : personne invitée par un membre, ou qui cherche « église baptiste
  Lomé / [ville] » en ligne.
- **Rôle** : objectif rayonnement. Volume faible, à ne pas sur-investir en v1.

### Qui peut bloquer
- **Les pasteurs et responsables d'église** : si l'annonce ne descend pas de
  l'estrade et si les responsables de département ne relaient pas dans leurs
  groupes WhatsApp, rien ne se passe. **Ce sont les premiers à convaincre.**
- **La méfiance paiement en ligne** : « est-ce que mon argent arrive vraiment ? »
  — à traiter par un mode d'emploi visuel + un témoignage d'un responsable connu.

---

## Phase 2 — Proposition de valeur

**Version longue (mots du fidèle, au téléphone à un frère de l'église)** :
> « Tu peux t'inscrire aux activités de la zone et recevoir ton billet avec le
> QR code directement sur ton téléphone, et donner par Flooz ou Mixx sans avoir
> de liquide sur toi. »

**Version courte, 20 mots — format WhatsApp (c'est le pitch)** :
> ZOBA en ligne : inscris-toi aux activités, reçois ton billet QR, donne par
> Mobile Money, suis les actus de la zone. [lien]

---

## Phase 3 — Canaux : la réalité, pas le buzz

Score des canaux de la shortlist UEMOA face à **cette** audience.

| Canal | Portée | Coût | Effort | Délai 1ᵉʳ usage | Verdict |
|---|---|---|---|---|---|
| **WhatsApp Business** (statuts, groupes de département, diffusion) | Élevée — les groupes existent déjà | Quasi nul | Moyen (discipline anti-spam) | Jours | **PICK #1** |
| **Annonces au culte + référents** (un référent par église qui aide à s'inscrire après le culte) | Très élevée sur les membres présents | Faible (impression + data référents) | Élevé les 3 premières semaines | 1 dimanche | **PICK #2** |
| Facebook / Instagram (page existante) | Moyenne — surtout diaspora & nouveaux venus | Faible à moyen (boost) | Moyen | Semaines | **RÉSERVE** (diaspora / rayonnement) |
| Radio locale | Large public | Élevé (spots) | Moyen | Semaines | Écarté v1 — garder pour un grand événement annuel |
| Associations pro / revendeurs / LinkedIn | — | — | — | — | Non applicable |

**Sélectionnés pour le lancement : WhatsApp Business + Annonces au culte & référents.**
**Réserve : Facebook / Instagram**, activée en semaine 6 pour la diaspora (dons)
et le rayonnement.

Question de cadrage à trancher lundi matin : **qui sont les 6 à 10 référents**,
nommément, un par église ? Sans cette liste, le PICK #2 n'existe pas.

---

## Phase 4 — Plan daté sur 10 semaines

Point de départ : **à fixer** (proposition : premier dimanche du mois prochain).
Propriétaire général : l'administrateur du site. Scripts à produire via `/pitch`
(annonce culte 30 s, message WhatsApp d'ouverture, mode d'emploi inscription,
mode d'emploi don, relance).

### Cibles à 10 semaines (à calibrer)
| Objectif | Cible S10 | Source de suivi |
|---|---|---|
| 1 — Adoption | **250 membres** ayant créé ≥ 1 inscription en ligne | Admin › Inscriptions |
| 2 — Dons en ligne | **1 500 000 FCFA** cumulés (Stripe + FedaPay, statut « complété ») | Admin › Dons |
| 3 — Newsletter | **400 abonnés** actifs | Admin › Abonnés |
| 4 — Nouveaux venus | **40 personnes** venues via site / réseaux (comptage référent à l'accueil) | Feuille d'accueil |

### Calendrier

| Semaine | Actions | Cible de la semaine |
|---|---|---|
| **S1** | Réunion pasteurs : présenter le site, obtenir le créneau d'annonce dominicale. Recruter 6–10 référents. Commander affiches A3 avec QR (1 par église) + 500 flyers. | Créneau obtenu ; référents nommés |
| **S2** | Former les référents (30 min : comment aider à s'inscrire, FAQ). Rédiger les scripts (`/pitch`). Vérifier le parcours d'inscription sur 5 téléphones réels. **Config FedaPay + test sandbox.** | Scripts prêts ; parcours mobile validé |
| **S3** | 1ʳᵉ annonce au culte dans toutes les églises + affichage QR. Message WhatsApp d'ouverture dans chaque groupe de département. Référents disponibles après le culte. | 40 inscriptions en ligne ; 60 abonnés |
| **S4** | 2ᵉ annonce (cibler la prochaine activité concrète). Statuts WhatsApp des référents. Première actu publiée sur le site + relais. | 90 inscriptions cumulées ; 120 abonnés |
| **S5** | **Ouverture des dons en ligne** : test FedaPay en réel (petit don d'un responsable), puis annonce « donner par Mobile Money » au culte + WhatsApp, avec mode d'emploi visuel. | 130 inscriptions ; 300 000 FCFA ; 180 abonnés |
| **S6** | Activer **Facebook / Instagram** : posts diaspora (« soutenez la zone où que vous soyez »), témoignage vidéo courte. Boost ciblé Togo + diaspora. | 160 inscriptions ; 600 000 FCFA ; 250 abonnés |
| **S7** | Campagne de collecte datée sur un besoin précis (ex. camp jeunesse, réfection) avec objectif affiché en FCFA et jauge. Relance WhatsApp mi-semaine. | 190 inscriptions ; 950 000 FCFA ; 300 abonnés |
| **S8** | Relance des inscrits inactifs. Bilan intermédiaire avec les pasteurs. Ajuster les référents faibles. | 220 inscriptions ; 1 200 000 FCFA ; 340 abonnés |
| **S9** | Pousser la dernière activité de la période. 2ᵉ vague diaspora. Publier un récap photos (galerie) pour entretenir l'audience. | 240 inscriptions ; 1 400 000 FCFA ; 380 abonnés |
| **S10** | Clôture de campagne : remerciement public + montant atteint. Bilan complet (voir Phase 5). Décider de la suite (poursuite, pivot canal, `/promote`). | **250 / 1 500 000 FCFA / 400** |

### Budget (FCFA)

| Poste | Détail | Montant |
|---|---|---|
| Forfaits data référents | 8 référents × 2 000 × 2 mois | 32 000 |
| Impression affiches QR + flyers | 10 affiches A3 + 500 flyers | 25 000 |
| Banderole / kakémono 1 événement | 1 | 20 000 |
| Test réseaux sociaux (boost diaspora) | 3 boosts × 5 000 | 15 000 |
| Imprévus (~10 %) | | 9 000 |
| **Total** | | **≈ 101 000 FCFA** |

Hors budget : temps bénévole des référents et de l'administrateur (le vrai coût
du plan), à reconnaître explicitement auprès des pasteurs.

---

## Phase 5 — Boucle de mesure & critères d'arrêt

Pas de `/metrics` installé → **tableau de comptage manuel**, rempli chaque lundi
par l'administrateur à partir de l'admin du site.

### Les 3 chiffres suivis chaque semaine
| # | Chiffre | Où le lire | Objectif de rythme |
|---|---|---|---|
| 1 | Inscriptions en ligne créées (semaine / cumul) | Admin › Inscriptions | +25 à +35 / semaine en régime |
| 2 | Dons en ligne confirmés en FCFA (semaine / cumul) | Admin › Dons (statut « complété ») | +150 000 à +250 000 / semaine dès S6 |
| 3 | Nouveaux abonnés newsletter (semaine / cumul) | Admin › Abonnés | +30 à +40 / semaine |

Chiffre 4 (nouveaux venus) : comptage mensuel via feuille d'accueil, moins fiable
— indicatif seulement.

### Tableau à tenir

| Semaine | Inscr. sem. | Inscr. cumul | Dons sem. (FCFA) | Dons cumul | Abonnés sem. | Abonnés cumul | Notes |
|---|---|---|---|---|---|---|---|
| S3 | | | — | — | | | |
| S4 | | | — | — | | | |
| S5 | | | | | | | ouverture dons |
| … | | | | | | | |

### Critères d'arrêt / pivot (par canal)

- **WhatsApp + annonces** — si après **S4** le cumul d'inscriptions en ligne est
  **< 50** : le problème n'est pas le canal (les gens sont touchés) mais l'outil.
  Geler la promotion, refaire le parcours d'inscription mobile, retester, relancer.
- **Référents** — si après **3 dimanches** la moitié des référents ne sont pas
  actifs : remplacer les personnes, pas le canal. Un référent = une église qui
  bascule ou pas.
- **Dons en ligne** — si après **S7** le cumul est **< 400 000 FCFA** : cause la
  plus probable = friction ou méfiance Mobile Money. Publier un mode d'emploi pas
  à pas + un témoignage nominatif d'un responsable ; sinon, accepter que le canal
  en ligne restera minoritaire face à l'espèce et réduire l'effort.
- **Facebook / Instagram diaspora** — si après **S8** (≥ 3 semaines d'activation)
  la part diaspora des dons est **< 100 000 FCFA** : arrêter le boost payant,
  garder les posts organiques uniquement.

---

## Suite

1. `/pitch` — figer les mots (annonce culte, message WhatsApp, modes d'emploi)
   avant d'imprimer les affiches et d'enregistrer les vidéos.
2. Lever les 3 bloquants pré-requis (FedaPay, connexion front↔back, fusion sécurité).
3. Fixer la date de S1 avec les pasteurs.
