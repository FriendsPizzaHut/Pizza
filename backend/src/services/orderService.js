/**
 * Order Service
 * 
 * Business logic for order management.
 * Handles order creation, status updates, and retrieval.
 */

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { invalidateDashboardCache } from './dashboardService.js';

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {Object} - Created order
 */
export const createOrder = async (orderData) => {
    const { items } = orderData;

    // Validate all products exist and are available
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            const error = new Error(`Product ${item.product} not found`);
            error.statusCode = 404;
            throw error;
        }

        if (!product.isAvailable) {
            const error = new Error(`Product ${product.name} is currently unavailable`);
            error.statusCode = 400;
            throw error;
        }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderData.totalAmount = totalAmount;

    // Create order
    const order = await Order.create(orderData);
    await order.populate('items.product', 'name price category');

    // Invalidate dashboard cache (new order affects stats)
    await invalidateDashboardCache();

    return order;
};

/**
 * Get all orders (admin)
 * @param {Object} filters - Optional filters
 * @returns {Array} - List of orders
 */
export const getAllOrders = async (filters = {}) => {
    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price category')
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 });

    return orders;
};

/**
 * Get orders by user
 * @param {String} userId - User ID
 * @returns {Array} - User's orders
 */
export const getOrdersByUser = async (userId) => {
    const orders = await Order.find({ user: userId })
        .populate('items.product', 'name price category')
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 });

    return orders;
};

/**
 * Update order status
 * @param {String} orderId - Order ID
 * @param {Object} updateData - Status and other data
 * @returns {Object} - Updated order
 */
export const updateOrderStatus = async (orderId, updateData) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    // Update status
    order.status = updateData.status;

    // Set delivered timestamp if status is delivered
    if (updateData.status === 'delivered') {
        order.deliveredAt = new Date();
    }

    // Update delivery agent if provided
    if (updateData.deliveryAgent) {
        order.deliveryAgent = updateData.deliveryAgent;
    }

    await order.save();
    await order.populate('items.product user deliveryAgent');

    // Invalidate dashboard cache (order status change affects stats)
    await invalidateDashboardCache();

    return order;
};

/**
 * Delete order
 * @param {String} orderId - Order ID
 * @returns {Object} - Success message
 */
export const deleteOrder = async (orderId) => {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    return { message: 'Order deleted successfully' };
};

export default {
    createOrder,
    getAllOrders,
    getOrdersByUser,
    updateOrderStatus,
    deleteOrder,
};
