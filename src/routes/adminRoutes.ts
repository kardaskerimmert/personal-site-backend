import { Router } from 'express';
import { checkAdminExists, setupAdmin, authenticateAdmin } from "../services/dataService"; 
import { AuthSchema } from '../validation/schemas';
import rateLimit from 'express-rate-limit';
import validate from '../middleware/validateResource';
import logger from '../utils/logger';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla deneme. 15 dakika bekleyin." }
});

const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla setup denemesi. 1 saat bekleyin." }
});

router.get("/exists", async (req, res, next) => {
  try {
    const { exists } = await checkAdminExists();
    res.json({ 
      exists,
      loggedIn: req.session.loggedIn === true && !!req.session.userId 
    });
  } catch (err) {
    next(err);
  }
});

router.post("/setup", setupLimiter, validate(AuthSchema), async (req, res, next) => {
  try {
    const providedToken = req.body.setupToken;
    
    if (!process.env.SETUP_TOKEN || providedToken !== process.env.SETUP_TOKEN) {
      logger.warn(`Yetkisiz Setup denemesi! IP: ${req.ip}`);
      return res.status(403).json({ error: "Geçersiz Setup Token." });
    }

    const { username, password } = req.body; 
    const newUser = await setupAdmin(username, password);

    req.session.regenerate((err) => {
      if (err) return next(err);
      
      req.session.loggedIn = true;
      req.session.userId = newUser._id.toString();
      req.session.username = newUser.username;

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        logger.info(`Yeni admin oluşturuldu: ${username}`);
        res.status(200).json({ ok: true });
      });
    });
  } catch (err: any) {
    if (err.message === "ADMIN_EXISTS") {
      return res.status(409).json({ error: "Admin zaten var." });
    }
    next(err);
  }
});

router.post("/login", loginLimiter, validate(AuthSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body; 
    const user = await authenticateAdmin(username, password);

    if (!user) {
      logger.warn(`Hatalı giriş denemesi: ${username} - IP: ${req.ip}`);
      return res.status(401).json({ error: "Geçersiz bilgiler" });
    }

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.loggedIn = true;
      req.session.userId = user._id.toString();
      req.session.username = user.username;

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        logger.info(`Admin giriş yaptı: ${username}`);
        res.status(200).json({ ok: true });
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res, next) => {
  const user = req.session.username;
  
  req.session.destroy((err) => {
    if (err) {
      logger.error(`Logout hatası: ${err.message}`);
      return next(err);
    }
    
    res.clearCookie("sid_portfolio");
    logger.info(`Admin çıkış yaptı: ${user}`);
    res.json({ ok: true });
  });
});

export default router;