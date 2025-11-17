/**
 * Socket.IO Configuration
 * 
 * This file initializes and configures Socket.IO for real-time communication.
 * Handles events like shop status updates, order updates, delivery tracking, and payment status.
 * The socket instance is exported to be used across different modules.
 */

import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

let io = null;

/**
 * Initialize Socket.IO server
 * @param {object} server - HTTP server instance
 * @returns {object} Socket.IO instance
 */
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000, // 25 seconds
    });

    // Connection event handler
    io.on('connection', (socket) => {
        // Handle client joining specific rooms (e.g., order room, shop room)
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });

        // Handle client leaving specific rooms
        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            // Silent disconnect
        });

        // Handle connection errors
        socket.on('error', (error) => {
            console.error(`❌ Socket error: ${error.message}`);
        });
    });

    return io;
};

/**
 * Get the Socket.IO instance
 * @returns {object} Socket.IO instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
};

/**
 * Emit event to specific room
 * @param {string} room - Room ID
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
export const emitToRoom = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
export const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

// Also export as initializeSocket for backwards compatibility
export const initializeSocket = initSocket;

export default { initSocket, initializeSocket, getIO, emitToRoom, emitToAll };
