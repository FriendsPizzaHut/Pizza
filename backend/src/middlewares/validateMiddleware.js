/**
 * Validation Middleware
 * 
 * Uses express-validator to validate request data before it reaches controllers.
 * Returns 400 with detailed error messages if validation fails.
 */

import { validationResult } from 'express-validator';

/**
 * Validation middleware factory
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} - Express middleware function
 */
export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        for (let validation of validations) {
            await validation.run(req);
        }

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map((err) => ({
                    field: err.path || err.param,
                    message: err.msg,
                    value: err.value,
                })),
            });
        }

        next();
    };
};

/**
 * Simple validation middleware for quick checks
 * Immediately returns error on first validation failure
 */
export const quickValidate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                const firstError = result.array()[0];
                return res.status(400).json({
                    success: false,
                    message: firstError.msg,
                    field: firstError.path || firstError.param,
                });
            }
        }
        next();
    };
};

export default validate;
