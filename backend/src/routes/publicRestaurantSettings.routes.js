/**
 * Public Restaurant Settings Routes
 * 
 * Public routes for customer-facing settings
 */

import express from 'express';
import * as restaurantSettingsController from '../controllers/restaurantSettingsController.js';

const router = express.Router();

/**
 * Public Routes (No authentication required)
 */

// GET /api/restaurant-settings/public - Get public settings
router.get('/public', restaurantSettingsController.getPublicSettings);

export default router;
