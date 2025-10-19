/**
 * Razorpay Service
 * 
 * Handles Razorpay payment gateway integration.
 * Provides functions for creating orders, verifying payments, and processing refunds.
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * @param {Object} orderData - Order data
 * @param {String} orderData.orderId - Database order ID
 * @param {Number} orderData.amount - Amount in rupees (will be converted to paise)
 * @param {String} orderData.currency - Currency code (default: INR)
 * @returns {Object} - Razorpay order object
 */
export const createRazorpayOrder = async (orderData) => {
    try {
        const { orderId, amount, currency = 'INR' } = orderData;

        // Validate amount
        if (!amount || amount <= 0) {
            const error = new Error('Invalid amount. Amount must be greater than 0');
            error.statusCode = 400;
            throw error;
        }

        // Convert amount to paise (Razorpay uses smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        // Create Razorpay order
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: currency,
            receipt: orderId, // Our database order ID
            notes: {
                order_id: orderId,
                description: 'Pizza Order Payment',
            },
        });

        logger.info(`Razorpay order created: ${razorpayOrder.id} for order: ${orderId}`);

        return {
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
            status: razorpayOrder.status,
        };
    } catch (error) {
        logger.error('Error creating Razorpay order:', error);

        // Handle Razorpay specific errors
        if (error.statusCode) {
            throw error;
        }

        const err = new Error('Failed to create payment order. Please try again.');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Verify Payment Signature
 * @param {Object} paymentData - Payment verification data
 * @param {String} paymentData.razorpay_order_id - Razorpay order ID
 * @param {String} paymentData.razorpay_payment_id - Razorpay payment ID
 * @param {String} paymentData.razorpay_signature - Payment signature
 * @returns {Boolean} - True if signature is valid
 */
export const verifyPaymentSignature = (paymentData) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            logger.error('Missing payment verification parameters');
            return false;
        }

        // Generate expected signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        // Compare signatures
        const isValid = generatedSignature === razorpay_signature;

        if (isValid) {
            logger.info(`Payment signature verified for payment: ${razorpay_payment_id}`);
        } else {
            logger.warn(`Invalid payment signature for payment: ${razorpay_payment_id}`);
        }

        return isValid;
    } catch (error) {
        logger.error('Error verifying payment signature:', error);
        return false;
    }
};

/**
 * Verify Webhook Signature
 * @param {String} webhookBody - Raw webhook body
 * @param {String} signature - Webhook signature from header
 * @returns {Boolean} - True if signature is valid
 */
export const verifyWebhookSignature = (webhookBody, signature) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            logger.warn('Webhook secret not configured');
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(webhookBody))
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        logger.error('Error verifying webhook signature:', error);
        return false;
    }
};

/**
 * Fetch Payment Details from Razorpay
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Object} - Payment details
 */
export const fetchPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);

        logger.info(`Fetched payment details for: ${paymentId}`);

        return {
            id: payment.id,
            orderId: payment.order_id,
            amount: payment.amount / 100, // Convert from paise to rupees
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            bank: payment.bank,
            wallet: payment.wallet,
            vpa: payment.vpa,
            email: payment.email,
            contact: payment.contact,
            card_id: payment.card_id,
            acquirer_data: payment.acquirer_data,
            createdAt: payment.created_at,
            captured: payment.captured,
            errorCode: payment.error_code,
            errorDescription: payment.error_description,
        };
    } catch (error) {
        logger.error('Error fetching payment details:', error);

        const err = new Error('Failed to fetch payment details');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Fetch Order Details from Razorpay
 * @param {String} razorpayOrderId - Razorpay order ID
 * @returns {Object} - Order details
 */
export const fetchOrderDetails = async (razorpayOrderId) => {
    try {
        const order = await razorpayInstance.orders.fetch(razorpayOrderId);

        logger.info(`Fetched order details for: ${razorpayOrderId}`);

        return {
            id: order.id,
            amount: order.amount / 100,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            attempts: order.attempts,
            createdAt: order.created_at,
        };
    } catch (error) {
        logger.error('Error fetching order details:', error);

        const err = new Error('Failed to fetch order details');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Initiate Refund
 * @param {Object} refundData - Refund data
 * @param {String} refundData.paymentId - Razorpay payment ID
 * @param {Number} refundData.amount - Amount to refund (optional, full refund if not provided)
 * @param {String} refundData.notes - Refund notes (optional)
 * @returns {Object} - Refund details
 */
export const initiateRefund = async (refundData) => {
    try {
        const { paymentId, amount, notes } = refundData;

        if (!paymentId) {
            const error = new Error('Payment ID is required for refund');
            error.statusCode = 400;
            throw error;
        }

        const refundOptions = {
            notes: notes || {},
        };

        // If amount specified, convert to paise
        if (amount) {
            refundOptions.amount = Math.round(amount * 100);
        }

        const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);

        logger.info(`Refund initiated: ${refund.id} for payment: ${paymentId}`);

        return {
            id: refund.id,
            paymentId: refund.payment_id,
            amount: refund.amount / 100,
            currency: refund.currency,
            status: refund.status,
            createdAt: refund.created_at,
        };
    } catch (error) {
        logger.error('Error initiating refund:', error);

        const err = new Error('Failed to initiate refund. Please try again.');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Fetch Refund Details
 * @param {String} refundId - Razorpay refund ID
 * @returns {Object} - Refund details
 */
export const fetchRefundDetails = async (refundId) => {
    try {
        const refund = await razorpayInstance.refunds.fetch(refundId);

        logger.info(`Fetched refund details for: ${refundId}`);

        return {
            id: refund.id,
            paymentId: refund.payment_id,
            amount: refund.amount / 100,
            currency: refund.currency,
            status: refund.status,
            speedProcessed: refund.speed_processed,
            createdAt: refund.created_at,
        };
    } catch (error) {
        logger.error('Error fetching refund details:', error);

        const err = new Error('Failed to fetch refund details');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Check if Razorpay credentials are configured
 * @returns {Boolean} - True if credentials are configured
 */
export const isRazorpayConfigured = () => {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

export default {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    fetchPaymentDetails,
    fetchOrderDetails,
    initiateRefund,
    fetchRefundDetails,
    isRazorpayConfigured,
};
