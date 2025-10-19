/**
 * Socket.IO Configuration
 * 
 * Centralized socket URL configuration for the entire application.
 * All screens and components should import SOCKET_URL from this file
 * instead of defining it separately.
 * 
 * The URL is automatically selected based on the environment:
 * - Development: Uses EXPO_PUBLIC_SOCKET_URL_DEVELOPMENT from .env
 * - Production: Uses EXPO_PUBLIC_SOCKET_URL_PRODUCTION from .env
 * 
 * @module socket.config
 */

import Constants from 'expo-constants';

/**
 * Get Socket URL from environment variables
 * Fallback to API URL if socket URL is not defined
 */
const getSocketURL = (): string => {
    if (__DEV__) {
        // Development mode
        const socketUrl = Constants.expoConfig?.extra?.socketUrlDevelopment;
        const apiUrl = Constants.expoConfig?.extra?.apiUrlDevelopment;

        // Use dedicated socket URL if available, otherwise extract from API URL
        const url = socketUrl || apiUrl?.replace(/\/api\/v1$/, '') || 'http://localhost:5000';

        console.log('🔌 [SOCKET-CONFIG] Development Socket URL:', url);
        return url;
    } else {
        // Production mode
        const socketUrl = Constants.expoConfig?.extra?.socketUrlProduction;
        const apiUrl = Constants.expoConfig?.extra?.apiUrlProduction;

        // Use dedicated socket URL if available, otherwise extract from API URL
        const url = socketUrl || apiUrl?.replace(/\/api\/v1$/, '') || 'https://pizzabackend-u9ui.onrender.com';

        console.log('🔌 [SOCKET-CONFIG] Production Socket URL:', url);
        return url;
    }
};

/**
 * Centralized Socket URL
 * Import this constant in all components that need socket connection
 * 
 * @example
 * ```typescript
 * import { SOCKET_URL } from '../../../config/socket.config';
 * 
 * const socket = io(SOCKET_URL, {
 *   transports: ['websocket', 'polling']
 * });
 * ```
 */
export const SOCKET_URL = getSocketURL();

/**
 * Default Socket.IO client options
 * Use these options for consistent socket connections across the app
 */
export const SOCKET_OPTIONS = {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 10000,
};

/**
 * Socket connection helper
 * Creates a socket connection with default options
 * 
 * @param customOptions - Optional custom socket options to override defaults
 * @returns Socket URL and options
 * 
 * @example
 * ```typescript
 * import { getSocketConfig } from '../../../config/socket.config';
 * import { io } from 'socket.io-client';
 * 
 * const { url, options } = getSocketConfig();
 * const socket = io(url, options);
 * ```
 */
export const getSocketConfig = (customOptions?: Partial<typeof SOCKET_OPTIONS>) => {
    return {
        url: SOCKET_URL,
        options: {
            ...SOCKET_OPTIONS,
            ...customOptions,
        },
    };
};

/**
 * Log socket configuration (for debugging)
 */
export const logSocketConfig = () => {
    console.log('📊 [SOCKET-CONFIG] Configuration:');
    console.log('  - Environment:', __DEV__ ? 'development' : 'production');
    console.log('  - Socket URL:', SOCKET_URL);
    console.log('  - Options:', JSON.stringify(SOCKET_OPTIONS, null, 2));
};

// Log configuration on module load (only in development)
if (__DEV__) {
    logSocketConfig();
}

export default {
    SOCKET_URL,
    SOCKET_OPTIONS,
    getSocketConfig,
    logSocketConfig,
};
