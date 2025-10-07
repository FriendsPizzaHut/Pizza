/**
 * Payment Model
 * 
 * Stores minimal payment information for transactions.
 * Old payments will be deleted periodically, but aggregated stats are stored elsewhere.
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'cod'],
            required: [true, 'Payment method is required'],
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        transactionId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple null values for COD orders
            trim: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Index for faster queries
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ paymentStatus: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
