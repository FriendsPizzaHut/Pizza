/**
 * Restaurant Settings Service
 * 
 * API client for restaurant settings operations
 */

import apiClient from '../api/apiClient';

// ==================== TYPES ====================

export interface RestaurantSettings {
    _id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    minOrderAmount: number;
    taxRate: number;
    deliveryFee: number;
    freeDeliveryThreshold: number;
    lastUpdatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PublicSettings {
    minOrderAmount: number;
    taxRate: number;
    deliveryFee: number;
    freeDeliveryThreshold: number;
}

export interface UpdateSettingsParams {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    minOrderAmount?: string | number;
    taxRate?: string | number;
    deliveryFee?: string | number;
    freeDeliveryThreshold?: string | number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get restaurant settings (Admin only)
 */
export const getRestaurantSettings = async (): Promise<RestaurantSettings> => {
    const response = await apiClient.get('/admin/restaurant-settings');
    return response.data.data;
};

/**
 * Update restaurant settings (Admin only)
 */
export const updateRestaurantSettings = async (
    settings: UpdateSettingsParams
): Promise<RestaurantSettings> => {
    const response = await apiClient.put('/admin/restaurant-settings', settings);
    return response.data.data;
};

/**
 * Get public settings (Customer facing)
 * No authentication required
 */
export const getPublicSettings = async (): Promise<PublicSettings> => {
    const response = await apiClient.get('/restaurant-settings/public');
    return response.data.data;
};

/**
 * Calculate delivery fee based on cart total
 */
export const calculateDeliveryFee = (cartTotal: number, settings: PublicSettings): number => {
    if (cartTotal >= settings.freeDeliveryThreshold) {
        return 0;
    }
    return settings.deliveryFee;
};

/**
 * Calculate tax amount
 */
export const calculateTax = (amount: number, settings: PublicSettings): number => {
    return (amount * settings.taxRate) / 100;
};

/**
 * Validate minimum order
 */
export const validateMinimumOrder = (cartTotal: number, settings: PublicSettings): {
    valid: boolean;
    message?: string;
} => {
    if (cartTotal < settings.minOrderAmount) {
        return {
            valid: false,
            message: `Minimum order amount is ₹${settings.minOrderAmount}. Your cart total is ₹${cartTotal.toFixed(0)}`,
        };
    }
    return { valid: true };
};

export default {
    getRestaurantSettings,
    updateRestaurantSettings,
    getPublicSettings,
    calculateDeliveryFee,
    calculateTax,
    validateMinimumOrder,
};
