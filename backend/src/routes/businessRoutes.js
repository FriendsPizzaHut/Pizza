/**
 * Business Routes
 * 
 * Business/Restaurant management endpoints:
 * - GET /api/business - Get restaurant details
 * - PATCH /api/business - Update business info
 * - PATCH /api/business/status - Toggle open/close status
 */

import express from 'express';
import {
    getBusinessDetails,
    updateBusiness,
    toggleBusinessStatus,
} from '../controllers/businessController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { updateBusinessValidator, toggleStatusValidator } from '../utils/validators/businessValidator.js';

const router = express.Router();

// Get business details (public)
router.get('/', getBusinessDetails);

// Update business information (admin only, with validation)
router.patch('/', protect, adminOnly, validate(updateBusinessValidator), updateBusiness);

// Toggle open/close status (admin only, with validation)
router.patch('/status', protect, adminOnly, validate(toggleStatusValidator), toggleBusinessStatus);

export default router;
