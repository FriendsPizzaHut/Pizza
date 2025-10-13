// JWT token helpers for axiosInstance
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = __DEV__
    ? process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:5000'
    : process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://pizzabackend-u9ui.onrender.com';

export async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem('@auth_token');
    } catch {
        return null;
    }
}

export async function refreshToken(): Promise<string | null> {
    try {
        const refreshTokenValue = await AsyncStorage.getItem('@refresh_token');

        if (!refreshTokenValue) {
            return null;
        }

        // Call refresh token API
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refreshToken: refreshTokenValue,
        });

        if (response.data?.data?.accessToken) {
            const newToken = response.data.data.accessToken;
            await AsyncStorage.setItem('@auth_token', newToken);

            // Update expiry if provided
            if (response.data.data.expiresIn) {
                const expiryTime = Date.now() + response.data.data.expiresIn * 1000;
                await AsyncStorage.setItem('@token_expiry', expiryTime.toString());
            }

            return newToken;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}
/**
 * Cache Utility
 * 
 * Provides timestamp-based caching using AsyncStorage for offline data access.
 * Allows storing and retrieving API responses with expiration support.
 */

interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    expiresAt?: number;
}

interface CacheOptions {
    /** Time to live in milliseconds (default: 1 hour) */
    ttl?: number;
    /** Force refresh even if cache is valid */
    forceRefresh?: boolean;
}

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_KEY_PREFIX = '@cache:';

/**
 * Cache Manager Class
 */
class CacheManager {
    private static instance: CacheManager;

    private constructor() { }

    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * Generate cache key with prefix
     */
    private getCacheKey(key: string): string {
        return `${CACHE_KEY_PREFIX}${key}`;
    }

    /**
     * Set data in cache with optional TTL
     */
    async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
        try {
            const { ttl = DEFAULT_TTL } = options;
            const cacheKey = this.getCacheKey(key);

            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
            };

            await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));

            if (__DEV__) {
                console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms)`);
            }
        } catch (error) {
            console.error(`Failed to set cache for key: ${key}`, error);
            throw error;
        }
    }

    /**
     * Get data from cache
     * Returns null if cache is expired or doesn't exist
     */
    async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
        try {
            const { forceRefresh = false } = options;
            const cacheKey = this.getCacheKey(key);

            if (forceRefresh) {
                if (__DEV__) {
                    console.log(`🔄 Cache FORCE REFRESH: ${key}`);
                }
                return null;
            }

            const cached = await AsyncStorage.getItem(cacheKey);

            if (!cached) {
                if (__DEV__) {
                    console.log(`❌ Cache MISS: ${key}`);
                }
                return null;
            }

            const entry: CacheEntry<T> = JSON.parse(cached);

            // Check if cache has expired
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                if (__DEV__) {
                    console.log(`⏰ Cache EXPIRED: ${key}`);
                }
                await this.remove(key);
                return null;
            }

            if (__DEV__) {
                const age = Date.now() - entry.timestamp;
                console.log(`✅ Cache HIT: ${key} (Age: ${Math.round(age / 1000)}s)`);
            }

            return entry.data;
        } catch (error) {
            console.error(`Failed to get cache for key: ${key}`, error);
            return null;
        }
    }

    /**
     * Remove specific cache entry
     */
    async remove(key: string): Promise<void> {
        try {
            const cacheKey = this.getCacheKey(key);
            await AsyncStorage.removeItem(cacheKey);

            if (__DEV__) {
                console.log(`🗑️ Cache REMOVE: ${key}`);
            }
        } catch (error) {
            console.error(`Failed to remove cache for key: ${key}`, error);
        }
    }

    /**
     * Check if cache entry exists and is valid
     */
    async has(key: string): Promise<boolean> {
        const data = await this.get(key);
        return data !== null;
    }

    /**
     * Get cache age in milliseconds
     */
    async getAge(key: string): Promise<number | null> {
        try {
            const cacheKey = this.getCacheKey(key);
            const cached = await AsyncStorage.getItem(cacheKey);

            if (!cached) {
                return null;
            }

            const entry: CacheEntry = JSON.parse(cached);
            return Date.now() - entry.timestamp;
        } catch (error) {
            console.error(`Failed to get cache age for key: ${key}`, error);
            return null;
        }
    }

    /**
     * Clear all cache entries
     */
    async clear(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

            await AsyncStorage.multiRemove(cacheKeys);

            if (__DEV__) {
                console.log(`🧹 Cache CLEARED: ${cacheKeys.length} entries removed`);
            }
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    /**
     * Clear expired cache entries
     */
    async clearExpired(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

            let removedCount = 0;

            for (const cacheKey of cacheKeys) {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const entry: CacheEntry = JSON.parse(cached);
                    if (entry.expiresAt && Date.now() > entry.expiresAt) {
                        await AsyncStorage.removeItem(cacheKey);
                        removedCount++;
                    }
                }
            }

            if (__DEV__) {
                console.log(`🧹 Cache EXPIRED CLEARED: ${removedCount} entries removed`);
            }
        } catch (error) {
            console.error('Failed to clear expired cache:', error);
        }
    }

    /**
     * Get all cache keys
     */
    async getAllKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys
                .filter(key => key.startsWith(CACHE_KEY_PREFIX))
                .map(key => key.replace(CACHE_KEY_PREFIX, ''));
        } catch (error) {
            console.error('Failed to get cache keys:', error);
            return [];
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        totalEntries: number;
        expiredEntries: number;
        validEntries: number;
    }> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

            let expiredCount = 0;

            for (const cacheKey of cacheKeys) {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const entry: CacheEntry = JSON.parse(cached);
                    if (entry.expiresAt && Date.now() > entry.expiresAt) {
                        expiredCount++;
                    }
                }
            }

            return {
                totalEntries: cacheKeys.length,
                expiredEntries: expiredCount,
                validEntries: cacheKeys.length - expiredCount,
            };
        } catch (error) {
            console.error('Failed to get cache stats:', error);
            return { totalEntries: 0, expiredEntries: 0, validEntries: 0 };
        }
    }
}

// Export singleton instance
export const cache = CacheManager.getInstance();

// Export class for testing
export default CacheManager;

// Helper functions for common operations
export const cacheHelpers = {
    /**
     * Cache API response with key generation
     */
    cacheApiResponse: async <T>(
        endpoint: string,
        params: any,
        data: T,
        ttl?: number
    ): Promise<void> => {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        await cache.set(key, data, { ttl });
    },

    /**
     * Get cached API response
     */
    getCachedApiResponse: async <T>(
        endpoint: string,
        params: any
    ): Promise<T | null> => {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        return await cache.get<T>(key);
    },

    /**
     * Cache with stale-while-revalidate pattern
     */
    getWithRevalidate: async <T>(
        key: string,
        fetcher: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> => {
        // Try to get from cache first
        const cached = await cache.get<T>(key, options);

        if (cached !== null) {
            // Return cached data immediately
            // Then fetch fresh data in background
            fetcher()
                .then(fresh => cache.set(key, fresh, options))
                .catch(err => console.error('Background revalidation failed:', err));

            return cached;
        }

        // No cache, fetch fresh data
        const fresh = await fetcher();
        await cache.set(key, fresh, options);
        return fresh;
    },
};
