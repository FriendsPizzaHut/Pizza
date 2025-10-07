/**
 * Activity Service
 * 
 * Business logic for activity log management.
 * Handles activity tracking and cleanup.
 */

import ActivityLog from '../models/ActivityLog.js';

/**
 * Get today's activities
 * @returns {Array} - Today's activity logs
 */
export const getTodayActivities = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await ActivityLog.find({
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
    })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    return activities;
};

/**
 * Get activities by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Activity logs
 */
export const getActivitiesByDateRange = async (startDate, endDate) => {
    const activities = await ActivityLog.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate,
        },
    })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    return activities;
};

/**
 * Create activity log
 * @param {Object} activityData - Activity data
 * @returns {Object} - Created activity log
 */
export const createActivity = async (activityData) => {
    const activity = await ActivityLog.create(activityData);
    return activity;
};

/**
 * Cleanup old activity logs (older than specified days)
 * @param {Number} days - Number of days to keep (default: 30)
 * @returns {Object} - Cleanup result
 */
export const cleanupOldLogs = async (days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await ActivityLog.deleteMany({
        createdAt: { $lt: cutoffDate },
    });

    return {
        message: `Deleted ${result.deletedCount} old activity logs`,
        deletedCount: result.deletedCount,
    };
};

/**
 * Get activities by user
 * @param {String} userId - User ID
 * @param {Number} limit - Max number of activities to return
 * @returns {Array} - User's activity logs
 */
export const getActivitiesByUser = async (userId, limit = 50) => {
    const activities = await ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit);

    return activities;
};

export default {
    getTodayActivities,
    getActivitiesByDateRange,
    createActivity,
    cleanupOldLogs,
    getActivitiesByUser,
};
