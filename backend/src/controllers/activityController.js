/**
 * Activity Log Controller
 * 
 * Handles activity log operations:
 * - Get today's activities (admin)
 * - Cleanup old activity logs
 * 
 * Controllers orchestrate request/response only - business logic in services
 */

import * as activityService from '../services/activityService.js';
import { sendResponse } from '../utils/response.js';

/**
 * Get today's activities
 * GET /api/v1/activity
 * @access Private (Admin only)
 */
export const getTodayActivities = async (req, res, next) => {
    try {
        const activities = await activityService.getTodayActivities();
        sendResponse(res, 200, 'Activities retrieved successfully', activities);
    } catch (error) {
        next(error);
    }
};

/**
 * Cleanup old activity logs (older than 30 days)
 * DELETE /api/v1/activity/cleanup
 * @access Private (Admin only)
 */
export const cleanupOldLogs = async (req, res, next) => {
    try {
        const result = await activityService.cleanupOldLogs();
        sendResponse(res, 200, `Deleted ${result.deletedCount} old activity logs`, result);
    } catch (error) {
        next(error);
    }
};

export default {
    getTodayActivities,
    cleanupOldLogs,
};
