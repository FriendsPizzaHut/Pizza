/**
 * Notification Routes
 * 
 * Routes:
 * - GET /api/notifications/:userId - Get user notifications (with optional isRead filter)
 * - PATCH /api/notifications/:id/read - Mark notification as read
 */

import express from 'express';
import {
    getUserNotifications,
    markAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get user notifications (authenticated users - with optional isRead query param)
router.get('/:userId', protect, getUserNotifications);

// Mark notification as read (authenticated users)
router.patch('/:id/read', protect, markAsRead);

export default router;
