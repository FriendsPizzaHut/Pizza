/**
 * Authentication Middleware
 * 
 * Handles JWT token verification and user authentication.
 * Protects routes that require authentication.
 * Verifies token and attaches user data to request object.
 */

import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';

/**
 * Verify JWT token and authenticate user
 */
export const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;

        if (!token) {
            throw new ApiError(401, 'Authentication required. Please provide a valid token.');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new ApiError(401, 'Invalid token. Please login again.'));
        } else if (error.name === 'TokenExpiredError') {
            next(new ApiError(401, 'Token expired. Please login again.'));
        } else {
            next(error);
        }
    }
};

/**
 * Check if user has required role(s)
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'You do not have permission to perform this action'));
        }

        next();
    };
};

export default { authenticate, authorize };
