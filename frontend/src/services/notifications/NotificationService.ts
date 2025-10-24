/**
 * Notification Service
 * Handles Expo push notification registration, permissions, and foreground notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import messaging from '@react-native-firebase/messaging';
import apiClient from '../../api/apiClient';
import type { NotificationData } from '../../types/notification';

// Configure notification handler for foreground notifications
console.log('🔧 [NOTIFICATIONS] Configuring notification handler...');
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚡ [FOREGROUND-DEBUG] Notification handler called!');
        console.log('🆔 [FOREGROUND-DEBUG] ID:', notification.request.identifier);
        console.log('📦 [FOREGROUND-DEBUG] Full content:', JSON.stringify(notification.request.content, null, 2));
        console.log('📋 [FOREGROUND-DEBUG] Title:', notification.request.content.title);
        console.log('📝 [FOREGROUND-DEBUG] Body:', notification.request.content.body);
        console.log('📦 [FOREGROUND-DEBUG] Data:', notification.request.content.data);
        console.log('⏰ [FOREGROUND-DEBUG] Timestamp:', new Date().toISOString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});
console.log('✅ [NOTIFICATIONS] Notification handler configured'); class NotificationService {
    private static instance: NotificationService;
    private expoPushToken: string | null = null;
    private notificationListener: any = null;
    private responseListener: any = null;

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Request notification permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            console.log('🔍 [NOTIFICATIONS] Checking device type...');
            console.log('📱 [NOTIFICATIONS] Device.isDevice:', Device.isDevice);
            console.log('📱 [NOTIFICATIONS] Platform:', Platform.OS);

            if (!Device.isDevice) {
                console.log('❌ [NOTIFICATIONS] Must use physical device for Push Notifications');
                return false;
            }

            console.log('🔍 [NOTIFICATIONS] Getting current permission status...');
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            console.log('📋 [NOTIFICATIONS] Current permission status:', existingStatus);

            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                console.log('🙏 [NOTIFICATIONS] Requesting permissions...');
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
                console.log('📋 [NOTIFICATIONS] Permission request result:', status);
            }

            if (finalStatus !== 'granted') {
                console.log('❌ [NOTIFICATIONS] Permission denied - Final status:', finalStatus);
                return false;
            }

            console.log('✅ [NOTIFICATIONS] Permission granted - Final status:', finalStatus);
            return true;
        } catch (error) {
            console.error('❌ [NOTIFICATIONS] Error requesting permissions:', error);
            console.error('❌ [NOTIFICATIONS] Error stack:', (error as Error).stack);
            return false;
        }
    }    /**
   * Get Expo push token
   */
    async getExpoPushToken(): Promise<string | null> {
        try {
            console.log('🔍 [NOTIFICATIONS] Getting FCM push token...');

            if (!Device.isDevice) {
                console.log('❌ [NOTIFICATIONS] Physical device required');
                return null;
            }

            // Get FCM token from Firebase Messaging
            console.log('📡 [NOTIFICATIONS] Requesting FCM token from Firebase...');
            const fcmToken = await messaging().getToken();

            this.expoPushToken = fcmToken;
            console.log('✅ [NOTIFICATIONS] FCM push token received:', fcmToken.substring(0, 30) + '...');
            console.log('📏 [NOTIFICATIONS] Token length:', fcmToken.length);
            console.log('🔍 [NOTIFICATIONS] Token type: FCM (Firebase Cloud Messaging)');

            return this.expoPushToken;
        } catch (error) {
            console.error('❌ [NOTIFICATIONS] Error getting FCM token:', error);
            console.error('❌ [NOTIFICATIONS] Error details:', JSON.stringify(error, null, 2));
            console.error('❌ [NOTIFICATIONS] Error stack:', (error as Error).stack);
            return null;
        }
    }

    /**
     * Register device token with backend
     */
    async registerDeviceToken(
        userId: string,
        userRole: 'admin' | 'delivery' | 'customer'
    ): Promise<boolean> {
        try {
            const token = await this.getExpoPushToken();
            if (!token) {
                console.error('❌ [NOTIFICATIONS] No push token available');
                return false;
            }

            const API_URL = __DEV__
                ? Constants.expoConfig?.extra?.apiUrlDevelopment || 'http://localhost:5000/api/v1'
                : Constants.expoConfig?.extra?.apiUrlProduction || 'https://pizzabackend-u9ui.onrender.com/api/v1';

            const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

            console.log('📤 [NOTIFICATIONS] Registering token with backend...');
            console.log('📍 [NOTIFICATIONS] URL:', `${API_URL}/device-tokens`);
            console.log('📦 [NOTIFICATIONS] Payload:', { userId, userRole, deviceType, platform: 'fcm', tokenLength: token.length });

            const response = await apiClient.post(
                '/device-tokens',
                {
                    token,
                    userId,
                    userRole,
                    deviceType,
                    platform: 'fcm', // Using Firebase Cloud Messaging tokens
                }
            );

            if (response.data.success) {
                console.log('✅ [NOTIFICATIONS] Token registered successfully');
                return true;
            } else {
                console.error('❌ [NOTIFICATIONS] Failed to register token:', response.data);
                return false;
            }
        } catch (error: any) {
            console.error('❌ [NOTIFICATIONS] Error registering token:', error.message);
            return false;
        }
    }

    /**
     * Initialize notification system
     */
    async initialize(
        userId: string,
        userRole: 'admin' | 'delivery' | 'customer',
        onNotificationReceived?: (notification: Notifications.Notification) => void,
        onNotificationTap?: (response: Notifications.NotificationResponse) => void
    ): Promise<boolean> {
        try {
            console.log('🔔 [NOTIFICATIONS] Initializing notification system...');

            // Request permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.warn('⚠️ [NOTIFICATIONS] No permission, skipping token registration');
                return false;
            }

            // Register device token
            const registered = await this.registerDeviceToken(userId, userRole);
            if (!registered) {
                console.warn('⚠️ [NOTIFICATIONS] Token registration failed');
                return false;
            }

            // Set up notification listeners
            console.log('🎧 [NOTIFICATIONS] Setting up notification listeners...');
            this.setupListeners(onNotificationReceived, onNotificationTap);
            console.log('✅ [NOTIFICATIONS] Listeners setup complete');

            // Configure notification channel for Android
            if (Platform.OS === 'android') {
                console.log('📱 [NOTIFICATIONS] Configuring Android notification channel...');
                const channel = await Notifications.setNotificationChannelAsync('orders', {
                    name: 'Orders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF6B35',
                    sound: 'default',
                });
                console.log('✅ [NOTIFICATIONS] Android channel created:', JSON.stringify(channel, null, 2));

                // Get all channels to verify
                const channels = await Notifications.getNotificationChannelsAsync();
                console.log('📋 [NOTIFICATIONS] All notification channels:', channels.length);
                channels.forEach(ch => {
                    console.log(`   - ${ch.id}: ${ch.name} (importance: ${ch.importance})`);
                });
            }

            console.log('✅ [NOTIFICATIONS] Initialization complete');
            return true;
        } catch (error) {
            console.error('❌ [NOTIFICATIONS] Initialization failed:', error);
            return false;
        }
    }

    /**
     * Set up notification listeners
     */
    private setupListeners(
        onNotificationReceived?: (notification: Notifications.Notification) => void,
        onNotificationTap?: (response: Notifications.NotificationResponse) => void
    ): void {
        // Add Firebase foreground message listener
        messaging().onMessage(async (remoteMessage) => {
            // Schedule a local notification to display Firebase message in foreground
            if (remoteMessage.notification) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: remoteMessage.notification.title || 'Notification',
                        body: remoteMessage.notification.body || '',
                        data: remoteMessage.data || {},
                        sound: 'default',
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                    },
                    trigger: null, // Show immediately
                });
                console.log('✅ [FIREBASE-FIX] Local notification scheduled successfully');
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
        console.log('✅ [FIREBASE-DEBUG] Firebase foreground listener registered');

        // Listener for notifications received while app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📬 [EXPO-FOREGROUND-DEBUG] Expo notification received (foreground)');
            console.log('📦 [EXPO-FOREGROUND-DEBUG] Full notification:', JSON.stringify(notification, null, 2));
            console.log('� [EXPO-FOREGROUND-DEBUG] Content:', notification.request.content);
            console.log('⏰ [EXPO-FOREGROUND-DEBUG] Timestamp:', new Date().toISOString());
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            } else {
                console.warn('⚠️ [NOTIFICATIONS] No onNotificationReceived callback');
            }
        });
        console.log('✅ [NOTIFICATIONS] Foreground listener registered');

        // Listener for when user taps on notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('👆 [NOTIFICATIONS] Notification tapped:', response);
            if (onNotificationTap) {
                onNotificationTap(response);
            } else {
                console.warn('⚠️ [NOTIFICATIONS] No onNotificationTap callback');
            }
        });
        console.log('✅ [NOTIFICATIONS] Tap listener registered');
    }

    /**
     * Deactivate device token on logout
     * Removes the token from backend to stop receiving notifications
     */
    async deactivateDeviceToken(userId: string): Promise<boolean> {
        try {
            const token = this.expoPushToken;
            if (!token) {
                console.warn('⚠️ [NOTIFICATIONS] No token to deactivate');
                return true; // Not an error, just no token registered
            }

            console.log('🔕 [NOTIFICATIONS] Deactivating device token...');
            console.log('  - User ID:', userId);
            console.log('  - Token length:', token.length);

            // Call backend to deactivate the token
            const response = await apiClient.delete(
                `/device-tokens/${encodeURIComponent(token)}`
            );

            if (response.data.success) {
                console.log('✅ [NOTIFICATIONS] Token deactivated successfully');
                this.expoPushToken = null; // Clear local reference
                return true;
            } else {
                console.error('❌ [NOTIFICATIONS] Failed to deactivate token:', response.data);
                return false;
            }
        } catch (error: any) {
            console.error('❌ [NOTIFICATIONS] Error deactivating token:', error.message);
            // Don't fail logout even if token deactivation fails
            // The backend will also deactivate tokens as a fallback
            return false;
        }
    }

    /**
     * Clean up listeners
     */
    cleanup(): void {
        if (this.notificationListener) {
            this.notificationListener.remove();
            this.notificationListener = null;
        }
        if (this.responseListener) {
            this.responseListener.remove();
            this.responseListener = null;
        }
        console.log('🧹 [NOTIFICATIONS] Cleanup complete');
    }

    /**
     * Show local notification (for testing)
     */
    async showLocalNotification(title: string, body: string, data?: NotificationData): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: (data as any) || {},
                    sound: 'default',
                },
                trigger: null, // Show immediately
            });
        } catch (error) {
            console.error('❌ [NOTIFICATIONS] Error showing local notification:', error);
        }
    }

    /**
     * Get current push token
     */
    getCurrentToken(): string | null {
        return this.expoPushToken;
    }
}

export default NotificationService.getInstance();
