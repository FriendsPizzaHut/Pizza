/**
 * Coupon Controller
 * 
 * Handles coupon operations:
 * - List all active coupons
 * - Create new coupon (admin)
 * - Update coupon (admin)
 * - Delete coupon (admin)
 * 
 * Controllers orchestrate request/response only - business logic in services
 */

import * as couponService from '../services/couponService.js';
import { sendResponse } from '../utils/response.js';

/**
 * Get all active coupons
 * GET /api/v1/coupons
 * @access Public
 */
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await couponService.getAllCoupons(req.query);
        sendResponse(res, 200, 'Coupons retrieved successfully', coupons);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new coupon
 * POST /api/v1/coupons
 * @access Private/Admin
 */
export const createCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.createCoupon(req.body);
        sendResponse(res, 201, 'Coupon created successfully', coupon);
    } catch (error) {
        next(error);
    }
};

/**
 * Update coupon
 * PATCH /api/v1/coupons/:id
 * @access Private/Admin
 */
export const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.updateCoupon(req.params.id, req.body);
        sendResponse(res, 200, 'Coupon updated successfully', coupon);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete coupon
 * DELETE /api/v1/coupons/:id
 * @access Private/Admin
 */
export const deleteCoupon = async (req, res, next) => {
    try {
        await couponService.deleteCoupon(req.params.id);
        sendResponse(res, 200, 'Coupon deleted successfully');
    } catch (error) {
        next(error);
    }
};

export default {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
