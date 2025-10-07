/**
 * Activity Log Routes
 * 
 * Routes:
 * - GET /api/activity - Get today's activities (admin only)
 * - DELETE /api/activity/cleanup - Cleanup old logs (admin only)
 */

import express from 'express';
import {
    getTodayActivities,
    cleanupOldLogs,
} from '../controllers/activityController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get today's activities (admin only)
router.get('/', protect, adminOnly, getTodayActivities);

// Cleanup old activity logs (admin only)
router.delete('/cleanup', protect, adminOnly, cleanupOldLogs);

export default router;
