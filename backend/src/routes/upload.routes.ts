import { Router, Response } from 'express';
import multer from 'multer';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/AppError';
import { uploadImage } from '../services/cloudinary.service';

const router = Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_FOLDERS = ['members', 'activities', 'news', 'gallery'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new AppError(400, 'Type de fichier non supporte (jpeg, png, webp, gif uniquement)'));
      return;
    }
    cb(null, true);
  }
});

router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new AppError(400, 'Aucun fichier fourni');
    }

    const folder = typeof req.body.folder === 'string' && ALLOWED_FOLDERS.includes(req.body.folder)
      ? req.body.folder
      : 'misc';

    const url = await uploadImage(req.file.buffer, folder);
    res.status(201).json({ url });
  })
);

export default router;
