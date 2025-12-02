import { Router } from 'express';
import { getSiteData, updateSiteData } from "../services/dataService";
import { SiteDataSchema } from '../validation/schemas';
import { requireAdmin } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

const router = Router();

const updateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla güncelleme denemesi. 1 dakika bekleyin." }
});

router.get("/site-data", async (req, res, next) => {
  try {
    const siteData = await getSiteData();
    res.json({ siteData });
  } catch (err) {
    logger.error(`Site data getirme hatası: ${err}`);
    next(err);
  }
});

router.post("/site-data", requireAdmin, updateLimiter, async (req, res, next) => {
  try {
    const validation = SiteDataSchema.safeParse(req.body.siteData);
    
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      logger.warn(`Site data validation hatası: ${JSON.stringify(formattedErrors)}`);
      return res.status(400).json({ errors: formattedErrors });
    }

    await updateSiteData(validation.data);
    logger.info(`Site data güncellendi: ${req.session.username}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error(`Site data güncelleme hatası: ${err}`);
    next(err);
  }
});

export default router;