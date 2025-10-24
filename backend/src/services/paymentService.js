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

/**
 * Get cash collections grouped by delivery agent
 * @returns {Array} - List of agents with their total cash collected
 */
export const getCashCollectionsByAgent = async () => {
    const cashCollections = await Payment.aggregate([
        {
            // Filter only COD orders with cash collection method and completed status
            $match: {
                paymentMethod: 'cod',
                collectionMethod: 'cash',
                paymentStatus: 'completed',
            },
        },
        {
            // Lookup order details to get delivery agent
            $lookup: {
                from: 'orders',
                localField: 'order',
                foreignField: '_id',
                as: 'orderDetails',
            },
        },
        {
            $unwind: '$orderDetails',
        },
        {
            // Lookup delivery agent details
            $lookup: {
                from: 'users',
                localField: 'orderDetails.deliveryAgent',
                foreignField: '_id',
                as: 'agentDetails',
            },
        },
        {
            $unwind: '$agentDetails',
        },
        {
            // Group by delivery agent
            $group: {
                _id: '$agentDetails._id',
                name: { $first: '$agentDetails.name' },
                email: { $first: '$agentDetails.email' },
                totalCashCollected: { $sum: '$amount' },
                deliveryCount: { $sum: 1 },
            },
        },
        {
            // Sort by total cash collected (highest first)
            $sort: { totalCashCollected: -1 },
        },
    ]);

    return cashCollections;
};

/**
 * Get payment statistics
 * @returns {Object} - Payment statistics
 */
export const getPaymentStats = async () => {
    const stats = await Payment.aggregate([
        {
            $match: {
                paymentStatus: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                cashCollections: {
                    $sum: {
                        $cond: [{ $eq: ['$collectionMethod', 'cash'] }, '$amount', 0],
                    },
                },
                onlinePayments: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: ['$paymentMethod', 'cod'] },
                                    { $ne: ['$paymentGateway', 'cash'] },
                                ],
                            },
                            '$amount',
                            0,
                        ],
                    },
                },
                codOrders: {
                    $sum: {
                        $cond: [{ $eq: ['$paymentMethod', 'cod'] }, 1, 0],
                    },
                },
            },
        },
    ]);

    return stats.length > 0
        ? stats[0]
        : {
            totalRevenue: 0,
            totalTransactions: 0,
            cashCollections: 0,
            onlinePayments: 0,
            codOrders: 0,
        };
};

export default {
    createPayment,
    getPaymentById,
    getAllPayments,
    deletePayment,
    getCashCollectionsByAgent,
    getPaymentStats,
};
