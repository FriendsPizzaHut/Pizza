/**
 * Razorpay Controller
 * 
 * Handles Razorpay payment operations:
 * - Create Razorpay order
 * - Verify payment
 * - Handle webhooks
 * - Get payment status
 * 
 * Controllers orchestrate request/response - business logic in services
 */

import * as razorpayService from '../services/razorpayService.js';
import * as paymentService from '../services/paymentService.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { sendResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
import { emitPaymentReceived } from '../socket/events.js';

/**
 * Create Razorpay Order
 * POST /api/v1/payments/razorpay/create-order
 * @access Private
 */
export const createRazorpayOrder = async (req, res, next) => {
    try {
        logger.info('📥 Razorpay create-order request:', {
            userId: req.user?.id,
            userRole: req.user?.role,
            body: req.body
        });

        const { orderId, amount } = req.body;

        // Validation
        if (!orderId) {
            const error = new Error('Order ID is required');
            error.statusCode = 400;
            throw error;
        }

        if (!amount || amount <= 0) {
            const error = new Error('Valid amount is required');
            error.statusCode = 400;
            throw error;
        }

        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            logger.error('❌ User not authenticated in request');
            const error = new Error('Authentication required');
            error.statusCode = 401;
            throw error;
        }

        // Check if Razorpay is configured
        if (!razorpayService.isRazorpayConfigured()) {
            const error = new Error('Payment gateway not configured. Please contact support.');
            error.statusCode = 503;
            throw error;
        }

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            logger.error('❌ Order not found:', orderId);
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        logger.info('✅ Order found:', {
            orderId: order._id,
            orderUserId: order.user.toString(),
            requestUserId: req.user.id
        });

        // Check if user owns this order (security check)
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            logger.error('❌ Unauthorized access attempt:', {
                orderUserId: order.user.toString(),
                requestUserId: req.user.id
            });
            const error = new Error('Unauthorized to access this order');
            error.statusCode = 403;
            throw error;
        }

        // Verify amount matches order total
        if (Math.abs(order.totalAmount - amount) > 0.01) {
            const error = new Error('Payment amount does not match order total');
            error.statusCode = 400;
            throw error;
        }

        // Check if payment already exists for this order
        const existingPayment = await Payment.findOne({
            order: orderId,
            paymentStatus: 'completed'
        });

        if (existingPayment) {
            const error = new Error('Payment already completed for this order');
            error.statusCode = 400;
            throw error;
        }

        // Create Razorpay order
        const razorpayOrder = await razorpayService.createRazorpayOrder({
            orderId: orderId,
            amount: amount,
            currency: 'INR',
        });

        // Return Razorpay order details with key
        logger.info('✅ Razorpay order created successfully:', razorpayOrder.razorpayOrderId);

        sendResponse(res, 201, 'Razorpay order created successfully', {
            ...razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID, // Frontend needs this
        });
    } catch (error) {
        logger.error('❌ Error in createRazorpayOrder:', {
            message: error.message,
            statusCode: error.statusCode,
            stack: error.stack,
            user: req.user?.id
        });
        next(error);
    }
};

/**
 * Verify Payment
 * POST /api/v1/payments/razorpay/verify
 * @access Private
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Validation
        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            const error = new Error('Missing required payment verification parameters');
            error.statusCode = 400;
            throw error;
        }

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user owns this order (security check)
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            const error = new Error('Unauthorized to access this order');
            error.statusCode = 403;
            throw error;
        }

        // Verify payment signature
        const isValid = razorpayService.verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValid) {
            logger.warn(`Payment verification failed for order: ${orderId}`);
            const error = new Error('Payment verification failed. Invalid signature.');
            error.statusCode = 400;
            throw error;
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpayService.fetchPaymentDetails(razorpay_payment_id);

        // Check if payment is captured
        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
            const error = new Error(`Payment not successful. Status: ${paymentDetails.status}`);
            error.statusCode = 400;
            throw error;
        }

        // Create or update payment record
        let payment = await Payment.findOne({
            order: orderId,
            razorpayOrderId: razorpay_order_id
        });

        if (payment) {
            // Update existing payment record
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.paymentStatus = 'completed';
            payment.paymentGateway = 'razorpay';
            payment.paymentMetadata = {
                method: paymentDetails.method,
                bank: paymentDetails.bank,
                wallet: paymentDetails.wallet,
                vpa: paymentDetails.vpa,
                card_id: paymentDetails.card_id,
                email: paymentDetails.email,
                contact: paymentDetails.contact,
                acquirer_data: paymentDetails.acquirer_data,
            };
            await payment.save();
        } else {
            // Create new payment record
            payment = await Payment.create({
                order: orderId,
                user: req.user.id,
                amount: paymentDetails.amount,
                paymentMethod: paymentDetails.method === 'upi' ? 'upi' :
                    paymentDetails.method === 'card' ? 'card' :
                        paymentDetails.method === 'wallet' ? 'wallet' : 'card',
                paymentStatus: 'completed',
                paymentGateway: 'razorpay',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                transactionId: razorpay_payment_id,
                paymentMetadata: {
                    method: paymentDetails.method,
                    bank: paymentDetails.bank,
                    wallet: paymentDetails.wallet,
                    vpa: paymentDetails.vpa,
                    card_id: paymentDetails.card_id,
                    email: paymentDetails.email,
                    contact: paymentDetails.contact,
                    acquirer_data: paymentDetails.acquirer_data,
                },
            });
        }

        // Update order payment status
        order.paymentStatus = 'completed';
        await order.save();

        // Populate payment for response
        await payment.populate('order user');

        // Emit real-time payment notification to admin
        emitPaymentReceived(payment);

        logger.info(`Payment verified and completed for order: ${orderId}`);

        sendResponse(res, 200, 'Payment verified successfully', {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
            },
            payment: {
                _id: payment._id,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                paymentStatus: payment.paymentStatus,
                razorpayPaymentId: payment.razorpayPaymentId,
                createdAt: payment.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Razorpay Webhook
 * POST /api/v1/payments/razorpay/webhook
 * @access Public (but verified via signature)
 */
