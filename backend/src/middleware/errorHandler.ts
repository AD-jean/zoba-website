import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MulterError } from 'multer';
import { AppError } from '../utils/AppError';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvee' });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: 'Donnees invalides' });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }

  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (max 5 Mo)' : 'Erreur de televersement';
    return res.status(400).json({ message });
  }

  if (err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'Ressource deja existante' });
  }

  console.error('Erreur serveur:', err);
  res.status(500).json({
    message: 'Une erreur est survenue',
    ...(process.env.NODE_ENV !== 'production' && err instanceof Error ? { error: err.message } : {})
  });
};
