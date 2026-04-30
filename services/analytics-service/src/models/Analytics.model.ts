import mongoose, { Document, Schema } from 'mongoose';

export interface IPageViewDocument extends Document {
  postId: string;
  postSlug: string;
  postTitle: string;
  visitorId: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  device?: string;
}

const pageViewSchema = new Schema<IPageViewDocument>(
  {
    postId: { type: String, required: true },
    postSlug: { type: String, required: true },
    postTitle: { type: String },
    visitorId: { type: String, required: true },
    referrer: { type: String },
    userAgent: { type: String },
    country: { type: String },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  },
  { timestamps: true }
);

pageViewSchema.index({ postId: 1, createdAt: -1 });
pageViewSchema.index({ createdAt: -1 });

export const PageView = mongoose.model<IPageViewDocument>('PageView', pageViewSchema);
