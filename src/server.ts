import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from "./config/db";
import { validateEnv } from "./config/validateEnv";
import adminRoutes from "./routes/adminRoutes";
import dataRoutes from "./routes/dataRoutes";
import { errorHandler } from './middleware/errorMiddleware';
import logger from './utils/logger';

declare module "express-session" {
  interface SessionData {
    loggedIn: boolean;
    userId: string;
    username: string;
  }
}

validateEnv();

const PORT = Number(process.env.PORT || 4000);

connectDB(); 

const app = express();

const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000"
];
if (process.env.CORS_ORIGIN) {
  const origins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  allowedOrigins.push(...origins);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], 
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], 
            imgSrc: ["'self'", "data:", "https:", "http:"], 
            connectSrc: ["'self'", ...allowedOrigins],
        },
    },
}));

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));

app.use(express.json({ limit: '10mb' }));

app.use(mongoSanitize());

app.use(session({
  name: 'sid_portfolio',
  secret: process.env.SESSION_SECRET as string, 
  resave: false,
  saveUninitialized: false, 
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/api/admin", adminRoutes); 
app.use("/api", dataRoutes);        

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Shutdown signal received. Closing server gracefully...');
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    try {
      const mongoose = await import('mongoose');
      await mongoose.default.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}