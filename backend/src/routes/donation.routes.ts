import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Donation from '../models/Donation.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { publicFormLimiter, paymentStatusLimiter } from '../middleware/rateLimit';
import * as stripeService from '../services/stripe.service';
import * as fedapayService from '../services/fedapay.service';
import * as donationService from '../services/donation.service';

const router = Router();

const ALLOWED_CURRENCIES = ['XOF'];
const MAX_AMOUNT = 5_000_000;

const donorFieldValidators = [
  body('donorEmail').optional({ values: 'falsy' }).isEmail().withMessage('Email invalide'),
  body('donorName').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }),
  body('donorPhone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 })
];

router.post(
  '/',
  publicFormLimiter,
  [
    body('amount').isFloat({ gt: 0, lt: MAX_AMOUNT }).withMessage('Montant invalide'),
    body('currency').optional().isIn(ALLOWED_CURRENCIES).withMessage('Devise non supportee'),
    body('paymentMethod').isString().trim().notEmpty().withMessage('Mode de paiement requis'),
    body('message').optional({ values: 'falsy' }).isString().trim().isLength({ max: 1000 }),
    ...donorFieldValidators
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { amount, currency, paymentMethod, donorName, donorEmail, donorPhone, message } = req.body;
    const donation = await Donation.create({
      amount,
      currency: currency || 'XOF',
      paymentMethod,
      donorName,
      donorEmail,
      donorPhone,
      message
    });
    res.status(201).json({ message: 'Don enregistre', id: donation._id });
  })
);

router.get(
  '/',
  protect,
  [query('status').optional().isIn(['pending', 'completed', 'failed'])],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    res.json(donations);
  })
);

router.get(
  '/stats',
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    res.json(stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 });
  })
);

router.put(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide'), body('status').isIn(['pending', 'completed', 'failed'])],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!donation) return res.status(404).json({ message: 'Don non trouve' });
    res.json(donation);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Don non trouve' });
    res.json({ message: 'Don supprime' });
  })
);

router.post(
  '/checkout',
  publicFormLimiter,
  [
    body('amount').isFloat({ gt: 0, lt: MAX_AMOUNT }).withMessage('Montant invalide'),
    body('currency').optional().isIn(ALLOWED_CURRENCIES).withMessage('Devise non supportee'),
    body('provider').isIn(['stripe', 'fedapay']).withMessage('Fournisseur de paiement invalide'),
    ...donorFieldValidators
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { amount, currency, provider, donorName, donorEmail, donorPhone } = req.body;
    const finalCurrency = currency || 'XOF';

    const donation = await Donation.create({
      amount,
      currency: finalCurrency,
      paymentMethod: provider === 'stripe' ? 'Stripe' : 'FedaPay',
      provider,
      donorName,
      donorEmail,
      donorPhone,
      status: 'pending'
    });

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

    try {
      if (provider === 'stripe') {
        const url = await stripeService.createCheckoutSession({
          amount,
          currency: finalCurrency,
          metadata: { donationId: donation._id.toString() },
          donorEmail,
          successUrl: `${frontendUrl}/dons?payment=success`,
          cancelUrl: `${frontendUrl}/dons?payment=cancel`
        });
        return res.json({ provider: 'stripe', url });
      }

      const transactionId = await fedapayService.createTransaction({
        amount,
        currency: finalCurrency,
        description: donorName ? `Don ZOBA - ${donorName}` : 'Don ZOBA',
        metadata: { donationId: donation._id.toString() },
        donorName,
        donorEmail,
        donorPhone,
        callbackUrl: `${frontendUrl}/dons?payment=success`
      });
      const url = await fedapayService.generateCheckoutUrl(transactionId);
      return res.json({ provider: 'fedapay', url });
    } catch (err) {
      donation.status = 'failed';
      await donation.save();
      throw err;
    }
  })
);

/**
 * Normalise un numero togolais vers ses 8 chiffres locaux ("+228 90 12 34 56",
 * "0022890123456", "90123456" -> "90123456"). Renvoie null si le format n'est pas reconnu.
 */
const normalizeTogoPhone = (raw: string): string | null => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00228')) digits = digits.slice(5);
  else if (digits.startsWith('228') && digits.length === 11) digits = digits.slice(3);
  return /^\d{8}$/.test(digits) ? digits : null;
};

// Paiement Mobile Money sans quitter le site : le donateur choisit son operateur, saisit son
// numero et recoit la demande de validation directement sur son telephone.
router.post(
  '/mobile-money',
  publicFormLimiter,
  [
    body('amount').isFloat({ gt: 0, lt: MAX_AMOUNT }).withMessage('Montant invalide'),
    body('operator').isIn(Object.keys(fedapayService.MOBILE_OPERATORS)).withMessage('Operateur invalide'),
    body('phone')
      .isString()
      .custom(value => normalizeTogoPhone(value) !== null)
      .withMessage('Numero de telephone invalide (8 chiffres, ex. 90 12 34 56)'),
    body('donorEmail').optional({ values: 'falsy' }).isEmail().withMessage('Email invalide'),
    body('donorName').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 })
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { amount, operator, donorName, donorEmail } = req.body as {
      amount: number;
      operator: fedapayService.MobileOperator;
      donorName?: string;
      donorEmail?: string;
    };
    const phone = normalizeTogoPhone(req.body.phone) as string;

    const donation = await Donation.create({
      amount,
      currency: 'XOF',
      paymentMethod: fedapayService.MOBILE_OPERATORS[operator].label,
      provider: 'fedapay',
      donorName,
      donorEmail,
      donorPhone: `+228${phone}`,
      status: 'pending'
    });

    try {
      const transactionId = await fedapayService.createTransaction({
        amount,
        currency: 'XOF',
        description: donorName ? `Don ZOBA - ${donorName}` : 'Don ZOBA',
        metadata: { donationId: donation._id.toString() },
        donorName,
        donorEmail,
        donorPhone: phone
      });
      // Rattache la transaction des maintenant : la verification de statut en a besoin
      // avant meme l'arrivee du webhook.
      donation.fedapayTransactionId = String(transactionId);
      await donation.save();

      await fedapayService.sendMobilePayment(transactionId, operator, phone);
    } catch (err) {
      donation.status = 'failed';
      await donation.save();
      throw err;
    }

    res.status(201).json({
      id: donation._id,
      status: 'pending',
      message: 'Une demande de paiement a ete envoyee sur votre telephone. Validez-la avec votre code secret.'
    });
  })
);

// Statut public d'un don (utilise pendant l'attente du Mobile Money). Ne renvoie que le
// statut, aucune donnee personnelle. Si le don est encore en attente, on interroge FedaPay :
// c'est lui qui fait foi, meme si le webhook n'est pas encore arrive.
router.get(
  '/:id/status',
  paymentStatusLimiter,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const donation = await Donation.findById(req.params.id).select('status fedapayTransactionId');
    if (!donation) return res.status(404).json({ message: 'Don non trouve' });

    if (donation.status === 'pending' && donation.fedapayTransactionId) {
      try {
        const fedapayStatus = await fedapayService.getTransactionStatus(Number(donation.fedapayTransactionId));
        await donationService.applyFedapayStatus(donation._id.toString(), fedapayStatus);
        const refreshed = await Donation.findById(donation._id).select('status');
        return res.json({ status: refreshed?.status ?? donation.status });
      } catch {
        // FedaPay injoignable : on renvoie le statut connu, le frontend reessaiera.
      }
    }
    res.json({ status: donation.status });
  })
);

export default router;
