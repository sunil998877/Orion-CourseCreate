import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import ebookRoutes from './routes/ebookRoutes.js';
import { verifySmtpConnection } from './utils/emailService.js';
import walletRoutes from './routes/walletRoutes.js';
import razorpayRoutes from './routes/razorpayRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://orion.evokeaisolutions.com/',
  'https://orion.evokeaisolutions.com',
];

connectDB();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.includes(origin) ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.vercel.dev');

      if (isAllowed) {
        return callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}`);
        return callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  })
);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/courses', express.static(path.join(process.cwd(), 'courses')));

app.use('/api', authRoutes);
app.use('/api', notificationRoutes);
app.use('/api', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', ebookRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/admin", adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
  });
});

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    try {
      await verifySmtpConnection();
    } catch (err) {
      console.error('SMTP verification failed:', err);
    }

    try {
      const { cleanupStaleReservations } = await import('./services/creditService/cleanupService.js');
      const { renewAllDueSubscriptions } = await import('./services/creditService/planService.js');

      const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
      const TIMEOUT_MINUTES = parseInt(process.env.RESERVATION_TIMEOUT_MINUTES) || 15;

      cleanupStaleReservations({ maxAgeMinutes: TIMEOUT_MINUTES }).catch(e => console.error('[Cleanup Job Error]:', e.message));

      setInterval(() => {
        cleanupStaleReservations({ maxAgeMinutes: TIMEOUT_MINUTES }).catch(e => console.error('[Cleanup Job Error]:', e.message));
        renewAllDueSubscriptions().catch(e => console.error('[Plan Renewal Job Error]:', e.message));
      }, CLEANUP_INTERVAL_MS);

      console.log(`Credit maintenance worker scheduled (Stale reservation cleanup every 5m, timeout: ${TIMEOUT_MINUTES}m)`);
    } catch (workerErr) {
      console.error('Failed to initialize credit background worker:', workerErr);
    }
  });
}
