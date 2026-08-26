import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Contact from '../models/Contact.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { publicFormLimiter } from '../middleware/rateLimit';

const router = Router();

router.post(
  '/',
  publicFormLimiter,
  [
    body('name').isString().trim().notEmpty().withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 }),
    body('message').isString().trim().notEmpty().isLength({ max: 5000 }).withMessage('Message requis')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;
    const contact = await Contact.create({ name, email, phone, message });
    res.status(201).json({ message: 'Message envoye avec succes', id: contact._id });
  })
);

router.get(
  '/',
  protect,
  [query('unread').optional().isIn(['true', 'false'])],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { unread } = req.query;
    const filter: Record<string, unknown> = {};
    if (unread === 'true') filter.isRead = false;

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  })
);

router.put(
  '/:id/read',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Message non trouve' });
    res.json(contact);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Message non trouve' });
    res.json({ message: 'Message supprime' });
  })
);

export default router;
