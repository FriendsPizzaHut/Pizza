/**
 * Cache Service
 * 
 * Provides caching functionality using Redis.
 * Helps improve performance by reducing database queries.
 */

import redisClient from '../config/redis.js';

/**
 * Set a value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
 */
export const setCache = async (key, value, ttl = 3600) => {
    try {
        const serializedValue = JSON.stringify(value);
        await redisClient.setex(key, ttl, serializedValue);
        console.log(`✅ Cache set: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Error setting cache for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export const getCache = async (key) => {
    try {
        const cachedValue = await redisClient.get(key);
        if (!cachedValue) {
            console.log(`⚠️  Cache miss: ${key}`);
            return null;
        }
        console.log(`✅ Cache hit: ${key}`);
        return JSON.parse(cachedValue);
    } catch (error) {
        console.error(`❌ Error getting cache for key ${key}:`, error.message);
        return null;
    }
};

/**
 * Delete a value from cache
 * @param {string} key - Cache key
 */
export const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
        console.log(`✅ Cache deleted: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Error deleting cache for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 */
export const deleteCachePattern = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
            console.log(`✅ Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ Error deleting cache pattern ${pattern}:`, error.message);
        return false;
    }
};

/**
 * Check if a key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
export const cacheExists = async (key) => {
    try {
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        console.error(`❌ Error checking cache existence for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Set cache with no expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 */
export const setCachePermanent = async (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        await redisClient.set(key, serializedValue);
        console.log(`✅ Permanent cache set: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Error setting permanent cache for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Increment a numeric value in cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} New value after increment
 */
export const incrementCache = async (key) => {
    try {
        const newValue = await redisClient.incr(key);
        return newValue;
    } catch (error) {
        console.error(`❌ Error incrementing cache for key ${key}:`, error.message);
        return null;
    }
};

/**
 * Get or set cache (fetch from DB if not cached)
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>}
 */
export const getOrSetCache = async (key, fetchFunction, ttl = 3600) => {
    try {
        // Try to get from cache
        const cachedValue = await getCache(key);
        if (cachedValue !== null) {
            return cachedValue;
        }

        // If not in cache, fetch from source
        const freshData = await fetchFunction();

        // Store in cache
        await setCache(key, freshData, ttl);

        return freshData;
    } catch (error) {
        console.error(`❌ Error in getOrSetCache for key ${key}:`, error.message);
        // If caching fails, still return fresh data
        return await fetchFunction();
    }
};

export default {
    setCache,
    getCache,
    deleteCache,
    deleteCachePattern,
    cacheExists,
    setCachePermanent,
    incrementCache,
    getOrSetCache,
};
