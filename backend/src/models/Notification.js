/**
 * Notification Model
 * 
 * Stores notifications for users (admin, delivery agents, customers).
 * Supports various notification types like new orders, order assignments, etc.
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User (receiver) is required'],
        },
        type: {
            type: String,
            required: [true, 'Notification type is required'],
            enum: ['order', 'delivery', 'payment', 'customer', 'system', 'staff'],
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium',
        },
        relatedEntity: {
            entityType: {
                type: String,
                enum: ['order', 'payment', 'user', 'menu', 'none'],
                default: 'none',
            },
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
            },
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for faster queries
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ user: 1, isRead: 1 }); // Compound index for filtering unread notifications
notificationSchema.index({ createdAt: -1 }); // Sort by newest first
notificationSchema.index({ priority: 1 }); // Filter by priority
notificationSchema.index({ 'relatedEntity.entityType': 1 }); // Query by entity type

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
