/**
 * Offer Controller
 * 
 * HTTP request handlers for offer management.
 */

import * as offerService from '../services/offerService.js';
import {
    createOfferSchema,
    updateOfferSchema,
    validateOfferCodeSchema,
} from '../utils/validators/offerValidator.js';

/**
 * Create new offer (Admin only)
 * POST /api/v1/admin/offers
 */
export const createOffer = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = createOfferSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Create offer
        const offer = await offerService.createOffer(value, req.userId);

        res.status(201).json({
            success: true,
            message: 'Offer created successfully',
            data: offer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all offers (Admin only)
 * GET /api/v1/admin/offers
 */
export const getAllOffers = async (req, res, next) => {
    try {
        const filters = {
            isActive: req.query.isActive,
            discountType: req.query.discountType,
            valid: req.query.valid,
            search: req.query.search,
        };

        const offers = await offerService.getAllOffers(filters);

        res.status(200).json({
            success: true,
            count: offers.length,
            data: offers,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active offers (Public - for customers)
 * GET /api/v1/offers/active
 */
export const getActiveOffers = async (req, res, next) => {
    try {
        const offers = await offerService.getActiveOffers();

        res.status(200).json({
            success: true,
            count: offers.length,
            data: offers,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get offer by ID (Admin only)
 * GET /api/v1/admin/offers/:id
 */
export const getOfferById = async (req, res, next) => {
    try {
        const offer = await offerService.getOfferById(req.params.id);

        res.status(200).json({
            success: true,
            data: offer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update offer (Admin only)
 * PATCH /api/v1/admin/offers/:id
 */
export const updateOffer = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = updateOfferSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Update offer
        const offer = await offerService.updateOffer(req.params.id, value);

        res.status(200).json({
            success: true,
            message: 'Offer updated successfully',
            data: offer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle offer status (Admin only)
 * PATCH /api/v1/admin/offers/:id/toggle
 */
export const toggleOfferStatus = async (req, res, next) => {
    try {
        const offer = await offerService.toggleOfferStatus(req.params.id);

        res.status(200).json({
            success: true,
            message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`,
            data: offer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete offer (Admin only)
 * DELETE /api/v1/admin/offers/:id
 */
export const deleteOffer = async (req, res, next) => {
    try {
        await offerService.deleteOffer(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Offer deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Validate offer code (Customer)
 * POST /api/v1/offers/validate
 */
export const validateOfferCode = async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = validateOfferCodeSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        // Validate offer
        const result = await offerService.validateOfferCode(value.code, value.cartValue);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get offer statistics (Admin only)
 * GET /api/v1/admin/offers/stats
 */
export const getOfferStats = async (req, res, next) => {
    try {
        const stats = await offerService.getOfferStats();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createOffer,
    getAllOffers,
    getActiveOffers,
    getOfferById,
    updateOffer,
    toggleOfferStatus,
    deleteOffer,
    validateOfferCode,
    getOfferStats,
};
