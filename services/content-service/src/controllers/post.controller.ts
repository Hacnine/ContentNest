import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Post } from '../models/Post.model';
import { sendSuccess, sendError, sendPaginated } from '@contentnest/shared';

export async function getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      tag,
      author,
      locale,
      sort = 'publishedAt',
      order = 'desc',
    } = req.query;

    const filter: Record<string, unknown> = {};

    // Public access only sees published posts; internal requests can see all
    const isInternal = req.headers['x-user-role'] !== undefined;
    if (!isInternal) filter.status = 'published';
    else if (status) filter.status = status;

    if (category) filter.categories = category;
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    if (locale) filter.locale = locale;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Post.find(filter)
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .sort({ [sort as string]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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

export async function getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const isInternal = req.headers['x-user-role'] !== undefined;
    const filter: Record<string, unknown> = { slug };
    if (!isInternal) filter.status = 'published';

    const post = await Post.findOne(filter)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug');

    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }
    sendSuccess(res, post);
  } catch (err) {
    next(err);
  }
}

export async function getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await Post.findById(req.params.id)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug');
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }
    sendSuccess(res, post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const { title, content, excerpt, status, featuredImage, categories, tags, seo, scheduledAt, locale } = req.body;

    // Only admins/editors can publish directly
    const finalStatus = (userRole === 'viewer' && status === 'published') ? 'draft' : (status || 'draft');

    const post = await Post.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, ''),
      author: userId,
      status: finalStatus,
      featuredImage,
      categories: categories || [],
      tags: tags || [],
      seo: seo || {},
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
      locale: locale || 'en',
      readingTime: Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
    });

    sendSuccess(res, await post.populate(['categories', 'tags']), 'Post created', 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const existing = await Post.findById(id);
    if (!existing) {
      sendError(res, 'Post not found', 404);
      return;
    }

    // Editors can only edit their own posts
    if (userRole === 'editor' && existing.author !== userId) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    const { content, ...rest } = req.body;
    const updateData: Record<string, unknown> = { ...rest };

    if (content) {
      updateData.content = content;
      updateData.readingTime = Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200);
    }

    if (rest.status === 'published' && existing.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const post = await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('categories', 'name slug')
      .populate('tags', 'name slug');

    sendSuccess(res, post, 'Post updated');
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const post = await Post.findById(id);
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    if (userRole !== 'admin' && post.author !== userId) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    await Post.findByIdAndDelete(id);
    sendSuccess(res, null, 'Post deleted');
  } catch (err) {
    next(err);
  }
}

export async function getRelatedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    const related = await Post.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { categories: { $in: post.categories } },
        { tags: { $in: post.tags } },
      ],
    })
      .limit(5)
      .select('title slug excerpt featuredImage publishedAt readingTime')
      .lean();

    sendSuccess(res, related);
  } catch (err) {
    next(err);
  }
}

// Called internally by scheduler service
export async function publishScheduledPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers['x-scheduler-token'];
    if (token !== process.env.SCHEDULER_TOKEN) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const now = new Date();
    const result = await Post.updateMany(
      { status: 'scheduled', scheduledAt: { $lte: now } },
      { $set: { status: 'published', publishedAt: now } }
    );

    sendSuccess(res, { published: result.modifiedCount }, 'Scheduled posts published');
  } catch (err) {
    next(err);
  }
}
