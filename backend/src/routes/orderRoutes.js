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
    getAllOrders,
    getOrdersByUser,
    updateOrderStatus,
    deleteOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly, deliveryOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createOrderValidator, updateOrderStatusValidator } from '../utils/validators/orderValidator.js';

const router = express.Router();

// Create new order (authenticated users, with validation)
router.post('/', protect, validate(createOrderValidator), createOrder);

// Get all orders (admin only)
router.get('/', protect, adminOnly, getAllOrders);

// Get orders by user (authenticated users - own orders)
router.get('/user/:userId', protect, getOrdersByUser);

// Update order status (admin or delivery agents, with validation)
router.patch('/:id/status', protect, deliveryOnly, validate(updateOrderStatusValidator), updateOrderStatus);

// Cancel/delete order (authenticated users or admin)
router.delete('/:id', protect, deleteOrder);

export default router;
