/**
 * Authentication Types
 * 
 * TypeScript interfaces for authentication-related data structures.
 */

export type UserRole = 'customer' | 'delivery' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
    createdAt?: string;
    isVerified?: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: UserRole;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface DemoAccount {
    email: string;
    password: string;
    userData: {
        token: string;
        user: User;
    };
}

export interface StoredAuthData {
    user: User;
    token: string;
}
