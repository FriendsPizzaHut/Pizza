/**
 * Authentication Validators
 * 
 * Validation rules for authentication endpoints (register, login).
 * Uses express-validator to validate request body fields.
 */

import { body } from 'express-validator';

/**
 * Register validation rules
 */
export const registerValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be 10 digits'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('role')
        .optional()
        .isIn(['customer', 'admin', 'delivery'])
        .withMessage('Role must be customer, admin, or delivery'),

    body('address')
        .optional()
        .isArray()
        .withMessage('Address must be an array'),

    body('address.*.street')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Street is required in address'),

    body('address.*.city')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('City is required in address'),

    body('address.*.state')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('State is required in address'),

    body('address.*.zipCode')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Zip code is required in address'),
];

/**
 * Login validation rules
 */
export const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

/**
 * Update profile validation rules
 */
export const updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

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
];

export default {
    registerValidator,
    loginValidator,
    updateProfileValidator,
};
