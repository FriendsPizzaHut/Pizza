import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { requestQueue } from '../utils/requestQueue';
import { cache, cacheHelpers } from '../utils/cache';
import { errorLogger } from '../services/errorLogger';
import { offlineQueue, OperationType, HttpMethod } from '../utils/offlineQueue';
import * as toastUtils from '../utils/toast';

// Determine API URL based on environment
const getApiUrl = () => {
    const isDevelopment = __DEV__;
    return isDevelopment
        ? process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:5000'
        : process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://pizzabackend-u9ui.onrender.com';
};

// Network status cache
let isOnline = true;
let networkCheckPromise: Promise<boolean> | null = null;

/**
 * Check network connectivity
 */
const checkNetworkConnectivity = async (): Promise<boolean> => {
    if (networkCheckPromise) {
        return networkCheckPromise;
    }

    networkCheckPromise = NetInfo.fetch()
        .then(state => {
            isOnline = state.isConnected ?? false;
            return isOnline;
        })
        .catch(() => {
            isOnline = false;
            return false;
        })
        .finally(() => {
            networkCheckPromise = null;
        });

    return networkCheckPromise;
};

// Subscribe to network changes
NetInfo.addEventListener(state => {
    const wasOnline = isOnline;
    isOnline = state.isConnected ?? false;

    // Process queue when coming back online
    if (!wasOnline && isOnline) {
        if (__DEV__) {
            console.log('🌐 Network restored - processing queued requests...');
        }
        processOfflineQueue();
    }
});

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: getApiUrl(),
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Process offline queue (using new enhanced queue system)
 */
const processOfflineQueue = async (): Promise<void> => {
    try {
        // Process old requestQueue first
        await requestQueue.processQueue(async (config) => {
            const response = await apiClient.request(config);
            return response.data;
        });

        // Process new offlineQueue
        const results = await offlineQueue.processQueue();

        if (results.length > 0) {
            const successCount = results.filter(r => r.success).length;
            if (successCount > 0) {
                toastUtils.showToast(`🔄 ${successCount} offline ${successCount === 1 ? 'change' : 'changes'} synced successfully.`, 'short', 'success');
            }
        }
    } catch (error) {
        console.error('Error processing offline queue:', error);
    }
};

