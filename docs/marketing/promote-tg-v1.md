# Kit d'exécution marketing — ZOBA (Togo) v1

**Source de vérité** : `docs/gtm-zoba-v1.md` (canaux, ICP, proposition de valeur,
plan des 100 premiers). **Scripts** : `docs/sales/pitch-zoba-responsables-v1.md`.
**Marché (défauts UEMOA, pas de manifeste)** : Togo · FCFA, sans décimale · français.

Ce kit fournit les **munitions** des 2 canaux retenus par `/gtm`. Il propose ;
**tu lances**. Aucune dépense publicitaire n'est engagée depuis ce document.

---

## Canaux couverts

| Canal | Statut | Kit |
|---|---|---|
| **WhatsApp Business** | Lancement | §1 |
| **Annonces au culte + référents** | Lancement | §2 |
| **Facebook / Instagram (organique)** | Réserve — activé S6 (diaspora / rayonnement) | §3 |

## ⚠️ Pré-requis non levés (repris de `/gtm` et `/pitch`)

- **Mobile Money (FedaPay) non configuré** → tout message « donne en ligne » est
  gelé jusqu'à la config + test réel.
- **Pas de kit de marque** (`docs/brand/checklist-v*.md` absent) → pas de gabarit
  d'affiche QR, pas de logo formalisé, pas de visuels réseaux. **Décision à
  prendre** : partir avec les **photos réelles des activités** (déjà le contenu
  le plus fort pour une église) et une affiche QR simple faite maintenant, puis
  `/brand-kit` plus tard si tu veux des visuels soignés — OU lancer `/brand-kit`
  avant. WhatsApp et les annonces au culte n'ont, eux, besoin d'aucun visuel.
- **Pas d'outil de mesure web** (ni `/metrics`, ni Google Analytics) → l'attribution
  restera approximative (voir §4).
- **Connexion frontend ↔ backend** à stabiliser avant d'envoyer du trafic.

## Budget de promotion

Hypothèse de travail, dérivée du plan `/gtm` (~101 000 FCFA sur 10 semaines) :
**≈ 40 000 FCFA / mois**. À ajuster. Détail dans le calendrier §5. Le **seul poste
payant** est un test Facebook en S6 (15 000 FCFA) — optionnel, avec point de
contrôle avant lancement.

> Langue : copie en français. Si dans ton église l'usage est d'ouvrir une annonce
> par une phrase en éwé ou en kabiyè, ajoute-la en tête de l'annonce au culte
> (§2.3) — garde le reste en français pour que tous les scripts soient
> réutilisables d'une église à l'autre.

---

## 1. Kit WhatsApp Business

### 1.1 Mise en place du compte (checklist)
- [ ] Installer **WhatsApp Business** sur le téléphone qui portera le numéro officiel de la zone (pas un numéro perso qui change).
- [ ] Profil : nom **« Zone Baptiste Agapé »**, photo = logo (ou bandeau du site en attendant), catégorie « Organisation religieuse ».
- [ ] Description : « Site officiel de la Zone Baptiste Agapé (CBT). Inscriptions aux activités, actualités, dons. [URL] »
- [ ] Lien du site dans le profil.
- [ ] **Message d'accueil** (auto, 1ᵉʳ contact) : « Bienvenue 🙏 Ici le compte officiel de la Zone Baptiste Agapé. Pour vous inscrire à une activité : [URL] › Activités. Un membre vous répondra aux heures de bureau. »
- [ ] **Message d'absence** (hors 8h–19h) : « Merci pour votre message. Nous répondons du lundi au samedi, 8h–19h. Pour une inscription, vous pouvez faire seul sur [URL] › Activités. »
- [ ] **Étiquettes (labels)** à créer : `Référent`, `Inscrit – activité en cours`, `Donateur diaspora`, `À relancer`, `Nouveau contact`.
- [ ] **Catalogue** : y lister les **activités à venir** (nom, date, lieu, gratuite/payante) plutôt que des produits — sert de vitrine partageable.

