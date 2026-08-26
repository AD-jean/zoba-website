# Audit SEO — ZOBA v1

> `/seo` (le skill) suppose une app **Next.js** (metadata par page, `sitemap.ts`,
> `next/image`, script `setup-seo`). ZOBA est une **application React à page
> unique (Vite + react-router)** : tout le référencement se joue différemment.
> Cet audit est en **lecture seule** — aucune correction appliquée. Les
> corrections toucheraient le balisage / la structure du frontend : à décider
> explicitement (tu as posé la contrainte « pas de modif de structure »).

**Marché** : Togo · français.

---

## 1. Positionnement détecté

- **Offre** : site officiel d'information de la Zone Baptiste Agapé (CBT) —
  activités avec inscription en ligne, actualités, galerie, dons, contact.
- **Cible** : membres des églises de la zone ; secondairement diaspora et
  personnes cherchant la zone / une église baptiste au Togo.
- **But** : informer et faire agir (s'inscrire, donner, s'abonner) — pas de vente.
- **Univers sémantique** : église baptiste, Convention Baptiste du Togo,
  fraternité / foi / service, activités d'église, dons en ligne.

## 2. La réalité du référencement pour ZOBA

**Google est un canal mineur ici.** Les volumes de recherche sont très faibles :

| Requête | Suggestions Google réelles | Lecture |
|---|---|---|
| « église baptiste togo » | *première église baptiste du togo doulassame lomé* | quasi aucune demande |
| « convention baptiste du togo » | *+ logo* | recherche de marque, très faible volume |
| « église évangélique lomé » | Google corrige « lomé » → « lomme » (France) | Google ne reconnaît presque pas la localité |
| « faire un don église » | *à l'église catholique / comment faire un don* | intention générique, pas locale |

**Conclusion** : `/gtm` a eu raison de ne PAS choisir le contenu SEO comme canal.
Le référencement ne servira que deux choses, précises :
1. Que quelqu'un qui cherche **« Zone Baptiste Agapé »** ou le nom d'une église
   de la zone tombe sur le site officiel (et pas sur une page Facebook).
2. Que les **aperçus de liens** partagés sur WhatsApp et Facebook (le cœur du
   plan `/promote`) affichent le bon titre, la bonne description et une image.

Le point 2 est **cassé aujourd'hui** — voir §4.

## 3. Mots-clés à cibler (peu, et de marque)

| Priorité | Mot-clé | Page cible | Présent aujourd'hui ? |
|---|---|---|---|
| 1 | Zone Baptiste Agapé | `/` | ✅ titre + description |
| 1 | ZOBA église Togo | `/` | ⚠️ « ZOBA » oui, « église Togo » non |
| 2 | Convention Baptiste du Togo Zone Agapé | `/a-propos` | ❌ pas de titre propre à la page |
| 2 | activités église baptiste Lomé | `/activites` | ❌ pas de titre propre |
| 3 | faire un don Zone Baptiste Agapé | `/dons` | ❌ pas de titre propre |
| 3 | [nom de chaque église de la zone] | `/departements` ou `/a-propos` | ❌ à vérifier dans le contenu |

Longue traîne (faible volume mais intention forte) : « inscription retraite
[zone] », « camp jeunesse baptiste Togo », « culte dimanche [ville] ».

---

## 4. Audit technique

### ✅ En place
- Langue de la page déclarée (`lang="fr"`).
- Balise `viewport` (site adapté mobile).
- Un `<title>` et une `meta description` (la vitrine sous le titre Google).
- Favicon complet (icône dans l'onglet + écran d'accueil mobile) + `webmanifest`.
- Un seul `<h1>` par page, titres clairs (« Nos activités », « Faire un don »…).
- Balise `<main>` présente (repère pour Google et les lecteurs d'écran).
- Images de contenu avec texte alternatif (`alt`) : titre de l'activité, de
  l'article, légende de la galerie. Images décoratives en `alt=""` (correct).
- Chargement différé des images (`loading="lazy"`).
- Polices chargées avec `preconnect` (pas de blocage au rendu).

### ⚠️ À améliorer / ❌ Manquant

| Point | État | Conséquence concrète |
|---|---|---|
| **Aperçu de lien social (Open Graph)** | ❌ Aucune balise `og:*` ni `twitter:card`, aucune image de partage | Quand un membre partage `…/activites`, `…/dons` ou un article sur **WhatsApp ou Facebook**, la carte affichée est vide d'image et montre toujours le titre générique de l'accueil. C'est le point n°1 pour le plan `/promote`. |
| **Titre & description par page** | ❌ Le site est une page unique : `/activites`, `/dons`, `/actualites`… servent tous le **même** `<title>` « Zone Baptiste Agapé — ZOBA » et la même description | Google comprend mal de quoi parle chaque page ; « faire un don Zone Baptiste Agapé » n'a pas de page clairement dédiée à ses yeux. |
| **Rendu par le navigateur uniquement (pas de pré-rendu)** | ❌ Le contenu s'affiche via JavaScript ; le HTML initial est presque vide | Google sait exécuter le JavaScript, mais **les robots de Facebook/WhatsApp/LinkedIn, non** : ils ne verront jamais un titre ou une image propres à la page partagée, quoi qu'on mette dans le JavaScript. |
| **`robots.txt`** | ❌ Absent | Pas d'instruction à l'entrée du site pour les moteurs ; pas de lien vers le plan du site. |
| **`sitemap.xml`** | ❌ Absent | Aucune « carte » remise à Google ; il ne trouve les pages qu'en suivant les liens. |
| **URL canonique** | ❌ Absente | Si une page est atteignable par plusieurs adresses, Google peut hésiter. Risque faible ici (URL propres) mais à ajouter. |
| **Données structurées (JSON-LD)** | ❌ Aucune | Pas de fiche `Organization` déclarant l'organisation, son logo et ses réseaux (`sameAs`). Une fiche `Organization` aide sur les recherches de marque et peut alimenter le panneau de droite Google. |
| **`/admin`** dans le référencement | ⚠️ Rien n'empêche l'indexation de `/admin` | À exclure explicitement via `robots.txt` + `noindex`. |
| **Images de fond depuis Pexels** (`images.pexels.com`) | ⚠️ 3 images hébergées chez un tiers | Dépendance externe ; si Pexels change l'URL, l'image casse. Cosmétique. |

### URL / slugs
Bon dans l'ensemble — `react-router` avec des chemins propres en kebab-case :
`/a-propos`, `/departements`, `/activites`, `/actualites`, `/galerie`, `/contact`,
`/dons`, `/billet/:ticketCode`. **Rien à renommer.**

### Accessibilité (impacte aussi le référencement)
- `<main>` présent ✅ ; vérifier la présence de `<nav>` / `<footer>` sémantiques
  (la `Navbar` et le `Footer` sont des composants — à confirmer qu'ils rendent
  bien `<nav>` / `<footer>`).
- Boutons à icône seule (fermer, supprimer…) : vérifier qu'ils ont un
  `aria-label`. Non audité en détail ici.
- Pas de lien « aller au contenu » (skip link) en début de page — amélioration
  mineure.

---

## 5. Score

**Technique : 9 / 20.** Les fondamentaux d'une page (langue, titre, description,
h1, viewport, favicon, alt) sont là ; tout ce qui concerne **le multi-page et le
partage social** manque, et c'est précisément ce dont le plan marketing a besoin.

