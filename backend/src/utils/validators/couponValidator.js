/**
 * Coupon Validators
 * 
 * Validation rules for coupon endpoints (create, update).
 * Validates coupon codes, discount values, and date ranges.
 */

import { body } from 'express-validator';

/**
 * Create coupon validation rules
 */
export const createCouponValidator = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Coupon code is required')
        .isLength({ min: 3, max: 20 })
        .withMessage('Coupon code must be between 3 and 20 characters')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Coupon code must contain only uppercase letters and numbers'),

    body('discountType')
        .notEmpty()
        .withMessage('Discount type is required')
        .isIn(['percentage', 'fixed'])
        .withMessage('Discount type must be percentage or fixed'),

    body('discountValue')
        .notEmpty()
        .withMessage('Discount value is required')
        .isFloat({ min: 0 })
        .withMessage('Discount value must be a positive number')
        .custom((value, { req }) => {
            if (req.body.discountType === 'percentage' && value > 100) {
                throw new Error('Percentage discount cannot exceed 100');
            }
            return true;
        }),

    body('minOrderAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum order amount must be a positive number'),

    body('maxDiscount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum discount must be a positive number'),

    body('maxUses')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max uses must be at least 1'),

    body('validFrom')
        .notEmpty()
        .withMessage('Valid from date is required')
        .isISO8601()
        .withMessage('Valid from must be a valid date'),

    body('validUntil')
        .notEmpty()
        .withMessage('Valid until date is required')
        .isISO8601()
        .withMessage('Valid until must be a valid date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.validFrom)) {
                throw new Error('Valid until date must be after valid from date');
            }
            return true;
        }),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
];

/**
 * Update coupon validation rules
 */
export const updateCouponValidator = [
    body('code')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Coupon code must be between 3 and 20 characters')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Coupon code must contain only uppercase letters and numbers'),

    body('discountType')
        .optional()
        .isIn(['percentage', 'fixed'])
        .withMessage('Discount type must be percentage or fixed'),

    body('discountValue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount value must be a positive number'),

    body('minOrderAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum order amount must be a positive number'),

    body('maxDiscount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum discount must be a positive number'),

    body('maxUses')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max uses must be at least 1'),

    body('validFrom')
        .optional()
        .isISO8601()
        .withMessage('Valid from must be a valid date'),

    body('validUntil')
        .optional()
        .isISO8601()
        .withMessage('Valid until must be a valid date'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
];

export default {
    createCouponValidator,
    updateCouponValidator,
};
