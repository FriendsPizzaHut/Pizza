import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import { restoreAuthState, setLoading } from '../../redux/slices/authSlice';
import { loadAuthData } from '../api/authService';
import { User } from '../types/auth';

/**
 * useAuthRedirect Hook
 * 
 * Handles automatic session restoration and role-based navigation on app startup.
 * - Checks AsyncStorage for saved auth data
 * - Restores Redux state if valid session found
 * - Redirects to appropriate screen based on authentication status and role
 */

export const useAuthRedirect = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const { isAuthenticated, role, isLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            try {
                dispatch(setLoading(true));

                // Load auth data from AsyncStorage
                const authData = await loadAuthData();

                if (authData && authData.token && authData.user) {
                    // Restore auth state in Redux
                    dispatch(restoreAuthState({
                        token: authData.token,
                        role: authData.user.role,
                        name: authData.user.name,
                        email: authData.user.email,
                        userId: authData.user.id,
                    }));

                    // Navigate based on role
                    redirectToRoleDashboard(authData.user.role);
                } else {
                    // No saved auth data, go to login
                    dispatch(setLoading(false));
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            } catch (error) {
                console.error('Error in auth redirect:', error);
                dispatch(setLoading(false));
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        };

        checkAuthAndRedirect();
    }, []);

    // Redirect based on role
    const redirectToRoleDashboard = (userRole: string) => {
        dispatch(setLoading(false));

        switch (userRole) {
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

    return {
        isAuthenticated,
        role,
        isLoading,
        redirectToRoleDashboard,
    };
};

export default useAuthRedirect;
