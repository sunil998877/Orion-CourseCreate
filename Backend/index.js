import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import ebookRoutes from './routes/ebookRoutes.js';
import { verifySmtpConnection } from './utils/emailService.js';

// credit
import walletRoutes from './routes/walletRoutes.js';


// Create __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

// ======================
// Middleware
// ======================

// CORS must be early to handle preflight before body parsers/session
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://orion.evokeaisolutions.com/',
  'https://orion.evokeaisolutions.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin matches any allowed pattern
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

// Legacy comment kept for reference: CORS runs before helmet/body parsers.

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
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

// ======================
// Static Files
// ======================

// React build files
app.use(express.static(path.join(__dirname, 'public')));

// Course files
app.use('/courses', express.static(path.join(process.cwd(), 'courses')));

// ======================
// API Routes
// ======================

app.use('/api', authRoutes);
app.use('/api', notificationRoutes);
app.use('/api', aiRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', ebookRoutes);

// credit wallet

app.use("/api/wallet", walletRoutes);


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
  });
});

// ======================
// MongoDB Connection
// ======================

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}
console.log('Connecting to MongoDB...');



mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    try {
      const dbName =
        mongoose.connection?.name ||
        mongoose.connection?.db?.databaseName ||
        'unknown';

      console.log(`MongoDB Database: ${dbName}`);

      const User = (await import('./models/userModel.js')).default;
      const userCount = await User.countDocuments();

      console.log(`Users in database: ${userCount}`);
    } catch (err) {
      console.log('Database debug info unavailable:', err.message);
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// ======================
// Export for Vercel serverless
// ======================

export default app;

// ======================
// Start Server (local only)
// ======================

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    try {
      await verifySmtpConnection();
    } catch (err) {
      console.error('SMTP verification failed:', err);
    }

    // Schedule background credit maintenance jobs (Cleanup stale reservations & Renew due plans)
    try {
      const { cleanupStaleReservations } = await import('./services/creditService/cleanupService.js');
      const { renewAllDueSubscriptions } = await import('./services/creditService/planService.js');

      const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes
      const TIMEOUT_MINUTES = parseInt(process.env.RESERVATION_TIMEOUT_MINUTES) || 15;

      // Run initial check
      cleanupStaleReservations({ maxAgeMinutes: TIMEOUT_MINUTES }).catch(e => console.error('[Cleanup Job Error]:', e.message));

      // Periodic worker interval
      setInterval(() => {
        cleanupStaleReservations({ maxAgeMinutes: TIMEOUT_MINUTES }).catch(e => console.error('[Cleanup Job Error]:', e.message));
        renewAllDueSubscriptions().catch(e => console.error('[Plan Renewal Job Error]:', e.message));
      }, CLEANUP_INTERVAL_MS);

      console.log(`⏱️ Credit maintenance worker scheduled (Stale reservation cleanup every 5m, timeout: ${TIMEOUT_MINUTES}m)`);
    } catch (workerErr) {
      console.error('Failed to initialize credit background worker:', workerErr);
    }
  });
}