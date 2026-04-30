import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);
