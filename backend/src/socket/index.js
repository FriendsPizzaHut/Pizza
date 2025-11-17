/**
 * Socket.IO Main Initialization Module (Prompt 9)
 * 
 * This module handles:
 * - User registration and tracking (connectedUsers Map)
 * - Socket authentication
 * - Connection/disconnection management
 * - Room-based communication (admin, delivery, customer)
 * - Global socket utilities for controllers
 * 
 * Events Supported:
 * - business:status:update
 * - order:new
 * - order:status:update
 * - delivery:status:update
 * - payment:received
 * - notification:new
 */

import { Server } from 'socket.io';
import { verifySocketToken } from '../middlewares/socketAuth.js';

// Store connected users: { userId: { socketId, role, socket } }
const connectedUsers = new Map();

// Store active rooms
const activeRooms = {
    admin: new Set(),
    delivery: new Set(),
    customer: new Set()
};

let io = null;

/**
 * Initialize Socket.IO server with Express HTTP server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
export default function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000, // 25 seconds
        transports: ['websocket', 'polling'],
    });

    // Socket.IO middleware for authentication (optional but recommended)
    // io.use(verifySocketToken); // Uncomment when JWT auth is needed

    io.on('connection', (socket) => {
        // ============================================
        // USER REGISTRATION
        // ============================================
        /**
         * Register user with their socket
         * Payload: { userId, role }
         */
        socket.on('register', ({ userId, role }) => {
            try {
                if (!userId) {
                    return;
                }

                // Store user connection
                connectedUsers.set(userId.toString(), {
                    socketId: socket.id,
                    role: role || 'customer',
                    socket: socket,
                    connectedAt: new Date()
                });

                // Join role-based room
                const userRole = role || 'customer';
                socket.join(`role:${userRole}`);
                activeRooms[userRole]?.add(userId.toString());

                // Join user-specific room
                socket.join(`user:${userId}`);

                // Notify user of successful registration
                socket.emit('registered', {
                    success: true,
                    userId,
                    role: userRole,
                    message: 'Successfully connected to real-time updates'
                });
            } catch (error) {
                console.error('❌ Registration error:', error.message);
                socket.emit('error', { message: 'Registration failed' });
            }
        });

        // ============================================
        // JOIN SPECIFIC ROOMS
        // ============================================
        /**
         * Join order-specific room for tracking
         * Used by customers and delivery agents
         */
        socket.on('join:order', (orderId) => {
            socket.join(`order:${orderId}`);
        });

        /**
         * Leave order room
         */
        socket.on('leave:order', (orderId) => {
            socket.leave(`order:${orderId}`);
        });

        /**
         * Join delivery tracking room
         * Used for real-time delivery location updates
         */
        socket.on('join:delivery', (deliveryId) => {
            socket.join(`delivery:${deliveryId}`);
        });

        // ============================================
        // DELIVERY AGENT LOCATION UPDATE
        // ============================================
        /**
         * Real-time location update from delivery agent
         * Payload: { orderId, latitude, longitude }
         */
        socket.on('delivery:location', ({ orderId, latitude, longitude }) => {
            try {
                // Broadcast to order room (customer + admin)
                io.to(`order:${orderId}`).emit('delivery:location:update', {
                    orderId,
                    location: { latitude, longitude },
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('❌ Location update error:', error.message);
            }
        });

        // ============================================
        // TYPING INDICATORS (for chat features)
        // ============================================
        socket.on('typing:start', (data) => {
            socket.broadcast.emit('user:typing', { userId: data.userId });
        });

        socket.on('typing:stop', (data) => {
            socket.broadcast.emit('user:stopped:typing', { userId: data.userId });
        });

        // ============================================
        // DISCONNECT HANDLER
        // ============================================
        socket.on('disconnect', (reason) => {
            try {
                // Find and remove user from connectedUsers
                let disconnectedUserId = null;
                let disconnectedRole = null;

                for (let [userId, userData] of connectedUsers.entries()) {
                    if (userData.socketId === socket.id) {
                        disconnectedUserId = userId;
                        disconnectedRole = userData.role;
                        connectedUsers.delete(userId);

                        // Remove from role room
                        activeRooms[disconnectedRole]?.delete(userId);

                        break;
                    }
                }
            } catch (error) {
                console.error('❌ Disconnect handler error:', error.message);
            }
        });

        // ============================================
        // ERROR HANDLER
        // ============================================
        socket.on('error', (error) => {
            console.error(`❌ Socket error (${socket.id}):`, error.message);
        });

        // ============================================
        // PING/PONG for connection health
        // ============================================
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
    });

    // Expose helper functions globally for use in controllers
    setupGlobalHelpers();

    return io;
}

/**
 * Setup global socket helper functions
 * These can be used from any controller/service
 */
function setupGlobalHelpers() {
    global.socketEmit = {
        // Emit to specific user by userId
        emitToUser: (userId, event, data) => {
            try {
                const user = connectedUsers.get(userId.toString());
                if (user && user.socket) {
                    user.socket.emit(event, {
                        ...data,
                        timestamp: new Date()
                    });
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`❌ Error emitting to user ${userId}:`, error.message);
                return false;
            }
        },

        // Emit to all users with specific role
        emitToRole: (role, event, data) => {
            try {
                if (io) {
                    io.to(`role:${role}`).emit(event, {
                        ...data,
                        timestamp: new Date()
                    });
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`❌ Error emitting to role ${role}:`, error.message);
                return false;
            }
        },

        // Emit to specific order room
        emitToOrder: (orderId, event, data) => {
            try {
                if (io) {
                    io.to(`order:${orderId}`).emit(event, {
                        ...data,
                        timestamp: new Date()
                    });
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`❌ Error emitting to order ${orderId}:`, error.message);
                return false;
            }
        },

        // Broadcast to all connected clients
        emitToAll: (event, data) => {
            try {
                if (io) {
                    io.emit(event, {
                        ...data,
                        timestamp: new Date()
                    });
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`❌ Error broadcasting ${event}:`, error.message);
                return false;
            }
        },

        // Get Socket.IO instance
        io: io,

        // Get connected users count
        getConnectedUsersCount: () => connectedUsers.size,

        // Get user connection status
        isUserConnected: (userId) => connectedUsers.has(userId.toString()),

        // Get all connected users
        getConnectedUsers: () => {
            return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
                userId,
                role: data.role,
                connectedAt: data.connectedAt
            }));
        }
    };
}

/**
 * Get Socket.IO instance (for direct use)
 * @returns {Object} Socket.IO instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('❌ Socket.IO not initialized! Call initSocket first.');
    }
    return io;
};

/**
 * Check if user is connected
 * @param {String} userId - User ID to check
 * @returns {Boolean}
 */
export const isUserConnected = (userId) => {
    return connectedUsers.has(userId.toString());
};

/**
 * Get connected users by role
 * @param {String} role - admin | delivery | customer
 * @returns {Array} List of user IDs
 */
export const getConnectedUsersByRole = (role) => {
    return Array.from(activeRooms[role] || []);
};

/**
 * Disconnect a user (force disconnect)
 * @param {String} userId - User ID to disconnect
 */
export const disconnectUser = (userId) => {
    const user = connectedUsers.get(userId.toString());
    if (user && user.socket) {
        user.socket.disconnect(true);
        connectedUsers.delete(userId.toString());
    }
};
