import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import News from '../models/News.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

const router = Router();

const newsValidators = [
  body('title').isString().trim().notEmpty().withMessage('Titre requis'),
  body('content').isString().trim().notEmpty().withMessage('Contenu requis'),
  body('excerpt').isString().trim().notEmpty().withMessage('Extrait requis'),
  body('image').optional({ values: 'falsy' }).isString().trim(),
  body('category').optional({ values: 'falsy' }).isString().trim(),
  body('published').optional().isBoolean(),
  body('publishedAt').optional({ values: 'falsy' }).isISO8601().withMessage('Date invalide')
];

router.get(
  '/',
  [query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  asyncHandler(async (req, res) => {
    const { limit, category } = req.query;
    const filter: Record<string, unknown> = { published: true };

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      delete filter.published;
    }

    if (category) filter.category = category;

    let query = News.find(filter).sort({ publishedAt: -1 });
    if (limit) query = query.limit(parseInt(limit as string));

    const news = await query;
    res.json(news);
  })
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'Article non trouve' });
    res.json(news);
  })
);

router.post(
  '/',
  protect,
  newsValidators,
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const news = await News.create(req.body);
    res.status(201).json(news);
  })
);

router.put(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide'), ...newsValidators],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!news) return res.status(404).json({ message: 'Article non trouve' });
    res.json(news);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: 'Article non trouve' });
    res.json({ message: 'Article supprime' });
  })
);

export default router;
