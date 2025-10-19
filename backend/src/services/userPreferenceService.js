/**
 * User Preference Analytics Service
 * 
 * Tracks user behavior and generates personalized recommendations
 * - Most ordered items
 * - Favorite categories
 * - Order patterns (time, day, frequency)
 * - Price preferences
 * - Dietary preferences
 */

import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * Update user preferences after order completion
 * Called automatically when order status changes to 'delivered'
 */
export const updateUserPreferences = async (userId, orderId) => {
    try {
        const order = await Order.findById(orderId).populate('items.product');
        if (!order) return;

        const user = await User.findById(userId);
        if (!user || user.role !== 'customer') return;

        // Initialize preferences if not exists
        if (!user.preferences) {
            user.preferences = {
                favoriteCategories: [],
                dietaryRestrictions: [],
                avgOrderValue: 0,
                preferredOrderTime: 'evening',
                orderFrequency: 0,
            };
        }

        if (!user.orderingBehavior) {
            user.orderingBehavior = {
                totalOrders: 0,
                totalSpent: 0,
                averageOrderValue: 0,
                mostOrderedItems: [],
                favoriteCategories: [],
                lastOrderDate: null,
                orderFrequency: 'occasional', // occasional, regular, frequent
                preferredOrderTime: 'evening', // morning, afternoon, evening, night
                avgItemsPerOrder: 0,
            };
        }

        // Update ordering behavior
        user.orderingBehavior.totalOrders += 1;
        user.orderingBehavior.totalSpent += order.totalAmount;
        user.orderingBehavior.averageOrderValue =
            user.orderingBehavior.totalSpent / user.orderingBehavior.totalOrders;
        user.orderingBehavior.lastOrderDate = new Date();

        // Calculate order frequency
        if (user.orderingBehavior.totalOrders > 20) {
            user.orderingBehavior.orderFrequency = 'frequent';
        } else if (user.orderingBehavior.totalOrders > 5) {
            user.orderingBehavior.orderFrequency = 'regular';
        } else {
            user.orderingBehavior.orderFrequency = 'occasional';
        }

        // Determine preferred order time
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) user.orderingBehavior.preferredOrderTime = 'morning';
        else if (hour >= 12 && hour < 17) user.orderingBehavior.preferredOrderTime = 'afternoon';
        else if (hour >= 17 && hour < 21) user.orderingBehavior.preferredOrderTime = 'evening';
        else user.orderingBehavior.preferredOrderTime = 'night';

        // Update most ordered items
        for (const item of order.items) {
            const productId = item.product._id.toString();
            const existing = user.orderingBehavior.mostOrderedItems.find(
                p => p.productId.toString() === productId
            );

            if (existing) {
                existing.count += item.quantity;
                existing.totalSpent += item.subtotal;
                existing.lastOrdered = new Date();
            } else {
                user.orderingBehavior.mostOrderedItems.push({
                    productId: item.product._id,
                    count: item.quantity,
                    totalSpent: item.subtotal,
                    lastOrdered: new Date(),
                });
            }
        }

        // Sort by count and keep top 10
        user.orderingBehavior.mostOrderedItems.sort((a, b) => b.count - a.count);
        user.orderingBehavior.mostOrderedItems = user.orderingBehavior.mostOrderedItems.slice(0, 10);

        // Update favorite categories
        const categoryCount = {};
        for (const item of order.items) {
            const category = item.productSnapshot.category;
            categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
        }

        // Merge with existing categories
        const allCategories = [...user.orderingBehavior.favoriteCategories];
        for (const [category, count] of Object.entries(categoryCount)) {
            const existing = allCategories.find(c => c.category === category);
            if (existing) {
                existing.count += count;
            } else {
                allCategories.push({ category, count });
            }
        }

        // Sort and keep top 4
        allCategories.sort((a, b) => b.count - a.count);
        user.orderingBehavior.favoriteCategories = allCategories.slice(0, 4);

        // Update legacy fields for backward compatibility
        user.mostOrderedItems = user.orderingBehavior.mostOrderedItems.map(item => item.productId);
        user.preferences.favoriteCategories = user.orderingBehavior.favoriteCategories.map(c => c.category);

        // Calculate average items per order
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const prevAvg = user.orderingBehavior.avgItemsPerOrder || 0;
        const totalOrders = user.orderingBehavior.totalOrders;
        user.orderingBehavior.avgItemsPerOrder =
            ((prevAvg * (totalOrders - 1)) + totalItems) / totalOrders;

        await user.save();
        console.log(`✅ Updated preferences for user ${userId}`);

        return user.orderingBehavior;
    } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
};

/**
 * Get personalized recommendations for user
 * Returns products based on user's order history and preferences
 */
