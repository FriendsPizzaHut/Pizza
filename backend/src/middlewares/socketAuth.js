/**
 * Socket.IO Authentication Middleware (Prompt 9)
 * 
 * Verifies JWT token for Socket.IO connections
 * Optional but recommended for production security
 * 
 * Usage:
 * io.use(verifySocketToken);
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Socket.IO middleware to verify JWT token
 * 
 * Client should send token in one of these ways:
 * 1. Auth header: socket.io({ auth: { token: 'Bearer xxx' } })
 * 2. Query param: socket.io('url?token=xxx')
 * 3. Handshake auth: socket.handshake.auth.token
 * 
 * @param {Object} socket - Socket instance
 * @param {Function} next - Next middleware function
 */
export const verifySocketToken = async (socket, next) => {
    try {
        // Try to get token from multiple sources
        let token = null;

        // 1. Check auth object (recommended)
        if (socket.handshake.auth && socket.handshake.auth.token) {
            token = socket.handshake.auth.token;
        }
        // 2. Check query parameters (fallback)
        else if (socket.handshake.query && socket.handshake.query.token) {
            token = socket.handshake.query.token;
        }
        // 3. Check headers (HTTP upgrade)
        else if (socket.handshake.headers && socket.handshake.headers.authorization) {
            token = socket.handshake.headers.authorization;
        }

        // Remove 'Bearer ' prefix if present
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        }

        // No token provided
        if (!token) {
            // Allow connection but mark as unauthenticated
            socket.authenticated = false;
            socket.user = null;
            return next();
            // Uncomment to require authentication:
            // return next(new Error('Authentication required'));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database
        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach user data to socket
        socket.authenticated = true;
        socket.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };

        // Auto-register user
        socket.emit('register', {
            userId: user._id.toString(),
            role: user.role
        });

        next();
    } catch (error) {
        console.error('❌ Socket authentication error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return next(new Error('Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new Error('Token expired'));
        }

        // Allow connection but mark as unauthenticated
        socket.authenticated = false;
        socket.user = null;
        next();
    }
};

/**
 * Middleware to check if socket is authenticated
 * Use this on specific event handlers that require auth
 * 
 * Usage:
 * socket.on('some-event', requireAuth(async (data) => {
 *   // Handle authenticated event
 * }));
 */
export const requireAuth = (handler) => {
    return async function (data) {
        const socket = this; // 'this' is the socket instance

        if (!socket.authenticated || !socket.user) {
            socket.emit('error', {
                message: 'Authentication required for this action',
                code: 'AUTH_REQUIRED'
            });
            return;
        }

        try {
            await handler.call(socket, data);
        } catch (error) {
            console.error('❌ Event handler error:', error.message);
            socket.emit('error', {
                message: 'An error occurred processing your request',
                code: 'SERVER_ERROR'
            });
        }
    };
};

/**
 * Middleware to check if user has specific role
 * 
 * Usage:
 * socket.on('admin-event', requireRole('admin')(async (data) => {
 *   // Handle admin-only event
 * }));
 */
export const requireRole = (requiredRole) => {
    return (handler) => {
        return async function (data) {
            const socket = this;

            if (!socket.authenticated || !socket.user) {
                socket.emit('error', {
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
                return;
            }

            if (socket.user.role !== requiredRole) {
                socket.emit('error', {
                    message: `This action requires ${requiredRole} role`,
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
                return;
            }

            try {
                await handler.call(socket, data);
            } catch (error) {
                console.error('❌ Event handler error:', error.message);
                socket.emit('error', {
                    message: 'An error occurred processing your request',
                    code: 'SERVER_ERROR'
                });
            }
        };
    };
};

export default {
    verifySocketToken,
    requireAuth,
    requireRole
};
