import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import {
    loginStart,
    loginSuccess,
    loginFailure,
    logout as logoutAction,
} from '../../redux/slices/authSlice';
import * as authService from '../api/authService';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

/**
 * useAuth Hook
 * 
 * Provides authentication functionality and state.
 * Handles login, logout, registration, and session management.
 */

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const authState = useSelector((state: RootState) => state.auth);

    /**
     * Login
     */
    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            dispatch(loginStart());

            // Call auth service
            const response = await authService.login(credentials);

            if (response.success) {
                const { user, token } = response.data;

                // Save to AsyncStorage
                await authService.saveAuthData(user, token);

                // Update Redux state
                dispatch(loginSuccess({
                    token,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    userId: user.id,
                }));

                // Navigate based on role
                redirectToRoleDashboard(user.role);
            } else {
                dispatch(loginFailure());
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            dispatch(loginFailure());
            throw error;
        }
    };

    /**
     * Register
     */
    const register = async (credentials: RegisterCredentials): Promise<void> => {
        try {
            dispatch(loginStart());

            // Call auth service
            const response = await authService.register(credentials);

            if (response.success) {
                const { user, token } = response.data;

                // Save to AsyncStorage
                await authService.saveAuthData(user, token);

                // Update Redux state
                dispatch(loginSuccess({
                    token,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    userId: user.id,
                }));

                // Navigate based on role
                redirectToRoleDashboard(user.role);
            } else {
                dispatch(loginFailure());
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            dispatch(loginFailure());
            throw error;
        }
    };

    /**
     * Logout
     */
    const logout = async (): Promise<void> => {
        try {
            // Call auth service to clear storage
            await authService.clearAuthData();

            // Update Redux state
            dispatch(logoutAction());

            // Navigate to login
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    /**
     * Redirect to role-specific dashboard
     */
    const redirectToRoleDashboard = (role: string) => {
        switch (role) {
            case 'customer':
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'CustomerTabs' }],
                });
                break;
            case 'delivery':
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'DeliveryDashboard' }],
                });
                break;
            case 'admin':
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminDashboard' }],
                });
                break;
            default:
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
        }
    };

    /**
     * Get demo accounts
     */
    const getDemoAccounts = () => authService.DEMO_ACCOUNTS;

    return {
        // State
        ...authState,

        // Actions
        login,
        register,
        logout,

        // Helpers
        getDemoAccounts,
    };
};

export default useAuth;
