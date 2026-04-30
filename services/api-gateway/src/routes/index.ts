import { Router } from 'express';
import proxy from 'express-http-proxy';
import { config } from '../config';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── Auth Service ─────────────────────────────────────────────────────────────
router.use('/auth', proxy(config.services.auth, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`,
}));

// ─── Content Service (public read) ───────────────────────────────────────────
router.get('/posts', proxy(config.services.content, {
  proxyReqPathResolver: (req) => `/api/posts${req.url}`,
}));
router.get('/posts/:slug', proxy(config.services.content, {
  proxyReqPathResolver: (req) => `/api/posts${req.url}`,
}));
router.get('/categories', proxy(config.services.content, {
  proxyReqPathResolver: (req) => `/api/categories${req.url}`,
}));
router.get('/tags', proxy(config.services.content, {
  proxyReqPathResolver: (req) => `/api/tags${req.url}`,
}));

// ─── Content Service (protected write) ───────────────────────────────────────
router.use('/posts', authenticate, proxy(config.services.content, {
  proxyReqPathResolver: (req) => `/api/posts${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    if (srcReq.user) {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
      proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
    }
    return proxyReqOpts;
  },
}));

router.use('/categories', authenticate, proxy(config.services.content, {
  proxyReqPathResolver: (req) => `/api/categories${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    if (srcReq.user) {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
    }
    return proxyReqOpts;
  },
}));

// ─── Media Service ────────────────────────────────────────────────────────────
router.get('/media', proxy(config.services.media, {
  proxyReqPathResolver: (req) => `/api/media${req.url}`,
}));
router.use('/media', authenticate, proxy(config.services.media, {
  proxyReqPathResolver: (req) => `/api/media${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    if (srcReq.user) {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
    }
    return proxyReqOpts;
  },
}));

// ─── Search Service ───────────────────────────────────────────────────────────
router.use('/search', proxy(config.services.search, {
  proxyReqPathResolver: (req) => `/api/search${req.url}`,
}));

// ─── Analytics Service ────────────────────────────────────────────────────────
router.post('/analytics/track', proxy(config.services.analytics, {
  proxyReqPathResolver: (req) => `/api/analytics/track`,
}));
router.use('/analytics', authenticate, proxy(config.services.analytics, {
  proxyReqPathResolver: (req) => `/api/analytics${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    if (srcReq.user) {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
    }
    return proxyReqOpts;
  },
}));

export default router;
