/**
 * Offer Service
 * 
 * Business logic for offer management.
 * Handles offer CRUD operations and validation.
 */

import Offer from '../models/Offer.js';

/**
 * Create a new offer
 * @param {Object} offerData - Offer data
 * @param {String} adminId - Admin user ID
 * @returns {Object} - Created offer
 */
export const createOffer = async (offerData, adminId) => {
    // Check if offer code already exists
    const existingOffer = await Offer.findOne({ code: offerData.code.toUpperCase() });

    if (existingOffer) {
        const error = new Error('Offer code already exists');
        error.statusCode = 400;
        throw error;
    }

    // Create offer
    const offer = new Offer({
        ...offerData,
        createdBy: adminId,
    });

    await offer.save();

    console.log(`✅ [OFFER] New offer created: ${offer.code} by admin ${adminId}`);

    return offer;
};

/**
 * Get all offers with optional filters
 * @param {Object} filters - Filter options
 * @returns {Array} - List of offers
 */
export const getAllOffers = async (filters = {}) => {
    const query = {};

    // Filter by active status
    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    // Filter by discount type
    if (filters.discountType) {
        query.discountType = filters.discountType;
    }

    // Filter by validity (currently valid offers)
    if (filters.valid === 'true') {
        const now = new Date();
        query.validFrom = { $lte: now };
        query.validUntil = { $gte: now };
    }

    // Search by code or title
    if (filters.search) {
        query.$or = [
            { code: { $regex: filters.search, $options: 'i' } },
            { title: { $regex: filters.search, $options: 'i' } },
        ];
    }

    const offers = await Offer.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

    console.log(`📊 [OFFER] Retrieved ${offers.length} offers with filters:`, filters);

    return offers;
};

/**
 * Get active offers for customers
 * @returns {Array} - List of active offers
 */
export const getActiveOffers = async () => {
    const offers = await Offer.getActiveOffers();

    console.log(`🎁 [OFFER] Retrieved ${offers.length} active offers for customers`);

    return offers;
};

/**
 * Get offer by ID
 * @param {String} offerId - Offer ID
 * @returns {Object} - Offer
 */
export const getOfferById = async (offerId) => {
    const offer = await Offer.findById(offerId).populate('createdBy', 'name email');

    if (!offer) {
        const error = new Error('Offer not found');
        error.statusCode = 404;
        throw error;
    }

    return offer;
};

/**
 * Update offer
 * @param {String} offerId - Offer ID
 * @param {Object} updateData - Updated offer data
 * @returns {Object} - Updated offer
 */
export const updateOffer = async (offerId, updateData) => {
    const offer = await Offer.findById(offerId);

    if (!offer) {
        const error = new Error('Offer not found');
        error.statusCode = 404;
        throw error;
    }

    // If updating code, check if new code already exists
    if (updateData.code && updateData.code.toUpperCase() !== offer.code) {
        const existingOffer = await Offer.findOne({
            code: updateData.code.toUpperCase(),
            _id: { $ne: offerId }
        });

        if (existingOffer) {
            const error = new Error('Offer code already exists');
            error.statusCode = 400;
            throw error;
        }
    }

    // Update offer fields
    Object.keys(updateData).forEach(key => {
        offer[key] = updateData[key];
    });

    await offer.save();

    console.log(`✏️ [OFFER] Offer updated: ${offer.code}`);

    return offer;
};

/**
 * Toggle offer active status
 * @param {String} offerId - Offer ID
 * @returns {Object} - Updated offer
 */
export const toggleOfferStatus = async (offerId) => {
    const offer = await Offer.findById(offerId);

    if (!offer) {
        const error = new Error('Offer not found');
        error.statusCode = 404;
        throw error;
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    console.log(`🔄 [OFFER] Offer ${offer.code} status toggled to: ${offer.isActive ? 'Active' : 'Inactive'}`);

    return offer;
};

/**
 * Delete offer
 * @param {String} offerId - Offer ID
 * @returns {Object} - Deleted offer
 */
export const deleteOffer = async (offerId) => {
    const offer = await Offer.findById(offerId);

    if (!offer) {
        const error = new Error('Offer not found');
        error.statusCode = 404;
        throw error;
    }

    await offer.deleteOne();

    console.log(`🗑️ [OFFER] Offer deleted: ${offer.code}`);

    return offer;
};

/**
 * Validate offer code and calculate discount
 * @param {String} code - Offer code
 * @param {Number} cartValue - Cart value
 * @returns {Object} - Validation result
 */
export const validateOfferCode = async (code, cartValue) => {
    console.log(`🔍 [OFFER] Validating code: ${code} for cart value: ₹${cartValue}`);

    const result = await Offer.validateOffer(code, cartValue);

    if (result.success) {
        console.log(`✅ [OFFER] Code ${code} valid - Discount: ₹${result.discount}`);
    } else {
        console.log(`❌ [OFFER] Code ${code} invalid - ${result.message}`);
    }

    return result;
};

/**
 * Apply offer to order (increment usage count)
 * @param {String} offerId - Offer ID
 * @returns {Object} - Updated offer
 */
export const applyOfferToOrder = async (offerId) => {
    const offer = await Offer.findById(offerId);

    if (!offer) {
        const error = new Error('Offer not found');
        error.statusCode = 404;
        throw error;
    }

    await offer.incrementUsage();

    console.log(`📈 [OFFER] Offer ${offer.code} usage count: ${offer.usageCount}`);

    return offer;
};

/**
 * Get offer statistics
 * @returns {Object} - Offer statistics
 */
export const getOfferStats = async () => {
    const total = await Offer.countDocuments();
    const active = await Offer.countDocuments({ isActive: true });
    const inactive = await Offer.countDocuments({ isActive: true });

    const now = new Date();
    const valid = await Offer.countDocuments({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
    });

    const mostUsed = await Offer.find()
        .sort({ usageCount: -1 })
        .limit(5)
        .select('code title usageCount');

    console.log(`📊 [OFFER] Stats - Total: ${total}, Active: ${active}, Valid: ${valid}`);

    return {
        total,
        active,
        inactive,
        valid,
        mostUsed,
    };
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
    applyOfferToOrder,
    getOfferStats,
};
