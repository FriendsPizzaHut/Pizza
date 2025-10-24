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
 * More lenient for GET requests (viewing history)
 */
export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: (req) => {
        // Allow more requests for GET (viewing) vs POST (creating)
        if (req.method === 'GET') {
            return 100; // 100 GET requests per hour for viewing history
        }
        return 10; // 10 POST requests per hour for creating payments
    },
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
            method: req.method,
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
 * Custom middleware to sanitize MongoDB operators from user input
 * 
 * NOTE: Not using express-mongo-sanitize due to Node.js v18+ compatibility issues
 * This custom implementation sanitizes $ and . characters from keys in-place
 */
export const noSQLInjectionProtection = (req, res, next) => {
    // Sanitize function to remove $ and . from object keys (in-place modification)
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            const keysToDelete = [];

            Object.keys(obj).forEach(key => {
                // Mark keys that start with $ or contain . for deletion
                if (key.startsWith('$') || key.includes('.')) {
                    keysToDelete.push(key);
                    logSecurity('NoSQL Injection Attempt Blocked', {
                        ip: req.ip,
                        key,
                        path: req.path,
                        method: req.method,
                    });
                }
                // Recursively sanitize nested objects
                else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            });

            // Delete dangerous keys
            keysToDelete.forEach(key => delete obj[key]);
        }
        return obj;
    };

    // Sanitize request body (safe to modify)
    if (req.body && typeof req.body === 'object') {
        sanitize(req.body);
    }

    // For query and params, we can't reassign but we CAN delete properties
    if (req.query && typeof req.query === 'object') {
        sanitize(req.query);
    }

    if (req.params && typeof req.params === 'object') {
        sanitize(req.params);
    }

    next();
};

/**
 * XSS Protection Middleware
 * Custom implementation to sanitize XSS attacks from user input
 * 
 * NOTE: Not using xss-clean due to Node.js v18+ compatibility issues
 * This custom implementation escapes HTML special characters
 * 
 * URL fields are whitelisted to prevent breaking image/document URLs
 */
export const xssProtection = (req, res, next) => {
    // Whitelist of fields that should not be HTML-escaped (URLs, file paths, etc.)
    const urlFieldWhitelist = [
        'imageUrl',
        'url',
        'avatar',
        'profilePicture',
        'documentUrl',
        'fileUrl',
        'photoUrl',
    ];

    // Function to escape HTML special characters
    const escapeHtml = (text) => {
        if (typeof text !== 'string') return text;

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
        };

        return text.replace(/[&<>"'/]/g, (char) => map[char]);
    };

    // Recursively sanitize object
    const sanitizeObject = (obj, parentKey = '') => {
        if (!obj || typeof obj !== 'object') {
            return typeof obj === 'string' ? escapeHtml(obj) : obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item, parentKey));
        }

        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Skip HTML escaping for whitelisted URL fields
                if (urlFieldWhitelist.includes(key) && typeof obj[key] === 'string') {
                    sanitized[key] = obj[key]; // Keep URL as-is
                } else {
                    sanitized[key] = sanitizeObject(obj[key], key);
                }
            }
        }
        return sanitized;
    };

    // Sanitize request body (safe - we can reassign body)
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query params (in-place modification)
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            const sanitizedValue = sanitizeObject(req.query[key]);
            if (typeof sanitizedValue === 'string') {
                req.query[key] = sanitizedValue;
            }
        });
    }

    // Sanitize URL params (in-place modification)
    if (req.params && typeof req.params === 'object') {
        Object.keys(req.params).forEach(key => {
            const sanitizedValue = sanitizeObject(req.params[key]);
            if (typeof sanitizedValue === 'string') {
                req.params[key] = sanitizedValue;
            }
        });
    }

    next();
};

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
