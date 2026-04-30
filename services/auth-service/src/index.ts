import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import { config } from './config';
import { setupPassport } from './config/passport';
import authRoutes from './routes/auth.routes';
import { AppError } from '@contentnest/shared';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(passport.initialize());
setupPassport();

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[Auth Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Database & Start ─────────────────────────────────────────────────────────
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('[Auth Service] MongoDB connected');
    app.listen(config.port, () => {
      console.log(`[Auth Service] Running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[Auth Service] MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
