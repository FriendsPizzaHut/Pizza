/**
 * NotificationInitializer Component
 * Initializes push notifications for authenticated users
 */

import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { RootState } from '../../../redux/store';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationInitializerProps {
    enabled?: boolean;
}

/**
 * Component to initialize push notifications
 * Should be placed in each role's main navigator
 * 
 * @example
 * ```tsx
 * // In AdminNavigator.tsx
 * function AdminNavigator() {
 *   return (
 *     <>
 *       <NotificationInitializer />
 *       <Stack.Navigator>
 *         ...
 *       </Stack.Navigator>
 *     </>
 *   );
 * }
 * ```
 */
export const NotificationInitializer: React.FC<NotificationInitializerProps> = ({
    enabled = true
}) => {
    const navigation = useNavigation<any>();
    const { userId, role, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Handle notification received while app is open (foreground)
    const handleNotificationReceived = useCallback((notification: any) => {
        console.log('📬 [NotificationInitializer] Foreground notification:', notification);

        const { title, body } = notification.request.content;

        // Show alert for foreground notifications
        if (title || body) {
            Alert.alert(
                title || 'New Notification',
                body || '',
                [{ text: 'OK', style: 'default' }],
                { cancelable: true }
            );
        }
    }, []);

    // Handle notification tap (user clicked on notification)
    const handleNotificationTap = useCallback((response: any) => {
        console.log('👆 [NotificationInitializer] Notification tapped:', response);

        const data = response.notification.request.content.data;

        // Navigate based on notification type
        if (data?.type === 'order:new' || data?.type === 'order:assigned' || data?.type === 'order:status:update') {
            const orderId = data.orderId;

            if (orderId) {
                console.log('📍 [NotificationInitializer] Navigating to order:', orderId);

                // Navigate to order details based on role
                if (role === 'admin') {
                    navigation.navigate('OrderManagement', {
                        screen: 'OrderDetails',
                        params: { orderId }
                    });
                } else if (role === 'delivery') {
                    navigation.navigate('Orders', {
                        screen: 'OrderDetails',
                        params: { orderId }
                    });
                } else if (role === 'customer') {
                    navigation.navigate('Orders', {
                        screen: 'OrderDetails',
                        params: { orderId }
                    });
                }
            }
        }
    }, [navigation, role]);

    // Initialize notifications hook
    const { initialize, cleanup } = useNotifications({
        userId: userId || '',
        userRole: (role as 'admin' | 'delivery' | 'customer') || 'customer',
        onNotificationReceived: handleNotificationReceived,
        onNotificationTap: handleNotificationTap,
    });

    // Initialize on mount if authenticated and enabled
    useEffect(() => {
        if (!enabled || !isAuthenticated || !userId || !role) {
            console.log('⏭️ [NotificationInitializer] Skipping initialization:', {
                enabled,
                isAuthenticated,
                userId: !!userId,
                role
            });
            return;
        }

        console.log('🚀 [NotificationInitializer] Starting initialization for:', { userId, role });
        initialize();

        // Cleanup on unmount
        return () => {
            console.log('🧹 [NotificationInitializer] Cleaning up');
            cleanup();
        };
    }, [enabled, isAuthenticated, userId, role, initialize, cleanup]);

    // This component doesn't render anything
    return null;
};

export default NotificationInitializer;
