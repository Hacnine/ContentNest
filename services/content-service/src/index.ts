import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import postRoutes from './routes/post.routes';
import categoryRoutes from './routes/category.routes';
import { AppError } from '@contentnest/shared';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'content-service', timestamp: new Date().toISOString() });
});

app.use('/api/posts', postRoutes);
app.use('/api', categoryRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[Content Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('[Content Service] MongoDB connected');
    app.listen(config.port, () => {
      console.log(`[Content Service] Running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[Content Service] MongoDB error:', err);
    process.exit(1);
  });

export default app;
