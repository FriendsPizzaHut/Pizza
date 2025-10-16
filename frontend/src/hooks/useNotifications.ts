import { useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/notifications/NotificationService';
import type { NotificationInitOptions, NotificationData } from '../types/notification';

/**
 * Notifications Hook
 * 
 * React hook for managing notification lifecycle with memoized callbacks and cleanup
 * 
 * @example
 * ```tsx
 * const { initialize, cleanup } = useNotifications({
 *   userId: user._id,
 *   userRole: 'admin',
 *   onNotificationReceived: (notification) => {
 *     Toast.show({ type: 'info', text1: notification.request.content.title });
 *   },
 *   onNotificationTap: (response) => {
 *     const orderId = response.notification.request.content.data.orderId;
 *     navigation.navigate('OrderDetails', { orderId });
 *   }
 * });
 * ```
 */

interface UseNotificationsReturn {
    initialize: () => Promise<boolean>;
    cleanup: () => void;
    showLocalNotification: (title: string, body: string, data?: NotificationData) => Promise<void>;
    currentToken: string | null;
}

export const useNotifications = (
    options: NotificationInitOptions
): UseNotificationsReturn => {
    const { userId, userRole, onNotificationReceived, onNotificationTap } = options;
    const isInitializedRef = useRef(false);

    // Memoized notification received handler
    const handleNotificationReceived = useCallback(
        (notification: Notifications.Notification) => {
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        },
        [onNotificationReceived]
    );

    // Memoized notification tap handler
    const handleNotificationTap = useCallback(
        (response: Notifications.NotificationResponse) => {
            if (onNotificationTap) {
                onNotificationTap(response);
            }
        },
        [onNotificationTap]
    );

    // Initialize notification system
    const initialize = useCallback(async (): Promise<boolean> => {
        if (isInitializedRef.current) {
            console.log('⚠️ [useNotifications] Already initialized, skipping');
            return true;
        }

        try {
            console.log('🔔 [useNotifications] Initializing for:', { userId, userRole });

            const success = await NotificationService.initialize(
                userId,
                userRole,
                handleNotificationReceived,
                handleNotificationTap
            );

            if (success) {
                isInitializedRef.current = true;
                console.log('✅ [useNotifications] Initialization successful');
            } else {
                console.warn('⚠️ [useNotifications] Initialization failed');
            }

            return success;
        } catch (error) {
            console.error('❌ [useNotifications] Initialization error:', error);
            return false;
        }
    }, [userId, userRole, handleNotificationReceived, handleNotificationTap]);

    // Cleanup notification listeners
    const cleanup = useCallback(() => {
        console.log('🧹 [useNotifications] Cleaning up');
        NotificationService.cleanup();
        isInitializedRef.current = false;
    }, []);

    // Show local notification (for testing)
    const showLocalNotification = useCallback(
        async (title: string, body: string, data?: NotificationData): Promise<void> => {
            try {
                await NotificationService.showLocalNotification(title, body, data);
            } catch (error) {
                console.error('❌ [useNotifications] Error showing local notification:', error);
            }
        },
        []
    );

    // Get current token
    const getCurrentToken = useCallback((): string | null => {
        return NotificationService.getCurrentToken();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isInitializedRef.current) {
                cleanup();
            }
        };
    }, [cleanup]);

    return {
        initialize,
        cleanup,
        showLocalNotification,
        currentToken: getCurrentToken(),
    };
};

export default useNotifications;
