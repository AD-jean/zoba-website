import Stripe from 'stripe';
import Donation from '../models/Donation.model';

export const applyStripeEvent = async (event: Stripe.Event): Promise<void> => {
  if (event.type !== 'payment_intent.succeeded' && event.type !== 'payment_intent.payment_failed') {
    return;
  }

  const intent = event.data.object as Stripe.PaymentIntent;
  const donationId = intent.metadata?.donationId;
  if (!donationId) {
    console.warn('Webhook Stripe recu sans donationId dans metadata', event.id);
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const updated = await Donation.findOneAndUpdate(
      { _id: donationId, status: { $ne: 'completed' } },
      {
        status: 'completed',
        stripePaymentIntentId: intent.id,
        stripeEventId: event.id,
        transactionId: intent.id
      },
      { new: true }
    );
    if (!updated) {
      console.info('Webhook Stripe deja traite ou don introuvable', donationId, event.id);
    }
    return;
  }

  await Donation.findOneAndUpdate(
    { _id: donationId, status: 'pending' },
    { status: 'failed', stripePaymentIntentId: intent.id, stripeEventId: event.id }
  );
};

interface FedapayEvent {
  id: number;
  type: string;
  entity: { id: number; status: string; custom_metadata?: Record<string, unknown> };
}

export const applyFedapayEvent = async (event: FedapayEvent): Promise<void> => {
  const donationId = event.entity?.custom_metadata?.donationId;
  if (!donationId || typeof donationId !== 'string') {
    console.warn('Webhook FedaPay recu sans donationId dans custom_metadata', event.id);
    return;
  }

  if (event.type === 'transaction.approved') {
    const updated = await Donation.findOneAndUpdate(
      { _id: donationId, status: { $ne: 'completed' } },
      {
        status: 'completed',
        fedapayTransactionId: String(event.entity.id),
        fedapayEventId: String(event.id),
        transactionId: String(event.entity.id)
      },
      { new: true }
    );
    if (!updated) {
      console.info('Webhook FedaPay deja traite ou don introuvable', donationId, event.id);
    }
    return;
  }

  if (event.type === 'transaction.declined' || event.type === 'transaction.canceled') {
    await Donation.findOneAndUpdate(
      { _id: donationId, status: 'pending' },
      { status: 'failed', fedapayTransactionId: String(event.entity.id), fedapayEventId: String(event.id) }
    );
  }
};

/**
 * Applique un statut FedaPay lu directement via l'API (verification active par le
 * frontend pendant l'attente du Mobile Money). Memes regles d'idempotence que le webhook :
 * un don deja complete ne bouge plus, un echec ne s'applique qu'a un don encore en attente.
 */
export const applyFedapayStatus = async (donationId: string, status: string): Promise<void> => {
  if (status === 'approved' || status === 'transferred') {
    await Donation.findOneAndUpdate({ _id: donationId, status: { $ne: 'completed' } }, { status: 'completed' });
    return;
  }
  if (status === 'declined' || status === 'canceled') {
    await Donation.findOneAndUpdate({ _id: donationId, status: 'pending' }, { status: 'failed' });
  }
};
