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
import * as notificationService from '../services/notificationService.js';
import User from '../models/User.js';

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

        // Create in-app notification for all admins
        const priority = payment.status === 'failed' ? 'high' : 'medium';
        const title = payment.status === 'failed' ? 'Payment Failed' : 'Payment Received';
        const message = payment.status === 'failed'
            ? `Payment of ₹${payment.amount} failed for Order #${payment.order?.orderNumber || payment.order}`
            : `Payment of ₹${payment.amount} received for Order #${payment.order?.orderNumber || payment.order}`;

        User.find({ role: 'admin' }).then(admins => {
            admins.forEach(admin => {
                notificationService.createNotification({
                    user: admin._id,
                    type: 'payment',
                    title: title,
                    message: message,
                    priority: priority,
                    relatedEntity: {
                        entityType: 'payment',
                        entityId: payment._id
                    }
                }).catch(err => console.error('[NOTIFICATION] Failed to create notification:', err));
            });
        }).catch(err => console.error('[NOTIFICATION] Failed to fetch admins:', err));

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

/**
 * Get cash collections grouped by delivery agent
 * GET /api/v1/payments/cash-collections-by-agent
 * @access Private/Admin
 */
export const getCashCollectionsByAgent = async (req, res, next) => {
    try {
        const result = await paymentService.getCashCollectionsByAgent();
        sendResponse(res, 200, 'Cash collections by agent retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment statistics
 * GET /api/v1/payments/stats
 * @access Private/Admin
 */
export const getPaymentStats = async (req, res, next) => {
    try {
        const stats = await paymentService.getPaymentStats();
        sendResponse(res, 200, 'Payment statistics retrieved successfully', stats);
    } catch (error) {
        next(error);
    }
};

export default {
    createPayment,
    getPaymentById,
    getAllPayments,
    deletePayment,
    getCashCollectionsByAgent,
    getPaymentStats,
};
