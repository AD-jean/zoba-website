import { Resend } from 'resend';
import { AppError } from '../utils/AppError';

let client: Resend | null = null;

const getClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new AppError(500, 'Envoi d\'email indisponible (Resend non configure)');
  }
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
};

const getFrom = (): string => {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new AppError(500, 'Envoi d\'email indisponible (EMAIL_FROM non configure)');
  }
  return from;
};

// Les noms, titres et lieux viennent de saisies utilisateur/admin : on les echappe avant
// de les injecter dans le HTML du mail (sinon un nom du type "<a href=...>" s'afficherait
// comme un vrai lien dans la boite du destinataire).
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const QR_CONTENT_ID = 'billet-qr';

interface TicketEmailParams {
  to: string;
  name: string;
  activityTitle: string;
  activityDate?: string;
  activityLocation: string;
  ticketUrl: string;
  /** PNG du QR code. Envoye en piece jointe inline (cid:) : Gmail/Outlook bloquent les images data:. */
  qrPng: Buffer;
}

export const sendTicketEmail = async ({
  to,
  name,
  activityTitle,
  activityDate,
  activityLocation,
  ticketUrl,
  qrPng
}: TicketEmailParams): Promise<void> => {
  const from = getFrom();
  const resend = getClient();

  const title = escapeHtml(activityTitle);
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #0f766e;">Votre billet — ${title}</h2>
      <p>Bonjour ${escapeHtml(name)},</p>
      <p>Votre inscription est confirmée. Présentez ce billet (à l'écran ou imprimé) à l'entrée.</p>
      <table style="width: 100%; margin: 16px 0; font-size: 14px;">
        ${activityDate ? `<tr><td style="padding:4px 0;color:#6b7280;">Date</td><td>${escapeHtml(activityDate)}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#6b7280;">Lieu</td><td>${escapeHtml(activityLocation)}</td></tr>
      </table>
      <div style="text-align: center; margin: 24px 0;">
        <img src="cid:${QR_CONTENT_ID}" alt="QR code du billet" width="240" height="240" />
      </div>
      <p style="text-align: center;"><a href="${escapeHtml(ticketUrl)}" style="color:#0f766e;">Voir mon billet en ligne</a></p>
      <p style="color:#9ca3af; font-size: 12px; margin-top: 24px;">Zone Baptiste Agapé — ZOBA</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Votre billet — ${activityTitle}`,
    html,
    attachments: [
      { filename: 'billet-qr.png', content: qrPng, contentType: 'image/png', contentId: QR_CONTENT_ID }
    ]
  });

  if (error) {
    throw new AppError(502, "Impossible d'envoyer l'email du billet");
  }
};

interface DonationReceiptParams {
  to: string;
  name?: string;
  amount: number;
  currency: string;
  reference: string;
  date: Date;
}

export const sendDonationReceiptEmail = async ({
  to,
  name,
  amount,
  currency,
  reference,
  date
}: DonationReceiptParams): Promise<void> => {
  const from = getFrom();
  const resend = getClient();

  const formattedAmount = `${amount.toLocaleString('fr-FR')} ${escapeHtml(currency)}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #0f766e;">Merci pour votre don</h2>
      <p>Bonjour${name ? ` ${escapeHtml(name)}` : ''},</p>
      <p>Nous avons bien reçu votre don. Que Dieu vous bénisse pour votre générosité.</p>
      <table style="width: 100%; margin: 16px 0; font-size: 14px;">
        <tr><td style="padding:4px 0;color:#6b7280;">Montant</td><td><strong>${formattedAmount}</strong></td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Date</td><td>${date.toLocaleDateString('fr-FR')}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Référence</td><td>${escapeHtml(reference)}</td></tr>
      </table>
      <p style="color:#9ca3af; font-size: 12px; margin-top: 24px;">Zone Baptiste Agapé — ZOBA. Conservez ce message comme justificatif de votre don.</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Merci pour votre don — Zone Baptiste Agapé',
    html
  });

  if (error) {
    throw new AppError(502, "Impossible d'envoyer le recu de don");
  }
};
