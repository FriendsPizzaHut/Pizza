/**
 * Business Validators
 * 
 * Validation rules for business settings endpoints.
 * Validates business information and operating hours.
 */

import { body } from 'express-validator';

/**
 * Update business validation rules
 */
export const updateBusinessValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be 10 digits'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('address')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10 and 200 characters'),

    body('isOpen')
        .optional()
        .isBoolean()
        .withMessage('isOpen must be a boolean'),

    body('openingTime')
        .optional()
        .trim()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Opening time must be in HH:MM format'),

    body('closingTime')
        .optional()
        .trim()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Closing time must be in HH:MM format'),

    body('deliveryRadius')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Delivery radius must be a positive number'),

    body('minOrderAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum order amount must be a positive number'),

    body('deliveryCharge')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Delivery charge must be a positive number'),
];

/**
 * Toggle business status validation rules
 */
export const toggleStatusValidator = [
    body('isOpen')
        .notEmpty()
        .withMessage('isOpen is required')
        .isBoolean()
        .withMessage('isOpen must be a boolean'),
];

export default {
    updateBusinessValidator,
    toggleStatusValidator,
};
