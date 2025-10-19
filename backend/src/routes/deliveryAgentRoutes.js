/**
 * Delivery Agent Routes
 * 
 * Routes for delivery agent-specific operations:
 * - Status management (online/offline)
 * - Profile information
 */

import express from 'express';
import { updateOnlineStatus, getAgentStatus } from '../controllers/deliveryAgentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   PATCH /api/v1/delivery-agent/status
 * @desc    Update delivery agent online/offline status
 * @access  Private (Delivery agents only)
 * 
 * Body: { isOnline: true/false }
 */
router.patch(
    '/status',
    authenticate,
    authorize('delivery'),
    updateOnlineStatus
);

/**
 * @route   GET /api/v1/delivery-agent/status
 * @desc    Get delivery agent current status
 * @access  Private (Delivery agents only)
 */
router.get(
    '/status',
    authenticate,
    authorize('delivery'),
    getAgentStatus
);

export default router;