// Request interceptor - Add auth token and handle offline
apiClient.interceptors.request.use(
    async (config: any) => {
        try {
            // Check network connectivity
            await checkNetworkConnectivity();

            // Get token from AsyncStorage - using the correct key from authService
            const token = await AsyncStorage.getItem('@auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add platform info
            config.headers['X-Platform'] = Platform.OS;
            config.headers['X-Platform-Version'] = Platform.Version;

            // Mark if offline mode
            config.headers['X-Offline-Mode'] = !isOnline;

            // Log request in development
            if (__DEV__) {
                console.log('🚀 API Request:', {
                    url: config.url,
                    method: config.method?.toUpperCase(),
                    data: config.data,
                    offline: !isOnline,
                });
            }

            // If offline and method is not GET, queue the request
            if (!isOnline && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
                const shouldQueue = config.queueWhenOffline !== false; // Allow opt-out

                if (shouldQueue) {
                    // Use new enhanced offline queue
                    const operationType: OperationType =
                        config.method.toLowerCase() === 'post' ? 'CREATE' :
                            config.method.toLowerCase() === 'delete' ? 'DELETE' :
                                config.method.toLowerCase() === 'patch' ? 'PATCH' : 'UPDATE';

                    const actionId = await offlineQueue.enqueue(
                        operationType,
                        config.url || '',
                        config.data,
                        config.method.toUpperCase() as HttpMethod,
                        {
                            priority: config.priority || 5,
                            resourceType: config.resourceType,
                            tempId: config.tempId,
                            metadata: config.metadata,
                        }
                    );

                    // Show user-friendly notification
                    toastUtils.showToast('📥 Saved locally. Will sync when back online.', 'short', 'info');

                    if (__DEV__) {
                        console.log('📥 Request queued for when online:', config.url);
                    }

                    // Throw error to prevent request
                    const error: any = new Error('No internet connection. Request queued.');
                    error.isQueued = true;
                    error.code = 'OFFLINE_QUEUED';
                    error.queueId = actionId;
                    throw error;
                }
            }

            return config;
        } catch (error) {
            console.error('Request interceptor error:', error);
            throw error;
        }
    },
    (error: AxiosError) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally and cache responses
apiClient.interceptors.response.use(
    async (response: AxiosResponse) => {
        // Log response in development
        if (__DEV__) {
            console.log('✅ API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        // Cache GET requests if cacheable
        const config: any = response.config;
        if (config.method?.toLowerCase() === 'get' && config.cacheable !== false) {
            try {
                const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
                const ttl = config.cacheTTL || 5 * 60 * 1000; // Default 5 minutes
                await cache.set(cacheKey, response.data, { ttl });
            } catch (cacheError) {
                console.error('Failed to cache response:', cacheError);
            }
        }

        return response;
    },
    async (error: AxiosError) => {
        const config: any = error.config;

        // Log error to error logger
        errorLogger.logNetworkError(error, config);

        // Log error in development
        if (__DEV__) {
            console.error('❌ API Error:', {
                url: config?.url,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
                type: 'network',
            });
        }

        // Handle specific error cases
        if (error.response) {
            const status = error.response.status;
            const data: any = error.response.data;

            switch (status) {
                case 401:
                    // Unauthorized - Try to refresh token
                    if (!config._retry) {
                        config._retry = true;

                        try {
                            // Attempt token refresh
                            const refreshTokenValue = await AsyncStorage.getItem('@refresh_token');

                            if (refreshTokenValue) {
                                if (__DEV__) {
                                    console.log('🔄 Attempting token refresh...');
                                }

                                // Call refresh endpoint (baseURL already includes /api/v1)
                                const refreshResponse = await axios.post(`${getApiUrl()}/auth/refresh`, {
                                    refreshToken: refreshTokenValue,
                                });

                                if (refreshResponse.data?.data?.accessToken) {
                                    const newToken = refreshResponse.data.data.accessToken;
                                    await AsyncStorage.setItem('@auth_token', newToken);

                                    // Update expiry if provided
                                    if (refreshResponse.data.data.expiresIn) {
                                        const expiryTime = Date.now() + refreshResponse.data.data.expiresIn * 1000;
                                        await AsyncStorage.setItem('@token_expiry', expiryTime.toString());
                                    }

                                    if (__DEV__) {
                                        console.log('✅ Token refreshed successfully');
                                    }

                                    // Update the failed request with new token
                                    config.headers.Authorization = `Bearer ${newToken}`;

                                    // Retry the original request
                                    return apiClient.request(config);
                                }
                            }
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                        }
                    }

                    // If refresh failed or no refresh token, clear auth state
                    await AsyncStorage.removeItem('@auth_token');
                    await AsyncStorage.removeItem('@refresh_token');
                    await AsyncStorage.removeItem('authState');
                    console.warn('Session expired. Please login again.');
                    break;

                case 403:
                    // Forbidden
                    console.warn('Access denied:', data?.message || 'Insufficient permissions');
                    break;

                case 404:
                    // Not found
                    console.warn('Resource not found:', config?.url);
                    break;

                case 429:
                    // Too many requests
                    console.warn('Rate limit exceeded. Please try again later.');
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    // Server errors
                    console.error('Server error. Please try again later.');
                    break;

                default:
                    console.error('API error:', data?.message || error.message);
            }
        } else if (error.request) {
            // Network error - try to return cached data for GET requests
            if (config?.method?.toLowerCase() === 'get' && config?.useCacheOnError !== false) {
                try {
                    const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
                    const cachedData = await cache.get(cacheKey);

                    if (cachedData) {
                        if (__DEV__) {
                            console.log('📦 Returning cached data due to network error');
                        }
                        return {
                            data: cachedData,
                            status: 200,
                            statusText: 'OK (from cache)',
                            headers: {},
                            config,
                            fromCache: true,
                        } as any;
                    }
                } catch (cacheError) {
                    console.error('Failed to retrieve cached data:', cacheError);
                }
            }

            // Network error
            console.error('Network error. Please check your internet connection.');
        } else {
            // Other errors
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Helper function to handle API calls with consistent error handling
export const makeApiCall = async <T = any>(
    config: AxiosRequestConfig
): Promise<{ data: T | null; error: string | null; fromCache?: boolean; isQueued?: boolean }> => {
    try {
        const response: any = await apiClient.request<T>(config);
        return {
            data: response.data,
            error: null,
            fromCache: response.fromCache || false
        };
    } catch (error: any) {
        // Handle queued requests
        if (error.isQueued) {
            return {
                data: null,
                error: 'Request queued for when online',
                isQueued: true
            };
        }

        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message || 'An error occurred';
            return { data: null, error: message };
        }
        return { data: null, error: 'An unexpected error occurred' };
    }
};

/**
 * Make API call with automatic caching
 */
export const makeApiCallWithCache = async <T = any>(
    config: AxiosRequestConfig,
    options: { ttl?: number; forceRefresh?: boolean } = {}
): Promise<{ data: T | null; error: string | null; fromCache?: boolean }> => {
    const { ttl = 5 * 60 * 1000, forceRefresh = false } = options;

    // Only cache GET requests
    if (config.method?.toLowerCase() !== 'get' && !config.method) {
        return makeApiCall<T>(config);
    }

    const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;

    // Try cache first if not forcing refresh
    if (!forceRefresh) {
        const cached = await cache.get<T>(cacheKey);
        if (cached) {
            return { data: cached, error: null, fromCache: true };
        }
    }

    // Make API call
    const result = await makeApiCall<T>({ ...config, cacheable: true, cacheTTL: ttl } as any);

    // Cache successful responses
    if (result.data && !result.error) {
        await cache.set(cacheKey, result.data, { ttl });
    }

    return result;
};

/**
 * Initialize API client (call this when app starts)
 */
export const initializeApiClient = async (): Promise<void> => {
    try {
        // Register sync callback for offline queue
        offlineQueue.setSyncCallback(async (action) => {
            const response = await apiClient.request({
                url: action.endpoint,
                method: action.method,
                data: action.payload,
            });
            return response.data;
        });

        // Check initial network state
        await checkNetworkConnectivity();

        // Process any queued requests if online
        if (isOnline) {
            await processOfflineQueue();
        }

        // Clear expired cache
        await cache.clearExpired();

        if (__DEV__) {
            const queueStats = requestQueue.getStats();
            const offlineQueueStats = offlineQueue.getStats();
            const cacheStats = await cache.getStats();
            console.log('📡 API Client initialized:', {
                online: isOnline,
                queuedRequests: queueStats.pending,
                offlineQueuePending: offlineQueueStats.pending,
                cachedEntries: cacheStats.validEntries,
            });
        }
    } catch (error) {
        console.error('Failed to initialize API client:', error);
    }
};

/**
 * Get current network status
 */
export const getNetworkStatus = (): boolean => isOnline;

/**
 * Manually trigger offline queue processing
 */
export const retryOfflineRequests = processOfflineQueue;

// Export configured axios instance
export default apiClient;
