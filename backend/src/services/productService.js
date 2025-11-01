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
 * Get all products with optional filters, search, and pagination
 * @param {Object} filters - Query filters { category, isVegetarian, isAvailable, sortBy, search, page, limit }
 * @returns {Object} - { products, total, page, limit, totalPages, hasMore }
 */
export const getAllProducts = async (filters = {}) => {
    const {
        category,
        isVegetarian,
        isAvailable,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        page = 1,
        limit = 10
    } = filters;

    // Build query
    const query = {};

    // Category filter
    if (category && category !== 'all') {
        query.category = category;
    }

    // Vegetarian filter
    if (isVegetarian !== undefined) {
        query.isVegetarian = isVegetarian === 'true' || isVegetarian === true;
    }

    // Availability filter
    if (isAvailable !== undefined) {
        query.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // Search filter - searches across name and description
    if (search && search.trim()) {
        query.$or = [
            { name: { $regex: search.trim(), $options: 'i' } },
            { description: { $regex: search.trim(), $options: 'i' } }
        ];
    }

    // Build sort options
    const sortOptions = {};
    const order = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'price') {
        sortOptions.basePrice = order;
    } else if (sortBy === 'rating') {
        sortOptions.rating = order;
    } else if (sortBy === 'popular') {
        sortOptions.salesCount = order;
    } else if (sortBy === 'name') {
        sortOptions.name = order;
    } else {
        sortOptions.createdAt = order;
    }

    // Calculate pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [products, total] = await Promise.all([
        Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasMore = pageNum < totalPages;

    console.log(`📊 Products query: page=${pageNum}, limit=${limitNum}, total=${total}, search="${search || 'none'}"`);

    return {
        products,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore
    };
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
 * Update product (invalidates specific product and all list caches)
 * @param {String} productId - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated product
 */
export const updateProduct = async (productId, updateData) => {
    console.log('🔍 [UPDATE PRODUCT DEBUG] Starting update for product:', productId);
    console.log('🔍 [UPDATE PRODUCT DEBUG] Update data received:', JSON.stringify(updateData, null, 2));

    // Find the product first
    const product = await Product.findById(productId);

    if (!product) {
        console.log('❌ [UPDATE PRODUCT DEBUG] Product not found');
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    console.log('✅ [UPDATE PRODUCT DEBUG] Product found:', {
        id: product._id,
        name: product.name,
        category: product.category,
        currentPricing: product.pricing,
        currentBasePrice: product.basePrice,
    });

    // Update fields manually
    Object.keys(updateData).forEach((key) => {
        console.log(`🔄 [UPDATE PRODUCT DEBUG] Updating field: ${key} = ${JSON.stringify(updateData[key])}`);
        product[key] = updateData[key];
    });

    console.log('💾 [UPDATE PRODUCT DEBUG] Attempting to save product...');
    console.log('💾 [UPDATE PRODUCT DEBUG] Product state before save:', {
        name: product.name,
        category: product.category,
        pricing: product.pricing,
        imageUrl: product.imageUrl,
        isVegetarian: product.isVegetarian,
        isAvailable: product.isAvailable,
        basePrice: product.basePrice,
        preparationTime: product.preparationTime,
    });

    try {
        // Save the product (this triggers pre-save hooks)
        await product.save();
        console.log('✅ [UPDATE PRODUCT DEBUG] Product saved successfully');
    } catch (error) {
        console.error('❌ [UPDATE PRODUCT DEBUG] Validation error during save:', {
            message: error.message,
            errors: error.errors,
            name: error.name,
            stack: error.stack,
        });

        // Log detailed validation errors
        if (error.errors) {
            Object.keys(error.errors).forEach((field) => {
                console.error(`❌ [UPDATE PRODUCT DEBUG] Validation error for field "${field}":`, {
                    message: error.errors[field].message,
                    value: error.errors[field].value,
                    kind: error.errors[field].kind,
                    path: error.errors[field].path,
                });
            });
        }

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
