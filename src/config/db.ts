import mongoose from "mongoose";
import logger from '../utils/logger';

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error("MONGO_URI ortam değişkeni ayarlanmadı. Lütfen .env dosyanızı kontrol edin.");
    process.exit(1);
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info(`MongoDB bağlandı: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB bağlantı hatası: ${(error as Error).message}`);
    process.exit(1); 
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('MongoDB bağlantısı başarılı');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB bağlantı hatası: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB bağlantısı kesildi');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB yeniden bağlandı');
});