/**
 * Offer Validator
 * 
 * Validation schemas for offer-related operations.
 */

import Joi from 'joi';

/**
 * Validation schema for creating a new offer
 */
export const createOfferSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters',
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 500 characters',
        }),

    code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9]+$/)
        .min(3)
        .max(20)
        .required()
        .messages({
            'string.empty': 'Offer code is required',
            'string.pattern.base': 'Offer code can only contain uppercase letters and numbers',
            'string.min': 'Offer code must be at least 3 characters',
            'string.max': 'Offer code cannot exceed 20 characters',
        }),

    badge: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Badge text is required',
            'string.min': 'Badge text must be at least 2 characters',
            'string.max': 'Badge text cannot exceed 50 characters',
        }),

    discountType: Joi.string()
        .valid('percentage', 'fixed')
        .required()
        .messages({
            'any.only': 'Discount type must be either percentage or fixed',
            'any.required': 'Discount type is required',
        }),

    discountValue: Joi.number()
        .positive()
        .when('discountType', {
            is: 'percentage',
            then: Joi.number().min(1).max(100).required(),
            otherwise: Joi.number().positive().required(),
        })
        .messages({
            'number.base': 'Discount value must be a number',
            'number.positive': 'Discount value must be positive',
            'number.min': 'Percentage discount must be at least 1',
            'number.max': 'Percentage discount cannot exceed 100',
            'any.required': 'Discount value is required',
        }),

    maxDiscount: Joi.number()
        .positive()
        .optional()
        .allow(null)
        .messages({
            'number.base': 'Max discount must be a number',
            'number.positive': 'Max discount must be positive',
        }),

    minOrderValue: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'Minimum order value must be a number',
            'number.min': 'Minimum order value cannot be negative',
            'any.required': 'Minimum order value is required',
        }),

    isActive: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'isActive must be a boolean',
        }),

    validFrom: Joi.date()
        .required()
        .messages({
            'date.base': 'Valid from must be a valid date',
            'any.required': 'Valid from date is required',
        }),

    validUntil: Joi.date()
        .greater(Joi.ref('validFrom'))
        .required()
        .messages({
            'date.base': 'Valid until must be a valid date',
            'date.greater': 'Valid until must be after valid from date',
            'any.required': 'Valid until date is required',
        }),

    usageLimit: Joi.number()
        .integer()
        .min(1)
        .optional()
        .allow(null)
        .messages({
            'number.base': 'Usage limit must be a number',
            'number.integer': 'Usage limit must be an integer',
            'number.min': 'Usage limit must be at least 1',
        }),

    gradientColors: Joi.array()
        .items(Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/))
        .length(2)
        .optional()
        .messages({
            'array.length': 'Gradient colors must have exactly 2 colors',
            'string.pattern.base': 'Colors must be valid hex codes (e.g., #FF5722)',
        }),

    bgColor: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Background color must be a valid hex code (e.g., #FF5722)',
        }),
});

/**
 * Validation schema for updating an offer
 */
export const updateOfferSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters',
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .optional()
        .messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 500 characters',
        }),

    code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9]+$/)
        .min(3)
        .max(20)
        .optional()
        .messages({
            'string.pattern.base': 'Offer code can only contain uppercase letters and numbers',
            'string.min': 'Offer code must be at least 3 characters',
            'string.max': 'Offer code cannot exceed 20 characters',
        }),

    badge: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Badge text must be at least 2 characters',
            'string.max': 'Badge text cannot exceed 50 characters',
        }),

    discountType: Joi.string()
        .valid('percentage', 'fixed')
        .optional()
        .messages({
            'any.only': 'Discount type must be either percentage or fixed',
        }),

    discountValue: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.base': 'Discount value must be a number',
            'number.positive': 'Discount value must be positive',
        }),

    maxDiscount: Joi.number()
        .positive()
        .optional()
        .allow(null)
        .messages({
            'number.base': 'Max discount must be a number',
            'number.positive': 'Max discount must be positive',
        }),

    minOrderValue: Joi.number()
        .min(0)
        .optional()
        .messages({
            'number.base': 'Minimum order value must be a number',
            'number.min': 'Minimum order value cannot be negative',
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'isActive must be a boolean',
        }),

    validFrom: Joi.date()
        .optional()
        .messages({
            'date.base': 'Valid from must be a valid date',
        }),

    validUntil: Joi.date()
        .optional()
        .messages({
            'date.base': 'Valid until must be a valid date',
        }),

    usageLimit: Joi.number()
        .integer()
        .min(1)
        .optional()
        .allow(null)
        .messages({
            'number.base': 'Usage limit must be a number',
            'number.integer': 'Usage limit must be an integer',
            'number.min': 'Usage limit must be at least 1',
        }),

    gradientColors: Joi.array()
        .items(Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/))
        .length(2)
        .optional()
        .messages({
            'array.length': 'Gradient colors must have exactly 2 colors',
            'string.pattern.base': 'Colors must be valid hex codes (e.g., #FF5722)',
        }),

    bgColor: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Background color must be a valid hex code (e.g., #FF5722)',
        }),
}).min(1); // At least one field must be provided

/**
 * Validation schema for validating an offer code
 */
export const validateOfferCodeSchema = Joi.object({
    code: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Offer code is required',
            'any.required': 'Offer code is required',
        }),

    cartValue: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'Cart value must be a number',
            'number.min': 'Cart value cannot be negative',
            'any.required': 'Cart value is required',
        }),
});

/**
 * Validation schema for toggling offer status
 */
export const toggleOfferStatusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isActive must be a boolean',
            'any.required': 'isActive is required',
        }),
});
