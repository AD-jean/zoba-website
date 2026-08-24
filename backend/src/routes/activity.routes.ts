import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Activity from '../models/Activity.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

const router = Router();

const DEPARTMENTS = ['Tous', 'Hommes', 'Femmes', 'Jeunesse', 'Enfants'];
const ORGANIZERS = ['Zone', 'Église'];

const activityValidators = [
  body('title').isString().trim().notEmpty().withMessage('Titre requis'),
  body('description').isString().trim().notEmpty().withMessage('Description requise'),
  body('location').isString().trim().notEmpty().withMessage('Lieu requis'),
  body('date').optional({ values: 'falsy' }).isISO8601().withMessage('Date invalide'),
  body('department').optional().isIn(DEPARTMENTS).withMessage('Departement invalide'),
  body('organizer').optional().isIn(ORGANIZERS).withMessage('Organisateur invalide'),
  body('image').optional({ values: 'falsy' }).isString().trim(),
  body('registrationRequired').optional().isBoolean(),
  body('registrationDeadline').optional({ values: 'falsy' }).isISO8601(),
  body('maxParticipants').optional({ values: 'falsy' }).isInt({ min: 1 })
];

router.get(
  '/',
  [
    query('upcoming').optional().isIn(['true', 'false']),
    query('department').optional().isIn(DEPARTMENTS)
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { upcoming, department } = req.query;
    const filter: Record<string, unknown> = {};

    if (department) filter.department = department;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const activities = await Activity.find(filter).sort({ date: 1 });
    res.json(activities);
  })
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activite non trouvee' });
    res.json(activity);
  })
);

router.post(
  '/',
  protect,
  activityValidators,
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  })
);

router.put(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide'), ...activityValidators],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!activity) return res.status(404).json({ message: 'Activite non trouvee' });
    res.json(activity);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activite non trouvee' });
    res.json({ message: 'Activite supprimee' });
  })
);

export default router;
