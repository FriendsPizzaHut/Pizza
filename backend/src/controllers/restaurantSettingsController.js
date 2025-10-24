/**
 * Restaurant Settings Controller
 * 
 * Handles HTTP requests for restaurant settings management
 */

import * as restaurantSettingsService from '../services/restaurantSettingsService.js';
import logger from '../utils/logger.js';

/**
 * Get restaurant settings (admin only)
 */
export const getSettings = async (req, res) => {
    try {
        const settings = await restaurantSettingsService.getSettings();

        logger.info('Restaurant settings retrieved', {
            userId: req.user._id,
            userRole: req.user.role
        });

        return res.status(200).json({
            success: true,
            message: 'Settings retrieved successfully',
            data: settings
        });
    } catch (error) {
        logger.error('Error getting restaurant settings:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get settings'
        });
    }
};

/**
 * Update restaurant settings (admin only)
 */
export const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (updates.minOrderAmount !== undefined && updates.minOrderAmount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimum order amount cannot be negative'
            });
        }

        if (updates.taxRate !== undefined && (updates.taxRate < 0 || updates.taxRate > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Tax rate must be between 0 and 100'
            });
        }

        if (updates.deliveryFee !== undefined && updates.deliveryFee < 0) {
            return res.status(400).json({
                success: false,
                message: 'Delivery fee cannot be negative'
            });
        }

        const settings = await restaurantSettingsService.updateSettings(updates, userId);

        logger.info('Restaurant settings updated', {
            userId,
            userRole: req.user.role,
            updates
        });

        return res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        logger.error('Error updating restaurant settings:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update settings'
        });
    }
};

/**
 * Get public restaurant settings (no auth required)
 */
export const getPublicSettings = async (req, res) => {
    try {
        const settings = await restaurantSettingsService.getPublicSettings();

        logger.info('Public restaurant settings retrieved');

        return res.status(200).json({
            success: true,
            message: 'Public settings retrieved successfully',
            data: settings
        });
    } catch (error) {
        logger.error('Error getting public restaurant settings:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get public settings'
        });
    }
};
