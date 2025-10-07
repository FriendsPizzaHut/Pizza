/**
 * Security Middleware Collection (Prompt 10 - Never-Crashing Strategy)
 * 
 * Comprehensive security middleware including:
 * - Helmet for security headers
 * - Rate limiting for API protection
 * - HPP for parameter pollution prevention
 * - NoSQL injection prevention
 * - XSS protection
 * - CORS configuration
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { logSecurity } from '../utils/logger.js';

/**
 * Helmet Security Headers
 * Protects against common web vulnerabilities
 */
export const helmetSecurity = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for mobile apps
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow CORS
});

/**
 * General API Rate Limiter
 * Prevents abuse and DDoS attacks
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'fail',
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        logSecurity('Rate Limit Exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        res.status(429).json({
            status: 'fail',
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests from this IP. Please try again after 15 minutes.',
            timestamp: new Date().toISOString(),
        });
    },
});

/**
 * Strict Rate Limiter for Authentication Routes
 * More restrictive limits for sensitive endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        status: 'fail',
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
    handler: (req, res) => {
        logSecurity('Auth Rate Limit Exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        res.status(429).json({
            status: 'fail',
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many authentication attempts. Please try again after 15 minutes.',
            timestamp: new Date().toISOString(),
        });
    },
});

/**
 * Payment Route Rate Limiter
 * Protects payment endpoints from abuse
 */
export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 payment requests per hour
    message: {
        status: 'fail',
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many payment requests. Please try again after 1 hour.',
    },
    handler: (req, res) => {
        logSecurity('Payment Rate Limit Exceeded', {
            ip: req.ip,
            userId: req.user?.id,
            path: req.path,
        });
        res.status(429).json({
            status: 'fail',
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many payment requests. Please try again after 1 hour.',
            timestamp: new Date().toISOString(),
        });
    },
});

/**
 * HPP (HTTP Parameter Pollution) Protection
 * Prevents parameter pollution attacks
 */
export const hppProtection = hpp({
    whitelist: [
        'price',
        'rating',
        'quantity',
        'sort',
        'page',
        'limit',
        'fields',
        'category',
        'status',
    ], // Allow duplicate parameters for these fields
});

/**
 * NoSQL Injection Protection
 * Sanitizes user input to prevent MongoDB injection
 */
export const noSQLInjectionProtection = mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
        logSecurity('NoSQL Injection Attempt Blocked', {
            ip: req.ip,
            key,
            path: req.path,
            method: req.method,
        });
    },
});

/**
 * XSS Protection Middleware
 * Note: xss-clean is deprecated but still functional
 * Consider migrating to DOMPurify for production
 */
import xss from 'xss-clean';
export const xssProtection = xss();

/**
 * Security Headers Middleware
 * Additional custom security headers
 */
export const customSecurityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');

    next();
};

/**
 * CORS Configuration
 * Allow specific origins in production
 */
export const corsConfig = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:8081',
            'http://localhost:19000',
            'http://localhost:19006',
        ];

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            logSecurity('CORS Origin Blocked', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200,
};

/**
 * Request Size Limiter
 * Prevents large payload attacks
 */
export const bodySizeLimit = '10mb'; // Maximum request body size

/**
 * Trusted Proxy Configuration
 * Enable if behind a reverse proxy (Nginx, AWS ALB, etc.)
 */
export const trustProxy = process.env.TRUST_PROXY === 'true';

/**
 * Security Middleware Stack
 * Apply all security middleware in the correct order
 */
export const securityStack = [
    helmetSecurity,
    customSecurityHeaders,
    hppProtection,
    noSQLInjectionProtection,
    xssProtection,
];

export default {
    helmetSecurity,
    apiLimiter,
    authLimiter,
    paymentLimiter,
    hppProtection,
    noSQLInjectionProtection,
    xssProtection,
    customSecurityHeaders,
    corsConfig,
    securityStack,
};
