import { Request, Response, NextFunction } from 'express';
import { Media } from '../models/Media.model';
import { uploadFile, deleteFile } from '../utils/storage';
import { sendSuccess, sendError, sendPaginated } from '@contentnest/shared';
import { MediaType } from '@contentnest/shared';
import crypto from 'crypto';

export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!req.file) {
      sendError(res, 'No file provided', 400);
      return;
    }

    const { buffer, originalname, mimetype, size } = req.file;

    let type: MediaType = 'document';
    if (mimetype.startsWith('image/')) type = 'image';
    else if (mimetype.startsWith('video/')) type = 'video';

    const uploadResult = await uploadFile(buffer, mimetype, originalname);

    const filename = `${crypto.randomUUID()}-${originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const media = await Media.create({
      filename,
      originalName: originalname,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      type,
      mimeType: mimetype,
      size,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedBy: userId,
      provider: uploadResult.provider,
    });

    sendSuccess(res, media, 'File uploaded', 201);
  } catch (err) {
    next(err);
  }
}

export async function getMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;

    const [data, total] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Media.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    sendPaginated(res, {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;

    const media = await Media.findById(id);
    if (!media) {
      sendError(res, 'Media not found', 404);
      return;
    }

    if (userRole !== 'admin' && media.uploadedBy !== userId) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    await deleteFile(media.publicId, media.provider);
    await Media.findByIdAndDelete(id);

    sendSuccess(res, null, 'Media deleted');
  } catch (err) {
    next(err);
  }
}
