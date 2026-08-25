import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import Registration from '../models/Registration.model';
import Activity, { IActivity } from '../models/Activity.model';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { generateTicketCode, generateQrDataUrl, ticketUrl } from '../services/ticket.service';
import { sendTicketEmail } from '../services/email.service';
import { generateTicketPdf } from '../services/pdf.service';
import * as stripeService from '../services/stripe.service';
import * as fedapayService from '../services/fedapay.service';
import { AppError } from '../utils/AppError';

const DUPLICATE_MESSAGE = 'Vous êtes déjà inscrit(e) à cette activité avec cette adresse e-mail';
const isDuplicateKeyError = (err: unknown): boolean =>
  !!err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000;

const router = Router();

const registrantFieldValidators = [
  body('activityId').isMongoId().withMessage('Activite invalide'),
  body('name').isString().trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 30 }),
  body('church').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }),
  body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 1000 })
];

// Places encore disponibles : les paiements en attente ne bloquent pas une place indefiniment
// (panier de paiement abandonne) -- seules les inscriptions gratuites et les payantes confirmees comptent.
const countTakenSeats = (activityId: string) =>
  Registration.countDocuments({
    activityId,
    status: { $ne: 'cancelled' },
    paymentStatus: { $in: ['not_required', 'paid'] }
  });

const checkActivityOpenForRegistration = async (activityId: string) => {
  const activity = await Activity.findById(activityId);
  if (!activity) {
    throw new AppError(404, 'Activite non trouvee');
  }
  if (!activity.registrationRequired) {
    throw new AppError(400, "Cette activite ne necessite pas d'inscription");
  }
  if (activity.registrationDeadline && new Date() > activity.registrationDeadline) {
    throw new AppError(400, "La date limite d'inscription est passee");
  }
  if (activity.maxParticipants) {
    const count = await countTakenSeats(activityId);
    if (count >= activity.maxParticipants) {
      throw new AppError(400, 'Plus de places disponibles');
    }
  }
  return activity;
};

// Une personne (email) ne peut avoir qu'une seule inscription valide par activite -- verification
// applicative pour un message d'erreur clair avant meme de tenter la creation ; l'index partiel
// unique sur Registration reste la vraie protection contre une race condition (deux requetes
// simultanees), voir Registration.model.ts.
const checkNoDuplicateRegistration = async (activityId: string, email: string) => {
  const existing = await Registration.findOne({
    activityId,
    email: email.toLowerCase(),
    status: { $ne: 'cancelled' },
    paymentStatus: { $in: ['not_required', 'paid'] }
  });
  if (existing) {
    throw new AppError(409, DUPLICATE_MESSAGE);
  }
};

router.post(
  '/',
  registrantFieldValidators,
  validate,
  asyncHandler(async (req, res) => {
    const { activityId, email } = req.body;
    const activity = await checkActivityOpenForRegistration(activityId);

    if (activity.price > 0) {
      throw new AppError(400, 'Cette activite est payante, utilisez /api/registrations/checkout');
    }

    await checkNoDuplicateRegistration(activityId, email);

    const ticketCode = generateTicketCode();
    let registration;
    try {
      registration = await Registration.create({ ...req.body, ticketCode, paymentStatus: 'not_required' });
    } catch (err) {
      if (isDuplicateKeyError(err)) throw new AppError(409, DUPLICATE_MESSAGE);
      throw err;
    }

    try {
      const qrDataUrl = await generateQrDataUrl(ticketCode);
      await sendTicketEmail({
        to: registration.email,
        name: registration.name,
        activityTitle: activity.title,
        activityDate: activity.date?.toLocaleDateString('fr-FR'),
        activityLocation: activity.location,
        ticketUrl: ticketUrl(ticketCode),
        qrDataUrl
      });
    } catch (err) {
      console.error('Envoi email billet echoue pour', registration._id.toString(), err);
    }

    res.status(201).json({ message: 'Inscription reussie', id: registration._id, ticketCode });
  })
);

