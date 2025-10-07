/**
 * Order Model
 * 
 * Handles order details with references to users and products.
 * Tracks order status, delivery, and payment information.
 */

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
                },
                price: {
                    type: Number,
                    required: true,
                    min: [0, 'Price cannot be negative'],
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
            default: 'pending',
        },
        deliveryAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // Optional - only set when delivery agent is assigned
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        deliveryAddress: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for analytics and cleanup
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // For sorting recent orders

const Order = mongoose.model('Order', orderSchema);

export default Order;
