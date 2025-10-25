/**
 * Recommendation Routes
 * 
 * Provides personalized product recommendations for customers
 */

import express from 'express';
import * as recommendationController from '../controllers/recommendationController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/recommendations/personalized
 * @desc    Get personalized product recommendations
 * @access  Private (Customer)
 */
router.get(
    '/personalized',
    authenticate,
    authorize('customer'),
    recommendationController.getPersonalizedRecommendations
);

/**
 * @route   GET /api/v1/recommendations/reorder
 * @desc    Get "Order Again" suggestions (previously ordered items)
 * @access  Private (Customer)
 */
router.get(
    '/reorder',
    authenticate,
    authorize('customer'),
    recommendationController.getReorderSuggestions
);

/**
 * @route   GET /api/v1/recommendations/category/:category
 * @desc    Get category-specific recommendations
 * @access  Private (Customer)
 */
router.get(
    '/category/:category',
    authenticate,
    authorize('customer'),
    recommendationController.getCategoryRecommendations
);

/**
 * @route   GET /api/v1/recommendations/frequently-bought/:productId
 * @desc    Get "Frequently Bought Together" suggestions for a product
 * @access  Public
 */
router.get(
    '/frequently-bought/:productId',
    recommendationController.getFrequentlyBoughtTogether
);

/**
 * @route   GET /api/v1/recommendations/stats
 * @desc    Get user's ordering statistics and behavior
 * @access  Private (Customer)
 */
router.get(
    '/stats',
    authenticate,
    authorize('customer'),
    recommendationController.getUserOrderingStats
);

/**
 * @route   POST /api/v1/recommendations/update-preferences/:orderId
 * @desc    Manually update user preferences (for testing)
 * @access  Private (Admin)
 */
router.post(
    '/update-preferences/:orderId',
    authenticate,
    authorize('admin'),
    recommendationController.manuallyUpdatePreferences
);

export default router;
