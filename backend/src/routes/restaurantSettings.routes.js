/**
 * Restaurant Settings Routes
 * 
 * Routes for managing restaurant settings
 */

import express from 'express';
import * as restaurantSettingsController from '../controllers/restaurantSettingsController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Admin Routes (Protected)
 */

// GET /api/admin/restaurant-settings - Get settings
router.get(
    '/',
    protect,
    adminOnly,
    restaurantSettingsController.getSettings
);

// PUT /api/admin/restaurant-settings - Update settings
router.put(
    '/',
    protect,
    adminOnly,
    restaurantSettingsController.updateSettings
);

export default router;
