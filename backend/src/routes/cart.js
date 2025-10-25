/**
 * Cart Routes
 * 
 * API endpoints for cart management
 * Base path: /api/v1/cart
 * All routes require authentication
 */

import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/cart
 * @desc    Get user's cart
 * @access  Private (Customer)
 */
router.get('/', authorize('customer'), cartController.getCart);

/**
 * @route   GET /api/v1/cart/validate
 * @desc    Validate cart before checkout
 * @access  Private (Customer)
 */
router.get('/validate', authorize('customer'), cartController.validateCart);

/**
 * @route   POST /api/v1/cart/items
 * @desc    Add item to cart
 * @access  Private (Customer)
 * @body    { productId, quantity, size, customToppings, specialInstructions }
 */
router.post('/items', authorize('customer'), cartController.addItemToCart);

/**
 * @route   PATCH /api/v1/cart/items/:itemId
 * @desc    Update item quantity
 * @access  Private (Customer)
 * @body    { quantity }
 */
router.patch('/items/:itemId', authorize('customer'), cartController.updateCartItem);

/**
 * @route   DELETE /api/v1/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private (Customer)
 */
router.delete('/items/:itemId', authorize('customer'), cartController.removeCartItem);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear entire cart
 * @access  Private (Customer)
 */
router.delete('/', authorize('customer'), cartController.clearCart);

/**
 * @route   POST /api/v1/cart/coupon
 * @desc    Apply coupon to cart
 * @access  Private (Customer)
 * @body    { couponCode }
 */
router.post('/coupon', authorize('customer'), cartController.applyCoupon);

/**
 * @route   DELETE /api/v1/cart/coupon
 * @desc    Remove coupon from cart
 * @access  Private (Customer)
 */
router.delete('/coupon', authorize('customer'), cartController.removeCoupon);

export default router;
