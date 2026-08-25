import Stripe from 'stripe';
import Registration from '../models/Registration.model';
import { IActivity } from '../models/Activity.model';
import { sendTicketEmail } from './email.service';
import { ticketUrl, generateQrDataUrl } from './ticket.service';

const isDuplicateKeyError = (err: unknown): boolean =>
  !!err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000;

const sendTicketIfPossible = async (registrationId: string): Promise<void> => {
  const registration = await Registration.findById(registrationId).populate<{ activityId: IActivity }>('activityId');
  if (!registration) return;

  try {
    const qrDataUrl = await generateQrDataUrl(registration.ticketCode);
    await sendTicketEmail({
      to: registration.email,
      name: registration.name,
      activityTitle: registration.activityId.title,
      activityDate: registration.activityId.date?.toLocaleDateString('fr-FR'),
      activityLocation: registration.activityId.location,
      ticketUrl: ticketUrl(registration.ticketCode),
      qrDataUrl
    });
  } catch (err) {
    console.error('Envoi email billet echoue pour', registrationId, err);
  }
};

export const applyStripeEvent = async (event: Stripe.Event): Promise<void> => {
  if (event.type !== 'payment_intent.succeeded' && event.type !== 'payment_intent.payment_failed') {
    return;
  }

  const intent = event.data.object as Stripe.PaymentIntent;
  const registrationId = intent.metadata?.registrationId;
  if (!registrationId) return;

  if (event.type === 'payment_intent.succeeded') {
    let updated;
    try {
      updated = await Registration.findOneAndUpdate(
        { _id: registrationId, paymentStatus: { $ne: 'paid' } },
        {
          paymentStatus: 'paid',
          stripePaymentIntentId: intent.id,
          stripeEventId: event.id,
          transactionId: intent.id
        },
        { new: true }
      );
    } catch (err) {
      // Index partiel unique (activityId+email) : cette personne a deja une autre inscription
      // payee pour cette activite (ex. deux onglets de paiement ouverts en parallele). Le
      // paiement est bien encaisse cote Stripe -- on ne perd pas la trace, mais ca necessite
      // une verification manuelle plutot qu'un crash du webhook.
      if (isDuplicateKeyError(err)) {
        console.error('ANOMALIE: paiement Stripe confirme mais doublon email+activite deja paye, revision manuelle necessaire', registrationId, event.id);
        return;
      }
      throw err;
    }
    if (!updated) {
      console.info('Webhook Stripe deja traite ou inscription introuvable', registrationId, event.id);
      return;
    }
    await sendTicketIfPossible(registrationId);
    return;
  }

  await Registration.findOneAndUpdate(
    { _id: registrationId, paymentStatus: 'pending' },
    { paymentStatus: 'failed', stripePaymentIntentId: intent.id, stripeEventId: event.id }
  );
};

interface FedapayEvent {
  id: number;
  type: string;
  entity: { id: number; status: string; custom_metadata?: Record<string, unknown> };
}

export const applyFedapayEvent = async (event: FedapayEvent): Promise<void> => {
  const registrationId = event.entity?.custom_metadata?.registrationId;
  if (!registrationId || typeof registrationId !== 'string') return;

  if (event.type === 'transaction.approved') {
    let updated;
    try {
      updated = await Registration.findOneAndUpdate(
        { _id: registrationId, paymentStatus: { $ne: 'paid' } },
        {
          paymentStatus: 'paid',
          fedapayTransactionId: String(event.entity.id),
          fedapayEventId: String(event.id),
          transactionId: String(event.entity.id)
        },
        { new: true }
      );
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        console.error('ANOMALIE: paiement FedaPay confirme mais doublon email+activite deja paye, revision manuelle necessaire', registrationId, event.id);
        return;
      }
      throw err;
    }
    if (!updated) {
      console.info('Webhook FedaPay deja traite ou inscription introuvable', registrationId, event.id);
      return;
    }
    await sendTicketIfPossible(registrationId);
    return;
  }

  if (event.type === 'transaction.declined' || event.type === 'transaction.canceled') {
    await Registration.findOneAndUpdate(
      { _id: registrationId, paymentStatus: 'pending' },
      { paymentStatus: 'failed', fedapayTransactionId: String(event.entity.id), fedapayEventId: String(event.id) }
    );
  }
};
