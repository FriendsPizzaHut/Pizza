/**
 * Order Routes
 * 
 * Order management endpoints:
 * - POST /api/orders - Create new order
 * - GET /api/orders - Get all orders (admin)
 * - GET /api/orders/user/:userId - Get orders by user
 * - PATCH /api/orders/:id/status - Update order status
 * - DELETE /api/orders/:id - Cancel/delete order
 */

import express from 'express';
import {
    createOrder,
    createOrderFromCart,
    getAllOrders,
    getOrdersByUser,
    getOrderById,
    getMyOrders,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    updateOrderStatus,
    assignDeliveryAgent,
    deleteOrder,
    getDeliveryAgentOrders,
} from '../controllers/orderController.js';
import { protect, adminOnly, deliveryOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createOrderValidator, updateOrderStatusValidator } from '../utils/validators/orderValidator.js';

const router = express.Router();

// Create order from cart (authenticated users)
router.post('/from-cart', protect, createOrderFromCart);

// Create new order (authenticated users, with validation)
router.post('/', protect, validate(createOrderValidator), createOrder);

// Get my orders - optimized for mobile (authenticated users - own orders)
router.get('/my-orders', protect, getMyOrders);

// Get delivery agent's assigned orders (delivery agents only)
router.get('/delivery-agent/my-orders', protect, deliveryOnly, getDeliveryAgentOrders);

// Get all orders (admin only)
router.get('/', protect, adminOnly, getAllOrders);

// Get single order by ID (authenticated users - own order, admin, or assigned delivery agent)
router.get('/:id', protect, getOrderById);

// Get orders by user (authenticated users - own orders)
router.get('/user/:userId', protect, getOrdersByUser);

// Accept order (admin only) - pending → accepted
router.post('/:id/accept', protect, adminOnly, acceptOrder);

// Reject/cancel order (admin only)
router.post('/:id/reject', protect, adminOnly, rejectOrder);

// Mark order as ready (admin only) - accepted → ready
router.post('/:id/mark-ready', protect, adminOnly, markOrderReady);

// Update order status (admin or delivery agents, with validation)
router.patch('/:id/status', protect, deliveryOnly, validate(updateOrderStatusValidator), updateOrderStatus);

// Assign delivery agent to order (admin only)
router.patch('/:id/assign-delivery', protect, adminOnly, assignDeliveryAgent);

// Cancel/delete order (authenticated users or admin)
router.delete('/:id', protect, deleteOrder);

export default router;
