import jwt from 'jsonwebtoken';
import { IUserDocument, User } from '../models/User.model';
import { config } from '../config';
import { IUserPayload } from '@contentnest/shared';
import { AppError, ConflictError, UnauthorizedError } from '@contentnest/shared';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(user: IUserDocument): AuthTokens {
  const payload: IUserPayload = {
    id: (user._id as unknown as string).toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ id: payload.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError('Email already registered');

  const user = await User.create({ name, email, password, provider: 'local' });
  const tokens = generateTokens(user);

  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
  return { user, tokens };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email, provider: 'local' }).select('+password');
  if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError('Invalid credentials');

  const tokens = generateTokens(user);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
  return { user, tokens };
}

export async function refreshTokens(token: string) {
  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: string };
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token || !user.isActive) {
    throw new UnauthorizedError('Refresh token revoked');
  }

  const tokens = generateTokens(user);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
  return { user, tokens };
}

export async function logoutUser(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}) {
  let user = await User.findOne({ $or: [{ googleId: profile.googleId }, { email: profile.email }] });

  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      avatar: profile.avatar,
      provider: 'google',
      role: 'viewer',
    });
  } else if (!user.googleId) {
    user.googleId = profile.googleId;
    user.provider = 'google';
    if (profile.avatar) user.avatar = profile.avatar;
    await user.save();
  }

  const tokens = generateTokens(user);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
  return { user, tokens };
}
