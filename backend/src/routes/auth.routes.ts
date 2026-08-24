import { Router } from 'express';
import { body } from 'express-validator';
import Admin from '../models/Admin.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

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
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Configuration serveur invalide' });
    }

    const token = jwt.sign({ id: admin._id }, secret, { expiresIn: '7d' });

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
    const decoded = jwt.verify(token, secret) as { id: string };
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
