import Stripe from 'stripe';
import { AppError } from '../utils/AppError';
import { toStripeUnitAmount } from '../utils/currency';

let client: Stripe | null = null;

const getClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new AppError(500, 'Paiement par carte indisponible (Stripe non configure)');
  }
  if (!client) {
    client = new Stripe(secretKey);
  }
  return client;
};

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  donorEmail?: string;
}

export const createPaymentIntent = async ({
  amount,
  currency,
  metadata,
  donorEmail
}: CreatePaymentIntentParams): Promise<string> => {
  const stripe = getClient();

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: toStripeUnitAmount(amount, currency),
      currency: currency.toLowerCase(),
      metadata,
      receipt_email: donorEmail,
      automatic_payment_methods: { enabled: true }
    });
  } catch {
    throw new AppError(502, 'Impossible de creer le paiement Stripe');
  }

  if (!intent.client_secret) {
    throw new AppError(502, 'Impossible de creer le paiement Stripe');
  }

  return intent.client_secret;
};

export const constructWebhookEvent = (rawBody: Buffer, signature: string): Stripe.Event => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError(500, 'Webhook Stripe non configure');
  }
  const stripe = getClient();
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    throw new AppError(400, 'Signature webhook invalide');
  }
};
