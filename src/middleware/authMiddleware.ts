import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.loggedIn || !req.session?.userId) {
    logger.warn(`Yetkisiz erişim denemesi - IP: ${req.ip} - Path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const sessionTimeout = 24 * 60 * 60 * 1000;
  const sessionAge = Date.now() - (req.session.cookie.expires?.getTime() || Date.now());
  
  if (sessionAge > sessionTimeout) {
    logger.warn(`Session timeout - User: ${req.session.username}`);
    req.session.destroy(() => {});
    return res.status(401).json({ error: "Session expired" });
  }

  next();
};