import Stripe from 'stripe';
import Donation, { IDonation } from '../models/Donation.model';
import { sendDonationReceiptEmail } from './email.service';
import * as stripeService from './stripe.service';
import * as fedapayService from './fedapay.service';

const sendReceiptIfPossible = async (donation: IDonation): Promise<void> => {
  if (!donation.donorEmail) return;
  try {
    await sendDonationReceiptEmail({
      to: donation.donorEmail,
      name: donation.donorName,
      amount: donation.amount,
      currency: donation.currency,
      reference: donation._id.toString(),
      date: new Date()
    });
  } catch (err) {
    // Le don est encaisse : un echec d'email ne doit jamais faire echouer le webhook
    // (sinon le fournisseur le rejouerait en boucle).
    console.error('Envoi recu de don echoue pour', donation._id.toString(), err);
  }
};

type DonationPaymentFields = Partial<
  Pick<IDonation, 'stripePaymentIntentId' | 'stripeEventId' | 'fedapayTransactionId' | 'fedapayEventId' | 'transactionId'>
>;

/**
 * Passe un don a "completed" de facon idempotente : la condition status != completed
 * garantit qu'un seul appel (webhook OU verification au retour) gagne et envoie le recu.
 */
export const markDonationCompleted = async (donationId: string, update: DonationPaymentFields): Promise<boolean> => {
  const updated = await Donation.findOneAndUpdate(
    { _id: donationId, status: { $ne: 'completed' } },
    { ...update, status: 'completed' },
    { new: true }
  );
  if (!updated) return false;
  await sendReceiptIfPossible(updated);
  return true;
};

export const markDonationFailed = async (donationId: string, update: DonationPaymentFields = {}): Promise<void> => {
  await Donation.findOneAndUpdate({ _id: donationId, status: 'pending' }, { ...update, status: 'failed' });
};

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
    const changed = await markDonationCompleted(donationId, {
      stripePaymentIntentId: intent.id,
      stripeEventId: event.id,
      transactionId: intent.id
    });
    if (!changed) {
      console.info('Webhook Stripe deja traite ou don introuvable', donationId, event.id);
    }
    return;
  }

  await markDonationFailed(donationId, { stripePaymentIntentId: intent.id, stripeEventId: event.id });
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
    const changed = await markDonationCompleted(donationId, {
      fedapayTransactionId: String(event.entity.id),
      fedapayEventId: String(event.id),
      transactionId: String(event.entity.id)
    });
    if (!changed) {
      console.info('Webhook FedaPay deja traite ou don introuvable', donationId, event.id);
    }
    return;
  }

  if (event.type === 'transaction.declined' || event.type === 'transaction.canceled') {
    await markDonationFailed(donationId, {
      fedapayTransactionId: String(event.entity.id),
      fedapayEventId: String(event.id)
    });
  }
};

/**
 * Verification au retour du donateur sur le site : si le webhook n'est pas encore arrive
 * (ou est mal configure), on interroge directement le fournisseur, cote serveur avec la
 * cle secrete -- jamais sur la foi d'un parametre d'URL. Retourne le statut a afficher.
 */
export const reconcileDonation = async (donation: IDonation): Promise<IDonation['status']> => {
  if (donation.status !== 'pending') return donation.status;
  const donationId = donation._id.toString();

  try {
    if (donation.provider === 'stripe' && donation.stripeCheckoutSessionId) {
      const session = await stripeService.retrieveCheckoutSession(donation.stripeCheckoutSessionId);
      if (session.paymentStatus === 'paid') {
        await markDonationCompleted(donationId, {
          stripePaymentIntentId: session.paymentIntentId,
          transactionId: session.paymentIntentId
        });
        return 'completed';
      }
      if (session.status === 'expired') {
        await markDonationFailed(donationId);
        return 'failed';
      }
      return 'pending';
    }

    if (donation.provider === 'fedapay' && donation.fedapayTransactionId) {
      const status = await fedapayService.getTransactionStatus(Number(donation.fedapayTransactionId));
      if (fedapayService.isApprovedStatus(status)) {
        await markDonationCompleted(donationId, { transactionId: donation.fedapayTransactionId });
        return 'completed';
      }
      if (fedapayService.isFailedStatus(status)) {
        await markDonationFailed(donationId);
        return 'failed';
      }
    }
  } catch (err) {
    // Fournisseur injoignable : on laisse le webhook trancher, le front reessaiera.
    console.warn('Verification du don aupres du fournisseur impossible', donationId, err);
  }
  return 'pending';
};
