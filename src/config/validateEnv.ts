import logger from '../utils/logger';

export const validateEnv = () => {
  const requiredEnvVars = [
    'MONGO_URI',
    'SESSION_SECRET',
    'SETUP_TOKEN'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Eksik environment variables: ${missingVars.join(', ')}`);
    logger.error('Lütfen .env dosyanızı kontrol edin.');
    process.exit(1);
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    logger.warn('SESSION_SECRET çok kısa! En az 32 karakter kullanın.');
  }

  logger.info('Environment variables validated successfully');
};