import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, refreshToken } from '../utils/cache';
import { formatError } from '../utils/errorHandler';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Request interceptor: attach JWT
axiosInstance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token && config.headers && typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Authorization', `Bearer ${token}`);
    }
    return config;
});

// Response interceptor: handle errors, retries, caching
axiosInstance.interceptors.response.use(
    async (response: AxiosResponse) => {
        // Cache GET responses for offline use
        if (response.config.method === 'get') {
            await AsyncStorage.setItem(
                `CACHE_${response.config.url}`,
                JSON.stringify({ data: response.data, timestamp: Date.now() })
            );
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        if (!originalRequest) {
            return Promise.reject(formatError(error));
        }
        // Retry logic for transient errors
        if (!originalRequest._retry) {
            originalRequest._retry = true;
            if (error.response?.status === 401) {
                // Token expired: try refresh
                const newToken = await refreshToken();
                if (newToken) {
                    if (!originalRequest.headers) originalRequest.headers = {};
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            }
            if (
                error.code === 'ECONNABORTED' ||
                error.message.includes('timeout') ||
                !error.response ||
                [500, 502, 503, 504].includes(error.response.status)
            ) {
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                if (originalRequest._retryCount <= 3) {
                    return axiosInstance(originalRequest);
                }
            }
        }
        // Format error for UI
        return Promise.reject(formatError(error));
    }
);

export default axiosInstance;
