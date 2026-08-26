# Pitch ZOBA — v1

**Généré depuis** `docs/gtm-zoba-v1.md` et le produit réel (README, parcours
d'inscription, dons Stripe/FedaPay, actus, galerie, newsletter, admin).
**Marché (défauts UEMOA, pas de manifeste)** : Togo · FCFA · français.

## Audience & objectif

ZOBA n'a ni client payant ni investisseur. Les deux « ventes » réelles sont :

| Audience | Objectif de la rencontre | Ce qu'on met en avant |
|---|---|---|
| **Responsables d'église & pasteurs de la zone** (audience principale) | Obtenir leur adhésion : créneau d'annonce dominicale + un référent par église + relais dans les groupes WhatsApp | Leur gain : moins de paperasse, présence aux activités mieux suivie, dons tracés et transparents |
| **Diaspora & sympathisants** | Faire donner en ligne, faire s'abonner | Soutenir la zone depuis l'étranger, simplement, sans intermédiaire |

Ce document sert les deux, dans cet ordre.

---

## ⚠️ Divergences docs / produit — à traiter avant de présenter

1. **Mobile Money (FedaPay) non configuré.** Tous les scripts « donne par Flooz
   ou Mixx » ci-dessous sont **inutilisables tant que FedaPay n'est pas branché
   et testé**. Ne pas annoncer les dons en ligne avant.
2. **Aucune page de politique de confidentialité** sur le site → l'objection
   « qu'est-ce que vous faites de mes données ? » n'a rien à montrer. À créer
   avant une présentation publique.
3. **Site non audité « propre ».** Le correctif critique (force brute connexion
   admin) est prêt sur une branche mais pas fusionné ; d'autres points moyens
   restent ouverts. Ne pas promettre « c'est sécurisé » sans nuance.
4. **Connexion frontend ↔ backend** à stabiliser (adresse d'API périmée).

---

## 1. Argumentaire une page — pour les responsables d'église

### Le problème, dans vos mots
« Pour chaque retraite, chaque séminaire, on court après les feuilles
d'inscription, on ne sait jamais combien de personnes viennent vraiment, et pour
les offrandes spéciales il faut que les gens aient de l'argent liquide sur eux le
jour même. »

### Ce que fait ZOBA
Le site officiel de la zone où un membre s'inscrit à une activité depuis son
téléphone et reçoit un billet avec QR code, et où l'on peut donner par Mobile
Money ou carte. Les responsables voient en temps réel qui est inscrit et combien
a été donné.

### Trois bénéfices concrets
1. **Vous savez qui vient.** Liste des inscrits à jour, par activité, avec
   pointage à l'entrée par scan du QR — plus de comptage à la main.
2. **Les offrandes en ligne sont tracées.** Chaque don en ligne est enregistré
   avec son statut ; le total est visible dans l'administration, sans caisse à
   recompter.
3. **L'information descend d'un coup.** Actualités, activités, photos publiées une
   fois, relayées dans tous les groupes WhatsApp de la zone.

### Ce qu'on vous demande
- Un créneau de **30 secondes d'annonce** au culte, 2 dimanches de suite.
- **Un référent par église** : quelqu'un qui, après le culte, aide ceux qui
  veulent s'inscrire depuis leur téléphone.
- Le **relais des messages** dans les groupes de département.

### Ce que ça coûte
Aux églises : **rien** en argent. Le temps du référent, et le vôtre pour
l'annonce. Le budget de lancement de la zone (affiches, forfaits data des
référents) est d'environ **101 000 FCFA**, porté par la zone, pas par les églises.

### Contact
[Nom · téléphone / WhatsApp] — site : [URL] — [QR code à insérer]

---

## 2. Version courte — 6 lignes, format WhatsApp

> *À envoyer aux responsables qui n'étaient pas à la réunion.*

ZOBA, le site de la zone, est prêt.
Les membres s'inscrivent aux activités depuis leur téléphone et reçoivent un
billet QR. On pointe les présences par scan.
On pourra aussi donner en ligne (Flooz, Mixx, carte) — bientôt activé.
Ce qu'on demande à chaque église : 30 s d'annonce au culte + un référent qui
aide à s'inscrire après le culte.
Zéro coût pour l'église. Qui est partant ?

---

## 3. Présentation de 5 minutes aux responsables (l'équivalent démo)

Sur un téléphone, avec des données réelles préparées (une activité à venir, 2–3
inscrits déjà créés, une actu publiée). **Ne pas montrer sur une base vide.**

| Temps | Ce qu'on montre | Ce qu'on dit |
|---|---|---|
| 0:00–1:00 | La page Activités, une activité à venir | « Voilà ce que voit un membre. Il clique sur "S'inscrire". » |
| 1:00–2:00 | Le formulaire d'inscription rempli, la confirmation avec le billet QR | « En 30 secondes il a son billet. Il le garde sur le téléphone ou l'imprime. » |
| 2:00–3:00 | L'administration › Inscriptions, la liste à jour | « De votre côté, vous voyez la liste en temps réel. À l'entrée, on scanne le QR, la personne est pointée. » |
| 3:00–4:00 | La page de dons (ou la maquette si FedaPay pas encore prêt) | « Ici on donnera par Flooz, Mixx ou carte. Chaque don est enregistré, le total est dans l'administration. » |
| 4:00–5:00 | La page Actualités + galerie | « Vous publiez une fois, on relaie partout. » |

**À ne pas ouvrir** : la page de dons si FedaPay n'est pas configuré (montrer une
capture à la place) ; la gestion des membres du bureau si elle est vide.

