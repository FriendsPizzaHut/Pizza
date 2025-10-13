/**
 * Cart Thunks
 * 
 * Async actions for cart operations.
 * Uses optimistic updates for better UX.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../src/services/cartService';
import {
    setCart,
    setLoading,
    setError,
    optimisticAddItem,
    optimisticUpdateQuantity,
    optimisticRemoveItem,
    CartState,
} from '../slices/cartSlice';
import { AddItemParams, UpdateQuantityParams } from '../../src/services/cartService';

// ==================== FETCH CART ====================

/**
 * Fetch user's cart from server
 */
export const fetchCartThunk = createAsyncThunk(
    'cart/fetchCart',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const cart = await cartService.getCart();
            dispatch(setCart(cart));
            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to fetch cart';
            dispatch(setError(message));
            return rejectWithValue(message);
        }
    }
);

// ==================== ADD TO CART ====================

/**
 * Add item to cart with optimistic update
 */
export const addToCartThunk = createAsyncThunk(
    'cart/addToCart',
    async (params: AddItemParams, { dispatch, rejectWithValue, getState }) => {
        try {
            // Optimistic update (immediate UI feedback)
            // Note: We don't have full product data here, so we'll just update after API call
            dispatch(setLoading(true));

            // Make API call
            const cart = await cartService.addItemToCart(params);

            // Update with real data from server
            dispatch(setCart(cart));

            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to add item to cart';
            dispatch(setError(message));
            return rejectWithValue(message);
        }
    }
);

// ==================== UPDATE CART ITEM ====================

/**
 * Update cart item quantity with optimistic update
 */
export const updateCartItemThunk = createAsyncThunk(
    'cart/updateCartItem',
    async (params: UpdateQuantityParams, { dispatch, rejectWithValue }) => {
        try {
            // Optimistic update
            dispatch(optimisticUpdateQuantity(params));

            // Make API call
            const cart = await cartService.updateCartItem(params);

            // Update with real data from server (in case of price changes)
            dispatch(setCart(cart));

            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to update cart item';

            // Revert optimistic update by fetching fresh cart
            try {
                const freshCart = await cartService.getCart();
                dispatch(setCart(freshCart));
            } catch (fetchError) {
                // If fetch fails, just show error
                dispatch(setError(message));
            }

            return rejectWithValue(message);
        }
    }
);

// ==================== REMOVE CART ITEM ====================

/**
 * Remove item from cart with optimistic update
 */
export const removeCartItemThunk = createAsyncThunk(
    'cart/removeCartItem',
    async (itemId: string, { dispatch, rejectWithValue }) => {
        try {
            // Optimistic update
            dispatch(optimisticRemoveItem(itemId));

            // Make API call
            const cart = await cartService.removeCartItem(itemId);

            // Update with real data from server
            dispatch(setCart(cart));

            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to remove item from cart';

            // Revert optimistic update
            try {
                const freshCart = await cartService.getCart();
                dispatch(setCart(freshCart));
            } catch (fetchError) {
                dispatch(setError(message));
            }

            return rejectWithValue(message);
        }
    }
);

// ==================== CLEAR CART ====================

/**
 * Clear entire cart
 */
export const clearCartThunk = createAsyncThunk(
    'cart/clearCart',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const cart = await cartService.clearCart();
            dispatch(setCart(cart));
            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to clear cart';
            dispatch(setError(message));
            return rejectWithValue(message);
        }
    }
);

// ==================== APPLY COUPON ====================

/**
 * Apply coupon to cart
 */
export const applyCouponThunk = createAsyncThunk(
    'cart/applyCoupon',
    async (couponCode: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const cart = await cartService.applyCoupon({ couponCode });
            dispatch(setCart(cart));
            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to apply coupon';
            dispatch(setError(message));
            return rejectWithValue(message);
        }
    }
);

// ==================== REMOVE COUPON ====================

/**
 * Remove coupon from cart
 */
export const removeCouponThunk = createAsyncThunk(
    'cart/removeCoupon',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const cart = await cartService.removeCoupon();
            dispatch(setCart(cart));
            return cart;
        } catch (error: any) {
            const message = error.message || 'Failed to remove coupon';
            dispatch(setError(message));
            return rejectWithValue(message);
        }
    }
);

// ==================== VALIDATE CART ====================

/**
 * Validate cart before checkout
 */
export const validateCartThunk = createAsyncThunk(
    'cart/validateCart',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const validation = await cartService.validateCart();

            if (validation.cart) {
                dispatch(setCart(validation.cart));
            }

            dispatch(setLoading(false));
            return validation;
        } catch (error: any) {
            const message = error.message || 'Failed to validate cart';
            dispatch(setError(message));
            return rejectWithValue(message);
        }
    }
);
