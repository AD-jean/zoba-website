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

interface CreateCheckoutSessionParams {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  donorEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = async ({
  amount,
  currency,
  metadata,
  donorEmail,
  successUrl,
  cancelUrl
}: CreateCheckoutSessionParams): Promise<{ id: string; url: string }> => {
  const stripe = getClient();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: toStripeUnitAmount(amount, currency),
            product_data: { name: 'Don - Zone Baptiste Agapé' }
          },
          quantity: 1
        }
      ],
      customer_email: donorEmail,
      metadata,
      // payment_intent recoit aussi les metadata : le webhook payment_intent.succeeded
      // (deja utilise par les inscriptions) peut ainsi retrouver donationId sans changement.
      payment_intent_data: { metadata },
      success_url: successUrl,
      cancel_url: cancelUrl
    });
  } catch {
    throw new AppError(502, 'Impossible de creer le paiement Stripe');
  }

  if (!session.url) {
    throw new AppError(502, 'Impossible de creer le paiement Stripe');
  }

  return { id: session.id, url: session.url };
};

export interface CheckoutSessionState {
  status: string | null;
  paymentStatus: string;
  paymentIntentId?: string;
}

export const retrieveCheckoutSession = async (sessionId: string): Promise<CheckoutSessionState> => {
  const stripe = getClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const pi = session.payment_intent;
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    paymentIntentId: typeof pi === 'string' ? pi : pi?.id
  };
};

export const retrievePaymentIntentStatus = async (paymentIntentId: string): Promise<Stripe.PaymentIntent.Status> => {
  const stripe = getClient();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status;
};

/** Un client_secret Stripe a la forme "pi_xxx_secret_yyy" : l'id du PaymentIntent en est le prefixe. */
export const paymentIntentIdFromClientSecret = (clientSecret: string): string =>
  clientSecret.split('_secret_')[0];

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
