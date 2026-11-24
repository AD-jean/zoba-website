import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATE = '24 novembre 2026';
const CONTACT_EMAIL = 'contact@zoba-cbt.org';

const SECTIONS: { id: string; title: string }[] = [
  { id: 'editeur', title: 'Éditeur du site' },
  { id: 'donnees', title: 'Données que nous collectons' },
  { id: 'finalites', title: 'Pourquoi nous les utilisons' },
  { id: 'paiements', title: 'Dons et paiements' },
  { id: 'destinataires', title: 'Qui y a accès' },
  { id: 'conservation', title: 'Durée de conservation' },
  { id: 'cookies', title: 'Cookies et stockage local' },
  { id: 'droits', title: 'Vos droits' },
  { id: 'securite', title: 'Sécurité' },
  { id: 'modifications', title: 'Modifications' },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-bold text-teal-800 font-display mb-3">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Politique de confidentialité et cookies — ZOBA';
    return () => {
      document.title = 'Zone Baptiste Agapé — ZOBA';
    };
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gradient-animated overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Vos données</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
            Confidentialité et cookies
          </h1>
          <p className="text-teal-200 text-lg max-w-2xl">
            Comment la Zone Baptiste Agapé collecte, utilise et protège vos informations personnelles.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[220px_1fr] gap-10">
          <nav aria-label="Sommaire" className="hidden lg:block">
            <div className="sticky top-28 space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Sommaire</p>
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} className="block py-1 text-gray-500 hover:text-teal-700 transition-colors">
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          <article className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 space-y-10">
            <p className="text-sm text-gray-400">Dernière mise à jour : {LAST_UPDATE}</p>

            <p className="text-gray-600 leading-relaxed">
              Cette politique s'applique au site de la Zone Baptiste Agapé (ZOBA). Elle est établie conformément à la
              loi togolaise n° 2019-014 du 29 octobre 2019 relative à la protection des données à caractère personnel
              et, pour les visiteurs résidant dans l'Union européenne, au Règlement général sur la protection des
              données (RGPD). Nous ne collectons que les données nécessaires et nous ne les vendons jamais.
            </p>

            <Section id="editeur" title="Éditeur du site">
              <p>
                <strong>Zone Baptiste Agapé (ZOBA)</strong>, zone d'églises de la Convention Baptiste du Togo (CBT),
                Lomé, Togo. Responsable du traitement des données : le bureau de la Zone Baptiste Agapé.
              </p>
              <p>
                Contact : <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-700 underline">{CONTACT_EMAIL}</a> —
                téléphone : <a href="tel:+22891754415" className="text-teal-700 underline">+228 91 75 44 15</a>.
              </p>
              <p>
                Hébergement : le site est servi par Vercel Inc. (États-Unis) et son serveur d'application par Render
                Services Inc. (États-Unis) ; les données sont stockées dans une base MongoDB Atlas.
              </p>
            </Section>

            <Section id="donnees" title="Données que nous collectons">
              <p>Nous collectons uniquement les informations que vous nous transmettez volontairement :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Formulaire de contact</strong> : nom, adresse e-mail, téléphone (facultatif) et votre message.</li>
                <li><strong>Newsletter</strong> : adresse e-mail.</li>
                <li>
                  <strong>Inscription à une activité</strong> : nom, adresse e-mail, téléphone, éventuellement église et
                  remarques ; un code de billet est généré, ainsi que l'heure de passage à l'entrée lors du contrôle.
                </li>
                <li>
                  <strong>Dons</strong> : montant, moyen de paiement choisi, et si vous les indiquez, nom, e-mail et
                  téléphone ; identifiant de transaction fourni par le prestataire de paiement.
                </li>
              </ul>
              <p>
                Données techniques : comme tout site web, nos hébergeurs traitent votre adresse IP et des informations
                de connexion (navigateur, date, page demandée) pour acheminer les pages, se protéger des abus (limitation
                du nombre d'envois) et assurer la sécurité. Nous n'utilisons <strong>aucun outil de mesure d'audience
                ni de publicité</strong>.
              </p>
            </Section>

            <Section id="finalites" title="Pourquoi nous les utilisons">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Répondre à vos messages (base : votre demande).</li>
                <li>Vous envoyer nos nouvelles si vous vous êtes abonné(e) (base : votre consentement, retirable à tout moment).</li>
                <li>Gérer les inscriptions, envoyer et contrôler les billets (base : exécution de votre inscription).</li>
                <li>Encaisser les dons, vous envoyer un reçu et tenir notre comptabilité (base : votre don et nos obligations légales).</li>
                <li>Sécuriser le site et prévenir la fraude (base : notre intérêt légitime).</li>
              </ul>
            </Section>

            <Section id="paiements" title="Dons et paiements">
              <p>
                Les paiements par carte sont traités par <strong>Stripe</strong> et les paiements Mobile Money par{' '}
                <strong>FedaPay</strong>. Vos numéros de carte et codes Mobile Money sont saisis directement chez ces
                prestataires certifiés : <strong>ils ne transitent jamais par nos serveurs</strong> et nous n'y avons
                pas accès. Nous recevons seulement la confirmation du paiement (montant, statut, identifiant de
                transaction).
              </p>
              <p>
                Un don n'est considéré comme validé qu'après confirmation par le prestataire. En cas de paiement refusé
                ou annulé, aucun montant n'est débité. Pour toute question ou demande de remboursement d'un don,
                écrivez-nous à <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-700 underline">{CONTACT_EMAIL}</a>{' '}
                en indiquant la référence reçue par e-mail.
              </p>
            </Section>

            <Section id="destinataires" title="Qui y a accès">
              <p>
                Vos données sont accessibles uniquement aux responsables de la ZOBA habilités à gérer le site. Elles
                sont confiées, pour les seuls besoins du service, aux prestataires techniques suivants :
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Vercel et Render (hébergement), MongoDB Atlas (base de données) ;</li>
                <li>Stripe et FedaPay (paiements) ;</li>
                <li>Resend (envoi des e-mails : billets, reçus) ;</li>
                <li>Cloudinary (stockage et diffusion des photos et vidéos de la galerie) ;</li>
                <li>Google Fonts (polices d'écriture du site, qui reçoit votre adresse IP lors du chargement).</li>
              </ul>
              <p>
                Certains de ces prestataires sont situés hors du Togo (notamment aux États-Unis et dans l'Union
                européenne) ; ils s'engagent contractuellement à protéger vos données. Nous ne vendons ni ne louons
                vos données à quiconque.
              </p>
            </Section>

            <Section id="conservation" title="Durée de conservation">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Messages de contact : 3 ans après le dernier échange.</li>
                <li>Newsletter : jusqu'à votre désinscription.</li>
                <li>Inscriptions et billets : 1 an après la date de l'activité.</li>
                <li>Dons : 10 ans, durée imposée pour les pièces comptables (Acte uniforme OHADA).</li>
              </ul>
            </Section>

            <Section id="cookies" title="Cookies et stockage local">
              <p>
                Un cookie est un petit fichier déposé sur votre appareil. <strong>Notre site n'utilise aucun cookie
                publicitaire ni de mesure d'audience</strong>, et aucun traceur de réseau social.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-left text-gray-700">
                    <tr>
                      <th className="p-3 font-semibold">Nom</th>
                      <th className="p-3 font-semibold">Déposé par</th>
                      <th className="p-3 font-semibold">Rôle</th>
                      <th className="p-3 font-semibold">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3 font-mono text-xs">zoba-cookie-notice</td>
                      <td className="p-3">ZOBA (stockage local)</td>
                      <td className="p-3">Mémorise que vous avez lu l'information sur les cookies.</td>
                      <td className="p-3">12 mois</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">adminToken</td>
                      <td className="p-3">ZOBA (stockage local)</td>
                      <td className="p-3">Session de l'espace d'administration (administrateurs uniquement).</td>
                      <td className="p-3">Jusqu'à la déconnexion</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">__stripe_mid, __stripe_sid</td>
                      <td className="p-3">Stripe</td>
                      <td className="p-3">Prévention de la fraude, uniquement lors d'un paiement par carte.</td>
                      <td className="p-3">30 min à 1 an</td>
                    </tr>
                    <tr>
                      <td className="p-3">Cookies de session FedaPay</td>
                      <td className="p-3">FedaPay</td>
                      <td className="p-3">Fonctionnement et sécurité du paiement Mobile Money.</td>
                      <td className="p-3">Durée du paiement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Ces éléments sont strictement nécessaires au fonctionnement du site ou du paiement que vous avez
                demandé : ils ne nécessitent pas de consentement préalable. Vous pouvez toutefois les supprimer ou les
                bloquer depuis les réglages de votre navigateur ; le paiement en ligne pourrait alors ne plus fonctionner.
              </p>
            </Section>

            <Section id="droits" title="Vos droits">
              <p>
                Vous pouvez à tout moment demander à <strong>accéder</strong> à vos données, les <strong>corriger</strong>,
                les <strong>supprimer</strong>, vous <strong>opposer</strong> à leur utilisation ou en <strong>limiter</strong>{' '}
                l'usage, et retirer votre consentement (par exemple vous désinscrire de la newsletter).
              </p>
              <p>
                Écrivez-nous à <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-700 underline">{CONTACT_EMAIL}</a> ;
                nous répondons sous un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir
                l'Instance de protection des données à caractère personnel (IPDCP) du Togo, ou l'autorité de protection
                des données de votre pays de résidence.
              </p>
            </Section>

            <Section id="securite" title="Sécurité">
              <p>
                Le site est servi exclusivement en HTTPS. L'accès à l'administration est protégé par mot de passe, les
                formulaires sont limités contre les envois automatisés, et les confirmations de paiement sont
                vérifiées par signature cryptographique auprès des prestataires.
              </p>
            </Section>

            <Section id="modifications" title="Modifications">
              <p>
                Nous pouvons mettre à jour cette politique, par exemple si nous ajoutons un nouveau service. La date de
                dernière mise à jour figure en haut de cette page.
              </p>
              <p>
                <Link to="/contact" className="text-teal-700 underline">Une question ? Contactez-nous.</Link>
              </p>
            </Section>
          </article>
        </div>
      </section>
    </>
  );
}
