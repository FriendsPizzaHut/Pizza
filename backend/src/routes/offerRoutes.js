/**
 * Offer Routes
 * 
 * API routes for offer management.
 */

import express from 'express';
import * as offerController from '../controllers/offerController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Customer)
// ============================================

/**
 * @route   GET /api/v1/offers/active
 * @desc    Get all active offers (for customer home screen)
 * @access  Public
 */
router.get('/active', offerController.getActiveOffers);

/**
 * @route   POST /api/v1/offers/validate
 * @desc    Validate offer code and get discount
 * @access  Protected (Customer)
 */
router.post('/validate', protect, offerController.validateOfferCode);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/v1/admin/offers/stats
 * @desc    Get offer statistics
 * @access  Protected (Admin only)
 * Note: This must come before /:id route
 */
router.get('/admin/stats', protect, adminOnly, offerController.getOfferStats);

/**
 * @route   POST /api/v1/admin/offers
 * @desc    Create new offer
 * @access  Protected (Admin only)
 */
router.post('/admin', protect, adminOnly, offerController.createOffer);

/**
 * @route   GET /api/v1/admin/offers
 * @desc    Get all offers with filters
 * @access  Protected (Admin only)
 */
router.get('/admin', protect, adminOnly, offerController.getAllOffers);

/**
 * @route   GET /api/v1/admin/offers/:id
 * @desc    Get offer by ID
 * @access  Protected (Admin only)
 */
router.get('/admin/:id', protect, adminOnly, offerController.getOfferById);

/**
 * @route   PATCH /api/v1/admin/offers/:id
 * @desc    Update offer
 * @access  Protected (Admin only)
 */
router.patch('/admin/:id', protect, adminOnly, offerController.updateOffer);

/**
 * @route   PATCH /api/v1/admin/offers/:id/toggle
 * @desc    Toggle offer active status
 * @access  Protected (Admin only)
 */
router.patch('/admin/:id/toggle', protect, adminOnly, offerController.toggleOfferStatus);

/**
 * @route   DELETE /api/v1/admin/offers/:id
 * @desc    Delete offer
 * @access  Protected (Admin only)
 */
router.delete('/admin/:id', protect, adminOnly, offerController.deleteOffer);

export default router;
