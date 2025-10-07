/**
 * Product Validators
 * 
 * Validation rules for product endpoints (create, update).
 * Ensures product data integrity before saving to database.
 */

import { body } from 'express-validator';

/**
 * Create product validation rules
 */
export const createProductValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Product description is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['pizza', 'sides', 'drinks', 'desserts'])
        .withMessage('Category must be pizza, sides, drinks, or desserts'),

    body('image')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image must be a valid URL'),

    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),

    body('sizes')
        .optional()
        .isArray()
        .withMessage('Sizes must be an array'),

    body('sizes.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Size name is required'),

    body('sizes.*.price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Size price must be a positive number'),

    body('toppings')
        .optional()
        .isArray()
        .withMessage('Toppings must be an array'),
];

/**
 * Update product validation rules
 */
export const updateProductValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('category')
        .optional()
        .trim()
        .isIn(['pizza', 'sides', 'drinks', 'desserts'])
        .withMessage('Category must be pizza, sides, drinks, or desserts'),

    body('image')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image must be a valid URL'),

    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),
];

export default {
    createProductValidator,
    updateProductValidator,
};
