/**
 * Environment Configuration
 * 
 * Centralized configuration for different environments.
 * Handles API URLs, timeouts, and environment-specific settings.
 */

import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
    API_URL: string;
    SOCKET_URL: string;
    API_TIMEOUT: number;
    MAX_RETRIES: number;
    ENABLE_LOGGING: boolean;
    CACHE_ENABLED: boolean;
    OFFLINE_MODE_ENABLED: boolean;
}

// Get current environment
export const getCurrentEnvironment = (): Environment => {
    if (__DEV__) {
        return 'development';
    }

    // Check for staging environment via extra metadata
    const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;
    if (releaseChannel?.includes('staging')) {
        return 'staging';
    }

    return 'production';
};

// Environment-specific configurations
const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
    development: {
        // For local development - update with your local IP
        // Get your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
        API_URL: process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:5000/api',
        SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL_DEVELOPMENT || 'http://localhost:5000',
        API_TIMEOUT: 30000, // 30 seconds for development (allows debugging)
        MAX_RETRIES: 3,
        ENABLE_LOGGING: true,
        CACHE_ENABLED: true,
        OFFLINE_MODE_ENABLED: true,
    },
    staging: {
        API_URL: process.env.EXPO_PUBLIC_API_URL_STAGING || 'https://staging-api.yourapp.com/api',
        SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL_STAGING || 'https://staging-api.yourapp.com',
        API_TIMEOUT: 20000, // 20 seconds
        MAX_RETRIES: 3,
        ENABLE_LOGGING: true,
        CACHE_ENABLED: true,
        OFFLINE_MODE_ENABLED: true,
    },
    production: {
        API_URL: process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://api.yourapp.com/api',
        SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL_PRODUCTION || 'https://api.yourapp.com',
        API_TIMEOUT: 15000, // 15 seconds
        MAX_RETRIES: 2,
        ENABLE_LOGGING: false,
        CACHE_ENABLED: true,
        OFFLINE_MODE_ENABLED: true,
    },
};

// Get current environment config
export const ENV = ENVIRONMENTS[getCurrentEnvironment()];

// Log current configuration in development
if (__DEV__) {
    console.log('🌍 Environment Configuration:');
    console.log('- Environment:', getCurrentEnvironment());
    console.log('- API URL:', ENV.API_URL);
    console.log('- Socket URL:', ENV.SOCKET_URL);
    console.log('- API Timeout:', ENV.API_TIMEOUT, 'ms');
    console.log('- Max Retries:', ENV.MAX_RETRIES);
    console.log('- Logging Enabled:', ENV.ENABLE_LOGGING);
    console.log('- Cache Enabled:', ENV.CACHE_ENABLED);
    console.log('- Offline Mode:', ENV.OFFLINE_MODE_ENABLED);
}

// Helper to check if running in local development
export const isLocalDevelopment = (): boolean => {
    return __DEV__ && ENV.API_URL.includes('localhost');
};

// Helper to check if running in production
export const isProduction = (): boolean => {
    return getCurrentEnvironment() === 'production';
};

// Export configuration
export default ENV;
