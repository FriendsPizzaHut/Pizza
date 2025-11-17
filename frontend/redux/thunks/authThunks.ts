/**
 * Auth Redux Thunks
 * 
 * Async actions for authentication with:
 * - Integration with authService
 * - Error handling
 * - Loading states
 * - Offline support
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService, {
    SignupData,
    LoginData,
    AuthResponse,
    AuthError,
} from '../../src/services/authService';
import { errorLogger } from '../../src/services/errorLogger';

/**
 * Signup Thunk
 */
export const signupThunk = createAsyncThunk<
    AuthResponse,
    SignupData,
    { rejectValue: AuthError }
>(
    'auth/signup',
    async (signupData, { rejectWithValue }) => {
        try {
            const response = await authService.signup(signupData);
            return response;
        } catch (error: any) {
            // Error is already formatted by authService
            return rejectWithValue(error as AuthError);
        }
    }
);

/**
 * Login Thunk
 */
export const loginThunk = createAsyncThunk<
    AuthResponse,
    LoginData,
    { rejectValue: AuthError }
>(
    'auth/login',
    async (loginData, { rejectWithValue }) => {
        try {
            const response = await authService.login(loginData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error as AuthError);
        }
    }
);

/**
 * Logout Thunk
 * Handles complete logout including device token deactivation
 */
export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // authService.logout() now handles:
            // 1. Getting userId from storage
            // 2. Deactivating device token via NotificationService
            // 3. Cleaning up notification listeners
            // 4. Calling backend logout endpoint
            // 5. Clearing local storage
            await authService.logout();

        } catch (error: any) {
            // Don't fail logout even if backend call fails
            console.error('⚠️ [LOGOUT_THUNK] Logout error:', error);
            await errorLogger.logError(
                new Error('Logout thunk error'),
                { error },
                'warning'
            );
            // Still resolve successfully to clear local state
        }
    }
);

/**
 * Check Auth Status Thunk (for app startup)
 */
export const checkAuthStatusThunk = createAsyncThunk<
    AuthResponse | null,
    void,
    { rejectValue: string }
>(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        try {
            const isAuth = await authService.isAuthenticated();

            if (!isAuth) {
                return null;
            }

            const user = await authService.getCurrentUser();
            const token = await authService.getStoredToken();

            if (!user || !token) {
                return null;
            }

            return {
                success: true,
                token,
                user,
            } as AuthResponse;

        } catch (error: any) {
            await errorLogger.logError(
                new Error('Check auth status failed'),
                { error },
                'warning'
            );
            return null;
        }
    }
);

/**
 * Refresh Token Thunk
 */
export const refreshTokenThunk = createAsyncThunk<boolean, void, { rejectValue: string }>(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshed = await authService.refreshToken();
            return refreshed;
        } catch (error: any) {
            return rejectWithValue('Token refresh failed');
        }
    }
);

export default {
    signupThunk,
    loginThunk,
    logoutThunk,
    checkAuthStatusThunk,
    refreshTokenThunk,
};
