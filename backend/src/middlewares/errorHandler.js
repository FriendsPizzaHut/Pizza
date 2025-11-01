/**
 * Error Handler Middleware (Prompt 10 - Never-Crashing Strategy)
 * 
 * Centralized error handling middleware for the application.
 * Catches all errors thrown in the application and returns consistent error responses.
 * Handles different types of errors (validation, authentication, database, etc.)
 * 
 * Features:
 * - Structured JSON error responses
 * - Environment-specific error details
 * - Operational vs Programming error distinction
 * - Comprehensive error type handling
 * - Never crashes the server
 */

/**
 * Error codes catalog for consistent error identification
 */
export const ERROR_CODES = {
    // Validation Errors (400)
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

    // Authentication Errors (401)
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',

    // Authorization Errors (403)
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    ACCESS_DENIED: 'ACCESS_DENIED',

    // Resource Errors (404)
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',

    // Conflict Errors (409)
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

    // Rate Limiting (429)
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

    // Server Errors (500)
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};

/**
 * Custom API Error class
 * Use this to throw operational errors with specific status codes
 */
export class ApiError extends Error {
    constructor(statusCode, message, code = ERROR_CODES.INTERNAL_SERVER_ERROR, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Enhanced error handler middleware (Prompt 10)
 * Handles all errors and sends appropriate response to client
 * This catches all thrown errors and provides structured responses
 * NEVER crashes the server - always returns a response
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
    let isOperational = err.isOperational !== undefined ? err.isOperational : true;

    // Handle specific error types with detailed responses

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        code = ERROR_CODES.INVALID_INPUT;
        message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
        isOperational = true;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = ERROR_CODES.VALIDATION_ERROR;
        const errors = Object.values(err.errors).map((error) => error.message);
        message = `Validation failed: ${errors.join(', ')}`;
        isOperational = true;

        // Add detailed debugging for validation errors
        console.error('❌ [VALIDATION ERROR DEBUG] Full validation error:', {
            name: err.name,
            message: err.message,
            errors: err.errors,
            errorDetails: Object.entries(err.errors || {}).map(([field, error]) => ({
                field,
                message: error.message,
                value: error.value,
                kind: error.kind,
                path: error.path,
            })),
        });
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 409;
        code = ERROR_CODES.DUPLICATE_RESOURCE;
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        message = `Duplicate field value: ${field} = "${value}". Please use another value.`;
        isOperational = true;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = ERROR_CODES.INVALID_TOKEN;
        message = 'Invalid authentication token. Please login again.';
        isOperational = true;
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = ERROR_CODES.TOKEN_EXPIRED;
        message = 'Your session has expired. Please login again.';
        isOperational = true;
    }

    // Joi Validation Error
    if (err.name === 'ValidationError' && err.isJoi) {
        statusCode = 400;
        code = ERROR_CODES.VALIDATION_ERROR;
        message = err.details?.map(detail => detail.message).join(', ') || err.message;
        isOperational = true;
    }

    // MongoDB Connection Error
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        statusCode = 503;
        code = ERROR_CODES.DATABASE_ERROR;
        message = 'Database temporarily unavailable. Please try again later.';
        isOperational = true;
    }

    // Redis Connection Error
    if (err.message && err.message.includes('Redis')) {
        // Don't crash on Redis errors - just log and continue
        console.error('⚠️ Redis Error (non-critical):', err.message);
        // If this is the only error, we might not need to send error response
        // But if it's part of a larger operation, let it through
    }

    // Rate Limit Error
    if (err.statusCode === 429) {
        code = ERROR_CODES.TOO_MANY_REQUESTS;
        message = 'Too many requests. Please try again later.';
        isOperational = true;
    }

    // Determine status based on operational vs programming error
    const status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    // Log error with full context
    const errorLog = {
        timestamp: new Date().toISOString(),
        status,
        statusCode,
        code,
        message,
        isOperational,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
    };

    // Log based on severity
    if (!isOperational || statusCode >= 500) {
        console.error('❌ CRITICAL ERROR:', {
            ...errorLog,
            stack: err.stack,
            body: req.body,
            query: req.query,
            params: req.params,
        });
    } else {
        console.warn('⚠️ Operational Error:', errorLog);
    }

    // Build structured JSON response
    const response = {
        success: false,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
    };

    // Add validation errors if present
    if (err.name === 'ValidationError' && err.errors) {
        response.errors = Object.entries(err.errors).map(([field, error]) => ({
            field,
            message: error.message,
            value: error.value,
        }));
    }

    // Add extra details in development mode
    if (process.env.NODE_ENV === 'development') {
        response.error = {
            name: err.name,
            code,
            isOperational,
            ...(err.stack && { stack: err.stack.split('\n').slice(0, 5) }), // First 5 lines only
            ...(err.details && { details: err.details }),
        };

        // Include request context
        response.request = {
            method: req.method,
            body: req.body,
            query: req.query,
            params: req.params,
        };
    }

    // Ensure headers haven't been sent
    if (res.headersSent) {
        console.error('❌ Headers already sent, cannot send error response');
        return next(err);
    }

    // Log what we're sending to client
    console.log('📤 [ERROR RESPONSE DEBUG] Sending error response to client:', {
        statusCode,
        response: JSON.stringify(response, null, 2),
    });

    // Send response - ALWAYS respond, never crash
    res.status(statusCode).json(response);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 * Catches all undefined routes and returns structured 404 response
 */
export const notFound = (req, res, next) => {
    const error = new ApiError(
        404,
        `Route ${req.method} ${req.originalUrl} not found`,
        ERROR_CODES.ROUTE_NOT_FOUND,
        true
    );
    next(error);
};

export default { errorHandler, asyncHandler, ApiError, notFound };
