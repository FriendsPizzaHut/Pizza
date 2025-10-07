/**
 * Payment Controller
 * 
 * Handles payment operations:
 * - Record payment
 * - Get payment details
 * - List all payments (admin)
 * - Delete old payments (cleanup)
 * 
 * Controllers orchestrate request/response only - business logic in services
 * Emits real-time Socket.IO events for payment notifications
 */

import * as paymentService from '../services/paymentService.js';
import { sendResponse } from '../utils/response.js';
import { emitPaymentReceived } from '../socket/events.js';

/**
 * Record payment
 * POST /api/v1/payments
 * @access Private
 */
export const createPayment = async (req, res, next) => {
    try {
        const payment = await paymentService.createPayment(req.body);

        // Emit real-time payment notification to admin
        emitPaymentReceived(payment);

        sendResponse(res, 201, 'Payment recorded successfully', payment);
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment details
 * GET /api/v1/payments/:id
 * @access Private
 */
export const getPaymentById = async (req, res, next) => {
    try {
        const payment = await paymentService.getPaymentById(req.params.id);
        sendResponse(res, 200, 'Payment retrieved successfully', payment);
    } catch (error) {
        next(error);
    }
};

/**
 * List all payments with pagination
 * GET /api/v1/payments
 * @access Private/Admin
 */
export const getAllPayments = async (req, res, next) => {
    try {
        const result = await paymentService.getAllPayments(req.query);
        sendResponse(res, 200, 'Payments retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete old payments (cleanup)
 * DELETE /api/v1/payments/:id
 * @access Private/Admin
 */
export const deletePayment = async (req, res, next) => {
    try {
        await paymentService.deletePayment(req.params.id);
        sendResponse(res, 200, 'Payment deleted successfully');
    } catch (error) {
        next(error);
    }
};

export default {
    createPayment,
    getPaymentById,
    getAllPayments,
    deletePayment,
};
