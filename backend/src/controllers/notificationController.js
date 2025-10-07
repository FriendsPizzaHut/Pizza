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
 * GET /api/v1/notifications/:userId
 * @access Private
 */
export const getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(
            req.params.userId,
            req.query
        );
        sendResponse(res, 200, 'Notifications retrieved successfully', notifications);
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

export default {
    getUserNotifications,
    markAsRead,
};
