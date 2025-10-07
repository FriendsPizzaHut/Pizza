/**
 * Coupon Service
 * 
 * Business logic for coupon management.
 * Handles coupon CRUD operations and validation.
 * Implements Redis caching for frequently accessed coupons.
 */

import Coupon from '../models/Coupon.js';
import { getCache, setCache, deleteCache, deleteCachePattern, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';

/**
 * Get all coupons (with caching)
 * @param {Boolean} activeOnly - Return only active coupons
 * @returns {Array} - List of coupons
 */
export const getAllCoupons = async (activeOnly = false) => {
    // Use different cache keys for active vs all
    const cacheKey = activeOnly ? CACHE_KEYS.COUPONS_ACTIVE : CACHE_KEYS.COUPONS_ALL;

    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`✅ Coupons served from cache: ${cacheKey}`);
        return cached;
    }

    // Query database
    const query = {};
    if (activeOnly) {
        query.isActive = true;
        query.validUntil = { $gte: new Date() };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    // Cache for 10 minutes (coupons change occasionally)
    await setCache(cacheKey, coupons, CACHE_TTL.TEN_MINUTES);

    return coupons;
};

/**
 * Get coupon by code (with caching)
 * @param {String} code - Coupon code
 * @returns {Object} - Coupon details
 */
export const getCouponByCode = async (code) => {
    const upperCode = code.toUpperCase();
    const cacheKey = `coupon:code:${upperCode}`;

    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`✅ Coupon ${upperCode} served from cache`);
        return cached;
    }

    // Query database
    const coupon = await Coupon.findOne({ code: upperCode });

    if (!coupon) {
        const error = new Error('Coupon not found');
        error.statusCode = 404;
        throw error;
    }

    // Cache for 10 minutes
    await setCache(cacheKey, coupon, CACHE_TTL.TEN_MINUTES);

    return coupon;
};

/**
 * Create new coupon (invalidates cache)
 * @param {Object} couponData - Coupon data
 * @returns {Object} - Created coupon
 */
export const createCoupon = async (couponData) => {
    // Check for existing coupon code
    const existingCoupon = await Coupon.findOne({ code: couponData.code });

    if (existingCoupon) {
        const error = new Error('Coupon code already exists');
        error.statusCode = 400;
        throw error;
    }

    const coupon = await Coupon.create(couponData);

    // Invalidate all coupon caches
    await deleteCachePattern('coupon*');
    console.log('✅ Coupon caches invalidated after create');

    return coupon;
};

/**
 * Update coupon (invalidates related caches)
 * @param {String} couponId - Coupon ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated coupon
 */
export const updateCoupon = async (couponId, updateData) => {
    const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
        new: true,
        runValidators: true,
    });

    if (!coupon) {
        const error = new Error('Coupon not found');
        error.statusCode = 404;
        throw error;
    }

    // Invalidate all coupon caches (code might have changed)
    await deleteCachePattern('coupon*');
    console.log(`✅ Coupon ${couponId} caches invalidated after update`);

    return coupon;
};

/**
 * Delete coupon (invalidates cache)
 * @param {String} couponId - Coupon ID
 * @returns {Object} - Success message
 */
export const deleteCoupon = async (couponId) => {
    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
        const error = new Error('Coupon not found');
        error.statusCode = 404;
        throw error;
    }

    // Invalidate all coupon caches
    await deleteCachePattern('coupon*');
    console.log(`✅ Coupon ${couponId} deleted and caches cleared`);

    return { message: 'Coupon deleted successfully' };
};

/**
 * Validate and apply coupon to order
 * @param {String} code - Coupon code
 * @param {Number} orderAmount - Order total amount
 * @returns {Object} - Discount information
 */
export const validateAndApplyCoupon = async (code, orderAmount) => {
    const coupon = await getCouponByCode(code);

    // Check if coupon is valid
    if (!coupon.isValid()) {
        const error = new Error('Coupon is expired or inactive');
        error.statusCode = 400;
        throw error;
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
        const error = new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
        error.statusCode = 400;
        throw error;
    }

    // Check max uses
    if (coupon.usedCount >= coupon.maxUses) {
        const error = new Error('Coupon usage limit reached');
        error.statusCode = 400;
        throw error;
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(orderAmount);

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    return {
        coupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
        },
        discount,
        finalAmount: orderAmount - discount,
    };
};

export default {
    getAllCoupons,
    getCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateAndApplyCoupon,
};
