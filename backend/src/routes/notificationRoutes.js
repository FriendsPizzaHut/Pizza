/**
 * Notification Routes
 * 
 * Routes:
 * - GET /api/notifications - Get authenticated user's notifications
 * - GET /api/notifications/unread-count - Get unread count
 * - GET /api/notifications/:userId - Get user notifications (admin access)
 * - PATCH /api/notifications/:id/read - Mark notification as read
 * - PATCH /api/notifications/read-all - Mark all as read
 * - DELETE /api/notifications/:id - Delete notification
 */

import express from 'express';
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get unread count (must be before /:userId route)
router.get('/unread-count', protect, getUnreadCount);

// Mark all as read (must be before /:id routes)
router.patch('/read-all', protect, markAllAsRead);

// Get authenticated user's notifications
router.get('/', protect, getUserNotifications);

// Get user notifications (with userId param for admin)
router.get('/:userId', protect, getUserNotifications);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

export default router;
