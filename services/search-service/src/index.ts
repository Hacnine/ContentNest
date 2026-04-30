import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Router } from 'express';
import { config } from './config';
import { search, getSuggestions } from './controllers/search.controller';

const router = Router();
router.get('/', search);
router.get('/suggestions', getSuggestions);

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'search-service', timestamp: new Date().toISOString() });
});

app.use('/api/search', router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Search Service Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('[Search Service] MongoDB connected');
    app.listen(config.port, () => {
      console.log(`[Search Service] Running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('[Search Service] MongoDB error:', err);
    process.exit(1);
  });

export default app;
