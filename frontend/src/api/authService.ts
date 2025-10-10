import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterCredentials, AuthResponse, UserRole } from '../types/auth';

/**
 * Auth Service
 * 
 * Mock authentication service that simulates backend API calls.
 * Replace these with actual API calls when backend is ready.
 */

const STORAGE_KEY = '@FriendsPizzaHut_auth';
const DELAY = 1000; // Simulate network delay

// Demo accounts for testing
export const DEMO_ACCOUNTS = {
    customer: {
        email: 'customer@demo.com',
        password: 'customer123',
        user: {
            id: 'customer_001',
            email: 'customer@demo.com',
            name: 'John Customer',
            role: 'customer' as UserRole,
            phone: '+91 9876543210',
            isVerified: true,
        },
    },
    delivery: {
        email: 'delivery@demo.com',
        password: 'delivery123',
        user: {
            id: 'delivery_001',
            email: 'delivery@demo.com',
            name: 'Mike Delivery',
            role: 'delivery' as UserRole,
            phone: '+91 9876543211',
            isVerified: true,
        },
    },
    admin: {
        email: 'admin@demo.com',
        password: 'admin123',
        user: {
            id: 'admin_001',
            email: 'admin@demo.com',
            name: 'Sarah Admin',
            role: 'admin' as UserRole,
            phone: '+91 9876543212',
            isVerified: true,
        },
    },
};

/**
 * Simulate network delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock Login
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(DELAY);

    // Check demo accounts
    for (const [role, account] of Object.entries(DEMO_ACCOUNTS)) {
        if (
            credentials.email.toLowerCase() === account.email.toLowerCase() &&
            credentials.password === account.password
        ) {
            const token = `demo_${role}_token_${Date.now()}`;

            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: account.user,
                    token,
                },
            };
        }
    }

    // Invalid credentials
    throw new Error('Invalid email or password');
};

/**
 * Mock Register
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await delay(DELAY);

    // Check if email already exists (demo accounts)
    const emailExists = Object.values(DEMO_ACCOUNTS).some(
        account => account.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (emailExists) {
        throw new Error('Email already registered');
    }

    // Validate password strength
    if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // Create new user
    const newUser: User = {
        id: `user_${Date.now()}`,
        email: credentials.email,
        name: credentials.name,
        role: credentials.role || 'customer',
        phone: credentials.phone,
        isVerified: false,
        createdAt: new Date().toISOString(),
    };

    const token = `token_${Date.now()}`;

    return {
        success: true,
        message: 'Registration successful',
        data: {
            user: newUser,
            token,
        },
    };
};

/**
 * Mock Get User Profile
 */
export const getUserProfile = async (token: string): Promise<User> => {
    await delay(500);

    // Extract role from token (demo)
    if (token.includes('customer')) {
        return DEMO_ACCOUNTS.customer.user;
    } else if (token.includes('delivery')) {
        return DEMO_ACCOUNTS.delivery.user;
    } else if (token.includes('admin')) {
        return DEMO_ACCOUNTS.admin.user;
    }

    throw new Error('Invalid token');
};

/**
 * Mock Logout
 */
export const logout = async (): Promise<void> => {
    await delay(300);
    await AsyncStorage.removeItem(STORAGE_KEY);
};

/**
 * Save auth data to AsyncStorage
 */
export const saveAuthData = async (user: User, token: string): Promise<void> => {
    try {
        const data = JSON.stringify({ user, token });
        await AsyncStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
        console.error('Error saving auth data:', error);
        throw error;
    }
};

/**
 * Load auth data from AsyncStorage
 */
export const loadAuthData = async (): Promise<{ user: User; token: string } | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Error loading auth data:', error);
        return null;
    }
};

/**
 * Clear auth data from AsyncStorage
 */
export const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

/**
 * Check if token is valid (mock)
 */
export const verifyToken = async (token: string): Promise<boolean> => {
    await delay(300);
    return token.startsWith('demo_') || token.startsWith('token_');
};

export default {
    login,
    register,
    getUserProfile,
    logout,
    saveAuthData,
    loadAuthData,
    clearAuthData,
    verifyToken,
    DEMO_ACCOUNTS,
};
