import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Donnees invalides',
      errors: errors.array().map(e => ('path' in e ? { field: e.path, message: e.msg } : { message: e.msg }))
    });
  }
  next();
};
