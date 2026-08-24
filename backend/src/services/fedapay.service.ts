import crypto from 'crypto';
import { AppError } from '../utils/AppError';

const getBaseUrl = (): string =>
  process.env.FEDAPAY_ENV === 'live' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com';

const getSecretKey = (): string => {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key) {
    throw new AppError(500, 'Paiement Mobile Money indisponible (FedaPay non configure)');
  }
  return key;
};

interface FedapayTransaction {
  id: number;
  status: string;
  custom_metadata?: Record<string, unknown>;
}

interface CreateTransactionParams {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
}

/**
 * Cree la transaction cote serveur (montant valide) sans generer de lien de
 * paiement hebergee : le widget Checkout.js du frontend prend le relais avec
 * cet id + la cle publique pour afficher le paiement en place ("pre-created
 * transaction" flow documente par FedaPay), sans jamais laisser le client
 * choisir le montant lui-meme.
 */
export const createTransaction = async ({
  amount,
  currency,
  description,
  metadata,
  donorName,
  donorEmail,
  donorPhone
}: CreateTransactionParams): Promise<number> => {
  const secretKey = getSecretKey();
  const baseUrl = getBaseUrl();
  const callbackUrl = process.env.FEDAPAY_CALLBACK_URL;

  const createRes = await fetch(`${baseUrl}/v1/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description,
      amount,
      currency: { iso: currency },
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      custom_metadata: metadata,
      // L'API FedaPay attend phone_number sous forme d'objet { number, country } : une chaine
      // brute est acceptee cote validation mais fait echouer la creation avec un 500 opaque.
      customer: donorEmail || donorPhone
        ? {
            email: donorEmail,
            phone_number: donorPhone ? { number: donorPhone, country: 'tg' } : undefined,
            firstname: donorName || 'Donateur'
          }
        : undefined
    })
  });

  if (!createRes.ok) {
    throw new AppError(502, 'Impossible de creer la transaction FedaPay');
  }

  // La reponse de creation est enveloppee sous la cle "v1/transaction" (contrairement aux
  // webhooks, qui livrent l'entite directement) : la deballer, sinon l'id reste undefined.
  const body = (await createRes.json()) as { 'v1/transaction'?: FedapayTransaction };
  const transaction = body['v1/transaction'];
  if (!transaction?.id) {
    throw new AppError(502, 'Impossible de creer la transaction FedaPay');
  }
  return transaction.id;
};

interface FedapayEvent {
  id: number;
  type: string;
  entity: FedapayTransaction;
}

const TOLERANCE_SECONDS = 300;

export const constructWebhookEvent = (rawBody: string, signatureHeader: string | undefined): FedapayEvent => {
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError(500, 'Webhook FedaPay non configure');
  }
  if (!signatureHeader) {
    throw new AppError(400, 'Signature webhook manquante');
  }

  const parts = signatureHeader.split(',').reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split('=');
    if (!key || value === undefined) return acc;
    (acc[key] ||= []).push(value);
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.s ?? [];

  if (!timestamp || signatures.length === 0) {
    throw new AppError(400, 'Signature webhook malformee');
  }

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  const matches = signatures.some(sig => {
    const sigBuffer = Buffer.from(sig, 'utf8');
    return sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  });

  if (!matches) {
    throw new AppError(400, 'Signature webhook invalide');
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > TOLERANCE_SECONDS) {
    throw new AppError(400, 'Webhook expire');
  }

  try {
    return JSON.parse(rawBody) as FedapayEvent;
  } catch {
    throw new AppError(400, 'Corps du webhook invalide');
  }
};
