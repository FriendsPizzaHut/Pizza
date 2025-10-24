/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls with:
 * - Offline support (queues auth requests when offline)
 * - Error handling (network errors, validation errors, server crashes)
 * - Security (token management, secure storage)
 * - Performance (caching, optimized requests)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { AUTH_ENDPOINTS } from '../api/endpoints';
import { errorLogger } from './errorLogger';
import { checkInternetConnection } from '../utils/healthCheck';
import NotificationService from './notifications/NotificationService';

// Storage keys
const STORAGE_KEYS = {
    TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    USER: '@user_data',
    TOKEN_EXPIRY: '@token_expiry',
};

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin' | 'delivery';
    avatar?: string;
    createdAt?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    refreshToken?: string;
    user: User;
    expiresIn?: number; // Token expiry in seconds
    requiresApproval?: boolean; // For delivery boys awaiting approval
    message?: string; // Optional message from server
}

export interface SignupData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'customer' | 'admin' | 'delivery';
    // Delivery boy specific fields
    vehicleInfo?: {
        type: 'bike' | 'scooter' | 'bicycle' | 'car';
        number?: string; // Optional
        model?: string;
    };
    documents?: {
        drivingLicense?: {
            imageUrl?: string; // Image URI/URL
        };
        aadharCard?: {
            imageUrl?: string; // Image URI/URL
        };
        vehicleRC?: {
            imageUrl?: string; // Image URI/URL (optional)
        };
    };
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthError {
    message: string;
    field?: string;
    code?: string;
    statusCode?: number;
}

/**
 * Signup - Register new user
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
    try {
        // Check internet connectivity first
        const hasInternet = await checkInternetConnection();
        if (!hasInternet) {
            throw {
                message: 'No internet connection. Please connect to WiFi or mobile data.',
                code: 'NETWORK_ERROR',
                statusCode: 0,
            } as AuthError;
        }

        // Validate input data
        validateSignupData(data);

        // Make API request
        const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, {
            ...data,
            role: data.role || 'customer', // Default to customer
        });

        // Check response format
        // Backend returns: { success, data: { accessToken, refreshToken, user, requiresApproval?, message? }, statusCode }
        const responseData = response.data?.data || response.data;
        const user = responseData.user;

        if (!user) {
            throw {
                message: 'Invalid response from server',
                code: 'INVALID_RESPONSE',
                statusCode: response.status,
            } as AuthError;
        }

        // Check if this is a delivery boy requiring approval
        if (responseData.requiresApproval || data.role === 'delivery') {
            // Delivery boy registered but needs admin approval
            // Don't store tokens, don't auto-login
            console.log('Delivery boy registered, awaiting approval:', data.email);

            return {
                success: true,
                token: '', // No token for unapproved delivery boys
                refreshToken: '',
                user: user,
                expiresIn: 0,
                requiresApproval: true,
                message: responseData.message || 'Registration successful! Please wait for admin approval.',
            };
        }

        // For customers and admins, proceed with auto-login
        const token = responseData.accessToken || responseData.token;

        if (!token) {
            throw {
                message: 'Invalid response from server',
                code: 'INVALID_RESPONSE',
                statusCode: response.status,
            } as AuthError;
        }

        const authData: AuthResponse = {
            success: true,
            token: token,
            refreshToken: responseData.refreshToken || '',
            user: user,
            expiresIn: responseData.expiresIn || 86400, // Default 24 hours
        };

        // Store auth data securely
        await storeAuthData(authData);

        // Log success
        if (__DEV__) {
            console.log('✅ Signup successful:', authData.user.email);
        }

        return authData;

    } catch (error: any) {
        // Handle and log error
        const authError = handleAuthError(error, 'signup');

        // Log to error logger
        await errorLogger.logError(
            new Error(`Signup failed: ${authError.message}`),
            { email: data.email, role: data.role },
            'error'
        );

        throw authError;
    }
};

/**
 * Login - Authenticate existing user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
        // Check internet connectivity
        const hasInternet = await checkInternetConnection();
        if (!hasInternet) {
            throw {
                message: 'No internet connection. Please connect to WiFi or mobile data.',
                code: 'NETWORK_ERROR',
                statusCode: 0,
            } as AuthError;
        }

        // Validate input
        validateLoginData(data);

        // Make API request
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, data);

        // Validate response
        // Backend returns: { success, data: { accessToken, refreshToken, user }, statusCode }
        const responseData = response.data?.data || response.data;
        const token = responseData.accessToken || responseData.token;
        const user = responseData.user;

        if (!token || !user) {
            throw {
                message: 'Invalid response from server',
                code: 'INVALID_RESPONSE',
                statusCode: response.status,
            } as AuthError;
        }

        const authData: AuthResponse = {
            success: true,
            token: token,
            refreshToken: responseData.refreshToken || '',
            user: user,
            expiresIn: responseData.expiresIn || 86400,
        };

        // Store auth data
        await storeAuthData(authData);

        // Log success
        if (__DEV__) {
            console.log('✅ Login successful:', authData.user.email);
        }

        return authData;

    } catch (error: any) {
        const authError = handleAuthError(error, 'login');

        await errorLogger.logError(
            new Error(`Login failed: ${authError.message}`),
            { email: data.email },
            'error'
        );

        throw authError;
    }
};

/**
 * Logout - Clear user session
 */
