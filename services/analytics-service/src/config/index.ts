import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contentnest_analytics',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
};
