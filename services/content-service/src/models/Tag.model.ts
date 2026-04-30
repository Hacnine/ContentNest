import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface ITagDocument extends Document {
  name: string;
  slug: string;
}

const tagSchema = new Schema<ITagDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 50 },
    slug: { type: String, unique: true, lowercase: true },
  },
  { timestamps: true }
);

tagSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Tag = mongoose.model<ITagDocument>('Tag', tagSchema);
