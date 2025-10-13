/**
 * Order Thunks
 * 
 * Async Redux actions for order operations.
 * Handles order placement with cart clearing and optimistic updates.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../src/services/orderService';
import { clearCart } from '../slices/cartSlice';
import { CreateOrderParams } from '../../src/services/orderService';

/**
 * Place order from cart
 * 
 * Optimizations:
 * - Single API call creates order and clears cart on backend
 * - Automatically clears Redux cart state on success
 * - Returns order details for confirmation screen
 * 
 * @param orderData - Order details (address, payment, etc.)
 * @returns Created order object
 */
export const placeOrderFromCartThunk = createAsyncThunk(
    'order/placeFromCart',
    async (orderData: CreateOrderParams, { dispatch, rejectWithValue }) => {
        try {
            // Call API to place order (backend clears cart atomically)
            const order = await orderService.createOrderFromCart(orderData);

            // Clear cart in Redux immediately after successful order
            dispatch(clearCart());

            return order;
        } catch (error: any) {
            // Extract error message
            const message = error.response?.data?.message
                || error.message
                || 'Failed to place order. Please try again.';

            return rejectWithValue(message);
        }
    }
);

/**
 * Fetch user orders with pagination
 * 
 * @param params - Pagination parameters
 */
export const fetchUserOrdersThunk = createAsyncThunk(
    'order/fetchUserOrders',
    async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10 } = params;
            const response = await orderService.getUserOrders(page, limit);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.message
                || 'Failed to fetch orders';

            return rejectWithValue(message);
        }
    }
);

/**
 * Fetch order by ID
 * 
 * @param orderId - Order ID
 */
export const fetchOrderByIdThunk = createAsyncThunk(
    'order/fetchById',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const order = await orderService.getOrderById(orderId);
            return order;
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.message
                || 'Failed to fetch order details';

            return rejectWithValue(message);
        }
    }
);

/**
 * Cancel order
 * 
 * @param params - Order ID and optional reason
 */
export const cancelOrderThunk = createAsyncThunk(
    'order/cancel',
    async (params: { orderId: string; reason?: string }, { rejectWithValue }) => {
        try {
            const { orderId, reason } = params;
            const order = await orderService.cancelOrder(orderId, reason);
            return order;
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.message
                || 'Failed to cancel order';

            return rejectWithValue(message);
        }
    }
);

/**
 * Track order by order number
 * 
 * @param orderNumber - Order number (e.g., ORD-ABC123)
 */
export const trackOrderThunk = createAsyncThunk(
    'order/track',
    async (orderNumber: string, { rejectWithValue }) => {
        try {
            const order = await orderService.trackOrder(orderNumber);
            return order;
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.message
                || 'Failed to track order';

            return rejectWithValue(message);
        }
    }
);

/**
 * Rate order
 * 
 * @param params - Order ID, rating score, and optional review
 */
export const rateOrderThunk = createAsyncThunk(
    'order/rate',
    async (params: { orderId: string; score: number; review?: string }, { rejectWithValue }) => {
        try {
            const { orderId, score, review } = params;
            const order = await orderService.rateOrder(orderId, { score, review });
            return order;
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.message
                || 'Failed to submit rating';

            return rejectWithValue(message);
        }
    }
);
