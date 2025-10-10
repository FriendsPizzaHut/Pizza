import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    signupThunk,
    loginThunk,
    logoutThunk,
    checkAuthStatusThunk,
} from '../thunks/authThunks';
import type { AuthError } from '../../src/services/authService';

export interface AuthState {
    token: string | null;
    role: 'customer' | 'delivery' | 'admin' | null;
    name: string | null;
    email: string | null;
    userId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: null,
    role: null,
    name: null,
    email: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading state
    error: null,
};

// Demo credentials for different roles
export const DEMO_CREDENTIALS = {
    customer: {
        email: 'customer@demo.com',
        password: 'customer123',
        userData: {
            token: 'demo_customer_token',
            role: 'customer' as const,
            name: 'John Customer',
            email: 'customer@demo.com',
            userId: 'customer_001',
        }
    },
    delivery: {
        email: 'delivery@demo.com',
        password: 'delivery123',
        userData: {
            token: 'demo_delivery_token',
            role: 'delivery' as const,
            name: 'Mike Delivery',
            email: 'delivery@demo.com',
            userId: 'delivery_001',
        }
    },
    admin: {
        email: 'admin@demo.com',
        password: 'admin123',
        userData: {
            token: 'demo_admin_token',
            role: 'admin' as const,
            name: 'Sarah Admin',
            email: 'admin@demo.com',
            userId: 'admin_001',
        }
    },
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
        },
        loginSuccess: (state, action: PayloadAction<{
            token: string;
            role: 'customer' | 'delivery' | 'admin';
            name: string;
            email: string;
            userId: string;
        }>) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.userId = action.payload.userId;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        loginFailure: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
        },
        registerStart: (state) => {
            state.isLoading = true;
        },
        registerSuccess: (state, action: PayloadAction<{
            token: string;
            role: 'customer' | 'delivery' | 'admin';
            name: string;
            email: string;
            userId: string;
        }>) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.userId = action.payload.userId;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        registerFailure: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
        },
        logout: (state) => {
            state.token = null;
            state.role = null;
            state.name = null;
            state.email = null;
            state.userId = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        restoreAuthState: (state, action: PayloadAction<{
            token: string;
            role: 'customer' | 'delivery' | 'admin';
            name: string;
            email: string;
            userId: string;
        }>) => {
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.userId = action.payload.userId;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Signup
        builder.addCase(signupThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signupThunk.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.role = action.payload.user.role;
            state.name = action.payload.user.name;
            state.email = action.payload.user.email;
            state.userId = action.payload.user.id;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        });
        builder.addCase(signupThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = action.payload?.message || 'Signup failed';
        });

        // Login
        builder.addCase(loginThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginThunk.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.role = action.payload.user.role;
            state.name = action.payload.user.name;
            state.email = action.payload.user.email;
            state.userId = action.payload.user.id;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        });
        builder.addCase(loginThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = action.payload?.message || 'Login failed';
        });

        // Logout
        builder.addCase(logoutThunk.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(logoutThunk.fulfilled, (state) => {
            state.token = null;
            state.role = null;
            state.name = null;
            state.email = null;
            state.userId = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        });
        builder.addCase(logoutThunk.rejected, (state) => {
            // Even if logout fails, clear local state
            state.token = null;
            state.role = null;
            state.name = null;
            state.email = null;
            state.userId = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        });

        // Check Auth Status
        builder.addCase(checkAuthStatusThunk.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
            if (action.payload) {
                state.token = action.payload.token;
                state.role = action.payload.user.role;
                state.name = action.payload.user.name;
                state.email = action.payload.user.email;
                state.userId = action.payload.user.id;
                state.isAuthenticated = true;
            }
            state.isLoading = false;
        });
        builder.addCase(checkAuthStatusThunk.rejected, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
        });
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    registerStart,
    registerSuccess,
    registerFailure,
    logout,
    restoreAuthState,
    setLoading,
    clearError,
} = authSlice.actions;

export default authSlice.reducer;