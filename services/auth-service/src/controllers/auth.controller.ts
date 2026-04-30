import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { User } from '../models/User.model';
import { sendSuccess, sendError } from '@contentnest/shared';
import { AppError } from '@contentnest/shared';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const { user, tokens } = await authService.registerUser(name, email, password);
    sendSuccess(
      res,
      {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.loginUser(email, password);
    sendSuccess(res, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }
    const { user, tokens } = await authService.refreshTokens(refreshToken);
    sendSuccess(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (userId) await authService.logoutUser(userId);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      sendError(res, 'Not authenticated', 401);
      return;
    }
    const user = await User.findById(userId).select('-refreshToken');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { ...(name && { name }), ...(avatar && { avatar }) },
      { new: true, runValidators: true }
    );
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find().select('-refreshToken -password');
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ['admin', 'editor', 'viewer'];
    if (!allowedRoles.includes(role)) {
      sendError(res, 'Invalid role', 400);
      return;
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'Role updated');
  } catch (err) {
    next(err);
  }
}

export function googleCallback(req: Request, res: Response): void {
  const user = req.user as { tokens: { accessToken: string; refreshToken: string } } | undefined;
  if (!user) {
    res.redirect(`${process.env.CLIENT_URL}/auth/login?error=oauth_failed`);
    return;
  }
  const { accessToken, refreshToken } = user.tokens;
  res.redirect(
    `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
}