Échelle : < 8 = à retravailler avant toute promotion · 8–13 = utilisable mais
bride la promo · 14–17 = correct · 18+ = solide.

---

## 6. Corrections — par niveau d'effort (toutes hors périmètre « pas de structure »)

### Niveau 0 — deux fichiers statiques, aucune modif de structure ✅ faisable tout de suite
- **`frontend/public/robots.txt`** : autoriser le site, interdire `/admin`,
  pointer le sitemap.
- **`frontend/public/sitemap.xml`** : liste des 8 pages publiques.
Gain : Google trouve toutes les pages, `/admin` exclu. Ne règle PAS le partage
social ni les titres par page.

### Niveau 1 — titres/descriptions par page côté navigateur
Ajouter `react-helmet-async` (~1 dépendance) et un `<Helmet>` par page.
Gain : meilleur titre/description pour Google sur chaque page.
Limite : **ne règle toujours pas** l'aperçu WhatsApp/Facebook (leurs robots
n'exécutent pas le JavaScript).

### Niveau 2 — le vrai correctif pour le partage social (choix d'architecture)
Une des trois voies :
1. **Pré-rendu au build** (`vite-plugin-ssg` ou équivalent) : chaque page a un
   vrai HTML avec ses balises `og:*`. Le mieux pour un site surtout statique
   comme celui-ci.
2. **Injection des balises côté serveur** : le backend Express sert `index.html`
   en insérant les `og:*` selon l'URL (et va chercher le titre d'une activité /
   d'un article en base pour les pages dynamiques).
3. **Fonction edge chez l'hébergeur** (Netlify/Vercel) qui fait la même chose.

C'est un vrai changement (build ou serveur). À décider : sans lui, chaque lien
`…/dons` ou `…/actualites/…` partagé sur WhatsApp affichera la carte générique de
l'accueil — ce qui affaiblit directement le plan `/promote`.

### Niveau 1 bis — fiche Organisation (JSON-LD)
Un bloc `<script type="application/ld+json">` dans `index.html` avec
`Organization` : nom, URL, logo, `sameAs` (Facebook, Instagram, TikTok, YouTube,
WhatsApp du footer). Petit fichier, gros signal pour les recherches de marque.
Faisable au niveau 0 si mis en dur dans `index.html`.

---

## 7. Recommandation

L'ordre qui a du sens pour ZOBA, vu que Google est un canal mineur mais que le
**partage de liens est le cœur du plan marketing** :

1. **Niveau 0** maintenant : `robots.txt` + `sitemap.xml` + fiche `Organization`
   en dur dans `index.html`. Zéro changement de structure.
2. **Niveau 2, voie 1 (pré-rendu au build)** avant de lancer `/promote` pour de
   bon : c'est ce qui rend les liens WhatsApp/Facebook présentables. À décider —
   ça touche la chaîne de build.
3. Niveau 1 (titres par page) : utile mais secondaire, à faire en même temps que
   le niveau 2.

Dis-moi si tu veux que j'applique le **niveau 0** (je peux le faire sans toucher
à la structure), et si tu ouvres la porte au **niveau 2**.

---

## Pour aller plus loin (après)

- **`/geo`** — audit pour être cité par les IA (ChatGPT, Claude, Perplexity).
  Peu prioritaire pour un site d'église local.
- **`/gsc`** — connecter Google Search Console pour voir les vraies requêtes.
  À faire une fois le site public et stable ; les données arrivent en 2–4 semaines.