### 1.2 Séquence de statuts — 4 semaines (valeur d'abord, 1 message de vente sur 4)
Rythme : **3 statuts / semaine**, jamais plus. Le 4ᵉ est l'appel à l'action.

| Semaine | Statut 1 (valeur) | Statut 2 (valeur) | Statut 3 (valeur) | Statut 4 (appel) |
|---|---|---|---|---|
| S1 | Verset + phrase de mission de la zone | Photo de la dernière activité | Rappel : « le site de la zone est en ligne → [URL] » | « Inscris-toi à **[activité]** en 2 min : [URL] › Activités » |
| S2 | Témoignage court d'un participant à une activité | Coulisses : préparation de **[activité]** | Actu de la zone (nouvelle du site) | « Plus que [N] jours pour t'inscrire à **[activité]**. [URL] » |
| S3 | Verset + application concrète | Photo/vidéo courte d'un culte ou d'une répétition | « Comment récupérer ton billet QR » (mode d'emploi §1.4 du pitch) | « Clôture des inscriptions **[activité]** le [date]. [URL] » |
| S4 | Bilan photos de **[activité]** passée | Remerciement public aux participants | Annonce de la **prochaine** activité | *(si FedaPay prêt)* « Tu peux maintenant soutenir la zone en ligne : [URL] › Dons » |

### 1.3 Discipline de diffusion (broadcast)
- **Opt-in only** : n'ajoute à une liste de diffusion que les personnes qui ont **écrit** au numéro. Les groupes de département existants restent gérés par les responsables — on **fournit le message**, on ne s'y invite pas.
- **Segmentation par étiquette** : un message « inscris-toi » va aux `Nouveau contact` + `À relancer`, pas aux `Inscrit – activité en cours`.
- **Cadence maximale** : 1 message de diffusion / semaine par segment. Au-delà, les gens bloquent le numéro.
- Toujours un seul appel à l'action par message, avec le lien direct.

### 1.4 Scripts de réponse (repris de la FAQ objections du pitch)
- **« Mon argent arrive vraiment ? »** → « Oui : le paiement passe par [Stripe / FedaPay], l'argent va sur le compte de la zone, et chaque don reçoit une confirmation. » *(à n'utiliser qu'après config FedaPay)*
- **« C'est compliqué pour ma maman. »** → « Après le culte, [référent de son église] fait l'inscription avec elle. Le papier reste possible aussi. »
- **« Et si le site ferme ? »** → « Les données appartiennent à la zone et sont exportables. Le site est un outil d'accès, pas le coffre. »
- **« Je n'ai pas reçu mon billet. »** → « Vérifie tes spams. Sinon envoie-moi ton nom + l'activité, je te renvoie le lien du billet. »

---

## 2. Kit « Annonces au culte + référents »

C'est le canal le plus fort : présence physique, confiance déjà là. Il se pilote
**par église**, un passage par dimanche.

### 2.1 La tournée
| Élément | Cible |
|---|---|
| Églises de la zone | Lister nommément (6–10) |
| Passage | 1 annonce / dimanche / église, 2 dimanches consécutifs au lancement, puis 1/mois d'entretien |
| Cible d'inscriptions aidées | **8–15 par église et par dimanche** au lancement |
| Qui | Le référent de l'église (pas un intervenant extérieur) |

### 2.2 Kit du référent (à préparer avant le 1ᵉʳ dimanche)
- [ ] Un **téléphone chargé** avec données préparées : 1 activité à venir visible, 2–3 inscriptions déjà créées (jamais une base vide), une actu publiée.
- [ ] **Affiche A3 avec le QR** du site, posée près de la sortie.
- [ ] **50 flyers** (URL + 5 étapes d'inscription, texte du §4.3 du pitch).
- [ ] Le **mode d'emploi inscription** imprimé (pitch §4.3), à montrer.
- [ ] Une **feuille de comptage** : date · nombre d'inscriptions aidées · nombre de personnes sans smartphone (inscrites pour elles) · questions revenues.

### 2.3 Script d'annonce — 30 s (depuis l'estrade ou juste après)
Voir `pitch-zoba-responsables-v1.md` §4.1. Rappel :
> « Un mot rapide : la zone a maintenant son site. Pour **[activité concrète]**,
> inscrivez-vous depuis votre téléphone et recevez votre billet, sans feuille.
> Après le culte, **[référent]** est près de **[lieu]** pour vous montrer. C'est
> gratuit, deux minutes. »

*(Option : ouvrir par une phrase en langue locale si c'est l'usage.)*

### 2.4 Rôle du référent après le culte
1. Se placer à un endroit **fixe et annoncé** (près de la sortie principale).
2. Aborder : « Vous voulez que je vous montre comment vous inscrire à [activité] ? »
3. Faire l'inscription **avec** la personne sur son téléphone (pas à sa place si elle peut suivre).
4. Personne sans smartphone : l'inscrire depuis le téléphone du référent avec **son** nom / téléphone, lui remettre un flyer avec le code du billet noté à la main.
5. Noter chaque inscription sur la feuille de comptage.
6. Dimanche soir : envoyer le total de la feuille dans le groupe des référents.

### 2.5 Suivi / attribution
Pas de code USSD possible (inscription gratuite). Attribution = **comparaison
hebdo** entre les inscriptions par activité dans l'administration et le total des
feuilles de comptage des référents. Écart important = des gens s'inscrivent seuls
(bon signe) ou une feuille n'est pas remontée (à relancer).

---

## 3. Kit Facebook / Instagram organique — RÉSERVE (activer en S6)

But : diaspora (dons) et rayonnement (nouveaux venus). **Organique d'abord** ;
le test payant est en §5, avec point de contrôle.

### 3.1 Calendrier de contenu — 2 semaines (à répéter)
Rotation : preuve → enseignement → appel → coulisses.

| Jour | Type | Contenu | Légende (fr) |
|---|---|---|---|
| S6-Lun | Preuve | Album photo d'une activité récente | « Retour en images sur [activité]. Merci à tous les participants 🙏 » |
| S6-Mer | Enseignement | Verset + 2 lignes d'application, sur fond photo | « [verset]. Cette semaine, [application courte]. » |
| S6-Ven | Appel (diaspora) | Visuel simple « Soutenez la zone où que vous soyez » | « Vous suivez la zone depuis l'étranger ? Vous pouvez donner directement : [URL]/dons » |
| S6-Dim | Coulisses | Photo/vidéo courte de la préparation d'un événement | « On prépare [événement]. Rendez-vous le [date]. » |
| S7-Lun | Preuve | Témoignage d'un membre (photo + citation) | « "[citation]" — [prénom], [église] » |
| S7-Mer | Enseignement | Mission de la zone en 3 points (carrousel) | « Ce que porte la Zone Baptiste Agapé. » |
| S7-Ven | Appel (activité) | Affiche de la prochaine activité | « Inscriptions ouvertes pour [activité] : [URL] › Activités » |
| S7-Dim | Coulisses | Remerciement + chiffre (« [N] inscrits cette semaine ») | « Merci ! Déjà [N] inscrits pour [activité]. » |

### 3.2 Assets
Le kit de marque n'existe pas. Deux options, au choix :
- **Maintenant** : photos réelles des activités (les plus fortes pour une église) + textes ci-dessus, sans gabarit. Suffisant pour démarrer.
- **Avant** : lancer `/brand-kit` pour un logo, un gabarit d'affiche, des visuels réseaux cohérents — puis `/generate` produit les images manquantes (devis affiché avant toute dépense).

---

## 4. Plan de suivi

Pas de `/metrics`, pas d'analytics web. Le suivi repose sur le **tableau manuel
hebdomadaire** défini dans `gtm-zoba-v1.md` §5, rempli chaque lundi depuis
l'administration du site :

| # | Chiffre | Source |
|---|---|---|
| 1 | Inscriptions en ligne créées (semaine / cumul) | Admin › Inscriptions |
| 2 | Dons en ligne confirmés en FCFA | Admin › Dons (statut « complété ») |
| 3 | Nouveaux abonnés newsletter | Admin › Abonnés |
| + | Inscriptions aidées par les référents | Feuilles de comptage |

**Liens partagés sur Facebook** : ajouter `?utm_source=facebook` à l'URL par
habitude, mais sans analytics ces UTM ne sont pas lisibles aujourd'hui — à
exploiter seulement si un outil de mesure est installé plus tard.

**Attribution honnête** : coarse. On saura *combien* d'inscriptions et de dons,
pas *par quel canal* avec précision. Si le budget Facebook monte, installer
d'abord une mesure (`/metrics` ou équivalent léger) — mesurer après avoir dépensé,
c'est payer pour oublier.

---

## 5. Calendrier d'exécution — 4 semaines & point de contrôle dépense

Aligné sur `gtm-zoba-v1.md` S1–S4 (préparation + lancement).

| Semaine | WhatsApp | Culte / référents | Facebook | Dépense (FCFA) |
|---|---|---|---|---|
| **S1** | Créer / configurer le compte Business (§1.1) | Réunion pasteurs, référents nommés, commande affiches + flyers | — | Impressions : **25 000** |
| **S2** | Préparer la séquence de statuts S1–S4 ; message d'accueil / absence en place | Former les référents (30 min) ; préparer les kits (§2.2) ; **config FedaPay + test sandbox** | — | Forfaits data référents (mois 1) : **16 000** |
| **S3** | Lancer statuts semaine S1 ; 1ᵉʳ message de diffusion aux `Nouveau contact` | 1ᵉʳ dimanche : annonce + référents + affichage QR dans toutes les églises | — | — |
| **S4** | Statuts semaine S2 ; relance segment `À relancer` | 2ᵉ dimanche : annonce ciblée sur la prochaine activité ; remontée des feuilles | Préparer les 8 posts (§3.1), **ne pas encore publier** | — |
| *(S5–S6, mois 2)* | Statuts S3–S4 ; *(si FedaPay OK)* appel aux dons | Entretien 1×/mois | **S6 : activer** l'organique + **test payant** | voir ci-dessous |

**Total mois 1 : ≈ 41 000 FCFA** (25 000 impressions + 16 000 data). Aucune
dépense publicitaire.

### Point de contrôle avant toute dépense publicitaire (S6)
- **Budget test Facebook : 15 000 FCFA** (3 jours × 5 000, puis stop).
- **Objectif d'apprentissage** : est-ce que la diaspora clique sur `[URL]/dons`
  et donne ? (à lire dans Admin › Dons, sur la fenêtre du test).
- **Comment** : via **Ads Manager**, objectif *Trafic* vers `[URL]/dons`, ciblage
  géo = France + villes à forte diaspora togolaise + Togo (Lomé, Kara), âge 25–55,
  centres d'intérêt « Togo », « christianisme évangélique ». **Pas le bouton
  "Booster"** (ciblage trop faible).
- **Tu lances toi-même dans Ads Manager.** Ce document ne dépense rien.
- **Critère d'arrêt** (repris de `/gtm`) : après ≥ 3 semaines d'activation, si la
  part diaspora des dons < 100 000 FCFA → couper le payant, garder l'organique.

### Boucle de revue hebdomadaire
Chaque lundi : remplir le tableau §4, comparer aux cibles de la semaine du plan
`/gtm`, appliquer les critères d'arrêt / d'accélération par canal (`gtm` §5).

---

## Suite

`/metrics` — les chiffres ne sont pas câblés (tout est manuel via l'admin) ;
avant de mettre le moindre budget sur Facebook, installer une mesure, sinon
l'attribution restera aveugle.
