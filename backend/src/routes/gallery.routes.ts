import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Gallery from '../models/Gallery.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

const router = Router();

const DEPARTMENTS = ['Tous', 'Hommes', 'Femmes', 'Jeunesse', 'Enfants'];

const galleryValidators = [
  body('image').isString().trim().notEmpty().withMessage('Image requise'),
  body('caption').optional({ values: 'falsy' }).isString().trim().isLength({ max: 300 }),
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 1000 }),
  body('department').optional({ values: 'falsy' }).isIn(DEPARTMENTS).withMessage('Departement invalide'),
  body('category').optional({ values: 'falsy' }).isString().trim(),
  body('event').optional({ values: 'falsy' }).isString().trim()
];

router.get(
  '/',
  [
    query('department').optional().isIn(DEPARTMENTS),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { category, department, limit } = req.query;
    const filter: Record<string, unknown> = {};

    // typeof string => neutralise une injection d'opérateur MongoDB
    // du type ?category[$ne]=x (req.query.category serait alors un objet).
    if (typeof category === 'string') filter.category = category;
    if (department) filter.department = department;

    let query = Gallery.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(parseInt(limit as string));

    const items = await query;
    res.json(items);
  })
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Image non trouvee' });
    res.json(item);
  })
);

router.post(
  '/',
  protect,
  galleryValidators,
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await Gallery.create(req.body);
    res.status(201).json(item);
  })
);

router.put(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide'), ...galleryValidators],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Image non trouvee' });
    res.json(item);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Image non trouvee' });
    res.json({ message: 'Image supprimee' });
  })
);

export default router;
