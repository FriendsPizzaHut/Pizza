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
 * @param {Object} query - Query parameters (isRead, page, limit, type, priority)
 * @returns {Object} - Paginated notifications with counts
 */
export const getUserNotifications = async (userId, query = {}) => {
    const filter = { user: userId };

    // Filter by read status
    if (query.isRead !== undefined && query.isRead !== null) {
        filter.isRead = query.isRead === 'true' || query.isRead === true;
    }

    // Filter by type
    if (query.type) {
        filter.type = query.type;
    }

    // Filter by priority
    if (query.priority) {
        filter.priority = query.priority;
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get notifications
    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Get total count
    const totalCount = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
        user: userId,
        isRead: false
    });

    return {
        notifications,
        totalCount,
        unreadCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
    };
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
    notification.readAt = new Date();
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
        {
            isRead: true,
            readAt: new Date()
        }
    );

    return {
        message: `Marked ${result.modifiedCount} notifications as read`,
        count: result.modifiedCount,
    };
};

/**
 * Get unread notification count for user
 * @param {String} userId - User ID
 * @returns {Number} - Unread count
 */
export const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({
        user: userId,
        isRead: false
    });

    return count;
};

/**
 * Delete notification
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Object} - Delete result
 */
export const deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }

    // Verify user owns this notification
    if (notification.user.toString() !== userId.toString()) {
        const error = new Error('Not authorized to delete this notification');
        error.statusCode = 403;
        throw error;
    }

    await Notification.findByIdAndDelete(notificationId);

    return {
        message: 'Notification deleted successfully',
    };
};

export default {
    getUserNotifications,
    markAsRead,
    createNotification,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
};
