/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication and role-based authorization.
 * - protect: Verifies JWT token and attaches user to req.user
 * - adminOnly: Ensures user has admin role
 * - deliveryOnly: Ensures user has delivery role (for delivery agents)
 */

import { verifyToken } from '../config/jwtConfig.js';
import User from '../models/User.js';

/**
 * Protect routes - Verify JWT token
 * Extracts token from Authorization header, verifies it, and attaches user to request
 * @middleware
 */
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if authorization header exists and starts with 'Bearer '
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please authenticate.',
            });
        }

        // Extract token from header
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format.',
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Find user by ID from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token is invalid.',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is inactive.',
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.',
            });
        }

        res.status(401).json({
            success: false,
            message: 'Not authorized, authentication failed.',
        });
    }
};

/**
 * Admin Only - Restrict access to admin users
 * Must be used after protect middleware
 * @middleware
 */
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }

    next();
};

/**
 * Delivery Only - Restrict access to delivery agents
 * Must be used after protect middleware
 * @middleware
 */
export const deliveryOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
    }

    if (req.user.role !== 'delivery' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Delivery agent privileges required.',
        });
    }

    next();
};

/**
 * Optional Auth - Attach user if token exists, but don't fail if not
 * Useful for routes that work differently for authenticated vs anonymous users
 * @middleware
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.id).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (err) {
        // Don't fail - just continue without user
        next();
    }
};

export default {
    protect,
    adminOnly,
    deliveryOnly,
    optionalAuth,
};
