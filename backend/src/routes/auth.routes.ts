import { Router } from 'express';
import { body } from 'express-validator';
import Admin from '../models/Admin.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { JWT_ALGORITHMS } from '../middleware/auth.middleware';

// Duree de session admin (heures). Courte par defaut : un jeton vole expire vite.
const SESSION_HOURS = Math.min(Math.max(Number(process.env.ADMIN_SESSION_HOURS) || 12, 1), 168);

// Hash factice : la comparaison bcrypt a toujours lieu, meme pour un e-mail inconnu,
// pour que le temps de reponse ne revele pas quels comptes existent.
const DUMMY_HASH = bcrypt.hashSync('zoba-compte-inexistant', 10);

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isString().notEmpty().withMessage('Mot de passe requis')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    const isMatch = await bcrypt.compare(password, admin?.password ?? DUMMY_HASH);
    if (!admin || !isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Configuration serveur invalide' });
    }

    const token = jwt.sign({ id: admin._id }, secret, { expiresIn: `${SESSION_HOURS}h`, algorithm: 'HS256' });

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  })
);

router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ valid: false });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret, { algorithms: JWT_ALGORITHMS }) as { id: string };
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ valid: false });
    }

    res.json({
      valid: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
