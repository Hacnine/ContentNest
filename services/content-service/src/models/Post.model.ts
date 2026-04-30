import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import { PostStatus } from '@contentnest/shared';

export interface IPostDocument extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  status: PostStatus;
  featuredImage?: string;
  categories: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
  scheduledAt?: Date;
  publishedAt?: Date;
  readingTime?: number;
  viewCount: number;
  locale: string;
}

const postSchema = new Schema<IPostDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 500 },
    author: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft',
    },
    featuredImage: { type: String },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    seo: {
      metaTitle: { type: String, maxlength: 70 },
      metaDescription: { type: String, maxlength: 160 },
      ogImage: { type: String },
      keywords: [{ type: String }],
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    readingTime: { type: Number },
    viewCount: { type: Number, default: 0 },
    locale: { type: String, default: 'en' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Text Index for Full-text Search ─────────────────────────────────────────
postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
postSchema.index({ slug: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ author: 1 });

// ─── Auto-generate Slug ───────────────────────────────────────────────────────
postSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

export const Post = mongoose.model<IPostDocument>('Post', postSchema);
