/**
 * Payment Validators
 * 
 * Validation rules for payment endpoints.
 * Validates payment information and transaction details.
 */

import { body } from 'express-validator';

/**
 * Create payment validation rules
 */
export const createPaymentValidator = [
    body('order')
        .notEmpty()
        .withMessage('Order ID is required')
        .isMongoId()
        .withMessage('Invalid order ID format'),

    body('user')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    body('amount')
        .notEmpty()
        .withMessage('Payment amount is required')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),

    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['cash', 'card', 'upi', 'wallet'])
        .withMessage('Payment method must be cash, card, upi, or wallet'),

    body('status')
        .optional()
        .isIn(['pending', 'completed', 'failed'])
        .withMessage('Status must be pending, completed, or failed'),

    body('transactionId')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Transaction ID must be between 5 and 100 characters'),

    body('paymentGateway')
        .optional()
        .trim()
        .isIn(['razorpay', 'paytm', 'phonepe', 'gpay', 'cash'])
        .withMessage('Invalid payment gateway'),
];

export default {
    createPaymentValidator,
};
