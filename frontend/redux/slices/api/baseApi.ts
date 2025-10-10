import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine API URL based on environment
const getApiUrl = () => {
    const isDevelopment = __DEV__;
    return isDevelopment
        ? process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:5000'
        : process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://pizzabackend-u9ui.onrender.com';
};

/**
 * RTK Query Base API
 * 
 * This is the foundation for all API slices.
 * It handles authentication, headers, and error handling automatically.
 */
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: getApiUrl(),
        timeout: 30000,
        prepareHeaders: async (headers) => {
            // Get token from AsyncStorage
            try {
                const authState = await AsyncStorage.getItem('authState');
                if (authState) {
                    const { token } = JSON.parse(authState);
                    if (token) {
                        headers.set('Authorization', `Bearer ${token}`);
                    }
                }
            } catch (error) {
                console.error('Error getting auth token:', error);
            }

            // Add platform info
            headers.set('X-Platform', Platform.OS);
            headers.set('X-Platform-Version', String(Platform.Version));
            headers.set('Content-Type', 'application/json');

            return headers;
        },
    }),

    // Define tag types for cache invalidation
    tagTypes: [
        'Auth',
        'User',
        'Menu',
        'Order',
        'Cart',
        'Coupon',
        'Payment',
        'Address',
        'Notification',
        'Review',
        'Dashboard',
    ],

    // Endpoints will be injected by individual API slices
    endpoints: () => ({}),
});

// Export hooks for usage in functional components
export default baseApi;
