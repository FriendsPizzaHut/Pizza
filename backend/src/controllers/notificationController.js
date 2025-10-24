/**
 * Notification Controller
 * 
 * Handles notification operations:
 * - Get user notifications
 * - Mark notification as read
 * 
 * Controllers orchestrate request/response only - business logic in services
 */

import * as notificationService from '../services/notificationService.js';
import { sendResponse } from '../utils/response.js';

/**
 * Get user notifications
 * GET /api/v1/notifications (uses authenticated user)
 * GET /api/v1/notifications/:userId (admin access)
 * @access Private
 */
export const getUserNotifications = async (req, res, next) => {
    try {
        // Use authenticated user's ID if no userId param provided
        const userId = req.params.userId || req.user._id;

        const result = await notificationService.getUserNotifications(
            userId,
            req.query
        );
        sendResponse(res, 200, 'Notifications retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);
        sendResponse(res, 200, 'Unread count retrieved successfully', { count });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id);
        sendResponse(res, 200, 'Notification marked as read', notification);
    } catch (error) {
        next(error);
    }
};

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/read-all
 * @access Private
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        const result = await notificationService.markAllAsRead(req.user._id);
        sendResponse(res, 200, result.message, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 * @access Private
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const result = await notificationService.deleteNotification(
            req.params.id,
            req.user._id
        );
        sendResponse(res, 200, result.message);
    } catch (error) {
        next(error);
    }
};

export default {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
