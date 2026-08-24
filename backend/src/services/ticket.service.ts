import crypto from 'crypto';
import QRCode from 'qrcode';

export const generateTicketCode = (): string => crypto.randomBytes(9).toString('base64url');

export const ticketUrl = (ticketCode: string): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/billet/${ticketCode}`;
};

export const generateQrDataUrl = async (ticketCode: string): Promise<string> =>
  QRCode.toDataURL(ticketUrl(ticketCode), { width: 320, margin: 1 });
