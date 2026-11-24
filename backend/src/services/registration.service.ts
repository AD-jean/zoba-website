import Stripe from 'stripe';
import Registration, { IRegistration } from '../models/Registration.model';
import { IActivity } from '../models/Activity.model';
import { sendTicketEmail } from './email.service';
import { ticketUrl, generateQrBuffer } from './ticket.service';
import * as stripeService from './stripe.service';
import * as fedapayService from './fedapay.service';

const isDuplicateKeyError = (err: unknown): boolean =>
  !!err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000;

const sendTicketIfPossible = async (registrationId: string): Promise<void> => {
  const registration = await Registration.findById(registrationId).populate<{ activityId: IActivity }>('activityId');
  if (!registration) return;

  try {
    const qrPng = await generateQrBuffer(registration.ticketCode);
    await sendTicketEmail({
      to: registration.email,
      name: registration.name,
      activityTitle: registration.activityId.title,
      activityDate: registration.activityId.date?.toLocaleDateString('fr-FR'),
      activityLocation: registration.activityId.location,
      ticketUrl: ticketUrl(registration.ticketCode),
      qrPng
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

type RegistrationPaymentFields = Partial<
  Pick<IRegistration, 'stripePaymentIntentId' | 'fedapayTransactionId' | 'transactionId'>
>;

const markRegistrationPaid = async (registrationId: string, update: RegistrationPaymentFields): Promise<boolean> => {
  let updated;
  try {
    updated = await Registration.findOneAndUpdate(
      { _id: registrationId, paymentStatus: { $ne: 'paid' } },
      { ...update, paymentStatus: 'paid' },
      { new: true }
    );
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      console.error('ANOMALIE: paiement confirme mais doublon email+activite deja paye, revision manuelle necessaire', registrationId);
      return false;
    }
    throw err;
  }
  if (!updated) return false;
  await sendTicketIfPossible(registrationId);
  return true;
};

/**
 * Meme principe que reconcileDonation : au retour du paiement, si le webhook n'a pas encore
 * confirme le billet, on interroge le fournisseur cote serveur. Le billet (et son email)
 * n'est jamais emis sur la seule foi du navigateur.
 */
export const reconcileRegistration = async (registration: IRegistration): Promise<IRegistration['paymentStatus']> => {
  if (registration.paymentStatus !== 'pending') return registration.paymentStatus;
  const registrationId = registration._id.toString();

  try {
    if (registration.provider === 'stripe' && registration.stripePaymentIntentId) {
      const status = await stripeService.retrievePaymentIntentStatus(registration.stripePaymentIntentId);
      if (status === 'succeeded') {
        const changed = await markRegistrationPaid(registrationId, { transactionId: registration.stripePaymentIntentId });
        return changed ? 'paid' : (await Registration.findById(registrationId))?.paymentStatus ?? 'pending';
      }
      if (status === 'canceled') {
        await Registration.findOneAndUpdate({ _id: registrationId, paymentStatus: 'pending' }, { paymentStatus: 'failed' });
        return 'failed';
      }
      // requires_payment_method apres un refus : le client peut encore reessayer -> pending.
      return 'pending';
    }

    if (registration.provider === 'fedapay' && registration.fedapayTransactionId) {
      const status = await fedapayService.getTransactionStatus(Number(registration.fedapayTransactionId));
      if (fedapayService.isApprovedStatus(status)) {
        const changed = await markRegistrationPaid(registrationId, { transactionId: registration.fedapayTransactionId });
        return changed ? 'paid' : (await Registration.findById(registrationId))?.paymentStatus ?? 'pending';
      }
      if (fedapayService.isFailedStatus(status)) {
        await Registration.findOneAndUpdate({ _id: registrationId, paymentStatus: 'pending' }, { paymentStatus: 'failed' });
        return 'failed';
      }
    }
  } catch (err) {
    console.warn('Verification du billet aupres du fournisseur impossible', registrationId, err);
  }
  return 'pending';
};
