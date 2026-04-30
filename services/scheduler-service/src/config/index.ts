import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3006', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  contentServiceUrl: process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
  schedulerToken: process.env.SCHEDULER_TOKEN || 'dev_scheduler_token',
};