router.post(
  '/checkout',
  [...registrantFieldValidators, body('provider').isIn(['stripe', 'fedapay']).withMessage('Fournisseur de paiement invalide')],
  validate,
  asyncHandler(async (req, res) => {
    const { activityId, name, email, phone, church, notes, provider } = req.body;
    const activity = await checkActivityOpenForRegistration(activityId);

    if (!(activity.price > 0)) {
      throw new AppError(400, "Cette activite est gratuite, utilisez /api/registrations");
    }

    await checkNoDuplicateRegistration(activityId, email);

    const ticketCode = generateTicketCode();
    let registration;
    try {
      registration = await Registration.create({
        activityId,
        name,
        email,
        phone,
        church,
        notes,
        ticketCode,
        paymentStatus: 'pending',
        provider,
        amount: activity.price,
        currency: 'XOF'
      });
    } catch (err) {
      if (isDuplicateKeyError(err)) throw new AppError(409, DUPLICATE_MESSAGE);
      throw err;
    }

    try {
      if (provider === 'stripe') {
        const clientSecret = await stripeService.createPaymentIntent({
          amount: activity.price,
          currency: 'XOF',
          metadata: { registrationId: registration._id.toString() },
          donorEmail: email
        });
        return res.json({ provider: 'stripe', clientSecret, id: registration._id });
      }

      const transactionId = await fedapayService.createTransaction({
        amount: activity.price,
        currency: 'XOF',
        description: `Billet ${activity.title} - ${name}`,
        metadata: { registrationId: registration._id.toString() },
        donorName: name,
        donorEmail: email,
        donorPhone: phone
      });
      return res.json({ provider: 'fedapay', transactionId, id: registration._id });
    } catch (err) {
      registration.paymentStatus = 'failed';
      await registration.save();
      throw err;
    }
  })
);

router.get(
  '/ticket/:ticketCode',
  asyncHandler(async (req, res) => {
    const registration = await Registration.findOne({ ticketCode: req.params.ticketCode }).populate<{ activityId: IActivity }>('activityId', 'title date location');
    if (!registration) return res.status(404).json({ message: 'Billet introuvable' });

    res.json({
      name: registration.name,
      activityTitle: registration.activityId.title,
      activityDate: registration.activityId.date,
      activityLocation: registration.activityId.location,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      checkedIn: registration.checkedIn,
      checkedInAt: registration.checkedInAt
    });
  })
);

router.get(
  '/ticket/:ticketCode/download',
  asyncHandler(async (req, res) => {
    const registration = await Registration.findOne({ ticketCode: req.params.ticketCode }).populate<{ activityId: IActivity }>('activityId', 'title date location');
    if (!registration) return res.status(404).json({ message: 'Billet introuvable' });

    const pdf = await generateTicketPdf({
      name: registration.name,
      activityTitle: registration.activityId.title,
      activityDate: registration.activityId.date?.toLocaleDateString('fr-FR'),
      activityLocation: registration.activityId.location,
      ticketCode: registration.ticketCode
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="billet-${registration.ticketCode}.pdf"`);
    res.send(pdf);
  })
);

router.post(
  '/checkin/:ticketCode',
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const registration = await Registration.findOne({ ticketCode: req.params.ticketCode });
    if (!registration) return res.status(404).json({ message: 'Billet introuvable' });

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Inscription annulee' });
    }
    if (registration.paymentStatus === 'pending' || registration.paymentStatus === 'failed') {
      return res.status(400).json({ message: 'Paiement non confirme pour ce billet' });
    }

    if (registration.checkedIn) {
      return res.json({
        alreadyCheckedIn: true,
        name: registration.name,
        checkedInAt: registration.checkedInAt
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({ alreadyCheckedIn: false, name: registration.name, checkedInAt: registration.checkedInAt });
  })
);

router.get(
  '/',
  protect,
  [
    query('activityId').optional().isMongoId(),
    query('status').optional().isIn(['pending', 'confirmed', 'cancelled'])
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { activityId, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (activityId) filter.activityId = activityId;
    if (status) filter.status = status;

    const registrations = await Registration.find(filter)
      .populate('activityId', 'title date location')
      .sort({ createdAt: -1 });
    res.json(registrations);
  })
);

router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Identifiant invalide'),
    body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Statut invalide')
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!registration) return res.status(404).json({ message: 'Inscription non trouvee' });
    res.json(registration);
  })
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Identifiant invalide')],
  validate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Inscription non trouvee' });
    res.json({ message: 'Inscription supprimee' });
  })
);

export default router;
