/**
 * Restaurant Settings Service
 * 
 * Business logic for managing restaurant settings
 */

import RestaurantSettings from '../models/RestaurantSettings.js';
import { deleteCachePattern } from '../utils/cache.js';

/**
 * Get current restaurant settings
 */
export const getSettings = async () => {
    const settings = await RestaurantSettings.getSingleton();
    return settings;
};

/**
 * Update restaurant settings
 */
export const updateSettings = async (updates, userId) => {
    // Validate numeric fields
    if (updates.minOrderAmount !== undefined) {
        updates.minOrderAmount = parseFloat(updates.minOrderAmount);
        if (isNaN(updates.minOrderAmount) || updates.minOrderAmount < 0) {
            throw new Error('Minimum order amount must be a positive number');
        }
    }

    if (updates.taxRate !== undefined) {
        updates.taxRate = parseFloat(updates.taxRate);
        if (isNaN(updates.taxRate) || updates.taxRate < 0 || updates.taxRate > 100) {
            throw new Error('Tax rate must be between 0 and 100');
        }
    }

    if (updates.deliveryFee !== undefined) {
        updates.deliveryFee = parseFloat(updates.deliveryFee);
        if (isNaN(updates.deliveryFee) || updates.deliveryFee < 0) {
            throw new Error('Delivery fee must be a positive number');
        }
    }

    if (updates.freeDeliveryThreshold !== undefined) {
        updates.freeDeliveryThreshold = parseFloat(updates.freeDeliveryThreshold);
        if (isNaN(updates.freeDeliveryThreshold) || updates.freeDeliveryThreshold < 0) {
            throw new Error('Free delivery threshold must be a positive number');
        }
    }

    // Update settings
    const settings = await RestaurantSettings.updateSingleton(updates, userId);

    // Clear cache for cart and checkout calculations
    await deleteCachePattern('restaurant_settings');
    await deleteCachePattern('cart:*'); // Clear all cart caches to recalculate with new settings

    return settings;
};

/**
 * Get settings for customer checkout (public)
 * Returns only customer-facing settings
 */
export const getPublicSettings = async () => {
    const settings = await RestaurantSettings.getSingleton();

    return {
        minOrderAmount: settings.minOrderAmount,
        taxRate: settings.taxRate,
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
    };
};

/**
 * Calculate delivery fee based on cart total
 */
export const calculateDeliveryFee = async (cartTotal) => {
    const settings = await RestaurantSettings.getSingleton();

    // Free delivery if cart total exceeds threshold
    if (cartTotal >= settings.freeDeliveryThreshold) {
        return 0;
    }

    return settings.deliveryFee;
};

/**
 * Validate minimum order amount
 */
export const validateMinimumOrder = async (cartTotal) => {
    const settings = await RestaurantSettings.getSingleton();

    if (cartTotal < settings.minOrderAmount) {
        return {
            valid: false,
            message: `Minimum order amount is ₹${settings.minOrderAmount}. Your cart total is ₹${cartTotal.toFixed(2)}`,
            minAmount: settings.minOrderAmount,
        };
    }

    return {
        valid: true,
        minAmount: settings.minOrderAmount,
    };
};

/**
 * Calculate tax amount
 */
export const calculateTax = async (amount) => {
    const settings = await RestaurantSettings.getSingleton();
    return (amount * settings.taxRate) / 100;
};
