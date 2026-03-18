import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Request logging
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));

// Cookie parsing
app.use(cookieParser());

// Body parsing
app.use(express.json());

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Zu viele Anfragen, bitte später erneut versuchen' },
});
app.use(generalLimiter);

// CSRF protection (skip in test environment)
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'csrf-default-secret',
  getSessionIdentifier: (req) => req.cookies?.refresh_token || req.ip || 'anonymous',
  cookieName: IS_PROD ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// /api/auth/refresh and /api/auth/logout are already protected by the
// sameSite:strict HttpOnly refresh_token cookie, so CSRF is not needed there.
// All other mutating endpoints require the CSRF token.
const CSRF_EXEMPT = ['/api/auth/refresh', '/api/auth/logout'];

if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    if (CSRF_EXEMPT.includes(req.path)) return next();
    doubleCsrfProtection(req, res, next);
  });
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
