import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { asyncHandler } from '../middleware/asyncHandler';
import * as stripeService from '../services/stripe.service';
import * as fedapayService from '../services/fedapay.service';
import * as donationService from '../services/donation.service';
import * as registrationService from '../services/registration.service';
import { AppError } from '../utils/AppError';

const router = Router();

// Un seul endpoint webhook par fournisseur (deja configure dans les dashboards Stripe/FedaPay) :
// on route vers le bon service selon la metadonnee presente, plutot que de demander a
// l'utilisateur de creer un second endpoint webhook pour les billets d'activites.

router.post(
  '/stripe',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new AppError(400, 'Signature manquante');
    }
    if (!Buffer.isBuffer(req.body)) {
      throw new AppError(400, 'Corps de requete invalide');
    }
    const event = stripeService.constructWebhookEvent(req.body, signature);

    const metadata = (event.data.object as Stripe.PaymentIntent).metadata;
    if (metadata?.registrationId) {
      await registrationService.applyStripeEvent(event);
    } else if (metadata?.donationId) {
      await donationService.applyStripeEvent(event);
    }

    res.json({ received: true });
  })
);

router.post(
  '/fedapay',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-fedapay-signature'];
    if (!Buffer.isBuffer(req.body)) {
      throw new AppError(400, 'Corps de requete invalide');
    }
    const event = fedapayService.constructWebhookEvent(
      req.body.toString('utf8'),
      typeof signature === 'string' ? signature : undefined
    );

    const metadata = event.entity?.custom_metadata;
    if (metadata?.registrationId) {
      await registrationService.applyFedapayEvent(event);
    } else if (metadata?.donationId) {
      await donationService.applyFedapayEvent(event);
    }

    res.json({ received: true });
  })
);

export default router;
