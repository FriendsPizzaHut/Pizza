import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { NOTIFICATION_ENDPOINTS } from '../api/endpoints';

/**
 * Notification Service
 * 
 * Handles push notifications using Expo Notifications.
 * Manages permissions, device registration, and notification display.
 */

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    private pushToken: string | null = null;

    /**
     * Initialize Notification Service
     */
    async initialize(): Promise<void> {
        try {
            // Request permissions
            const hasPermission = await this.requestPermissions();

            if (hasPermission) {
                // Get push token
                this.pushToken = await this.getPushToken();

                if (this.pushToken) {
                    // Register device with backend
                    await this.registerDevice(this.pushToken);
                }
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    /**
     * Request Notification Permissions
     */
    async requestPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            console.warn('Push notifications only work on physical devices');
            return false;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Notification permissions not granted');
                return false;
            }

            // Android: Set notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: 'default',
                });

                await Notifications.setNotificationChannelAsync('orders', {
                    name: 'Orders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    sound: 'default',
                });

                await Notifications.setNotificationChannelAsync('promotions', {
                    name: 'Promotions',
                    importance: Notifications.AndroidImportance.DEFAULT,
                    sound: 'default',
                });
            }

            return true;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }

    /**
     * Get Push Token
     */
    async getPushToken(): Promise<string | null> {
        try {
            if (!Device.isDevice) {
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
            });

            if (__DEV__) {
                console.log('📱 Push Token:', token.data);
            }

            return token.data;
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }

    /**
     * Register Device with Backend
     */
    async registerDevice(token: string): Promise<void> {
        try {
            const deviceInfo = {
                token,
                platform: Platform.OS,
                deviceName: Device.deviceName,
                osVersion: Device.osVersion,
            };

            await apiClient.post(NOTIFICATION_ENDPOINTS.REGISTER_DEVICE, deviceInfo);

            // Store token locally
            await AsyncStorage.setItem('push_token', token);

            if (__DEV__) {
                console.log('✅ Device registered for notifications');
            }
        } catch (error) {
            console.error('Error registering device:', error);
        }
    }

    /**
     * Unregister Device
     */
    async unregisterDevice(): Promise<void> {
        try {
            const token = await AsyncStorage.getItem('push_token');

            if (token) {
                await apiClient.post(NOTIFICATION_ENDPOINTS.UNREGISTER_DEVICE, { token });
                await AsyncStorage.removeItem('push_token');

                if (__DEV__) {
                    console.log('✅ Device unregistered from notifications');
                }
            }
        } catch (error) {
            console.error('Error unregistering device:', error);
        }
    }

    /**
     * Schedule Local Notification
     */
    async scheduleNotification(
        title: string,
        body: string,
        data?: any,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: trigger || null, // null means immediate
            });

            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw error;
        }
    }

    /**
     * Cancel Notification
     */
    async cancelNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    }

    /**
     * Cancel All Notifications
     */
    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error canceling all notifications:', error);
        }
    }

    /**
     * Get Badge Count
     */
    async getBadgeCount(): Promise<number> {
        try {
            return await Notifications.getBadgeCountAsync();
        } catch (error) {
            console.error('Error getting badge count:', error);
            return 0;
        }
    }

    /**
     * Set Badge Count
     */
    async setBadgeCount(count: number): Promise<void> {
        try {
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Error setting badge count:', error);
        }
    }

    /**
     * Clear Badge
     */
    async clearBadge(): Promise<void> {
        await this.setBadgeCount(0);
    }

    /**
     * Get Current Push Token
     */
    getCurrentToken(): string | null {
        return this.pushToken;
    }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
