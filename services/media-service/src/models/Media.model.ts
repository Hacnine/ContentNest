import mongoose, { Document, Schema } from 'mongoose';
import { MediaType } from '@contentnest/shared';

export interface IMediaDocument extends Document {
  filename: string;
  originalName: string;
  url: string;
  publicId: string;
  type: MediaType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  provider: 'cloudinary' | 's3';
}

const mediaSchema = new Schema<IMediaDocument>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'], required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    uploadedBy: { type: String, required: true },
    provider: { type: String, enum: ['cloudinary', 's3'], required: true },
  },
  { timestamps: true }
);

mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ type: 1 });

export const Media = mongoose.model<IMediaDocument>('Media', mediaSchema);
