/**
 * Winston Logger Configuration (Prompt 10 - Never-Crashing Strategy)
 * 
 * Comprehensive logging system with:
 * - Daily rotating file logs
 * - Separate error logs
 * - Console output for development
 * - Structured log format
 * - Request logging middleware
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log colors for console
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add stack trace if present (for errors)
    if (stack) {
        msg += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return msg;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Daily Rotate File Transport for combined logs
const combinedFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d', // Keep logs for 14 days
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json()
    ),
});

// Daily Rotate File Transport for error logs
const errorFileTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs for 30 days
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json()
    ),
});

// Console Transport for development
const consoleTransport = new winston.transports.Console({
    format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
});

// Create Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
    levels,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    transports: [
        combinedFileTransport,
        errorFileTransport,
    ],
    // Exit on error: false prevents logger from exiting the application
    exitOnError: false,
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(consoleTransport);
}

// Stream for Morgan HTTP request logging
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with details
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'http';

        logger.log(logLevel, 'HTTP Request', {
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id || 'anonymous',
        });
    });

    next();
};

/**
 * Log an error with full context
 */
export const logError = (error, context = {}) => {
    logger.error(error.message, {
        ...context,
        name: error.name,
        stack: error.stack,
        isOperational: error.isOperational,
        code: error.code,
    });
};

/**
 * Log API endpoint calls
 */
export const logAPICall = (endpoint, method, data = {}) => {
    logger.info(`API Call: ${method} ${endpoint}`, data);
};

/**
 * Log database operations
 */
export const logDB = (operation, model, data = {}) => {
    logger.debug(`DB Operation: ${operation} on ${model}`, data);
};

/**
 * Log Socket.IO events
 */
export const logSocket = (event, data = {}) => {
    logger.debug(`Socket Event: ${event}`, data);
};

/**
 * Log security events
 */
export const logSecurity = (event, data = {}) => {
    logger.warn(`Security Event: ${event}`, data);
};

/**
 * Log system events
 */
export const logSystem = (event, data = {}) => {
    logger.info(`System Event: ${event}`, data);
};

// Handle logger errors
logger.on('error', (error) => {
    console.error('❌ Logger Error:', error);
});

// Graceful shutdown
export const closeLogger = () => {
    return new Promise((resolve) => {
        logger.end(() => {
            resolve();
        });
    });
};

export default logger;
