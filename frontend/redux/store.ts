import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authSlice from './slices/authSlice';
import onboardingSlice from './slices/onboardingSlice';
import { baseApi } from './slices/api/baseApi';

// Store configuration with RTK Query
const store = configureStore({
    reducer: {
        // Feature slices
        auth: authSlice,
        onboarding: onboardingSlice,

        // RTK Query API slice
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // Performance optimizations
            immutableCheck: {
                warnAfter: 128,
            },
            serializableCheck: {
                warnAfter: 128,
                ignoredActions: ['persist/PERSIST'],
            },
        })
            // Add RTK Query middleware for caching, invalidation, polling, etc.
            .concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Auth state persistence helpers
export const saveAuthState = async (authState: any) => {
    try {
        await AsyncStorage.setItem('authState', JSON.stringify(authState));
    } catch (error) {
        console.error('Error saving auth state:', error);
    }
};

export const loadAuthState = async () => {
    try {
        const authState = await AsyncStorage.getItem('authState');
        return authState ? JSON.parse(authState) : null;
    } catch (error) {
        console.error('Error loading auth state:', error);
        return null;
    }
};

export const clearAuthState = async () => {
    try {
        await AsyncStorage.removeItem('authState');
    } catch (error) {
        console.error('Error clearing auth state:', error);
    }
};

// Onboarding state persistence helpers
export const saveOnboardingState = async (completed: boolean) => {
    try {
        await AsyncStorage.setItem('onboardingCompleted', JSON.stringify(completed));
    } catch (error) {
        console.error('Error saving onboarding state:', error);
    }
};

export const loadOnboardingState = async (): Promise<boolean> => {
    try {
        const state = await AsyncStorage.getItem('onboardingCompleted');
        return state ? JSON.parse(state) : false;
    } catch (error) {
        console.error('Error loading onboarding state:', error);
        return false;
    }
};

export default store;