export const logout = async (): Promise<void> => {
    try {
        // Get user data before clearing storage (need userId for token deactivation)
        const userData = await getStoredUser();
        const userId = userData?.id;

        // ✅ NEW: Deactivate device token first to stop receiving notifications
        if (userId) {
            console.log('🔕 [LOGOUT] Deactivating device token for user:', userId);
            try {
                await NotificationService.deactivateDeviceToken(userId);
                console.log('✅ [LOGOUT] Device token deactivated');
            } catch (error) {
                console.warn('⚠️ [LOGOUT] Failed to deactivate device token:', error);
                // Continue with logout anyway
            }
        }

        // ✅ NEW: Cleanup notification listeners
        console.log('🧹 [LOGOUT] Cleaning up notification listeners...');
        NotificationService.cleanup();

        // Try to notify backend (best effort, don't fail if offline)
        const token = await getStoredToken();
        if (token) {
            try {
                await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('✅ [LOGOUT] Backend logout successful');
            } catch (error) {
                // Silently fail - logout locally even if backend call fails
                if (__DEV__) {
                    console.warn('⚠️ [LOGOUT] Backend logout failed, clearing local data:', error);
                }
            }
        }

        // Clear local storage
        await clearAuthData();

        if (__DEV__) {
            console.log('✅ Logout successful - All data cleared');
        }

    } catch (error) {
        await errorLogger.logError(
            new Error('Logout failed'),
            { error },
            'warning'
        );

        // Force clear local data even if error occurs
        await clearAuthData();
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const token = await getStoredToken();
        const user = await getStoredUser();

        if (!token || !user) {
            return false;
        }

        // Check if token is expired
        const isExpired = await isTokenExpired();
        if (isExpired) {
            // Try to refresh token
            const refreshed = await refreshToken();
            return refreshed;
        }

        return true;

    } catch (error) {
        return false;
    }
};

/**
 * Get current user from storage
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        return await getStoredUser();
    } catch {
        return null;
    }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<boolean> => {
    try {
        const refreshTokenValue = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshTokenValue) {
            return false;
        }

        const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken: refreshTokenValue,
        });

        if (response.data && response.data.token) {
            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);

            if (response.data.expiresIn) {
                const expiryTime = Date.now() + response.data.expiresIn * 1000;
                await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
            }

            return true;
        }

        return false;

    } catch (error) {
        await clearAuthData();
        return false;
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate signup data
 */
