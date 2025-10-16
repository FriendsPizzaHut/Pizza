/**
 * Express Application Configuration (Enhanced with Prompt 10 - Never-Crashing Strategy)
 * 
 * This file initializes and configures the Express application.
 * It sets up all middleware, security, logging, and routes.
 * Keeps the server.js clean by separating app configuration.
 * 
 * Features:
 * - Comprehensive security middleware (helmet, rate limiting, XSS, NoSQL injection)
 * - Request logging with Winston
 * - Health check endpoints
 * - Error handling that never crashes
 * - Production-ready configuration
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { requestLogger } from './utils/logger.js';
import {
    helmetSecurity,
    apiLimiter,
    authLimiter,
    paymentLimiter,
    hppProtection,
    noSQLInjectionProtection,
    xssProtection,
    customSecurityHeaders,
    corsConfig,
    trustProxy,
} from './middlewares/security.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

/**
 * TRUST PROXY
 * Enable if behind a reverse proxy (Nginx, AWS ALB, etc.)
 * Required for rate limiting to work correctly
 */
if (trustProxy) {
    app.set('trust proxy', 1);
}

/**
 * SECURITY MIDDLEWARE (Prompt 10)
 * Layer 1: Basic security headers
 */
app.use(helmetSecurity);
app.use(customSecurityHeaders);

/**
 * CORS MIDDLEWARE (Enhanced)
 * Allows cross-origin requests with strict configuration
 */
app.use(cors(corsConfig));

/**
 * COMPRESSION MIDDLEWARE
 * Compress response bodies for better performance
 */
app.use(compression());

/**
 * BODY PARSING MIDDLEWARE
 * Parse JSON and URL-encoded data with size limits
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * SECURITY MIDDLEWARE (Prompt 10)
 * Layer 2: Input sanitization and protection
 */
app.use(noSQLInjectionProtection); // Prevent MongoDB injection
app.use(xssProtection); // Prevent XSS attacks
app.use(hppProtection); // Prevent HTTP parameter pollution

/**
 * REQUEST LOGGING MIDDLEWARE (Prompt 10)
 * Log all HTTP requests with Winston
 */
app.use(requestLogger);

/**
 * HEALTH CHECK ROUTES (Prompt 10)
 * Comprehensive health monitoring endpoints
 * These routes bypass rate limiting for monitoring tools
 */
import healthRoutes from './routes/healthRoutes.js';
app.use('/health', healthRoutes);

/**
 * API ROUTES
 * All API routes are mounted here with /api/v1 prefix (API versioning)
 * Organized by domain: auth, users, business, products, orders, payments, coupons, notifications, activity
 */

/**
 * RATE LIMITING MIDDLEWARE (Prompt 10)
 * Applied to API routes only (not health checks)
 */
app.use('/api', apiLimiter);

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cart.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import deviceTokenRoutes from './routes/deviceTokenRoutes.js';

// Mount routes with /api/v1 prefix
// Auth routes have stricter rate limiting
app.use('/api/v1/auth', authLimiter, authRoutes);

// Payment routes have payment-specific rate limiting
app.use('/api/v1/payments', paymentLimiter, paymentRoutes);

// Other routes use standard API rate limiting
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/business', businessRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/device-tokens', deviceTokenRoutes);

/**
 * ROOT ENDPOINT
 */
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Pizza Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/health',
            healthDetailed: '/health/detailed',
            api: '/api/v1',
            documentation: '/api/docs',
        },
        features: [
            'Real-time Socket.IO communication',
            'Comprehensive security middleware',
            'Rate limiting',
            'Request logging',
            'Never-crashing error handling',
        ],
    });
});

/**
 * 404 HANDLER (Prompt 10 Enhanced)
 * Handles requests to undefined routes
 * Must be placed after all valid routes
 */
app.use(notFound);

/**
 * ERROR HANDLER (Prompt 10 Enhanced)
 * Centralized error handling middleware
 * MUST be the last middleware
 * Catches all errors and prevents crashes
 */
app.use(errorHandler);

export default app;
