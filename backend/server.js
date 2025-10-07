/**
 * Server Entry Point (Enhanced with Prompt 10 - Never-Crashing Strategy)
 * 
 * This file starts the HTTP server and initializes:
 * - Express app
 * - MongoDB connection
 * - Redis connection
 * - Socket.IO server
 * - Process-level error handlers
 * - Graceful shutdown mechanisms
 * 
 * Features:
 * - Comprehensive error handling (uncaughtException, unhandledRejection)
 * - Graceful shutdown on SIGTERM, SIGINT, SIGHUP
 * - Logger integration
 * - Never crashes unexpectedly
 */

import http from 'http';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import redisClient, { closeRedis } from './src/config/redis.js';
import initSocket from './src/socket/index.js';
import logger, { logSystem, logError, closeLogger } from './src/utils/logger.js';

// Load environment variables first
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Initialize Socket.IO
 * Pass the HTTP server to enable WebSocket connections
 */
initSocket(server);

/**
 * Start server function (Enhanced with Prompt 10)
 */
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ MongoDB connection established');
        logSystem('MongoDB Connected', {
            host: process.env.MONGO_URI ? 'configured' : 'default',
        });

        // Wait for Redis to be ready
        await new Promise((resolve) => {
            if (redisClient.status === 'ready') {
                resolve();
            } else {
                redisClient.on('ready', resolve);
            }
        });
        console.log('✅ Redis connection established');
        logSystem('Redis Connected', {
            status: redisClient.status,
        });

        // Start listening
        server.listen(PORT, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Server is running in ${NODE_ENV} mode`);
            console.log(`🌐 Server URL: http://localhost:${PORT}`);
            console.log(`⚡ Socket.IO is active`);
            console.log(`🛡️  Security middleware enabled`);
            console.log(`📊 Health checks: http://localhost:${PORT}/health`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            logSystem('Server Started', {
                port: PORT,
                environment: NODE_ENV,
                pid: process.pid,
                nodeVersion: process.version,
            });
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        logError(error, {
            context: 'Server Startup',
            fatal: true,
        });

        // Close logger before exit
        await closeLogger();
        process.exit(1);
    }
};

/**
 * Graceful shutdown handler (Enhanced with Prompt 10)
 * Properly closes all connections in the correct order
 */
const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
    logSystem('Shutdown Initiated', { signal });

    try {
        // Close server (stop accepting new connections)
        server.close(async () => {
            console.log('🔒 HTTP server closed (no new connections accepted)');

            // Wait a bit for existing requests to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('⏳ Waiting for existing requests to complete...');

            // Close Socket.IO connections
            try {
                // Get Socket.IO instance if available
                if (global.io) {
                    global.io.close();
                    console.log('✅ Socket.IO connections closed');
                }
            } catch (error) {
                console.error('❌ Error closing Socket.IO:', error.message);
            }

            // Close Redis connection
            try {
                await closeRedis();
                console.log('✅ Redis connection closed');
            } catch (error) {
                console.error('❌ Error closing Redis:', error.message);
                logError(error, { context: 'Redis shutdown' });
            }

            // Close MongoDB connection
            try {
                const mongoose = await import('mongoose');
                await mongoose.default.connection.close();
                console.log('✅ MongoDB connection closed');
            } catch (error) {
                console.error('❌ Error closing MongoDB:', error.message);
                logError(error, { context: 'MongoDB shutdown' });
            }

            // Close logger (flush remaining logs)
            try {
                await closeLogger();
                console.log('✅ Logger closed');
            } catch (error) {
                console.error('❌ Error closing logger:', error.message);
            }

            console.log('👋 Graceful shutdown completed successfully');
            logSystem('Shutdown Complete', { signal });
            process.exit(0);
        });

        // Force shutdown after 15 seconds if graceful shutdown hangs
        setTimeout(() => {
            console.error('⚠️  Graceful shutdown timeout exceeded. Forcing exit...');
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 15000);
    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error.message);
        logError(error, {
            context: 'Graceful shutdown',
            signal,
        });
        process.exit(1);
    }
};

/**
 * Handle shutdown signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle uncaught exceptions (Prompt 10 Enhanced)
 * These are synchronous errors that weren't caught
 * We log them and exit gracefully to prevent undefined state
 */
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION! Application in undefined state. Shutting down...');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    // Log to file
    logError(error, {
        type: 'uncaughtException',
        fatal: true,
    });

    // Give logger time to write, then exit
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

/**
 * Handle unhandled promise rejections (Prompt 10 Enhanced)
 * These are async errors that weren't caught with .catch()
 * We log them and shutdown gracefully
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION! Promise rejected without catch handler.');
    console.error('Reason:', reason);
    console.error('Promise:', promise);

    // Log to file
    if (reason instanceof Error) {
        logError(reason, {
            type: 'unhandledRejection',
            fatal: true,
            promise: String(promise),
        });
    } else {
        logger.error('Unhandled Rejection (non-Error)', {
            type: 'unhandledRejection',
            reason: String(reason),
            promise: String(promise),
        });
    }

    // Attempt graceful shutdown
    server.close(async () => {
        console.log('🔒 Server closed after unhandled rejection');

        // Close connections
        try {
            await closeRedis();
            const mongoose = await import('mongoose');
            await mongoose.default.connection.close();
            await closeLogger();
        } catch (error) {
            console.error('❌ Error during emergency shutdown:', error.message);
        }

        process.exit(1);
    });

    // Force exit if server doesn't close in time
    setTimeout(() => {
        console.error('⚠️  Forced exit after unhandled rejection timeout');
        process.exit(1);
    }, 5000);
});

/**
 * Handle SIGHUP (terminal closed)
 * Common in production environments
 */
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

/**
 * Handle warnings (memory leaks, deprecations, etc.)
 */
process.on('warning', (warning) => {
    console.warn('⚠️ Process Warning:', warning.name);
    console.warn('Message:', warning.message);
    console.warn('Stack:', warning.stack);

    logger.warn('Process Warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
    });
});

// Start the server
startServer();
