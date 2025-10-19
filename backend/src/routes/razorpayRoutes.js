/**
 * Razorpay Routes
 * 
 * Handles Razorpay payment-related routes
 */

import express from 'express';
import * as razorpayController from '../controllers/razorpayController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/payments/razorpay/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', authenticate, razorpayController.createRazorpayOrder);

/**
 * @route   POST /api/v1/payments/razorpay/verify
 * @desc    Verify payment signature
 * @access  Private
 */
router.post('/verify', authenticate, razorpayController.verifyPayment);

/**
 * @route   POST /api/v1/payments/razorpay/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (verified via signature)
 * @note    This endpoint should NOT use the protect middleware
 *          as webhooks come from Razorpay servers, not authenticated users
 */
router.post('/webhook', razorpayController.handleWebhook);

/**
 * @route   GET /api/v1/payments/razorpay/status/:orderId
 * @desc    Get payment status for an order
 * @access  Private
 */
router.get('/status/:orderId', authenticate, razorpayController.getPaymentStatus);

export default router;
