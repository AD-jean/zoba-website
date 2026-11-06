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
  callbackUrl?: string;
}

/**
 * Cree la transaction cote serveur (montant valide). L'appelant choisit ensuite comment
 * la faire payer : soit via generateCheckoutUrl (redirection complete vers FedaPay), soit
 * via le widget Checkout.js embarque cote frontend avec cet id + la cle publique
 * ("pre-created transaction" flow documente par FedaPay) -- dans les deux cas, le client
 * ne choisit jamais le montant lui-meme.
 */
export const createTransaction = async ({
  amount,
  currency,
  description,
  metadata,
  donorName,
  donorEmail,
  donorPhone,
  callbackUrl = process.env.FEDAPAY_CALLBACK_URL
}: CreateTransactionParams): Promise<number> => {
  const secretKey = getSecretKey();
  const baseUrl = getBaseUrl();

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

/**
 * Genere l'URL de paiement hebergee FedaPay pour une transaction deja creee (endpoint
 * "token"). Utilise pour les flux qui redirigent entierement le client vers FedaPay,
 * par opposition au widget Checkout.js embarque sur place (cf. createTransaction).
 */
export const generateCheckoutUrl = async (transactionId: number): Promise<string> => {
  const secretKey = getSecretKey();
  const baseUrl = getBaseUrl();

  const tokenRes = await fetch(`${baseUrl}/v1/transactions/${transactionId}/token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}` }
  });

  if (!tokenRes.ok) {
    throw new AppError(502, 'Impossible de generer le lien de paiement FedaPay');
  }

  const body = (await tokenRes.json()) as { url?: string };
  if (!body.url) {
    throw new AppError(502, 'Impossible de generer le lien de paiement FedaPay');
  }
  return body.url;
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

// ============ PAIEMENT MOBILE MONEY SANS REDIRECTION ============
// Meme experience que les plateformes de vote/billetterie locales : le donateur choisit son
// operateur, saisit son numero, et valide le paiement directement sur son telephone (push
// USSD) sans quitter le site. Doc : POST /v1/transactions/{id}/token puis POST /v1/{mode}.

/** Operateurs Togo disponibles "sans redirection" chez FedaPay (cle = valeur exposee au frontend). */
export const MOBILE_OPERATORS = {
  moov_tg: { label: 'Moov Money', mode: 'moov_tg' },
  togocel: { label: 'Mixx by Yas', mode: 'togocel' }
} as const;

export type MobileOperator = keyof typeof MOBILE_OPERATORS;

/**
 * En sandbox, FedaPay n'accepte plus que le mode unique "momo_test" (changelog du
 * 07/11/2025) : numeros 64000001 / 66000001 = succes, tout autre numero = echec.
 */
const resolveMode = (operator: MobileOperator): string =>
  process.env.FEDAPAY_ENV === 'live' ? MOBILE_OPERATORS[operator].mode : 'momo_test';

const generateToken = async (transactionId: number): Promise<string> => {
  const res = await fetch(`${getBaseUrl()}/v1/transactions/${transactionId}/token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getSecretKey()}` }
  });
  const body = (await res.json().catch(() => ({}))) as { token?: string };
  if (!res.ok || !body.token) {
    throw new AppError(502, 'Impossible de preparer le paiement Mobile Money');
  }
  return body.token;
};

/**
 * Declenche la demande de paiement sur le telephone du donateur. Le paiement n'est PAS
 * termine a ce stade : le statut final arrive par webhook (ou par getTransactionStatus).
 */
export const sendMobilePayment = async (
  transactionId: number,
  operator: MobileOperator,
  phoneNumber: string,
  country = 'tg'
): Promise<void> => {
  const token = await generateToken(transactionId);
  const res = await fetch(`${getBaseUrl()}/v1/${resolveMode(operator)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, phone_number: { number: phoneNumber, country } })
  });
  if (!res.ok) {
    throw new AppError(502, "La demande de paiement n'a pas pu etre envoyee a votre operateur");
  }
};

export type FedapayStatus = 'pending' | 'approved' | 'declined' | 'canceled' | 'refunded' | 'transferred' | string;

/**
 * Lit le statut reel d'une transaction chez FedaPay. Sert de filet de securite quand le
 * webhook est en retard ou absent : c'est FedaPay qui fait foi, jamais le navigateur.
 */
export const getTransactionStatus = async (transactionId: number): Promise<FedapayStatus> => {
  const res = await fetch(`${getBaseUrl()}/v1/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` }
  });
  if (!res.ok) {
    throw new AppError(502, 'Impossible de verifier le statut du paiement');
  }
  // Selon l'endpoint, l'entite est enveloppee sous "v1/transaction" ou livree directement.
  const body = (await res.json()) as { 'v1/transaction'?: FedapayTransaction } & Partial<FedapayTransaction>;
  const status = body['v1/transaction']?.status ?? body.status;
  if (!status) {
    throw new AppError(502, 'Impossible de verifier le statut du paiement');
  }
  return status;
};
