import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import mediaRoutes from './routes/media.routes';
import { AppError } from '@contentnest/shared';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'media-service', timestamp: new Date().toISOString() });
});

app.use('/api/media', mediaRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[Media Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('[Media Service] MongoDB connected');
    app.listen(config.port, () => {
      console.log(`[Media Service] Running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[Media Service] MongoDB error:', err);
    process.exit(1);
  });

export default app;
