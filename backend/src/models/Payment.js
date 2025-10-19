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
            enum: ['card', 'upi', 'cod', 'cash', 'wallet'],
            required: [true, 'Payment method is required'],
        },
        // For COD orders, track how payment was actually collected
        collectionMethod: {
            type: String,
            enum: ['cash', 'upi', 'card'],
            required: false, // Only required for COD orders
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

        // ==================== RAZORPAY FIELDS ====================
        // Razorpay order ID (created before payment)
        razorpayOrderId: {
            type: String,
            sparse: true,
            trim: true,
        },
        // Razorpay payment ID (after successful payment)
        razorpayPaymentId: {
            type: String,
            sparse: true,
            trim: true,
        },
        // Payment signature for verification
        razorpaySignature: {
            type: String,
            trim: true,
        },
        // Payment gateway used
        paymentGateway: {
            type: String,
            enum: ['razorpay', 'cash', 'manual'],
            default: 'cash',
        },
        // Payment metadata (optional - stores additional payment details)
        paymentMetadata: {
            method: String,        // card, netbanking, upi, wallet
            bank: String,          // HDFC, SBI, etc.
            wallet: String,        // paytm, phonepe, googlepay, etc.
            vpa: String,           // UPI ID (if UPI payment)
            card_id: String,       // Razorpay card ID
            email: String,         // Customer email
            contact: String,       // Customer phone
            acquirer_data: {       // Bank reference number
                rrn: String,
                upi_transaction_id: String,
            },
        },
        // Refund tracking (optional)
        refundStatus: {
            type: String,
            enum: ['none', 'pending', 'processed', 'failed'],
            default: 'none',
        },
        refundId: {
            type: String,
            sparse: true,
        },
        refundAmount: {
            type: Number,
            default: 0,
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
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ paymentGateway: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
