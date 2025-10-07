/**
 * Order Controller
 * 
 * Handles order operations:
 * - Create new order
 * - Get all orders (admin)
 * - Get orders by user
 * - Update order status
 * - Cancel/delete order
 * 
 * Controllers orchestrate request/response only - business logic in services
 * Emits real-time Socket.IO events for order lifecycle
 */

import * as orderService from '../services/orderService.js';
import { sendResponse } from '../utils/response.js';
import { emitNewOrder, emitOrderStatusUpdate, emitOrderCancelled } from '../socket/events.js';

/**
 * Create new order
 * POST /api/v1/orders
 * @access Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.body);

        // Emit real-time notification to admin and delivery agents
        emitNewOrder(order);

        sendResponse(res, 201, 'Order created successfully', order);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all orders with pagination
 * GET /api/v1/orders
 * @access Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        sendResponse(res, 200, 'Orders retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get orders by user
 * GET /api/v1/orders/user/:userId
 * @access Private
 */
export const getOrdersByUser = async (req, res, next) => {
    try {
        const orders = await orderService.getOrdersByUser(req.params.userId);
        sendResponse(res, 200, 'User orders retrieved successfully', orders);
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status
 * PATCH /api/v1/orders/:id/status
 * @access Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body);

        // Emit real-time update to customer, admin, and delivery agent
        emitOrderStatusUpdate(order);

        sendResponse(res, 200, 'Order status updated successfully', order);
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel/delete order
 * DELETE /api/v1/orders/:id
 * @access Private
 */
export const deleteOrder = async (req, res, next) => {
    try {
        const order = await orderService.deleteOrder(req.params.id);

        // Emit cancellation notification
        if (order) {
            emitOrderCancelled(order);
        }

        sendResponse(res, 200, 'Order deleted successfully');
    } catch (error) {
        next(error);
    }
};

export default {
    createOrder,
    getAllOrders,
    getOrdersByUser,
    updateOrderStatus,
    deleteOrder,
};
