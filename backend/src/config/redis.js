/**
 * Redis Configuration
 * 
 * This file handles Redis connection using ioredis.
 * Redis is used for caching, session management, and real-time data.
 * Provides connection with error handling and reconnection logic.
 */

import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create Redis client instance
 */
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

// Redis connection event handlers
redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

redisClient.on('close', () => {
    console.warn('⚠️  Redis connection closed');
});

/**
 * Graceful shutdown for Redis
 */
export const closeRedis = async () => {
    try {
        await redisClient.quit();
    } catch (error) {
        console.error('❌ Error closing Redis connection:', error.message);
    }
};

export default redisClient;
