/**
 * Firebase Cloud Messaging Service
 * 
 * Sends push notifications directly via Firebase Admin SDK (HTTP v1 API)
 * This replaces Expo's push service for better reliability and modern API support
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DeviceToken from '../../models/DeviceToken.js';
import logger from '../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
    if (firebaseInitialized) {
        return;
    }

    try {
        // Try to load service account from file
        const serviceAccountPath = join(__dirname, '../../../firebase-service-account.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });

        firebaseInitialized = true;
        logger.info('[FIREBASE] Firebase Admin SDK initialized successfully');
    } catch (error) {
        logger.error('[FIREBASE] Failed to initialize Firebase Admin SDK:', error.message);
        logger.error('[FIREBASE] Make sure firebase-service-account.json exists in backend root directory');
        throw new Error('Firebase initialization failed. Check service account configuration.');
    }
};

/**
 * Send notification to specific device tokens
 * @param {Array<string>} tokens - FCM device tokens
 * @param {Object} notification - Notification payload
 * @param {Object} data - Additional data payload
 */
export const sendToDevices = async (tokens, notification, data = {}) => {
    initializeFirebase();

    if (!tokens || tokens.length === 0) {
        logger.warn('[FIREBASE] No tokens provided for notification');
        return { success: false, error: 'No tokens provided' };
    }

    try {
        // Filter out Expo tokens (only use FCM tokens)
        const fcmTokens = tokens.filter(token => !token.startsWith('ExponentPushToken['));
        const skippedExpoTokens = tokens.length - fcmTokens.length;

        if (skippedExpoTokens > 0) {
            logger.info(`[FIREBASE] Skipped ${skippedExpoTokens} Expo tokens (use FCM tokens only)`);
        }

        if (fcmTokens.length === 0) {
            logger.warn('[FIREBASE] No valid FCM tokens after filtering');
            return { success: false, error: 'No valid FCM tokens' };
        }

        // Convert all data values to strings (Firebase requirement)
        const stringData = {};
        if (data) {
            Object.keys(data).forEach(key => {
                stringData[key] = String(data[key]);
            });
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: stringData,
            android: {
                priority: 'high',
                notification: {
                    channelId: 'orders',
                    sound: 'default',
                    priority: 'high',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    visibility: 'public',
                    notificationCount: 1,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };

        // Send to multiple devices
        const results = await Promise.allSettled(
            fcmTokens.map((token, index) => {
                return admin.messaging().send({
                    ...message,
                    token,
                });
            })
        );

        // Process results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        logger.info(`[FIREBASE] Sent notifications: ${successful} successful, ${failed} failed`);

        // Log failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                logger.error(`[FIREBASE] Failed to send to token ${index}:`, result.reason.message);

                // Handle invalid tokens - mark as inactive
                if (result.reason.code === 'messaging/invalid-registration-token' ||
                    result.reason.code === 'messaging/registration-token-not-registered' ||
                    result.reason.code === 'messaging/invalid-argument') {
                    logger.info(`[FIREBASE] Marking invalid token ${index} as inactive`);
                    DeviceToken.findOneAndUpdate(
                        { token: fcmTokens[index] },
                        { isActive: false }
                    ).catch(err => logger.error('[FIREBASE] Error updating token:', err));
                }
            }
        });

        return {
            success: successful > 0,
            successCount: successful,
            failureCount: failed,
            results,
        };

    } catch (error) {
        logger.error('[FIREBASE] Error sending notifications:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Send notification to users by user IDs
 */
export const sendNotificationToUsers = async (userIds, type, notificationData) => {
    try {
        logger.info(`[FIREBASE] Sending ${type} notification to ${userIds.length} users`);

        // Get active device tokens for these users
        const deviceTokens = await DeviceToken.find({
            userId: { $in: userIds },
            isActive: true,
        });

        if (deviceTokens.length === 0) {
            logger.warn('[FIREBASE] No active device tokens found for users');
            return { success: false, error: 'No active tokens' };
        }

        const tokens = deviceTokens.map(dt => dt.token);
        logger.info(`[FIREBASE] Found ${tokens.length} device tokens`);

        // Get notification template
        const notification = getNotificationTemplate(type, notificationData);

        // Send notifications
        const result = await sendToDevices(tokens, notification, {
            type,
            ...notificationData,
        });

        return result;

    } catch (error) {
        logger.error('[FIREBASE] Error in sendNotificationToUsers:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification to all users with a specific role
 */
export const sendNotificationToRole = async (role, type, notificationData) => {
    try {
        logger.info(`[FIREBASE] Sending ${type} notification to all ${role}s`);

        // Get active device tokens for this role
        const deviceTokens = await DeviceToken.findActiveByRole(role);

        if (deviceTokens.length === 0) {
            logger.warn(`[FIREBASE] No active device tokens found for role: ${role}`);
            return { success: false, error: 'No active tokens' };
        }

        const tokens = deviceTokens.map(dt => dt.token);
        logger.info(`[FIREBASE] Found ${tokens.length} device tokens for ${role}s`);

        // Get notification template
        const notification = getNotificationTemplate(type, notificationData);

        // Send notifications
        const result = await sendToDevices(tokens, notification, {
            type,
            ...notificationData,
        });

        return result;

    } catch (error) {
        logger.error('[FIREBASE] Error in sendNotificationToRole:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Notify all admins about a new order
 */
export const notifyAdminsNewOrder = async (order) => {
    try {
        logger.info(`[FIREBASE] Notifying admins about new order: ${order.orderNumber}`);

        const notificationData = {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            itemCount: order.items?.length || 0,
            total: order.totalAmount,
            customerName: order.deliveryAddress?.name || 'Customer',
        };

        return await sendNotificationToRole('admin', 'order:new', notificationData);

    } catch (error) {
        logger.error('[FIREBASE] Error notifying admins:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Notify delivery agent about order assignment
 */
export const notifyDeliveryAgentOrderAssigned = async (order, deliveryAgentId) => {
    try {
        logger.info(`[FIREBASE] Notifying delivery agent ${deliveryAgentId} about order: ${order.orderNumber}`);

        const notificationData = {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            itemCount: order.items?.length || 0,
            total: order.totalAmount,
            customerName: order.deliveryAddress?.name || 'Customer',
            customerAddress: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`,
            customerPhone: order.contactPhone,
        };

        return await sendNotificationToUsers([deliveryAgentId], 'order:assigned', notificationData);

    } catch (error) {
        logger.error('[FIREBASE] Error notifying delivery agent:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Notification templates
 */
const getNotificationTemplate = (type, data) => {
    const templates = {
        'order:new': {
            title: '🍕 New Order!',
            body: `Order #${data.orderNumber || data.orderId} - ${data.itemCount} items • ₹${data.total}`,
        },
        'order:assigned': {
            title: '� New Delivery Assignment!',
            body: `Order #${data.orderNumber} - ${data.itemCount} items • ₹${data.total}\nDeliver to: ${data.customerName}`,
        },
        'order:ready': {
            title: '✅ Order Ready',
            body: `Order #${data.orderNumber} is ready for pickup`,
        },
        'order:out_for_delivery': {
            title: '🚚 Out for Delivery',
            body: `Your order is on its way! ETA: ${data.eta || '15-20 mins'}`,
        },
        'order:delivered': {
            title: '🎉 Order Delivered',
            body: `Order #${data.orderNumber} has been delivered. Enjoy your meal!`,
        },
        'test': {
            title: data.title || '🔔 Test Notification',
            body: data.body || 'This is a test notification from Firebase',
        },
    };

    return templates[type] || {
        title: 'Notification',
        body: 'You have a new notification',
    };
};

export default {
    sendToDevices,
    sendNotificationToUsers,
    sendNotificationToRole,
    notifyAdminsNewOrder,
    notifyDeliveryAgentOrderAssigned,
};
