import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: err.message || "Bilinmeyen Hata",
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.session?.userId
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Sunucu Hatası";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};