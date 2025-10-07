/**
 * Business Service
 * 
 * Business logic for restaurant/business settings management.
 * Handles business information and operating status.
 * Implements Redis caching for instant business info retrieval.
 */

import Business from '../models/Business.js';
import { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';

/**
 * Get business details (with caching)
 * @returns {Object} - Business information
 */
export const getBusinessDetails = async () => {
    // Try to get from cache first
    const cached = await getCache(CACHE_KEYS.BUSINESS_INFO);
    if (cached) {
        console.log('✅ Business info served from cache');
        return cached;
    }

    // Get the first (and should be only) business document
    let business = await Business.findOne();

    // Create default business if none exists
    if (!business) {
        business = await Business.create({
            name: 'Friends Pizza Hut',
            email: 'info@friendspizzahut.com',
            phone: '1234567890',
            address: '123 Main Street, City',
            isOpen: true,
        });
    }

    // Cache business info (no expiry - manual invalidation only)
    await setCache(CACHE_KEYS.BUSINESS_INFO, business, CACHE_TTL.NO_EXPIRY);

    return business;
};

/**
 * Update business information (invalidates cache)
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated business
 */
export const updateBusiness = async (updateData) => {
    let business = await Business.findOne();

    if (!business) {
        // Create if doesn't exist
        business = await Business.create(updateData);
    } else {
        // Update existing
        Object.assign(business, updateData);
        await business.save();
    }

    // Update cache immediately with new data
    await setCache(CACHE_KEYS.BUSINESS_INFO, business, CACHE_TTL.NO_EXPIRY);
    console.log('✅ Business cache updated');

    return business;
};

/**
 * Toggle business open/closed status (updates cache)
 * @param {Boolean} isOpen - Open status
 * @returns {Object} - Updated business
 */
export const toggleBusinessStatus = async (isOpen) => {
    let business = await Business.findOne();

    if (!business) {
        const error = new Error('Business not found');
        error.statusCode = 404;
        throw error;
    }

    business.isOpen = isOpen;
    await business.save();

    // Update cache immediately - this is frequently accessed
    await setCache(CACHE_KEYS.BUSINESS_INFO, business, CACHE_TTL.NO_EXPIRY);
    console.log(`✅ Business status updated to: ${isOpen ? 'OPEN' : 'CLOSED'}`);

    return business;
};

export default {
    getBusinessDetails,
    updateBusiness,
    toggleBusinessStatus,
};
