/**
 * Business Controller
 * 
 * Handles restaurant business operations:
 * - Get business details
 * - Update business information
 * - Toggle open/close status
 * 
 * Controllers orchestrate request/response only - business logic in services
 * Emits real-time Socket.IO events for business status changes
 */

import * as businessService from '../services/businessService.js';
import { sendResponse } from '../utils/response.js';
import { emitBusinessStatusUpdate } from '../socket/events.js';

/**
 * Get business/restaurant details
 * GET /api/v1/business
 * @access Public
 */
export const getBusinessDetails = async (req, res, next) => {
    try {
        const business = await businessService.getBusinessDetails();
        sendResponse(res, 200, 'Business details retrieved successfully', business);
    } catch (error) {
        next(error);
    }
};

/**
 * Update business information
 * PATCH /api/v1/business
 * @access Private/Admin
 */
export const updateBusiness = async (req, res, next) => {
    try {
        const business = await businessService.updateBusiness(req.body);
        sendResponse(res, 200, 'Business updated successfully', business);
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle business open/close status
 * PATCH /api/v1/business/status
 * @access Private/Admin
 */
export const toggleBusinessStatus = async (req, res, next) => {
    try {
        const business = await businessService.toggleBusinessStatus(req.body.isOpen);

        // Emit real-time update to all connected clients
        emitBusinessStatusUpdate({
            isOpen: business.isOpen,
            businessName: business.name,
        });

        sendResponse(res, 200, `Business is now ${business.isOpen ? 'open' : 'closed'}`, business);
    } catch (error) {
        next(error);
    }
};

export default { getBusinessDetails, updateBusiness, toggleBusinessStatus };
