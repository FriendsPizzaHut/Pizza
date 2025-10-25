/**
 * Delivery Agent Routes
 * 
 * Routes for delivery agent-specific operations:
 * - Status management (online/offline)
 * - Profile information
 */

import express from 'express';
import { updateOnlineStatus, getAgentStatus } from '../controllers/deliveryAgentController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

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

/**
 * @route   GET /api/v1/delivery-agent/stats
 * @desc    Get delivery agent dashboard stats (today + overall)
 * @access  Private (Delivery agents only)
 */
router.get(
    '/stats',
    authenticate,
    authorize('delivery'),
    // controller method added: getDeliveryStats
    (req, res, next) => {
        // lazy require to avoid potential hoisting issues
        import('../controllers/deliveryAgentController.js')
            .then(mod => mod.getDeliveryStats(req, res, next))
            .catch(err => next(err));
    }
);

/**
 * @route   GET /api/v1/delivery-agent/recent-deliveries
 * @desc    Get recent delivered orders for the agent
 * @access  Private (Delivery agents only)
 */
router.get(
    '/recent-deliveries',
    authenticate,
    authorize('delivery'),
    (req, res, next) => {
        import('../controllers/deliveryAgentController.js')
            .then(mod => mod.getRecentDeliveries(req, res, next))
            .catch(err => next(err));
    }
);

export default router;
