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
import { emitNewOrder, emitOrderStatusUpdate, emitOrderCancelled, emitDeliveryAssignment } from '../socket/events.js';
import { notifyAdminsNewOrder, notifyDeliveryAgentOrderAssigned } from '../services/notifications/firebaseService.js';

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

        // Send push notification to admins (non-blocking)
        // This runs asynchronously and won't delay the response
        notifyAdminsNewOrder(order).catch(err => {
            // Log error but don't fail the request
            console.error('[ORDER] Failed to send push notification:', err);
        });

        sendResponse(res, 201, 'Order created successfully', order);
    } catch (error) {
        next(error);
    }
};

/**
 * Create order from cart
 * POST /api/v1/orders/from-cart
 * @access Private
 */
export const createOrderFromCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderData = req.body;

        const order = await orderService.createOrderFromCart(userId, orderData);

        // Emit real-time notification to admin and delivery agents
        emitNewOrder(order);

        // Send push notification to admins (non-blocking)
        // This runs asynchronously and won't delay the response
        notifyAdminsNewOrder(order).catch(err => {
            // Log error but don't fail the request
            console.error('[ORDER] Failed to send push notification:', err);
        });

        sendResponse(res, 201, 'Order placed successfully', order);
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
 * Get my orders (optimized for mobile OrdersScreen)
 * GET /api/v1/orders/my-orders
 * @access Private
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { limit, skip, status } = req.query;

        const orders = await orderService.getMyOrders(userId, {
            limit: parseInt(limit) || 20,
            skip: parseInt(skip) || 0,
            status,
        });

        sendResponse(res, 200, 'Orders retrieved successfully', orders);
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
 * Assign delivery agent to order
 * PATCH /api/v1/orders/:id/assign-delivery
 * @access Private/Admin
 */
export const assignDeliveryAgent = async (req, res, next) => {
    try {
        const { deliveryAgentId } = req.body;

        if (!deliveryAgentId) {
            return res.status(400).json({
                success: false,
                message: 'Delivery agent ID is required'
            });
        }

        const order = await orderService.assignDeliveryAgent(req.params.id, deliveryAgentId);

        // Emit real-time notification to delivery agent, admin, and customer
        emitDeliveryAssignment(order);

        // Send push notification to delivery agent (non-blocking)
        notifyDeliveryAgentOrderAssigned(order, deliveryAgentId).catch(err => {
            console.error('[ORDER] Failed to send push notification to delivery agent:', err);
        });

        sendResponse(res, 200, 'Delivery agent assigned successfully', order);
    } catch (error) {
        next(error);
    }
};

/**
 * Get single order by ID
 * GET /api/v1/orders/:id
 * @access Private (Admin or Order Owner)
 */
export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is admin or order owner
        const isAdmin = req.user.role === 'admin' || req.user.role === 'owner';
        const isOwner = order.user._id.toString() === req.user._id.toString();
        const isDeliveryAgent = order.deliveryAgent && order.deliveryAgent._id.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner && !isDeliveryAgent) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        sendResponse(res, 200, 'Order retrieved successfully', { order });
    } catch (error) {
        next(error);
    }
};

/**
 * Accept order (change status from pending to confirmed)
 * POST /api/v1/orders/:id/accept
 * @access Private (Admin only)
 */
export const acceptOrder = async (req, res, next) => {
    try {
        const order = await orderService.acceptOrder(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Emit socket event for real-time update
        emitOrderStatusUpdate(order);

        sendResponse(res, 200, 'Order accepted successfully', { order });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject/Cancel order
 * POST /api/v1/orders/:id/reject
 * @access Private (Admin only)
 */
export const rejectOrder = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await orderService.rejectOrder(req.params.id, reason);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Emit socket event for real-time update
        emitOrderCancelled(order);

        sendResponse(res, 200, 'Order rejected successfully', { order });
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

/**
 * Get orders assigned to delivery agent
 * GET /api/v1/orders/delivery-agent/my-orders
 * @access Private/Delivery Agent
 */
export const getDeliveryAgentOrders = async (req, res, next) => {
    try {
        const deliveryAgentId = req.user.id;
        const { status, limit } = req.query;

        console.log(`🚴 [DELIVERY AGENT ORDERS] Agent: ${deliveryAgentId}`);

        const orders = await orderService.getDeliveryAgentOrders(deliveryAgentId, {
            status,
            limit: limit ? parseInt(limit) : 20
        });

        sendResponse(res, 200, 'Orders retrieved successfully', { orders });
    } catch (error) {
        next(error);
    }
};

export default {
    createOrder,
    createOrderFromCart,
    getAllOrders,
    getOrdersByUser,
    getOrderById,
    getMyOrders,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    assignDeliveryAgent,
    deleteOrder,
    getDeliveryAgentOrders,
};
