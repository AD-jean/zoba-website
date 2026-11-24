import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import request from 'supertest';
import Stripe from 'stripe';

vi.mock('../src/services/email.service', () => ({
  sendDonationReceiptEmail: vi.fn().mockResolvedValue(undefined),
  sendTicketEmail: vi.fn().mockResolvedValue(undefined)
}));

import app from '../src/app';
import Donation from '../src/models/Donation.model';
import Registration from '../src/models/Registration.model';
import * as emailService from '../src/services/email.service';
import * as stripeService from '../src/services/stripe.service';
import * as fedapayService from '../src/services/fedapay.service';
import * as donationService from '../src/services/donation.service';
import * as registrationService from '../src/services/registration.service';

const DONATION_ID = '665f0c0c0c0c0c0c0c0c0c0c';
const STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
const FEDAPAY_WEBHOOK_SECRET = 'fedapay_test_secret';

const fakeDonation = (overrides: Record<string, unknown> = {}) => ({
  _id: { toString: () => DONATION_ID },
  amount: 5000,
  currency: 'XOF',
  donorEmail: 'donateur@example.com',
  donorName: 'Awa',
  status: 'pending',
  provider: 'stripe',
  stripeCheckoutSessionId: 'cs_test_123',
  ...overrides
});

const signFedapay = (body: string, secret = FEDAPAY_WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000)) => {
  const sig = crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`, 'utf8').digest('hex');
  return `t=${timestamp},s=${sig}`;
};

beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  process.env.STRIPE_WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET;
  process.env.FEDAPAY_SECRET_KEY = 'sk_sandbox_fake';
  process.env.FEDAPAY_WEBHOOK_SECRET = FEDAPAY_WEBHOOK_SECRET;
  vi.mocked(emailService.sendDonationReceiptEmail).mockClear();
  vi.mocked(emailService.sendTicketEmail).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Signature des webhooks FedaPay', () => {
  const body = JSON.stringify({ id: 1, type: 'transaction.approved', entity: { id: 42, status: 'approved' } });

  it('accepte une signature valide', () => {
    expect(fedapayService.constructWebhookEvent(body, signFedapay(body)).type).toBe('transaction.approved');
  });

  it('refuse une signature faite avec un autre secret', () => {
    expect(() => fedapayService.constructWebhookEvent(body, signFedapay(body, 'mauvais'))).toThrow(/invalide/);
  });

  it('refuse un corps modifie apres signature', () => {
    const header = signFedapay(body);
    expect(() => fedapayService.constructWebhookEvent(body.replace('42', '43'), header)).toThrow(/invalide/);
  });

  it('refuse un webhook trop ancien (rejeu)', () => {
    const old = Math.floor(Date.now() / 1000) - 3600;
    expect(() => fedapayService.constructWebhookEvent(body, signFedapay(body, FEDAPAY_WEBHOOK_SECRET, old))).toThrow(/expire/);
  });

  it('refuse une signature absente', () => {
    expect(() => fedapayService.constructWebhookEvent(body, undefined)).toThrow(/manquante/);
  });
});

describe('POST /api/donations/webhook/stripe', () => {
  const stripe = new Stripe('sk_test_fake');
  const eventPayload = (type: string) =>
    JSON.stringify({
      id: 'evt_test_1',
      object: 'event',
      type,
      data: { object: { id: 'pi_test_1', object: 'payment_intent', metadata: { donationId: DONATION_ID } } }
    });
  const post = (payload: string, signature: string) =>
    request(app)
      .post('/api/donations/webhook/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);
  const sign = (payload: string) => stripe.webhooks.generateTestHeaderString({ payload, secret: STRIPE_WEBHOOK_SECRET });

  it('valide un don sur payment_intent.succeeded et envoie le recu', async () => {
    const update = vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(fakeDonation({ status: 'completed' }) as never);
    const payload = eventPayload('payment_intent.succeeded');

    const res = await post(payload, sign(payload));

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      { _id: DONATION_ID, status: { $ne: 'completed' } },
      expect.objectContaining({ status: 'completed', stripePaymentIntentId: 'pi_test_1' }),
      { new: true }
    );
    expect(emailService.sendDonationReceiptEmail).toHaveBeenCalledTimes(1);
  });

  it("n'envoie pas de second recu si le webhook est rejoue", async () => {
    vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(null as never);
    const payload = eventPayload('payment_intent.succeeded');
    const res = await post(payload, sign(payload));
    expect(res.status).toBe(200);
    expect(emailService.sendDonationReceiptEmail).not.toHaveBeenCalled();
  });

  it('marque le don en echec sur payment_intent.payment_failed', async () => {
    const update = vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(null as never);
    const payload = eventPayload('payment_intent.payment_failed');
    await post(payload, sign(payload));
    expect(update).toHaveBeenCalledWith({ _id: DONATION_ID, status: 'pending' }, expect.objectContaining({ status: 'failed' }));
    expect(emailService.sendDonationReceiptEmail).not.toHaveBeenCalled();
  });

  it('rejette une signature invalide sans toucher la base', async () => {
    const update = vi.spyOn(Donation, 'findOneAndUpdate');
    const res = await post(eventPayload('payment_intent.succeeded'), 't=1,v1=deadbeef');
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});

describe('POST /api/donations/webhook/fedapay', () => {
  const post = (body: string) =>
    request(app)
      .post('/api/donations/webhook/fedapay')
      .set('x-fedapay-signature', signFedapay(body))
      .set('Content-Type', 'application/json')
      .send(body);

  it('valide le don sur transaction.approved', async () => {
    const update = vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(fakeDonation({ status: 'completed' }) as never);
    const body = JSON.stringify({ id: 9, type: 'transaction.approved', entity: { id: 42, status: 'approved', custom_metadata: { donationId: DONATION_ID } } });
    const res = await post(body);
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      { _id: DONATION_ID, status: { $ne: 'completed' } },
      expect.objectContaining({ status: 'completed', fedapayTransactionId: '42' }),
      { new: true }
    );
  });

  it('marque le don en echec sur transaction.declined', async () => {
    const update = vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(null as never);
    const body = JSON.stringify({ id: 10, type: 'transaction.declined', entity: { id: 42, status: 'declined', custom_metadata: { donationId: DONATION_ID } } });
    await post(body);
    expect(update).toHaveBeenCalledWith({ _id: DONATION_ID, status: 'pending' }, expect.objectContaining({ status: 'failed' }));
  });
});

describe('Verification au retour (reconcileDonation)', () => {
  it('ne consulte pas le fournisseur si le don est deja tranche', async () => {
    const spy = vi.spyOn(stripeService, 'retrieveCheckoutSession');
    expect(await donationService.reconcileDonation(fakeDonation({ status: 'completed' }) as never)).toBe('completed');
    expect(spy).not.toHaveBeenCalled();
  });

  it('valide le don si la session Stripe est payee (webhook en retard)', async () => {
    vi.spyOn(stripeService, 'retrieveCheckoutSession').mockResolvedValue({ status: 'complete', paymentStatus: 'paid', paymentIntentId: 'pi_1' });
    vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(fakeDonation({ status: 'completed' }) as never);
    expect(await donationService.reconcileDonation(fakeDonation() as never)).toBe('completed');
    expect(emailService.sendDonationReceiptEmail).toHaveBeenCalledTimes(1);
  });

  it('reste en attente tant que la session Stripe est ouverte', async () => {
    vi.spyOn(stripeService, 'retrieveCheckoutSession').mockResolvedValue({ status: 'open', paymentStatus: 'unpaid' });
    const update = vi.spyOn(Donation, 'findOneAndUpdate');
    expect(await donationService.reconcileDonation(fakeDonation() as never)).toBe('pending');
    expect(update).not.toHaveBeenCalled();
  });

  it('passe en echec si la session Stripe a expire', async () => {
    vi.spyOn(stripeService, 'retrieveCheckoutSession').mockResolvedValue({ status: 'expired', paymentStatus: 'unpaid' });
    vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(null as never);
    expect(await donationService.reconcileDonation(fakeDonation() as never)).toBe('failed');
  });

  it('passe en echec si FedaPay a refuse la transaction', async () => {
    vi.spyOn(fedapayService, 'getTransactionStatus').mockResolvedValue('declined');
    vi.spyOn(Donation, 'findOneAndUpdate').mockResolvedValue(null as never);
    const d = fakeDonation({ provider: 'fedapay', stripeCheckoutSessionId: undefined, fedapayTransactionId: '42' });
    expect(await donationService.reconcileDonation(d as never)).toBe('failed');
  });

  it('reste en attente si le fournisseur est injoignable', async () => {
    vi.spyOn(fedapayService, 'getTransactionStatus').mockRejectedValue(new Error('timeout'));
    const d = fakeDonation({ provider: 'fedapay', stripeCheckoutSessionId: undefined, fedapayTransactionId: '42' });
    expect(await donationService.reconcileDonation(d as never)).toBe('pending');
  });
});

describe('GET /api/donations/:id/status', () => {
  it('renvoie le statut sans donnees personnelles', async () => {
    vi.spyOn(Donation, 'findById').mockResolvedValue(fakeDonation({ status: 'completed' }) as never);
    const res = await request(app).get(`/api/donations/${DONATION_ID}/status`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'completed', amount: 5000, currency: 'XOF', provider: 'stripe' });
    expect(JSON.stringify(res.body)).not.toContain('donateur@example.com');
  });

  it('renvoie 404 pour un don inconnu et 400 pour un id invalide', async () => {
    vi.spyOn(Donation, 'findById').mockResolvedValue(null as never);
    expect((await request(app).get(`/api/donations/${DONATION_ID}/status`)).status).toBe(404);
    expect((await request(app).get('/api/donations/pas-un-id/status')).status).toBe(400);
  });
});

describe('Billets payants (reconcileRegistration)', () => {
  const fakeRegistration = (overrides: Record<string, unknown> = {}) => ({
    _id: { toString: () => DONATION_ID },
    paymentStatus: 'pending',
    provider: 'stripe',
    stripePaymentIntentId: 'pi_reg_1',
    ticketCode: 'TICKET123',
    ...overrides
  });

  it("extrait l'id du PaymentIntent depuis le client_secret", () => {
    expect(stripeService.paymentIntentIdFromClientSecret('pi_3Abc_secret_xyz')).toBe('pi_3Abc');
  });

  it('confirme le billet et envoie le mail si Stripe indique succeeded', async () => {
    vi.spyOn(stripeService, 'retrievePaymentIntentStatus').mockResolvedValue('succeeded');
    vi.spyOn(Registration, 'findOneAndUpdate').mockResolvedValue(fakeRegistration({ paymentStatus: 'paid' }) as never);
    vi.spyOn(Registration, 'findById').mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        ...fakeRegistration({ paymentStatus: 'paid' }),
        email: 'fidele@example.com',
        name: 'Jean',
        activityId: { title: 'Retraite', location: 'Lomé', date: new Date('2026-12-12') }
      })
    } as never);
    expect(await registrationService.reconcileRegistration(fakeRegistration() as never)).toBe('paid');
    expect(emailService.sendTicketEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'fidele@example.com', qrPng: expect.any(Buffer) })
    );
  });

  it('reste en attente si le paiement Stripe demande une autre carte', async () => {
    vi.spyOn(stripeService, 'retrievePaymentIntentStatus').mockResolvedValue('requires_payment_method');
    expect(await registrationService.reconcileRegistration(fakeRegistration() as never)).toBe('pending');
    expect(emailService.sendTicketEmail).not.toHaveBeenCalled();
  });
});
