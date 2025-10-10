import { baseApi } from './baseApi';
import { AUTH_ENDPOINTS } from '../../../src/api/endpoints';

/**
 * Auth API Slice (RTK Query)
 * 
 * This slice will handle authentication-related API calls.
 * Currently a placeholder - will be implemented in future prompts.
 */

// Types (to be expanded)
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'customer' | 'admin' | 'delivery';
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            phone: string;
        };
        token: string;
    };
}

// Inject endpoints into baseApi
export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Login
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: AUTH_ENDPOINTS.LOGIN,
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Register
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: AUTH_ENDPOINTS.REGISTER,
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Verify Token
        verifyToken: builder.query<AuthResponse, void>({
            query: () => AUTH_ENDPOINTS.VERIFY_TOKEN,
            providesTags: ['Auth'],
        }),

        // Logout (placeholder)
        logout: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: AUTH_ENDPOINTS.LOGOUT,
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User', 'Cart', 'Order'],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyTokenQuery,
    useLogoutMutation,
} = authApi;
