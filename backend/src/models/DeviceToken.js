/**
 * DeviceToken Model
 * 
 * Stores device tokens for push notifications
 * Supports multiple roles: admin, delivery, customer
 * Optimized with indexes for fast queries
 */

import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        token: {
            type: String,
            required: [true, 'Device token is required'],
            trim: true,
        },
        deviceType: {
            type: String,
            enum: ['android', 'ios', 'web'],
            required: [true, 'Device type is required'],
        },
        platform: {
            type: String,
            enum: ['expo', 'fcm'],
            default: 'expo',
        },
        userRole: {
            type: String,
            enum: ['admin', 'delivery', 'customer'],
            required: [true, 'User role is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        metadata: {
            deviceName: String,
            osVersion: String,
            appVersion: String,
        },
        lastUsed: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for fast queries
deviceTokenSchema.index({ userId: 1, userRole: 1 });
deviceTokenSchema.index({ userRole: 1, isActive: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });

// TTL index: Auto-delete tokens older than 90 days
deviceTokenSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7776000 });

// Update lastUsed on token usage
deviceTokenSchema.methods.updateLastUsed = async function () {
    this.lastUsed = new Date();
    await this.save();
};

// Static method: Find active tokens by role
deviceTokenSchema.statics.findActiveByRole = function (role) {
    return this.find({
        userRole: role,
        isActive: true,
    }).select('token userId').lean();
};

// Static method: Find active tokens by user
deviceTokenSchema.statics.findActiveByUser = function (userId) {
    return this.find({
        userId,
        isActive: true,
    }).select('token').lean();
};

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);

export default DeviceToken;
