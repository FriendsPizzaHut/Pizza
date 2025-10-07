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
            trim: true,
            // Examples: "new_order", "order_assigned", "order_delivered", "payment_received"
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
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for faster queries
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ user: 1, isRead: 1 }); // Compound index for filtering unread notifications

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
