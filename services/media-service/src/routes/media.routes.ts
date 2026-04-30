import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { config } from '../config';
import * as controller from '../controllers/media.controller';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (config.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

function multerErrorHandler(err: Error, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof multer.MulterError || err.message.startsWith('File type not allowed')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
  next(err);
}

const router = Router();

router.get('/', controller.getMedia);
router.post('/', upload.single('file'), multerErrorHandler, controller.uploadMedia);
router.delete('/:id', controller.deleteMedia);

export default router;
