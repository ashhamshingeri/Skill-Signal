import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { dashboardRouter } from './routes/dashboard.js';
import { statesRouter } from './routes/states.js';
import { districtsRouter } from './routes/districts.js';
import { skillsRouter } from './routes/skills.js';
import { gapsRouter } from './routes/gaps.js';
import { forecastsRouter } from './routes/forecasts.js';
import { recommendationsRouter } from './routes/recommendations.js';
import { dataSourcesRouter } from './routes/data-sources.js';
import { aiRouter } from './routes/ai.js';
import { authRouter } from './routes/auth.js';
import { coverageRouter } from './routes/coverage.js';
import { searchRouter } from './routes/search.js';
import { notificationsRouter } from './routes/notifications.js';
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware (Helmet with CSP and strict frameguards)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:5173', 'http://localhost:3001'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Environment configured CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback
      }
    },
    credentials: true,
  })
);

// Cookies & Body parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Specialized Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillSignal Enterprise API',
    timestamp: new Date().toISOString(),
    version: '2.6.0',
    security: 'JWT + HttpOnly Cookie Active',
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/states', statesRouter);
app.use('/api/districts', districtsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/gaps', gapsRouter);
app.use('/api/forecasts', forecastsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/data-sources', dataSourcesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/coverage', coverageRouter);
app.use('/api/search', searchRouter);
app.use('/api/notifications', notificationsRouter);

// Error handling
app.use(errorHandler);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', message: 'The requested endpoint does not exist' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SkillSignal API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
