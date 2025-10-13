/**
 * Cart Controller
 * 
 * Handles HTTP requests for cart operations.
 * Uses cartService for business logic.
 */

import * as cartService from '../services/cartService.js';

/**
 * GET /api/v1/cart
 * Get user's cart
 */
export const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'
        const cart = await cartService.getUserCart(userId);

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/cart/items
 * Add item to cart
 * Body: { productId, quantity, size, customToppings, specialInstructions }
 */
export const addItemToCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'
        const itemData = req.body;

        const cart = await cartService.addItemToCart(userId, itemData);

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/cart/items/:itemId
 * Update item quantity
 * Body: { quantity }
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        const cart = await cartService.updateCartItemQuantity(userId, itemId, quantity);

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/cart/items/:itemId
 * Remove item from cart
 */
export const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'
        const { itemId } = req.params;

        const cart = await cartService.removeCartItem(userId, itemId);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/cart
 * Clear entire cart
 */
export const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'

        const cart = await cartService.clearCart(userId);

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/cart/coupon
 * Apply coupon to cart
 * Body: { couponCode }
 */
export const applyCoupon = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'
        const { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const cart = await cartService.applyCouponToCart(userId, couponCode);

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/cart/coupon
 * Remove coupon from cart
 */
export const removeCoupon = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'

        const cart = await cartService.removeCouponFromCart(userId);

        res.status(200).json({
            success: true,
            message: 'Coupon removed successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/cart/validate
 * Validate cart before checkout
 */
export const validateCart = async (req, res, next) => {
    try {
        const userId = req.user.id; // JWT token contains 'id', not '_id'

        const validation = await cartService.validateCart(userId);

        if (validation.isValid) {
            res.status(200).json({
                success: true,
                message: 'Cart is valid',
                data: { cart: validation.cart }
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Cart validation found issues',
                data: validation
            });
        }
    } catch (error) {
        next(error);
    }
};
