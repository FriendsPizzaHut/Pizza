/**
 * Restaurant Settings Model
 * 
 * Stores global restaurant configuration settings
 * Used for minimum order, pricing, tax, and delivery fees
 */

import mongoose from 'mongoose';

const restaurantSettingsSchema = new mongoose.Schema(
    {
        // Restaurant Information
        name: {
            type: String,
            required: [true, 'Restaurant name is required'],
            trim: true,
            maxlength: [100, 'Restaurant name cannot exceed 100 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^[\d\s\+\-\(\)]+$/, 'Please enter a valid phone number'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
            maxlength: [500, 'Address cannot exceed 500 characters'],
        },

        // Order Configuration
        minOrderAmount: {
            type: Number,
            required: [true, 'Minimum order amount is required'],
            min: [0, 'Minimum order amount cannot be negative'],
            default: 100,
        },

        // Pricing & Taxes
        taxRate: {
            type: Number,
            required: [true, 'Tax rate is required'],
            min: [0, 'Tax rate cannot be negative'],
            max: [100, 'Tax rate cannot exceed 100%'],
            default: 8.5,
        },
        deliveryFee: {
            type: Number,
            required: [true, 'Delivery fee is required'],
            min: [0, 'Delivery fee cannot be negative'],
            default: 40,
        },
        freeDeliveryThreshold: {
            type: Number,
            required: [true, 'Free delivery threshold is required'],
            min: [0, 'Free delivery threshold cannot be negative'],
            default: 2490,
        },

        // System tracking
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        collection: 'restaurant_settings',
    }
);

// Index for faster queries
restaurantSettingsSchema.index({ updatedAt: -1 });

// Ensure only one settings document exists
restaurantSettingsSchema.statics.getSingleton = async function () {
    let settings = await this.findOne();

    if (!settings) {
        // Create default settings if none exist
        settings = await this.create({
            name: "Friend's Pizza Hut",
            phone: '+91 98765 43210',
            email: 'contact@friendspizzahut.com',
            address: '123 Pizza Street, Mumbai, Maharashtra 400001',
            minOrderAmount: 100,
            taxRate: 8.5,
            deliveryFee: 40,
            freeDeliveryThreshold: 2490,
        });
    }

    return settings;
};

// Update singleton settings
restaurantSettingsSchema.statics.updateSingleton = async function (updates, userId) {
    const settings = await this.getSingleton();

    // Update fields
    Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined && updates[key] !== null) {
            settings[key] = updates[key];
        }
    });

    if (userId) {
        settings.lastUpdatedBy = userId;
    }

    await settings.save();
    return settings;
};

const RestaurantSettings = mongoose.model('RestaurantSettings', restaurantSettingsSchema);

export default RestaurantSettings;
