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

interface TicketEmailParams {
  to: string;
  name: string;
  activityTitle: string;
  activityDate?: string;
  activityLocation: string;
  ticketUrl: string;
  qrDataUrl: string;
}

export const sendTicketEmail = async ({
  to,
  name,
  activityTitle,
  activityDate,
  activityLocation,
  ticketUrl,
  qrDataUrl
}: TicketEmailParams): Promise<void> => {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new AppError(500, 'Envoi d\'email indisponible (EMAIL_FROM non configure)');
  }
  const resend = getClient();

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #0f766e;">Votre billet — ${activityTitle}</h2>
      <p>Bonjour ${name},</p>
      <p>Votre inscription est confirmée. Présentez ce billet (à l'écran ou imprimé) à l'entrée.</p>
      <table style="width: 100%; margin: 16px 0; font-size: 14px;">
        ${activityDate ? `<tr><td style="padding:4px 0;color:#6b7280;">Date</td><td>${activityDate}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#6b7280;">Lieu</td><td>${activityLocation}</td></tr>
      </table>
      <div style="text-align: center; margin: 24px 0;">
        <img src="${qrDataUrl}" alt="QR code du billet" width="240" height="240" />
      </div>
      <p style="text-align: center;"><a href="${ticketUrl}" style="color:#0f766e;">Voir mon billet en ligne</a></p>
      <p style="color:#9ca3af; font-size: 12px; margin-top: 24px;">Zone Baptiste Agapé — ZOBA</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Votre billet — ${activityTitle}`,
    html
  });

  if (error) {
    throw new AppError(502, "Impossible d'envoyer l'email du billet");
  }
};
