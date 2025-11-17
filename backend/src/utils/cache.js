/**
 * Cache Utility Functions
 * 
 * Provides helper functions for Redis caching operations:
 * - setCache: Store data in cache with TTL
 * - getCache: Retrieve data from cache
 * - deleteCache: Remove specific cache key
 * - deleteCachePattern: Remove multiple keys matching pattern
 * - clearAllCache: Clear entire cache (use with caution)
 * 
 * All functions handle Redis errors gracefully - app never crashes if Redis fails
 */

import redis from '../config/redis.js';

/**
 * Redis key naming conventions:
 * - products:all - All products list
 * - products:{id} - Single product by ID
 * - business:info - Business information
 * - coupons:active - Active coupons list
 * - coupons:all - All coupons
 * - dashboard:stats:today - Today's dashboard stats
 * - dashboard:stats:week - Weekly stats
 * - orders:{id} - Single order by ID
 * - user:{id}:orders - User's orders
 */

/**
 * Set cache with key, value, and optional TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (0 = no expiry, manual invalidation)
 * @returns {Promise<boolean>} - Success status
 */
export const setCache = async (key, value, ttl = 3600) => {
    try {
        const stringValue = JSON.stringify(value);

        if (ttl === 0) {
            // No expiry - manual invalidation only
            await redis.set(key, stringValue);
        } else {
            // Set with expiry time
            await redis.set(key, stringValue, 'EX', ttl);
        }

        return true;
    } catch (error) {
        console.error(`❌ Cache SET error for key "${key}":`, error.message);
        // Don't throw - gracefully fail, app continues without cache
        return false;
    }
};

/**
 * Get cached value by key
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached value or null if not found
 */
export const getCache = async (key) => {
    try {
        const data = await redis.get(key);

        if (!data) {
            return null;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Cache GET error for key "${key}":`, error.message);
        // Return null on error - app will fetch from DB
        return null;
    }
};

/**
 * Delete specific cache key
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCache = async (key) => {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error(`❌ Cache DELETE error for key "${key}":`, error.message);
        return false;
    }
};

/**
 * Delete multiple cache keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'products:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);

        if (keys.length === 0) {
            return 0;
        }

        await redis.del(...keys);
        return keys.length;
    } catch (error) {
        console.error(`❌ Cache DELETE PATTERN error for pattern "${pattern}":`, error.message);
        return 0;
    }
};

/**
 * Clear all cache keys (use with caution!)
 * @returns {Promise<boolean>} - Success status
 */
export const clearAllCache = async () => {
    try {
        await redis.flushdb();
        return true;
    } catch (error) {
        console.error('❌ Cache CLEAR ALL error:', error.message);
        return false;
    }
};

/**
 * Get cache TTL (remaining time to live)
 * @param {string} key - Cache key
 * @returns {Promise<number>} - TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
 */
export const getCacheTTL = async (key) => {
    try {
        return await redis.ttl(key);
    } catch (error) {
        console.error(`❌ Cache TTL error for key "${key}":`, error.message);
        return -2;
    }
};

/**
 * Check if cache key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - True if exists
 */
export const cacheExists = async (key) => {
    try {
        const result = await redis.exists(key);
        return result === 1;
    } catch (error) {
        console.error(`❌ Cache EXISTS error for key "${key}":`, error.message);
        return false;
    }
};

/**
 * Set multiple cache keys at once
 * @param {Object} keyValuePairs - Object with key-value pairs
 * @param {number} ttl - TTL for all keys
 * @returns {Promise<boolean>} - Success status
 */
export const setCacheMultiple = async (keyValuePairs, ttl = 3600) => {
    try {
        const pipeline = redis.pipeline();

        Object.entries(keyValuePairs).forEach(([key, value]) => {
            const stringValue = JSON.stringify(value);
            if (ttl === 0) {
                pipeline.set(key, stringValue);
            } else {
                pipeline.set(key, stringValue, 'EX', ttl);
            }
        });

        await pipeline.exec();
        return true;
    } catch (error) {
        console.error('❌ Cache SET MULTIPLE error:', error.message);
        return false;
    }
};

/**
 * Increment cache value (useful for counters)
 * @param {string} key - Cache key
 * @param {number} amount - Amount to increment (default: 1)
 * @returns {Promise<number|null>} - New value or null on error
 */
export const incrementCache = async (key, amount = 1) => {
    try {
        return await redis.incrby(key, amount);
    } catch (error) {
        console.error(`❌ Cache INCREMENT error for key "${key}":`, error.message);
        return null;
    }
};

// Cache key constants for consistency
export const CACHE_KEYS = {
    // Products
    PRODUCTS_ALL: 'products:all',
    PRODUCT_BY_ID: (id) => `products:${id}`,
    PRODUCTS_BY_CATEGORY: (category) => `products:category:${category}`,

    // Business
    BUSINESS_INFO: 'business:info',

    // Coupons
    COUPONS_ACTIVE: 'coupons:active',
    COUPONS_ALL: 'coupons:all',
    COUPON_BY_ID: (id) => `coupons:${id}`,

    // Orders
    ORDER_BY_ID: (id) => `orders:${id}`,
    USER_ORDERS: (userId) => `user:${userId}:orders`,

    // Dashboard
    DASHBOARD_TODAY: 'dashboard:stats:today',
    DASHBOARD_WEEK: 'dashboard:stats:week',
    DASHBOARD_MONTH: 'dashboard:stats:month',

    // Users
    USER_BY_ID: (id) => `user:${id}`,
    USERS_ALL: 'users:all',
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    NO_EXPIRY: 0,           // Manual invalidation only
    ONE_MINUTE: 60,
    FIVE_MINUTES: 300,
    TEN_MINUTES: 600,
    THIRTY_MINUTES: 1800,
    ONE_HOUR: 3600,
    ONE_DAY: 86400,
};

export default {
    setCache,
    getCache,
    deleteCache,
    deleteCachePattern,
    clearAllCache,
    getCacheTTL,
    cacheExists,
    setCacheMultiple,
    incrementCache,
    CACHE_KEYS,
    CACHE_TTL,
};
