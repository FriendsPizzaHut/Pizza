/**
 * Device Token Routes
 * 
 * Endpoints for managing device tokens for push notifications
 */

import express from 'express';
import {
    registerDeviceToken,
    removeDeviceToken,
    getUserDeviceTokens,
    pingDeviceToken,
} from '../controllers/deviceTokenController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/device-tokens
 * @desc    Register or update a device token
 * @access  Private (all authenticated users)
 */
router.post('/', registerDeviceToken);

/**
 * @route   GET /api/v1/device-tokens
 * @desc    Get user's active device tokens
 * @access  Private
 */
router.get('/', getUserDeviceTokens);

/**
 * @route   DELETE /api/v1/device-tokens/:token
 * @desc    Remove/deactivate a device token
 * @access  Private
 */
router.delete('/:token', removeDeviceToken);

/**
 * @route   POST /api/v1/device-tokens/ping
 * @desc    Send test notification to a device token
 * @access  Private
 */
router.post('/ping', pingDeviceToken);

/**
 * @route   PATCH /api/v1/device-tokens/:token/ping
 * @desc    Update token last used time
 * @access  Private
 */
router.patch('/:token/ping', pingDeviceToken);

export default router;
