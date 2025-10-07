/**
 * Coupon Routes
 * 
 * Coupon management endpoints:
 * - GET /api/coupons - List all active coupons
 * - POST /api/coupons - Create new coupon (admin)
 * - PATCH /api/coupons/:id - Update coupon (admin)
 * - DELETE /api/coupons/:id - Delete coupon (admin)
 */

import express from 'express';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createCouponValidator, updateCouponValidator } from '../utils/validators/couponValidator.js';

const router = express.Router();

// Get all coupons (public - users can see available coupons)
router.get('/', getAllCoupons);

// Create new coupon (admin only, with validation)
router.post('/', protect, adminOnly, validate(createCouponValidator), createCoupon);

// Update coupon (admin only, with validation)
router.patch('/:id', protect, adminOnly, validate(updateCouponValidator), updateCoupon);

// Delete coupon (admin only)
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
