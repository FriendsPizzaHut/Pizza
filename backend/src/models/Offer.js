/**
 * Offer Model
 * 
 * Stores promotional offers and discount codes.
 * Supports percentage and fixed discounts with validation rules.
 */

import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
    {
        // Basic Information
        title: {
            type: String,
            required: [true, 'Offer title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Offer description is required'],
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        code: {
            type: String,
            required: [true, 'Offer code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Z0-9]+$/, 'Offer code can only contain uppercase letters and numbers'],
            maxlength: [20, 'Offer code cannot exceed 20 characters'],
            minlength: [3, 'Offer code must be at least 3 characters'],
        },
        badge: {
            type: String,
            required: [true, 'Badge text is required'],
            trim: true,
            maxlength: [50, 'Badge text cannot exceed 50 characters'],
        },

        // Discount Configuration
        discountType: {
            type: String,
            enum: {
                values: ['percentage', 'fixed'],
                message: 'Discount type must be either percentage or fixed',
            },
            required: [true, 'Discount type is required'],
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value cannot be negative'],
            validate: {
                validator: function (value) {
                    // If percentage, value should be between 0-100
                    if (this.discountType === 'percentage') {
                        return value > 0 && value <= 100;
                    }
                    // If fixed, just ensure it's positive
                    return value > 0;
                },
                message: function (props) {
                    if (this.discountType === 'percentage') {
                        return 'Percentage discount must be between 1 and 100';
                    }
                    return 'Discount value must be greater than 0';
                },
            },
        },
        maxDiscount: {
            type: Number,
            default: null,
            min: [0, 'Max discount cannot be negative'],
            validate: {
                validator: function (value) {
                    // Max discount only applies to percentage discounts
                    if (value === null || value === undefined) return true;
                    return this.discountType === 'percentage';
                },
                message: 'Max discount is only applicable for percentage discounts',
            },
        },

        // Conditions
        minOrderValue: {
            type: Number,
            required: [true, 'Minimum order value is required'],
            default: 0,
            min: [0, 'Minimum order value cannot be negative'],
        },

        // Validity Period
        isActive: {
            type: Boolean,
            default: true,
        },
        validFrom: {
            type: Date,
            required: [true, 'Valid from date is required'],
        },
        validUntil: {
            type: Date,
            required: [true, 'Valid until date is required'],
            validate: {
                validator: function (value) {
                    return value > this.validFrom;
                },
                message: 'Valid until date must be after valid from date',
            },
        },

        // Usage Tracking
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
            min: [1, 'Usage limit must be at least 1 if specified'],
        },
        usageCount: {
            type: Number,
            default: 0,
            min: [0, 'Usage count cannot be negative'],
        },

        // UI Customization
        gradientColors: {
            type: [String],
            default: ['#FF9800', '#FF5722'],
            validate: {
                validator: function (colors) {
                    return colors.length === 2;
                },
                message: 'Gradient colors must have exactly 2 colors',
            },
        },
        bgColor: {
            type: String,
            default: '#FF5722',
        },

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
offerSchema.index({ code: 1, isActive: 1 }); // Compound index for code and active status
offerSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
offerSchema.index({ createdAt: -1 });

// Instance Methods

/**
 * Check if offer is currently valid
 * @returns {Boolean} - True if offer is valid
 */
offerSchema.methods.isValid = function () {
    const now = new Date();

    // Check if active
    if (!this.isActive) {
        return { valid: false, message: 'This offer is currently inactive' };
    }

    // Check validity period
    if (now < this.validFrom) {
        return { valid: false, message: 'This offer has not started yet' };
    }

    if (now > this.validUntil) {
        return { valid: false, message: 'This offer has expired' };
    }

    // Check usage limit
    if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
        return { valid: false, message: 'This offer has reached its usage limit' };
    }

    return { valid: true, message: 'Offer is valid' };
};

/**
 * Calculate discount for a given cart value
 * @param {Number} cartValue - Total cart value
 * @returns {Object} - Discount details
 */
offerSchema.methods.calculateDiscount = function (cartValue) {
    // Check minimum order value
    if (cartValue < this.minOrderValue) {
        const remaining = this.minOrderValue - cartValue;
        return {
            valid: false,
            discount: 0,
            message: `Add ₹${remaining} more to use this offer (Min order: ₹${this.minOrderValue})`,
        };
    }

    let discount = 0;

    if (this.discountType === 'percentage') {
        // Calculate percentage discount
        discount = (cartValue * this.discountValue) / 100;

        // Apply max discount cap if specified
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        // Fixed discount
        discount = this.discountValue;
    }

    // Ensure discount doesn't exceed cart value
    if (discount > cartValue) {
        discount = cartValue;
    }

    return {
        valid: true,
        discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
        finalAmount: Math.round((cartValue - discount) * 100) / 100,
        message: `₹${discount} discount applied!`,
    };
};

/**
 * Increment usage count
 */
offerSchema.methods.incrementUsage = async function () {
    this.usageCount += 1;
    await this.save();
};

// Static Methods

/**
 * Get all active offers
 * @returns {Array} - List of active offers
 */
offerSchema.statics.getActiveOffers = async function () {
    const now = new Date();

    return this.find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
        ],
    })
        .sort({ createdAt: -1 })
        .select('-createdBy -__v');
};

/**
 * Validate and apply offer
 * @param {String} code - Offer code
 * @param {Number} cartValue - Cart value
 * @returns {Object} - Validation result with discount
 */
offerSchema.statics.validateOffer = async function (code, cartValue) {
    // Find offer by code
    const offer = await this.findOne({ code: code.toUpperCase() });

    if (!offer) {
        return {
            success: false,
            message: 'Invalid offer code',
        };
    }

    // Check if offer is valid
    const validityCheck = offer.isValid();
    if (!validityCheck.valid) {
        return {
            success: false,
            message: validityCheck.message,
        };
    }

    // Calculate discount
    const discountResult = offer.calculateDiscount(cartValue);

    if (!discountResult.valid) {
        return {
            success: false,
            message: discountResult.message,
        };
    }

    return {
        success: true,
        offer: {
            id: offer._id,
            code: offer.code,
            title: offer.title,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
        },
        discount: discountResult.discount,
        finalAmount: discountResult.finalAmount,
        message: discountResult.message,
    };
};

// Pre-save middleware
offerSchema.pre('save', function (next) {
    // Ensure code is always uppercase
    if (this.code) {
        this.code = this.code.toUpperCase();
    }
    next();
});

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
