import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as controller from '../controllers/auth.controller';

const router = Router();

function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
}

// ─── Local Auth ───────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  controller.login
);

router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', controller.getMe);
router.patch('/me', controller.updateProfile);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/users', controller.getAllUsers);
router.patch('/users/:id/role', [
  body('role').isIn(['admin', 'editor', 'viewer']),
  validate,
], controller.updateUserRole);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failed' }),
  controller.googleCallback
);
router.get('/google/failed', (_req, res) => {
  res.status(401).json({ success: false, message: 'Google authentication failed' });
});

export default router;
