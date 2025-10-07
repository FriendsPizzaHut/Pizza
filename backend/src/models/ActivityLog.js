/**
 * Activity Log Model
 * 
 * Tracks system activities for daily visibility.
 * Logs are automatically cleaned up at the end of each day using a cron job.
 * 
 * Cleanup Strategy:
 * - Use node-cron or similar to delete logs older than 24 hours daily
 * - Run cleanup job at midnight: 0 0 * * *
 */

import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, 'Activity type is required'],
            trim: true,
            // Examples: "order_received", "payment_received", "order_delivered", "shop_opened", "shop_closed"
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false, // We use custom timestamp field
    }
);

// Index on timestamp for efficient deletion of old logs
activityLogSchema.index({ timestamp: 1 });

/**
 * Static method to clean up old logs (older than 24 hours)
 * Call this method from a cron job
 */
activityLogSchema.statics.cleanupOldLogs = async function () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
        const result = await this.deleteMany({ timestamp: { $lt: oneDayAgo } });
        console.log(`🧹 Cleaned up ${result.deletedCount} old activity logs`);
        return result;
    } catch (error) {
        console.error('❌ Error cleaning up activity logs:', error.message);
        throw error;
    }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
