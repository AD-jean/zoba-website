import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Donation from '../models/Donation.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import * as stripeService from '../services/stripe.service';
import * as fedapayService from '../services/fedapay.service';

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

    try {
      if (provider === 'stripe') {
        const clientSecret = await stripeService.createPaymentIntent({
          amount,
          currency: finalCurrency,
          metadata: { donationId: donation._id.toString() },
          donorEmail
        });
        return res.json({ provider: 'stripe', clientSecret });
      }

      const transactionId = await fedapayService.createTransaction({
        amount,
        currency: finalCurrency,
        description: donorName ? `Don ZOBA - ${donorName}` : 'Don ZOBA',
        metadata: { donationId: donation._id.toString() },
        donorName,
        donorEmail,
        donorPhone
      });
      return res.json({ provider: 'fedapay', transactionId });
    } catch (err) {
      donation.status = 'failed';
      await donation.save();
      throw err;
    }
  })
);

export default router;
