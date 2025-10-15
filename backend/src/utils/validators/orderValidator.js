/**
 * Order Validators
 * 
 * Validation rules for order endpoints (create, update status).
 * Validates order items, addresses, and status transitions.
 */

import { body } from 'express-validator';

/**
 * Create order validation rules
 */
export const createOrderValidator = [
    body('user')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),

    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),

    body('items.*.product')
        .notEmpty()
        .withMessage('Product ID is required for each item')
        .isMongoId()
        .withMessage('Invalid product ID format'),

    body('items.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required for each item')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),

    body('items.*.price')
        .notEmpty()
        .withMessage('Price is required for each item')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('deliveryAddress')
        .optional()
        .isObject()
        .withMessage('Delivery address must be an object'),

    body('deliveryAddress.street')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Street is required in delivery address'),

    body('deliveryAddress.city')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('City is required in delivery address'),

    body('deliveryAddress.state')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('State is required in delivery address'),

    body('deliveryAddress.zipCode')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Zip code is required in delivery address'),

    body('paymentMethod')
        .optional()
        .trim()
        .isIn(['cash', 'card', 'upi', 'wallet'])
        .withMessage('Payment method must be cash, card, upi, or wallet'),
];

/**
 * Update order status validation rules
 */
export const updateOrderStatusValidator = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'awaiting_payment', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Invalid order status'),

    body('deliveryAgent')
        .optional()
        .isMongoId()
        .withMessage('Invalid delivery agent ID format'),

    body('cancellationReason')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Cancellation reason must be between 5 and 200 characters'),
];

export default {
    createOrderValidator,
    updateOrderStatusValidator,
};