**Si ça plante** : « Le site est en cours de mise en route, l'important est le
principe — je vous renvoie une vidéo courte cette semaine. »

**Question de clôture** : « Est-ce que je peux compter sur votre église pour
l'annonce de dimanche prochain, et qui serait le référent ? »

---

## 4. Scripts terrain

### 4.1 Annonce au culte — 30 secondes
« Un mot rapide : la zone a maintenant son site. Pour les activités — comme
[activité concrète à venir] — vous pouvez vous inscrire directement depuis votre
téléphone et recevoir votre billet, sans passer par une feuille. Après le culte,
[nom du référent] est disponible près de [lieu] pour vous montrer. C'est gratuit
et ça prend deux minutes. »

### 4.2 Message WhatsApp d'ouverture — groupe de département
> Bonjour à tous 🙏
> Le site de la zone est en ligne : [URL]
> Vous pouvez vous inscrire à [activité] et recevoir votre billet avec QR code
> directement ici. Plus besoin de feuille d'inscription.
> Un souci pour vous inscrire ? Répondez ici ou voyez [référent] après le culte.

### 4.3 Mode d'emploi inscription — à envoyer en image ou texte
> S'inscrire à une activité :
> 1. Ouvrez [URL] → onglet **Activités**
> 2. Choisissez l'activité → **S'inscrire**
> 3. Nom, e-mail, téléphone → **Valider**
> 4. Vous recevez votre **billet avec QR code** (à l'écran + par e-mail)
> 5. Présentez le QR à l'entrée. C'est tout.

### 4.4 Mode d'emploi don Mobile Money — *à publier seulement après config FedaPay*
> Faire un don en ligne :
> 1. [URL] → onglet **Dons**
> 2. Entrez le montant (en FCFA)
> 3. Choisissez **Mobile Money** → Flooz ou Mixx
> 4. Validez sur votre téléphone avec votre code
> 5. Vous recevez une confirmation. Le don est enregistré par la zone.
> Votre argent va directement au compte de la zone, sans intermédiaire.

### 4.5 Relance — semaine +1
> Rappel : les inscriptions pour [activité] se font sur [URL], onglet Activités.
> Déjà [N] inscrits. Clôture le [date]. [référent] aide après le culte.

---

## 5. Argumentaire dons — diaspora (format court FB / WhatsApp)

> Où que vous soyez, soutenez la Zone Baptiste Agapé.
> Don en ligne par carte ou Mobile Money, en quelques secondes : [URL]/dons
> Chaque don est enregistré et suivi par la zone. Merci 🙏

Accroche Facebook (image + ce texte) :
> « Vous suivez la zone depuis l'étranger ? Vous pouvez maintenant donner
> directement, sans passer par quelqu'un. [URL]/dons »

---

## 6. FAQ objections — réponses honnêtes

**« Est-ce que mon argent arrive vraiment ? »**
Le paiement passe par [Stripe pour les cartes / FedaPay pour Flooz et Mixx], les
mêmes services que vous utilisez déjà pour vos paiements marchands. L'argent va
sur le compte de la zone. Chaque don reçoit une confirmation et apparaît dans le
suivi. *(Non résolu tant que FedaPay n'est pas configuré et testé en réel — à
lever avant toute annonce publique de dons.)*

**« Et si le site ferme un jour ? »**
Les données (membres, inscriptions, dons) sont dans une base MongoDB qui
appartient à la zone, exportable à tout moment. Le site est un outil d'accès, pas
le coffre : arrêter le site ne fait pas disparaître les informations.

**« On a toujours fait avec le papier. »**
Le papier reste possible en parallèle — le site ne l'interdit pas. Il ajoute
juste : la liste à jour sans recomptage, le pointage par scan, et les dons pour
ceux qui n'ont pas de liquide. On commence avec une seule activité pour voir.

**« Qu'est-ce que vous faites de nos données personnelles ? »**
On collecte le minimum : nom, e-mail, téléphone, pour l'inscription et le billet.
Les mots de passe d'administration sont chiffrés (illisibles même pour nous). Le
site passe en HTTPS avec les en-têtes de sécurité standard.
*(Non résolu : il n'existe pas encore de page "politique de confidentialité" à
montrer, et le site n'a pas encore reçu un audit de sécurité entièrement au vert.
À traiter avant une présentation large.)*

**« C'est compliqué pour les personnes âgées / peu à l'aise avec le téléphone. »**
C'est le rôle du référent : après le culte, il fait l'inscription avec la
personne. Et le papier reste disponible pour ceux qui préfèrent.

**« Combien ça coûte à mon église ? »**
Rien en argent. Le budget de lancement (~101 000 FCFA : affiches, forfaits data
des référents) est porté par la zone.

---

## Suite

- Répétition proposée : **jeu de rôle de 10 minutes**, je joue le responsable
  d'église sceptique avec les objections ci-dessus, tu t'entraînes à répondre.
- Avant toute présentation : lever les 4 divergences en tête de document.
- Ensuite : `/promote` pour transformer WhatsApp + annonces au culte en matériel
  prêt à diffuser (affiches, visuels, calendrier de publication).
