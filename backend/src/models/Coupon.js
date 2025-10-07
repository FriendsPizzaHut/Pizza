/**
 * Coupon Model
 * 
 * Handles discount coupons for orders.
 * Supports percentage and flat discount types with date validity.
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'flat'],
            required: [true, 'Discount type is required'],
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value cannot be negative'],
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: [0, 'Minimum order amount cannot be negative'],
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for faster queries
// Note: code already has unique:true which creates an index automatically
// couponSchema.index({ code: 1 }); // Removed duplicate - code has unique: true
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