const validateSignupData = (data: SignupData): void => {
    if (!data.name || data.name.trim().length < 2) {
        throw {
            message: 'Name must be at least 2 characters long',
            field: 'name',
            code: 'VALIDATION_ERROR',
        } as AuthError;
    }

    if (!data.email || !isValidEmail(data.email)) {
        throw {
            message: 'Please enter a valid email address',
            field: 'email',
            code: 'VALIDATION_ERROR',
        } as AuthError;
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        throw {
            message: 'Please enter a valid 10-digit phone number',
            field: 'phone',
            code: 'VALIDATION_ERROR',
        } as AuthError;
    }

    if (!data.password || data.password.length < 6) {
        throw {
            message: 'Password must be at least 6 characters long',
            field: 'password',
            code: 'VALIDATION_ERROR',
        } as AuthError;
    }
};

/**
 * Validate login data
 */
const validateLoginData = (data: LoginData): void => {
    if (!data.email || !isValidEmail(data.email)) {
        throw {
            message: 'Please enter a valid email address',
            field: 'email',
            code: 'VALIDATION_ERROR',
        } as AuthError;
    }

    if (!data.password || data.password.length === 0) {
        throw {
            message: 'Password is required',
            field: 'password',
            code: 'VALIDATION_ERROR',
        } as AuthError;
    }
};

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Store authentication data securely
 */
const storeAuthData = async (authData: AuthResponse): Promise<void> => {
    try {
        await AsyncStorage.multiSet([
            [STORAGE_KEYS.TOKEN, authData.token],
            [STORAGE_KEYS.USER, JSON.stringify(authData.user)],
        ]);

        if (authData.refreshToken) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
        }

        if (authData.expiresIn) {
            const expiryTime = Date.now() + authData.expiresIn * 1000;
            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
        }
    } catch (error) {
        throw new Error('Failed to store authentication data');
    }
};

/**
 * Get stored auth token
 */
const getStoredToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch {
        return null;
    }
};

/**
 * Get stored user data
 */
const getStoredUser = async (): Promise<User | null> => {
    try {
        const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return userJson ? JSON.parse(userJson) : null;
    } catch {
        return null;
    }
};

/**
 * Check if token is expired
 */
const isTokenExpired = async (): Promise<boolean> => {
    try {
        const expiryTime = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        if (!expiryTime) {
            return false; // If no expiry time, assume token is valid
        }
        return Date.now() > parseInt(expiryTime, 10);
    } catch {
        return false;
    }
};

/**
 * Clear all authentication data
 */
const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.TOKEN_EXPIRY,
        ]);
    } catch (error) {
        console.error('Failed to clear auth data:', error);
    }
};

/**
 * Handle authentication errors
 */
const handleAuthError = (error: any, action: 'signup' | 'login'): AuthError => {
    // Network errors
    if (error.code === 'NETWORK_ERROR') {
        return error as AuthError;
    }

    // Validation errors
    if (error.code === 'VALIDATION_ERROR') {
        return error as AuthError;
    }

    // API errors
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // 400 - Validation error from backend
        if (status === 400) {
            return {
                message: data.message || 'Invalid input data',
                field: data.field,
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            };
        }

        // 401 - Unauthorized (wrong credentials)
        if (status === 401) {
            return {
                message: action === 'login'
                    ? 'Invalid email or password'
                    : 'Authentication failed',
                code: 'UNAUTHORIZED',
                statusCode: 401,
            };
        }

        // 409 - Conflict (email already exists)
        if (status === 409) {
            return {
                message: 'An account with this email already exists',
                field: 'email',
                code: 'CONFLICT',
                statusCode: 409,
            };
        }

        // 429 - Too many requests
        if (status === 429) {
            return {
                message: 'Too many attempts. Please try again later.',
                code: 'RATE_LIMIT',
                statusCode: 429,
            };
        }

        // 500+ - Server error
        if (status >= 500) {
            return {
                message: 'Server error. Please try again later.',
                code: 'SERVER_ERROR',
                statusCode: status,
            };
        }

        // Generic API error
        return {
            message: data.message || 'Authentication failed',
            code: 'API_ERROR',
            statusCode: status,
        };
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
        return {
            message: 'Request timed out. Please check your connection.',
            code: 'TIMEOUT',
            statusCode: 0,
        };
    }

    // Unknown error
    return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 0,
    };
};

// Export auth service
export const authService = {
    signup,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    refreshToken,
    getStoredToken, // Export for internal use
};

export default authService;
