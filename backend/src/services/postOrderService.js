/**
 * Post-Order Processing Service
 * 
 * Handles all post-order updates efficiently:
 * - Updates Product sales count and revenue (bulk operations)
 * - Updates User's most ordered items and favorite categories
 * - Uses MongoDB bulk operations for performance
 * - Runs asynchronously without blocking order response
 */

import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * Process order-related updates asynchronously
 * This runs after order creation to update products and user preferences
 * 
 * @param {Object} order - The created order document
 * @param {String} userId - User ID who placed the order
 */
export const processOrderUpdates = async (order, userId) => {
    try {
        // Run both updates in parallel for better performance
        await Promise.all([
            updateProductStatistics(order),
            updateUserPreferences(order, userId),
        ]);

        console.log(`✅ Post-order processing completed for order ${order.orderNumber}`);
    } catch (error) {
        // Log error but don't throw - this is async processing
        // Order is already created, these are just analytics updates
        console.error('❌ Post-order processing error:', error.message);
        console.error('Order ID:', order._id);
    }
};

/**
 * Update product statistics (sales count, revenue, ratings) using bulk operations
 * Uses bulkWrite for optimal performance - single DB call for all products
 * 
 * @param {Object} order - The order document
 */
const updateProductStatistics = async (order) => {
    try {
        // Aggregate product quantities and revenues from order items
        const productUpdates = {};

        order.items.forEach(item => {
            const productId = item.product.toString();
            const itemRevenue = item.subtotal; // Already calculated per item

            if (!productUpdates[productId]) {
                productUpdates[productId] = {
                    quantity: 0,
                    revenue: 0,
                };
            }

            productUpdates[productId].quantity += item.quantity;
            productUpdates[productId].revenue += itemRevenue;
        });

        // Build bulk operations array
        const bulkOps = Object.entries(productUpdates).map(([productId, data]) => ({
            updateOne: {
                filter: { _id: productId },
                update: {
                    $inc: {
                        salesCount: data.quantity,
                        totalRevenue: data.revenue,
                    },
                },
            },
        }));

        // Execute bulk update in single DB call
        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps, { ordered: false });
            console.log(`📦 Updated ${bulkOps.length} products`);

            // Update ratings for affected products (separate operation)
            // This needs to be done individually as rating calculation is complex
            const productIds = Object.keys(productUpdates);
            await updateProductRatings(productIds);
        }
    } catch (error) {
        console.error('Error updating product statistics:', error.message);
        throw error;
    }
};

/**
 * Update product ratings based on new sales count
 * Only updates products that were in the order
 * 
 * @param {Array} productIds - Array of product IDs to update ratings
 */
const updateProductRatings = async (productIds) => {
    try {
        // Fetch products with their current sales counts
        const products = await Product.find({ _id: { $in: productIds } });

        // Prepare bulk rating updates
        const ratingUpdates = products.map(product => {
            let newRating = 4.0;

            if (product.salesCount >= 200) {
                newRating = 5.0;
            } else if (product.salesCount >= 100) {
                newRating = 4.7;
            } else if (product.salesCount >= 50) {
                newRating = 4.5;
            } else if (product.salesCount >= 10) {
                newRating = 4.2;
            }

            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: { $set: { rating: newRating } },
                },
            };
        });

        if (ratingUpdates.length > 0) {
            await Product.bulkWrite(ratingUpdates, { ordered: false });
            console.log(`⭐ Updated ratings for ${ratingUpdates.length} products`);
        }
    } catch (error) {
        console.error('Error updating product ratings:', error.message);
    }
};

/**
 * Update user preferences based on order
 * Updates:
 * - mostOrderedItems (top 5 most frequently ordered products)
 * - preferences.favoriteCategories (based on order history)
 * 
 * @param {Object} order - The order document
 * @param {String} userId - User ID
 */
const updateUserPreferences = async (order, userId) => {
    try {
        // Get user document (only for customers)
        const user = await User.findById(userId);

        if (!user || user.role !== 'customer') {
            return; // Only update for customers
        }

        // Extract product IDs and categories from current order
        const orderedProductIds = order.items.map(item => item.product);
        const orderedCategories = order.items.map(item => item.productSnapshot.category);

        // Update mostOrderedItems
        // Add new products, keeping only unique ones, limit to top 5
        const currentMostOrdered = user.mostOrderedItems || [];

        // Merge new products with existing, filter duplicates
        const updatedMostOrdered = [...new Set([
            ...orderedProductIds.map(id => id.toString()),
            ...currentMostOrdered.map(id => id.toString()),
        ])].slice(0, 5); // Keep top 5

        // Update favorite categories
        const currentFavorites = user.preferences?.favoriteCategories || [];

        // Merge and count category frequency
        const categoryFrequency = {};
        [...currentFavorites, ...orderedCategories].forEach(cat => {
            categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
        });

        // Sort by frequency and keep top 3
        const updatedFavoriteCategories = Object.entries(categoryFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat]) => cat);

        // Single atomic update for user preferences
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    mostOrderedItems: updatedMostOrdered,
                    'preferences.favoriteCategories': updatedFavoriteCategories,
                },
            },
            { new: true }
        );

        console.log(`👤 Updated user preferences for ${user.name}`);
    } catch (error) {
        console.error('Error updating user preferences:', error.message);
        throw error;
    }
};

/**
 * Batch process multiple orders (useful for bulk operations or migrations)
 * 
 * @param {Array} orders - Array of order documents
 */
export const batchProcessOrderUpdates = async (orders) => {
    try {
        console.log(`🔄 Batch processing ${orders.length} orders...`);

        // Process in chunks to avoid memory issues
        const CHUNK_SIZE = 50;
        for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
            const chunk = orders.slice(i, i + CHUNK_SIZE);

            await Promise.all(
                chunk.map(order => processOrderUpdates(order, order.user))
            );

            console.log(`✅ Processed ${Math.min(i + CHUNK_SIZE, orders.length)}/${orders.length} orders`);
        }
    } catch (error) {
        console.error('Batch processing error:', error.message);
        throw error;
    }
};

export default {
    processOrderUpdates,
    batchProcessOrderUpdates,
};
