/**
 * Cart Slice
 * 
 * Redux state management for shopping cart.
 * Handles cart items, totals, loading states, and errors.
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Cart, CartItem } from '../../src/services/cartService';

// State interface
export interface CartState {
    cart: Cart | null;
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    appliedCoupon: string | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
}

// Initial state
const initialState: CartState = {
    cart: null,
    items: [],
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    appliedCoupon: null,
    isLoading: false,
    error: null,
    lastFetched: null,
};

// Cart slice
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Set cart data
        setCart: (state, action: PayloadAction<Cart>) => {
            const cart = action.payload;
            state.cart = cart;
            state.items = cart.items || [];
            state.itemCount = cart.totalItems || 0;
            state.subtotal = cart.subtotal || 0;
            state.tax = cart.tax || 0;
            state.deliveryFee = cart.deliveryFee || 0;
            state.discount = cart.discount || 0;
            state.total = cart.total || 0;
            state.appliedCoupon = cart.appliedCoupon || null;
            state.lastFetched = Date.now();
            state.isLoading = false; // ✅ Set loading to false after cart is loaded
            state.error = null;
        },

        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Set error
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Optimistic add item (updates UI immediately)
        optimisticAddItem: (state, action: PayloadAction<CartItem>) => {
            const newItem = action.payload;
            const existingItemIndex = state.items.findIndex(
                (item) => item.product._id === newItem.product._id &&
                    item.size === newItem.size
            );

            if (existingItemIndex >= 0) {
                // Update quantity
                state.items[existingItemIndex].quantity += newItem.quantity;
                state.items[existingItemIndex].subtotal += newItem.subtotal;
            } else {
                // Add new item
                state.items.push(newItem);
            }

            // Recalculate totals
            state.itemCount += newItem.quantity;
            state.subtotal += newItem.subtotal;
            state.tax = state.subtotal * 0.08;
            state.deliveryFee = state.subtotal >= 2490 ? 0 : 40;
            state.total = state.subtotal + state.tax + state.deliveryFee - state.discount;
        },

        // Optimistic update quantity
        optimisticUpdateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
            const { itemId, quantity } = action.payload;
            const itemIndex = state.items.findIndex((item) => item._id === itemId);

            if (itemIndex >= 0) {
                const item = state.items[itemIndex];
                const oldQuantity = item.quantity;
                const pricePerItem = item.selectedPrice + (item.customToppings?.reduce((sum, t) => sum + t.price, 0) || 0);

                if (quantity === 0) {
                    // Remove item
                    state.itemCount -= oldQuantity;
                    state.subtotal -= item.subtotal;
                    state.items.splice(itemIndex, 1);
                } else {
                    // Update quantity
                    item.quantity = quantity;
                    item.subtotal = pricePerItem * quantity;
                    state.itemCount += (quantity - oldQuantity);
                    state.subtotal += (item.subtotal - (pricePerItem * oldQuantity));
                }

                // Recalculate totals
                state.tax = state.subtotal * 0.08;
                state.deliveryFee = state.subtotal >= 2490 ? 0 : 40;
                state.total = state.subtotal + state.tax + state.deliveryFee - state.discount;
            }
        },

        // Optimistic remove item
        optimisticRemoveItem: (state, action: PayloadAction<string>) => {
            const itemId = action.payload;
            const itemIndex = state.items.findIndex((item) => item._id === itemId);

            if (itemIndex >= 0) {
                const item = state.items[itemIndex];
                state.itemCount -= item.quantity;
                state.subtotal -= item.subtotal;
                state.items.splice(itemIndex, 1);

                // Recalculate totals
                state.tax = state.subtotal * 0.08;
                state.deliveryFee = state.subtotal >= 2490 ? 0 : 40;
                state.total = state.subtotal + state.tax + state.deliveryFee - state.discount;
            }
        },

        // Clear cart
        clearCart: (state) => {
            return { ...initialState, lastFetched: state.lastFetched };
        },

        // Reset cart state completely (on logout)
        resetCart: () => {
            return initialState;
        },
    },
});

// Export actions
export const {
    setCart,
    setLoading,
    setError,
    clearError,
    optimisticAddItem,
    optimisticUpdateQuantity,
    optimisticRemoveItem,
    clearCart,
    resetCart,
} = cartSlice.actions;

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.itemCount;

// Memoized selector for cart totals to prevent unnecessary re-renders
export const selectCartTotals = createSelector(
    [(state: { cart: CartState }) => state.cart],
    (cart) => ({
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee,
        discount: cart.discount,
        total: cart.total,
    })
);

export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectAppliedCoupon = (state: { cart: CartState }) => state.cart.appliedCoupon;

// Export reducer
export default cartSlice.reducer;
