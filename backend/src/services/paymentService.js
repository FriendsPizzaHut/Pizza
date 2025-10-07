/**
 * Payment Service
 * 
 * Business logic for payment management.
 * Handles payment recording and retrieval.
 */

import Payment from '../models/Payment.js';
import { invalidateDashboardCache } from './dashboardService.js';

/**
 * Create payment record
 * @param {Object} paymentData - Payment data
 * @returns {Object} - Created payment
 */
export const createPayment = async (paymentData) => {
    const payment = await Payment.create(paymentData);
    await payment.populate('order user');

    // Invalidate dashboard cache (new payment affects revenue stats)
    await invalidateDashboardCache();

    return payment;
};

/**
 * Get payment by ID
 * @param {String} paymentId - Payment ID
 * @returns {Object} - Payment details
 */
export const getPaymentById = async (paymentId) => {
    const payment = await Payment.findById(paymentId)
        .populate('order')
        .populate('user', 'name email');

    if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }

    return payment;
};

/**
 * Get all payments (admin)
 * @param {Object} filters - Optional filters
 * @returns {Array} - List of payments
 */
export const getAllPayments = async (filters = {}) => {
    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
    }

    const payments = await Payment.find(query)
        .populate('order')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    return payments;
};

/**
 * Delete payment
 * @param {String} paymentId - Payment ID
 * @returns {Object} - Success message
 */
export const deletePayment = async (paymentId) => {
    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }

    return { message: 'Payment deleted successfully' };
};

export default {
    createPayment,
    getPaymentById,
    getAllPayments,
    deletePayment,
};
