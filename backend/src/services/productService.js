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
 * Get all products with optional category filter (with caching)
 * @param {String} category - Category filter (optional)
 * @returns {Array} - List of products
 */
export const getAllProducts = async (category = null) => {
    // Create cache key based on filter
    const cacheKey = category
        ? CACHE_KEYS.PRODUCTS_BY_CATEGORY(category)
        : CACHE_KEYS.PRODUCTS_ALL;

    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`✅ Products served from cache: ${cacheKey}`);
        return cached;
    }

    // Query database
    const query = {};
    if (category) {
        query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

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
