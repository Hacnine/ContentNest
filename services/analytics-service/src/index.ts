import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Router } from 'express';
import { config } from './config';
import { trackPageView, getSummary, getPostAnalytics } from './controllers/analytics.controller';

const router = Router();
router.post('/track', trackPageView);
router.get('/summary', getSummary);
router.get('/posts/:id', getPostAnalytics);

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'analytics-service', timestamp: new Date().toISOString() });
});

app.use('/api/analytics', router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Analytics Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('[Analytics Service] MongoDB connected');
    app.listen(config.port, () => {
      console.log(`[Analytics Service] Running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[Analytics Service] MongoDB error:', err);
    process.exit(1);
  });

export default app;
