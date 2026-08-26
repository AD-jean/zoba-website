import { Router, Response } from 'express';
import { body, param } from 'express-validator';
import Subscriber from '../models/Subscriber.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { publicFormLimiter } from '../middleware/rateLimit';

const router = Router();

router.post(
  '/',
  publicFormLimiter,
  [body('email').isEmail().withMessage('Email invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return res.json({ message: 'Reabonnement reussi' });
      }
      return res.status(400).json({ message: 'Deja abonne' });
    }

    const subscriber = await Subscriber.create({ email: normalizedEmail });
    res.status(201).json({ message: 'Abonnement reussi', id: subscriber._id });
  })
);

router.delete(
  '/unsubscribe',
  publicFormLimiter,
  [body('email').isEmail().withMessage('Email invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    await Subscriber.findOneAndUpdate({ email: email.toLowerCase() }, { active: false });
    res.json({ message: 'Desabonnement reussi' });
  })
);

router.get(
  '/',
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  })
);

router.put(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide'), body('active').isBoolean().withMessage('Valeur invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { active } = req.body;
    const subscriber = await Subscriber.findByIdAndUpdate(req.params.id, { active }, { new: true });
    if (!subscriber) return res.status(404).json({ message: 'Abonne non trouve' });
    res.json(subscriber);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) return res.status(404).json({ message: 'Abonne non trouve' });
    res.json({ message: 'Abonne supprime' });
  })
);

export default router;