export const getPersonalizedRecommendations = async (userId, limit = 10) => {
    try {
        const user = await User.findById(userId)
            .populate('orderingBehavior.mostOrderedItems.productId');

        if (!user || !user.orderingBehavior) {
            // New user - return popular items
            return await Product.find({ isAvailable: true })
                .sort({ salesCount: -1, rating: -1 })
                .limit(limit);
        }

        const recommendations = [];
        const { mostOrderedItems, favoriteCategories } = user.orderingBehavior;

        // 1. Top ordered items (30% weight)
        if (mostOrderedItems && mostOrderedItems.length > 0) {
            const topOrdered = await Product.find({
                _id: { $in: mostOrderedItems.slice(0, 3).map(i => i.productId) },
                isAvailable: true,
            });
            recommendations.push(...topOrdered.map(p => ({ product: p, score: 30, reason: 'You order this often' })));
        }

        // 2. Similar items from favorite categories (40% weight)
        if (favoriteCategories && favoriteCategories.length > 0) {
            const topCategories = favoriteCategories.slice(0, 2).map(c => c.category);
            const categoryItems = await Product.find({
                category: { $in: topCategories },
                _id: { $nin: recommendations.map(r => r.product._id) },
                isAvailable: true,
            })
                .sort({ rating: -1, salesCount: -1 })
                .limit(4);

            recommendations.push(...categoryItems.map(p => ({
                product: p,
                score: 40,
                reason: `Popular in ${p.category}`
            })));
        }

        // 3. Trending items (20% weight)
        const trending = await Product.find({
            _id: { $nin: recommendations.map(r => r.product._id) },
            isAvailable: true,
            salesCount: { $gte: 10 },
        })
            .sort({ salesCount: -1, rating: -1 })
            .limit(3);

        recommendations.push(...trending.map(p => ({ product: p, score: 20, reason: 'Trending now' })));

        // 4. New items (10% weight) - items created in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newItems = await Product.find({
            _id: { $nin: recommendations.map(r => r.product._id) },
            isAvailable: true,
            createdAt: { $gte: thirtyDaysAgo },
        })
            .sort({ createdAt: -1 })
            .limit(2);

        recommendations.push(...newItems.map(p => ({ product: p, score: 10, reason: 'New arrival' })));

        // Sort by score and limit
        recommendations.sort((a, b) => b.score - a.score);

        return recommendations.slice(0, limit);
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        // Fallback to popular items
        return await Product.find({ isAvailable: true })
            .sort({ salesCount: -1, rating: -1 })
            .limit(limit);
    }
};

/**
 * Get "Reorder" suggestions - items user ordered before
 */
export const getReorderSuggestions = async (userId, limit = 5) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.orderingBehavior?.mostOrderedItems) {
            return [];
        }

        const productIds = user.orderingBehavior.mostOrderedItems
            .slice(0, limit)
            .map(item => item.productId);

        const products = await Product.find({
            _id: { $in: productIds },
            isAvailable: true,
        });

        // Maintain order by count
        const orderedProducts = productIds
            .map(id => products.find(p => p._id.toString() === id.toString()))
            .filter(p => p);

        return orderedProducts;
    } catch (error) {
        console.error('Error getting reorder suggestions:', error);
        return [];
    }
};

/**
 * Get category-specific recommendations
 */
export const getCategoryRecommendations = async (userId, category, limit = 10) => {
    try {
        const user = await User.findById(userId);

        // If user has ordered from this category before, prioritize those
        let userFavorites = [];
        if (user?.orderingBehavior?.mostOrderedItems) {
            const favProducts = await Product.find({
                _id: { $in: user.orderingBehavior.mostOrderedItems.map(i => i.productId) },
                category: category,
                isAvailable: true,
            }).limit(3);
            userFavorites = favProducts;
        }

        // Get remaining slots with popular items
        const remaining = limit - userFavorites.length;
        const popularItems = await Product.find({
            category: category,
            isAvailable: true,
            _id: { $nin: userFavorites.map(p => p._id) },
        })
            .sort({ rating: -1, salesCount: -1 })
            .limit(remaining);

        return [...userFavorites, ...popularItems];
    } catch (error) {
        console.error('Error getting category recommendations:', error);
        return await Product.find({ category, isAvailable: true })
            .sort({ rating: -1 })
            .limit(limit);
    }
};

/**
 * Get "Frequently Bought Together" suggestions
 */
export const getFrequentlyBoughtTogether = async (productId, limit = 3) => {
    try {
        // Find orders containing this product
        const orders = await Order.find({
            'items.product': productId,
            status: 'delivered',
        }).limit(100); // Limit to recent 100 orders for performance

        // Count co-occurring products
        const coOccurrence = {};
        for (const order of orders) {
            for (const item of order.items) {
                const itemId = item.product.toString();
                if (itemId !== productId.toString()) {
                    coOccurrence[itemId] = (coOccurrence[itemId] || 0) + 1;
                }
            }
        }

        // Sort by frequency and get top products
        const topProductIds = Object.entries(coOccurrence)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        const products = await Product.find({
            _id: { $in: topProductIds },
            isAvailable: true,
        });

        return products;
    } catch (error) {
        console.error('Error getting frequently bought together:', error);
        return [];
    }
};

/**
 * Get user's ordering statistics
 */
export const getUserOrderingStats = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('orderingBehavior.mostOrderedItems.productId');

        if (!user || !user.orderingBehavior) {
            return null;
        }

        return {
            totalOrders: user.orderingBehavior.totalOrders,
            totalSpent: user.orderingBehavior.totalSpent,
            averageOrderValue: user.orderingBehavior.averageOrderValue,
            orderFrequency: user.orderingBehavior.orderFrequency,
            preferredOrderTime: user.orderingBehavior.preferredOrderTime,
            favoriteCategories: user.orderingBehavior.favoriteCategories,
            mostOrderedItems: user.orderingBehavior.mostOrderedItems,
            lastOrderDate: user.orderingBehavior.lastOrderDate,
            avgItemsPerOrder: user.orderingBehavior.avgItemsPerOrder,
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        return null;
    }
};

export default {
    updateUserPreferences,
    getPersonalizedRecommendations,
    getReorderSuggestions,
    getCategoryRecommendations,
    getFrequentlyBoughtTogether,
    getUserOrderingStats,
};
