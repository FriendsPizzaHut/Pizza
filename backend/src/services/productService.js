/**
 * Product Service
 * 
 * Business logic for product/menu management.
 * Handles CRUD operations for products.
 * Implements Redis caching for fast menu retrieval.
 */

import Product from '../models/Product.js';
import { getCache, setCache, deleteCache, deleteCachePattern, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';

/**
 * Get all products with optional filters (with caching)
 * @param {Object} filters - Query filters { category, isVegetarian, isAvailable, sortBy }
 * @returns {Array} - List of products
 */
export const getAllProducts = async (filters = {}) => {
    const { category, isVegetarian, isAvailable, sortBy = 'createdAt' } = filters;

    // Create cache key based on filters
    const filterKey = JSON.stringify(filters);
    const cacheKey = `${CACHE_KEYS.PRODUCTS_ALL}:${filterKey}`;

    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`✅ Products served from cache: ${cacheKey}`);
        return cached;
    }

    // Build query
    const query = {};
    if (category) {
        query.category = category;
    }
    if (isVegetarian !== undefined) {
        query.isVegetarian = isVegetarian === 'true' || isVegetarian === true;
    }
    if (isAvailable !== undefined) {
        query.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // Build sort options
    const sortOptions = {};
    if (sortBy === 'price') {
        sortOptions.basePrice = 1;
    } else if (sortBy === 'rating') {
        sortOptions.rating = -1;
    } else if (sortBy === 'popular') {
        sortOptions.salesCount = -1;
    } else {
        sortOptions.createdAt = -1;
    }

    const products = await Product.find(query).sort(sortOptions);

    // Cache for 1 hour (menu doesn't change often)
    await setCache(cacheKey, products, CACHE_TTL.ONE_HOUR);

    return products;
};

/**
 * Get product by ID (with caching)
 * @param {String} productId - Product ID
 * @returns {Object} - Product data
 */
export const getProductById = async (productId) => {
    // Try cache first
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(productId);
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`✅ Product ${productId} served from cache`);
        return cached;
    }

    // Query database
    const product = await Product.findById(productId);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    // Cache for 10 minutes
    await setCache(cacheKey, product, CACHE_TTL.TEN_MINUTES);

    return product;
};

/**
 * Create new product (invalidates all product caches)
 * @param {Object} productData - Product data
 * @returns {Object} - Created product
 */
export const createProduct = async (productData) => {
    // Validate pricing structure
    if (productData.category === 'pizza') {
        if (typeof productData.pricing !== 'object' || !productData.pricing) {
            const error = new Error('Pizza products must have pricing as an object with size keys');
            error.statusCode = 400;
            throw error;
        }
    } else {
        if (typeof productData.pricing !== 'number') {
            const error = new Error('Non-pizza products must have pricing as a single number');
            error.statusCode = 400;
            throw error;
        }
    }

    // Validate toppings only for pizza
    if (productData.category !== 'pizza' && productData.toppings && productData.toppings.length > 0) {
        const error = new Error('Only pizza products can have toppings');
        error.statusCode = 400;
        throw error;
    }

    const product = await Product.create(productData);

    // Invalidate all product list caches
    await deleteCachePattern('products:*');
    console.log('✅ Product caches invalidated after create');

    return product;
};

/**
 * Update product (invalidates related caches)
 * @param {String} productId - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated product
 */
export const updateProduct = async (productId, updateData) => {
    const product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    // Invalidate specific product and all list caches
    await deleteCache(CACHE_KEYS.PRODUCT_BY_ID(productId));
    await deleteCachePattern('products:*');
    console.log(`✅ Product ${productId} caches invalidated after update`);

    return product;
};

/**
 * Delete product (invalidates all product caches)
 * @param {String} productId - Product ID
 * @returns {Object} - Success message
 */
export const deleteProduct = async (productId) => {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    // Invalidate all product caches
    await deleteCache(CACHE_KEYS.PRODUCT_BY_ID(productId));
    await deleteCachePattern('products:*');
    console.log(`✅ Product ${productId} deleted and caches cleared`);

    return { message: 'Product deleted successfully' };
};

export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
