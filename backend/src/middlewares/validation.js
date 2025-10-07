/**
 * Request Validation Middleware (Prompt 10 - Never-Crashing Strategy)
 * 
 * Joi validation schemas and middleware for all routes
 * Validates request body, query parameters, and URL parameters
 * Returns structured error responses
 * 
 * Usage:
 * import { validateBody, schemas } from './validation.js';
 * router.post('/orders', validateBody(schemas.createOrder), orderController.create);
 */

import Joi from 'joi';
import { ApiError, ERROR_CODES } from './errorHandler.js';

/**
 * Validation middleware factory
 * Creates middleware to validate different parts of the request
 */
export const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Collect all errors, not just the first one
            stripUnknown: true, // Remove unknown keys
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message.replace(/['"]/g, ''))
                .join(', ');

            return next(
                new ApiError(
                    400,
                    errorMessage,
                    ERROR_CODES.VALIDATION_ERROR,
                    true
                )
            );
        }

        // Replace request data with validated data
        req[property] = value;
        next();
    };
};

/**
 * Convenience functions for common validation targets
 */
export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');

/**
 * Common validation schemas
 */

// MongoDB ObjectId validation
const objectId = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('Invalid ID format');

// Pagination schemas
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * User schemas
 */
export const userSchemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        phone: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                'string.pattern.base': 'Phone must be 10 digits',
            }),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'delivery', 'admin').default('user'),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    updateProfile: Joi.object({
        name: Joi.string().min(2).max(50),
        phone: Joi.string().pattern(/^[0-9]{10}$/),
        address: Joi.string().max(200),
    }).min(1),
};

/**
 * Product schemas
 */
export const productSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500),
        price: Joi.number().min(0).required(),
        category: Joi.string().required(),
        image: Joi.string().uri(),
        isAvailable: Joi.boolean().default(true),
        isVeg: Joi.boolean(),
        preparationTime: Joi.number().min(0),
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(100),
        description: Joi.string().max(500),
        price: Joi.number().min(0),
        category: Joi.string(),
        image: Joi.string().uri(),
        isAvailable: Joi.boolean(),
        isVeg: Joi.boolean(),
        preparationTime: Joi.number().min(0),
    }).min(1),

    filter: Joi.object({
        category: Joi.string(),
        isVeg: Joi.boolean(),
        isAvailable: Joi.boolean(),
        minPrice: Joi.number().min(0),
        maxPrice: Joi.number().min(0),
        search: Joi.string(),
    }),
};

/**
 * Order schemas
 */
export const orderSchemas = {
    create: Joi.object({
        items: Joi.array()
            .items(
                Joi.object({
                    product: objectId.required(),
                    quantity: Joi.number().integer().min(1).required(),
                    price: Joi.number().min(0).required(),
                })
            )
            .min(1)
            .required(),
        deliveryAddress: Joi.string().min(10).max(200).required(),
        phone: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required(),
        notes: Joi.string().max(200),
        coupon: Joi.string(),
    }),

    updateStatus: Joi.object({
        status: Joi.string()
            .valid('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
            .required(),
    }),

    assignDelivery: Joi.object({
        deliveryAgent: objectId.required(),
    }),
};

/**
 * Payment schemas
 */
export const paymentSchemas = {
    create: Joi.object({
        order: objectId.required(),
        amount: Joi.number().min(0).required(),
        method: Joi.string()
            .valid('cash', 'card', 'upi', 'razorpay')
            .required(),
        razorpayOrderId: Joi.string(),
        razorpayPaymentId: Joi.string(),
        razorpaySignature: Joi.string(),
    }),

    verify: Joi.object({
        razorpay_order_id: Joi.string().required(),
        razorpay_payment_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),
    }),
};

/**
 * Coupon schemas
 */
export const couponSchemas = {
    create: Joi.object({
        code: Joi.string().uppercase().min(3).max(20).required(),
        description: Joi.string().max(200),
        discountType: Joi.string().valid('percentage', 'fixed').required(),
        discountValue: Joi.number().min(0).required(),
        minOrderValue: Joi.number().min(0).default(0),
        maxDiscount: Joi.number().min(0),
        validFrom: Joi.date(),
        validUntil: Joi.date().greater(Joi.ref('validFrom')),
        usageLimit: Joi.number().integer().min(1),
        isActive: Joi.boolean().default(true),
    }),

    apply: Joi.object({
        code: Joi.string().required(),
        orderValue: Joi.number().min(0).required(),
    }),
};

/**
 * Business schemas
 */
export const businessSchemas = {
    updateStatus: Joi.object({
        isOpen: Joi.boolean().required(),
    }),

    updateInfo: Joi.object({
        name: Joi.string().min(2).max(100),
        phone: Joi.string().pattern(/^[0-9]{10}$/),
        address: Joi.string().max(200),
        openingTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        closingTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        deliveryRadius: Joi.number().min(0),
        minOrderValue: Joi.number().min(0),
    }).min(1),
};

/**
 * ID parameter validation
 */
export const idSchema = Joi.object({
    id: objectId.required(),
});

/**
 * Export all schemas for easy import
 */
export const schemas = {
    user: userSchemas,
    product: productSchemas,
    order: orderSchemas,
    payment: paymentSchemas,
    coupon: couponSchemas,
    business: businessSchemas,
    id: idSchema,
    pagination: paginationSchema,
};

export default {
    validate,
    validateBody,
    validateQuery,
    validateParams,
    schemas,
};
