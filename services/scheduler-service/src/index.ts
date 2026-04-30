import express from 'express';
import helmet from 'helmet';
import { config } from './config';
import { startPublishJob } from './jobs/publish.job';

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'scheduler-service', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`[Scheduler Service] Running on port ${config.port}`);
  startPublishJob();
});

export default app;
