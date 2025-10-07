/**
 * Notification Service
 * 
 * Business logic for notification management.
 * Handles creating and retrieving user notifications.
 * Emits real-time Socket.IO events when notifications are created
 */

import Notification from '../models/Notification.js';
import { emitNewNotification } from '../socket/events.js';

/**
 * Get user notifications
 * @param {String} userId - User ID
 * @param {Boolean} isRead - Filter by read status (optional)
 * @returns {Array} - List of notifications
 */
export const getUserNotifications = async (userId, isRead = null) => {
    const query = { user: userId };

    if (isRead !== null) {
        query.isRead = isRead;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

    return notifications;
};

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 * @returns {Object} - Updated notification
 */
export const markAsRead = async (notificationId) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }

    notification.isRead = true;
    await notification.save();

    return notification;
};

/**
 * Create notification
 * @param {Object} notificationData - Notification data
 * @returns {Object} - Created notification
 */
export const createNotification = async (notificationData) => {
    const notification = await Notification.create(notificationData);

    // Emit real-time notification to user
    emitNewNotification(notification);

    return notification;
};

/**
 * Mark all user notifications as read
 * @param {String} userId - User ID
 * @returns {Object} - Update result
 */
export const markAllAsRead = async (userId) => {
    const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
    );

    return {
        message: `Marked ${result.modifiedCount} notifications as read`,
        count: result.modifiedCount,
    };
};

export default {
    getUserNotifications,
    markAsRead,
    createNotification,
    markAllAsRead,
};
