import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import {
    loginStart,
    loginSuccess,
    loginFailure,
    logout as logoutAction,
} from '../../redux/slices/authSlice';
import * as authService from '../services/authService';
import { Alert } from 'react-native';

/**
 * useAuth Hook
 * 
 * Provides authentication functionality and state.
 * Handles login, logout, registration, and session management.
 * Updated to work with real backend API.
 */

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const authState = useSelector((state: RootState) => state.auth);

    /**
     * Login
     */
    const login = async (credentials: { email: string; password: string }): Promise<void> => {
        try {
            dispatch(loginStart());

            // Call real auth service
            const response = await authService.login(credentials);

            if (response.success) {
                const { user, token } = response;

                // Update Redux state (AsyncStorage is handled by authService)
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
    const register = async (credentials: authService.SignupData): Promise<void> => {
        try {
            dispatch(loginStart());

            // Call real auth service (signup function)
            const response = await authService.signup(credentials);

            if (response.success) {
                // Check if delivery boy requiring approval
                if (response.requiresApproval) {
                    dispatch(loginFailure());
                    Alert.alert(
                        'Registration Successful!',
                        response.message || 'Your account is awaiting admin approval. You will be able to login once approved.',
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.navigate('Login' as never),
                            },
                        ]
                    );
                    return;
                }

                // Auto-login for customers and admins
                const { user, token } = response;

                // Update Redux state (AsyncStorage is handled by authService)
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
            // Call real auth service (handles AsyncStorage and backend)
            await authService.logout();

            // Clear Redux state
            dispatch(logoutAction());

            // Navigate to login
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Clear local state even if backend call fails
            dispatch(logoutAction());
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
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
                    routes: [{ name: 'DeliveryTabs' }],
                });
                break;
            case 'admin':
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminTabs' }],
                });
                break;
            default:
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
        }
    };

    return {
        // State
        ...authState,

        // Actions
        login,
        register,
        logout,
    };
};

// Export both named and default
export default useAuth;
