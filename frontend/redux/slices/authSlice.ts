import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
    token: string | null;
    role: 'customer' | 'delivery' | 'admin' | null;
    name: string | null;
    email: string | null;
    userId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    token: null,
    role: null,
    name: null,
    email: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading state
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
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    restoreAuthState,
    setLoading,
} = authSlice.actions;

export default authSlice.reducer;