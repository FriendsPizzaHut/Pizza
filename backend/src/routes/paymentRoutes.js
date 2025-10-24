/**
 * Payment Routes
 * 
 * Payment management endpoints:
 * - POST /api/payments - Record payment
 * - GET /api/payments/:id - Get payment details
 * - GET /api/payments - List payments (admin)
 * - DELETE /api/payments/:id - Delete old payments (cleanup)
 */

import express from 'express';
import {
    createPayment,
    getPaymentById,
    getAllPayments,
    deletePayment,
    getCashCollectionsByAgent,
    getPaymentStats,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createPaymentValidator } from '../utils/validators/paymentValidator.js';

const router = express.Router();

// Record payment (authenticated users, with validation)
router.post('/', protect, validate(createPaymentValidator), createPayment);

// Get cash collections by agent (admin only) - MUST come before /:id
router.get('/cash-collections-by-agent', protect, adminOnly, getCashCollectionsByAgent);

// Get payment stats (admin only) - MUST come before /:id
router.get('/stats', protect, adminOnly, getPaymentStats);

// Get payment details (authenticated users)
router.get('/:id', protect, getPaymentById);

// List all payments (admin only)
router.get('/', protect, adminOnly, getAllPayments);

// Delete payment (admin only)
router.delete('/:id', protect, adminOnly, deletePayment);

export default router;
