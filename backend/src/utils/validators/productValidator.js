/**
 * Product Validators
 * 
 * Validation rules for product endpoints (create, update).
 * Ensures product data integrity before saving to database.
 * Updated to support new schema with multi-size pricing and toppings.
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

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['pizza', 'sides', 'beverages', 'desserts'])
        .withMessage('Category must be pizza, sides, beverages, or desserts'),

    body('pricing')
        .notEmpty()
        .withMessage('Pricing is required')
        .custom((value, { req }) => {
            const category = req.body.category;

            // For pizza: pricing must be object with size keys
            if (category === 'pizza') {
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    throw new Error('Pizza pricing must be an object with size keys (small, medium, large)');
                }
                const validSizes = ['small', 'medium', 'large'];
                const sizes = Object.keys(value);

                if (sizes.length === 0) {
                    throw new Error('Pizza must have at least one size defined');
                }

                for (const size of sizes) {
                    if (!validSizes.includes(size)) {
                        throw new Error(`Invalid size: ${size}. Valid sizes are: small, medium, large`);
                    }
                    if (typeof value[size] !== 'number' || value[size] <= 0) {
                        throw new Error(`Price for ${size} must be a positive number`);
                    }
                }
            } else {
                // For non-pizza: pricing must be a single positive number
                if (typeof value !== 'number' || value <= 0) {
                    throw new Error('Pricing must be a positive number for non-pizza items');
                }
            }
            return true;
        }),

    body('imageUrl')
        .notEmpty()
        .withMessage('Product image is required')
        .isString()
        .withMessage('Image URL must be a string'),
    // Note: Removed strict URL validation to allow file:// URIs for development
    // In production, implement proper image upload to cloud storage

    body('isVegetarian')
        .optional()
        .isBoolean()
        .withMessage('isVegetarian must be a boolean'),

    body('toppings')
        .optional()
        .isArray()
        .withMessage('Toppings must be an array')
        .custom((value, { req }) => {
            if (req.body.category !== 'pizza' && value && value.length > 0) {
                throw new Error('Only pizza products can have toppings');
            }
            return true;
        }),

    body('toppings.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Topping name is required'),

    body('toppings.*.category')
        .optional()
        .isIn(['vegetables', 'meat', 'cheese', 'sauce'])
        .withMessage('Topping category must be vegetables, meat, cheese, or sauce'),

    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),

    body('preparationTime')
        .optional()
        .isInt({ min: 5 })
        .withMessage('Preparation time must be at least 5 minutes'),

    body('discountPercent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Discount percent must be between 0 and 100'),
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

    body('category')
        .optional()
        .trim()
        .isIn(['pizza', 'sides', 'beverages', 'desserts'])
        .withMessage('Category must be pizza, sides, beverages, or desserts'),

    body('pricing')
        .optional()
        .custom((value, { req }) => {
            const category = req.body.category;

            if (category === 'pizza') {
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    throw new Error('Pizza pricing must be an object with size keys');
                }
                const validSizes = ['small', 'medium', 'large'];
                const sizes = Object.keys(value);

                for (const size of sizes) {
                    if (!validSizes.includes(size)) {
                        throw new Error(`Invalid size: ${size}`);
                    }
                    if (typeof value[size] !== 'number' || value[size] <= 0) {
                        throw new Error(`Price for ${size} must be a positive number`);
                    }
                }
            } else if (value !== undefined) {
                if (typeof value !== 'number' || value <= 0) {
                    throw new Error('Pricing must be a positive number for non-pizza items');
                }
            }
            return true;
        }),

    body('imageUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Image URL must be a valid HTTP/HTTPS URL'),

    body('isVegetarian')
        .optional()
        .isBoolean()
        .withMessage('isVegetarian must be a boolean'),

    body('toppings')
        .optional()
        .isArray()
        .withMessage('Toppings must be an array'),

    body('toppings.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Topping name is required'),

    body('toppings.*.category')
        .optional()
        .isIn(['vegetables', 'meat', 'cheese', 'sauce'])
        .withMessage('Topping category must be vegetables, meat, cheese, or sauce'),

    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),

    body('preparationTime')
        .optional()
        .isInt({ min: 5 })
        .withMessage('Preparation time must be at least 5 minutes'),

    body('discountPercent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Discount percent must be between 0 and 100'),
];

export default {
    createProductValidator,
    updateProductValidator,
};
