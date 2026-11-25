import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model';

// Algorithme impose a la verification : refuse tout jeton signe autrement (ex. alg « none »).
export const JWT_ALGORITHMS: jwt.Algorithm[] = ['HS256'];

export interface AuthRequest extends Request {
  adminId?: string;
}

// Vérifie réellement le jeton admin d'une requête (signature + expiration),
// sans bloquer si absent. Pour les routes publiques qui exposent un peu plus
// de données à un admin authentifié (ex. brouillons d'actualités).
export const hasValidAdminToken = (req: Request): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    jwt.verify(authHeader.split(' ')[1], secret, { algorithms: JWT_ALGORITHMS });
    return true;
  } catch {
    return false;
  }
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Non autorise - Token manquant' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Configuration serveur invalide' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret, { algorithms: JWT_ALGORITHMS }) as { id: string };
    // Le compte doit toujours exister : un admin supprime perd l'acces immediatement.
    if (!(await Admin.exists({ _id: decoded.id }))) {
      res.status(401).json({ message: 'Non autorise - Token invalide' });
      return;
    }
    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Non autorise - Token invalide' });
  }
};
