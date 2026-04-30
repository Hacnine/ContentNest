import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendSuccess, sendPaginated } from '@contentnest/shared';

// Reference the Post collection from content-service's database
const postSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  author: String,
  status: String,
  featuredImage: String,
  categories: [mongoose.Schema.Types.ObjectId],
  tags: [mongoose.Schema.Types.ObjectId],
  publishedAt: Date,
  readingTime: Number,
  locale: String,
}, { collection: 'posts' });

postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

const Post = mongoose.model('Post', postSchema);

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      q,
      category,
      tag,
      locale,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { status: 'published' };

    if (q) {
      filter.$text = { $search: q as string };
    }
    if (category) filter.categories = new mongoose.Types.ObjectId(category as string);
    if (tag) filter.tags = new mongoose.Types.ObjectId(tag as string);
    if (locale) filter.locale = locale;

    const projection = q
      ? { score: { $meta: 'textScore' }, content: 0 }
      : { content: 0 };

    const sortOptions = q
      ? { score: { $meta: 'textScore' } }
      : { publishedAt: -1 as const };

    const [data, total] = await Promise.all([
      Post.find(filter, projection).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Post.countDocuments(filter),
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

export async function getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) {
      sendSuccess(res, []);
      return;
    }

    const posts = await Post.find(
      { status: 'published', title: { $regex: q, $options: 'i' } },
      { title: 1, slug: 1 }
    )
      .limit(5)
      .lean();

    sendSuccess(res, posts);
  } catch (err) {
    next(err);
  }
}
