import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Member from '../models/Member.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

const router = Router();

const memberValidators = [
  body('name').isString().trim().notEmpty().withMessage('Nom requis'),
  body('role').isString().trim().notEmpty().withMessage('Role requis'),
  body('organization').isIn(['CBT', 'Zone']).withMessage('Organisation invalide'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email invalide'),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 }),
  body('image').optional({ values: 'falsy' }).isString().trim(),
  body('bio').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
  body('order').optional().isInt().withMessage('Ordre invalide')
];

router.get(
  '/',
  [query('organization').optional().isIn(['CBT', 'Zone'])],
  validate,
  asyncHandler(async (req, res) => {
    const { organization } = req.query;
    const filter = organization ? { organization } : {};
    const members = await Member.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(members);
  })
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Membre non trouve' });
    res.json(member);
  })
);

router.post(
  '/',
  protect,
  memberValidators,
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  })
);

router.put(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide'), ...memberValidators],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Membre non trouve' });
    res.json(member);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Membre non trouve' });
    res.json({ message: 'Membre supprime' });
  })
);

export default router;
