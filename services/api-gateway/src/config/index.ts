import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || '',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3002',
    media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3003',
    search: process.env.SEARCH_SERVICE_URL || 'http://localhost:3004',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005',
  },
};
