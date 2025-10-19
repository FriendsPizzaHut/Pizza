/**
 * Recommendations Controller
 * 
 * Handles personalized product recommendations for customers
 */

import * as preferenceService from '../services/userPreferenceService.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Get personalized recommendations for logged-in user
 * 
 * @route   GET /api/v1/recommendations/personalized
 * @access  Private (Customer only)
 */
export const getPersonalizedRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await preferenceService.getPersonalizedRecommendations(userId, limit);

        res.status(200).json({
            success: true,
            data: recommendations,
            count: recommendations.length,
        });
    } catch (error) {
        next(new ApiError(500, error.message || 'Failed to fetch recommendations'));
    }
};

/**
 * Get "Order Again" suggestions
 * 
 * @route   GET /api/v1/recommendations/reorder
 * @access  Private (Customer only)
 */
export const getReorderSuggestions = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 5;

        const suggestions = await preferenceService.getReorderSuggestions(userId, limit);

        res.status(200).json({
            success: true,
            data: suggestions,
            count: suggestions.length,
        });
    } catch (error) {
        next(new ApiError(500, error.message || 'Failed to fetch reorder suggestions'));
    }
};

/**
 * Get category-specific recommendations
 * 
 * @route   GET /api/v1/recommendations/category/:category
 * @access  Private (Customer only)
 */
export const getCategoryRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        if (!['pizza', 'sides', 'beverages', 'desserts'].includes(category)) {
            throw new ApiError(400, 'Invalid category');
        }

        const recommendations = await preferenceService.getCategoryRecommendations(userId, category, limit);

        res.status(200).json({
            success: true,
            data: recommendations,
            count: recommendations.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get "Frequently Bought Together" for a product
 * 
 * @route   GET /api/v1/recommendations/frequently-bought/:productId
 * @access  Public
 */
export const getFrequentlyBoughtTogether = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 3;

        const suggestions = await preferenceService.getFrequentlyBoughtTogether(productId, limit);

        res.status(200).json({
            success: true,
            data: suggestions,
            count: suggestions.length,
        });
    } catch (error) {
        next(new ApiError(500, error.message || 'Failed to fetch suggestions'));
    }
};

/**
 * Get user's ordering statistics and preferences
 * 
 * @route   GET /api/v1/recommendations/stats
 * @access  Private (Customer only)
 */
export const getUserOrderingStats = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const stats = await preferenceService.getUserOrderingStats(userId);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(new ApiError(500, error.message || 'Failed to fetch user stats'));
    }
};

/**
 * Manually trigger preference update (for testing)
 * This is automatically called when order is delivered
 * 
 * @route   POST /api/v1/recommendations/update-preferences/:orderId
 * @access  Private (Admin only)
 */
export const manuallyUpdatePreferences = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const updated = await preferenceService.updateUserPreferences(userId, orderId);

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: updated,
        });
    } catch (error) {
        next(new ApiError(500, error.message || 'Failed to update preferences'));
    }
};

export default {
    getPersonalizedRecommendations,
    getReorderSuggestions,
    getCategoryRecommendations,
    getFrequentlyBoughtTogether,
    getUserOrderingStats,
    manuallyUpdatePreferences,
};