export const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            logger.warn('Webhook received without signature');
            return res.status(400).json({ error: 'Missing signature' });
        }

        // Verify webhook signature
        const isValid = razorpayService.verifyWebhookSignature(req.body, signature);

        if (!isValid) {
            logger.warn('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        logger.info(`Webhook received: ${event}`);

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;

            case 'refund.created':
            case 'refund.processed':
                await handleRefundProcessed(payload);
                break;

            case 'refund.failed':
                await handleRefundFailed(payload);
                break;

            default:
                logger.info(`Unhandled webhook event: ${event}`);
        }

        // Always return 200 to acknowledge webhook receipt
        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Error handling webhook:', error);
        // Still return 200 to prevent Razorpay from retrying
        res.status(200).json({ received: true, error: error.message });
    }
};

/**
 * Get Payment Status
 * GET /api/v1/payments/razorpay/status/:orderId
 * @access Private
 */
export const getPaymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            const error = new Error('Unauthorized to access this order');
            error.statusCode = 403;
            throw error;
        }

        // Find payment record
        const payment = await Payment.findOne({ order: orderId })
            .sort({ createdAt: -1 }); // Get latest payment

        if (!payment) {
            return sendResponse(res, 200, 'Payment not found', {
                paymentStatus: 'pending',
                message: 'No payment record found for this order',
            });
        }

        sendResponse(res, 200, 'Payment status retrieved', {
            paymentStatus: payment.paymentStatus,
            paymentMethod: payment.paymentMethod,
            paymentGateway: payment.paymentGateway,
            amount: payment.amount,
            razorpayPaymentId: payment.razorpayPaymentId,
            razorpayOrderId: payment.razorpayOrderId,
            paymentMetadata: payment.paymentMetadata,
            createdAt: payment.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// ==================== WEBHOOK HANDLERS ====================

/**
 * Handle payment.captured webhook
 */
const handlePaymentCaptured = async (payload) => {
    try {
        const paymentEntity = payload.payment.entity;
        const razorpayPaymentId = paymentEntity.id;
        const razorpayOrderId = paymentEntity.order_id;

        logger.info(`Payment captured: ${razorpayPaymentId}`);

        // Find payment record by Razorpay order ID
        const payment = await Payment.findOne({ razorpayOrderId });

        if (!payment) {
            logger.warn(`Payment record not found for Razorpay order: ${razorpayOrderId}`);
            return;
        }

        // Update payment if not already completed
        if (payment.paymentStatus !== 'completed') {
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.paymentStatus = 'completed';
            payment.paymentMetadata = {
                method: paymentEntity.method,
                bank: paymentEntity.bank,
                wallet: paymentEntity.wallet,
                vpa: paymentEntity.vpa,
                email: paymentEntity.email,
                contact: paymentEntity.contact,
            };
            await payment.save();

            // Update order payment status
            const order = await Order.findById(payment.order);
            if (order) {
                order.paymentStatus = 'completed';
                await order.save();
            }

            logger.info(`Payment updated from webhook: ${razorpayPaymentId}`);
        }
    } catch (error) {
        logger.error('Error handling payment.captured webhook:', error);
    }
};

/**
 * Handle payment.failed webhook
 */
const handlePaymentFailed = async (payload) => {
    try {
        const paymentEntity = payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;

        logger.info(`Payment failed: ${paymentEntity.id}`);

        // Find payment record
        const payment = await Payment.findOne({ razorpayOrderId });

        if (payment && payment.paymentStatus === 'pending') {
            payment.paymentStatus = 'failed';
            await payment.save();

            logger.info(`Payment marked as failed: ${paymentEntity.id}`);
        }
    } catch (error) {
        logger.error('Error handling payment.failed webhook:', error);
    }
};

/**
 * Handle refund.processed webhook
 */
const handleRefundProcessed = async (payload) => {
    try {
        const refundEntity = payload.refund.entity;
        const razorpayPaymentId = refundEntity.payment_id;
        const refundId = refundEntity.id;

        logger.info(`Refund processed: ${refundId}`);

        // Find payment record
        const payment = await Payment.findOne({ razorpayPaymentId });

        if (payment) {
            payment.refundStatus = 'processed';
            payment.refundId = refundId;
            payment.refundAmount = refundEntity.amount / 100; // Convert from paise
            await payment.save();

            // Update order status to refunded
            const order = await Order.findById(payment.order);
            if (order) {
                order.status = 'refunded';
                await order.save();
            }

            logger.info(`Refund updated: ${refundId} for payment: ${razorpayPaymentId}`);
        }
    } catch (error) {
        logger.error('Error handling refund.processed webhook:', error);
    }
};

/**
 * Handle refund.failed webhook
 */
const handleRefundFailed = async (payload) => {
    try {
        const refundEntity = payload.refund.entity;
        const razorpayPaymentId = refundEntity.payment_id;

        logger.info(`Refund failed: ${refundEntity.id}`);

        // Find payment record
        const payment = await Payment.findOne({ razorpayPaymentId });

        if (payment) {
            payment.refundStatus = 'failed';
            await payment.save();

            logger.info(`Refund marked as failed for payment: ${razorpayPaymentId}`);
        }
    } catch (error) {
        logger.error('Error handling refund.failed webhook:', error);
    }
};

export default {
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
    getPaymentStatus,
};
