import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/post.controller';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', controller.getPosts);
router.get('/:slug', controller.getPostBySlug);
router.get('/:id/related', controller.getRelatedPosts);

// ─── Protected Routes (require x-user-id header from gateway) ─────────────────
router.get('/admin/:id', controller.getPostById);

router.post(
  '/',
  [
    body('title').trim().notEmpty().isLength({ max: 255 }),
    body('content').notEmpty(),
    body('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']),
    body('scheduledAt').optional().isISO8601(),
    body('categories').optional().isArray(),
    body('tags').optional().isArray(),
  ],
  controller.createPost
);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 255 }),
    body('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']),
    body('scheduledAt').optional().isISO8601(),
  ],
  controller.updatePost
);

router.delete('/:id', controller.deletePost);

// ─── Internal Route (scheduler) ───────────────────────────────────────────────
router.post('/internal/publish-scheduled', controller.publishScheduledPosts);

export default router;
