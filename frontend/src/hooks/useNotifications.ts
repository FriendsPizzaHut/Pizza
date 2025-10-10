import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notifications';

/**
 * Notifications Hook
 * 
 * Provides notification functionality and event handlers.
 * Handles incoming notifications and user interactions.
 */

export interface NotificationData {
    title: string;
    body: string;
    data?: any;
}

export const useNotifications = () => {
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    /**
     * Initialize Notifications
     */
    useEffect(() => {
        const init = async () => {
            try {
                await notificationService.initialize();
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        init();
    }, []);

    /**
     * Setup Notification Listeners
     */
    useEffect(() => {
        // Listener for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                if (__DEV__) {
                    console.log('📬 Notification received:', notification);
                }
                setNotification(notification);
            }
        );

        // Listener for when user taps on notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                if (__DEV__) {
                    console.log('👆 Notification tapped:', response);
                }

                const data = response.notification.request.content.data;
                handleNotificationTap(data);
            }
        );

        // Cleanup listeners
        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    /**
     * Handle Notification Tap
     */
    const handleNotificationTap = (data: any) => {
        // This will be customized based on notification type
        if (__DEV__) {
            console.log('Handling notification tap with data:', data);
        }

        // Navigate to appropriate screen based on notification data
        if (data?.type === 'order') {
            // Navigate to order details
            // navigation.navigate('OrderDetails', { orderId: data.orderId });
        } else if (data?.type === 'promotion') {
            // Navigate to promotions/offers
            // navigation.navigate('Offers');
        }
    };

    /**
     * Schedule Local Notification
     */
    const scheduleNotification = async (
        title: string,
        body: string,
        data?: any,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string | null> => {
        try {
            const notificationId = await notificationService.scheduleNotification(
                title,
                body,
                data,
                trigger
            );
            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    };

    /**
     * Cancel Notification
     */
    const cancelNotification = async (notificationId: string): Promise<void> => {
        await notificationService.cancelNotification(notificationId);
    };

    /**
     * Cancel All Notifications
     */
    const cancelAllNotifications = async (): Promise<void> => {
        await notificationService.cancelAllNotifications();
    };

    /**
     * Set Badge Count
     */
    const setBadgeCount = async (count: number): Promise<void> => {
        await notificationService.setBadgeCount(count);
    };

    /**
     * Clear Badge
     */
    const clearBadge = async (): Promise<void> => {
        await notificationService.clearBadge();
    };

    /**
     * Get Push Token
     */
    const getPushToken = (): string | null => {
        return notificationService.getCurrentToken();
    };

    return {
        notification,
        isInitialized,
        scheduleNotification,
        cancelNotification,
        cancelAllNotifications,
        setBadgeCount,
        clearBadge,
        getPushToken,
    };
};

export default useNotifications;
