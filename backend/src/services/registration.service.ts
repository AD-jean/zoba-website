import Stripe from 'stripe';
import Registration from '../models/Registration.model';
import { IActivity } from '../models/Activity.model';
import { sendTicketEmail } from './email.service';
import { ticketUrl, generateQrDataUrl } from './ticket.service';

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
    const updated = await Registration.findOneAndUpdate(
      { _id: registrationId, paymentStatus: { $ne: 'paid' } },
      {
        paymentStatus: 'paid',
        stripePaymentIntentId: intent.id,
        stripeEventId: event.id,
        transactionId: intent.id
      },
      { new: true }
    );
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
    const updated = await Registration.findOneAndUpdate(
      { _id: registrationId, paymentStatus: { $ne: 'paid' } },
      {
        paymentStatus: 'paid',
        fedapayTransactionId: String(event.entity.id),
        fedapayEventId: String(event.id),
        transactionId: String(event.entity.id)
      },
      { new: true }
    );
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
