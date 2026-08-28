import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
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
if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
}
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://orion.evokeaisolutions.com/',
    'https://orion.evokeaisolutions.com',
];
if (process.env.VERCEL) {
    connectDB();
}
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        const isAllowed = allowedOrigins.includes(origin) ||
            /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
            /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.vercel.dev') ||
            origin.endsWith('.onrender.com');
        if (isAllowed) {
            return callback(null, true);
        }
        else {
            console.warn(`[CORS Blocked] Origin: ${origin}`);
            return callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));
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
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 20 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts. Please try again later.' },
});
app.use(['/api/login', '/api/register', '/api/verify-registration-otp', '/api/resend-registration-otp', '/api/forgot-password', '/api/reset-password'], authLimiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
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
    const dbOk = mongoose.connection.readyState === 1;
    res.status(dbOk ? 200 : 503).json({
        status: dbOk ? 'ok' : 'degraded',
        message: dbOk ? 'Server is running' : 'Database is not connected',
        db: dbOk ? 'connected' : 'disconnected',
    });
});
app.use((err, req, res, next) => {
    if (res.headersSent)
        return next(err);
    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File is too large. Maximum size is 2MB.' });
    }
    console.error('Unhandled request error:', err);
    res.status(err.status || 500).json({
        message: isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
    });
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
export default app;
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    const startServer = async () => {
        await connectDB();
        app.listen(PORT, async () => {
            console.log(`🚀 Server running on port ${PORT}`);
            try {
                await verifySmtpConnection();
            }
            catch (err) {
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
            }
            catch (workerErr) {
                console.error('Failed to initialize credit background worker:', workerErr);
            }
        });
    };
    startServer().catch((err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}
