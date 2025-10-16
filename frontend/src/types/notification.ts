/**
 * Notification Type Definitions
 * Types for push notifications and notification handlers
 */

import type * as Notifications from 'expo-notifications';

export interface NotificationData {
    type: 'order:new' | 'order:assigned' | 'order:status:update' | 'order:delivered';
    orderId: string;
    orderNumber?: string;
    customerName?: string;
    amount?: number;
    itemCount?: number;
    status?: string;
    title?: string;
    body?: string;
    deliveryAgentId?: string;
    deliveryAgentName?: string;
    previousStatus?: string;
    timestamp?: number;
}

export interface PushNotificationPayload {
    to: string | string[];
    sound: 'default';
    title: string;
    body: string;
    data: NotificationData;
    priority?: 'default' | 'normal' | 'high';
    channelId?: string;
}

export interface DeviceTokenData {
    token: string;
    userId: string;
    userRole: 'admin' | 'delivery' | 'customer';
    deviceType: 'android' | 'ios';
}

export interface NotificationResponse {
    notification: {
        request: {
            content: {
                title: string;
                body: string;
                data: NotificationData;
            };
        };
    };
    actionIdentifier: string;
}

/**
 * Notification handler callback types
 */
export type NotificationReceivedHandler = (
    notification: Notifications.Notification
) => void;

export type NotificationTapHandler = (
    response: Notifications.NotificationResponse
) => void;

/**
 * Notification service initialization options
 */
export interface NotificationInitOptions {
    userId: string;
    userRole: 'admin' | 'delivery' | 'customer';
    onNotificationReceived?: NotificationReceivedHandler;
    onNotificationTap?: NotificationTapHandler;
}
