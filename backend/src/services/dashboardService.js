/**
 * Dashboard Service
 * 
 * Handles dashboard statistics and analytics
 * - Today's revenue (cached)
 * - Order counts by status (cached)
 * - Top products (cached)
 * - Recent activities (cached)
 * 
 * All expensive queries are cached for 1-5 minutes
 */

import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';

/**
 * Get dashboard statistics (today's revenue, order counts, user counts)
 * Cached for 2 minutes
 */
export const getDashboardStats = async () => {
    try {
        // Try to get from cache first
        const cached = await getCache('dashboard:stats:today');
        if (cached) {
            return { ...cached, fromCache: true };
        }

        // Calculate start and end of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Parallel queries for better performance
        const [
            todayRevenue,
            todayOrders,
            totalUsers,
            activeOrders,
            completedOrders,
            cancelledOrders,
        ] = await Promise.all([
            // Today's revenue
            Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfDay, $lte: endOfDay },
                        paymentStatus: 'completed',
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' },
                    },
                },
            ]),

            // Today's orders count
            Order.countDocuments({
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            }),

            // Total users count
            User.countDocuments({ isActive: true }),

            // Active orders (pending, preparing, out-for-delivery)
            Order.countDocuments({
                status: { $in: ['pending', 'preparing', 'out-for-delivery'] },
            }),

            // Completed orders today
            Order.countDocuments({
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                status: 'delivered',
            }),

            // Cancelled orders today
            Order.countDocuments({
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                status: 'cancelled',
            }),
        ]);

        const stats = {
            todayRevenue: todayRevenue[0]?.total || 0,
            todayOrders,
            totalUsers,
            activeOrders,
            completedOrders,
            cancelledOrders,
            lastUpdated: new Date().toISOString(),
        };

        // Cache for 2 minutes (120 seconds)
        await setCache('dashboard:stats:today', stats, 120);

        return stats;
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        const err = new Error('Failed to fetch dashboard statistics');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get top selling products
 * Cached for 5 minutes
 */
export const getTopProducts = async (limit = 5) => {
    try {
        const cacheKey = `dashboard:top-products:${limit}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return { products: cached, fromCache: true };
        }

        // Aggregate orders to find top products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo',
                },
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$productInfo.name',
                    category: '$productInfo.category',
                    totalQuantity: 1,
                    totalRevenue: 1,
                },
            },
        ]);

        // Cache for 5 minutes (300 seconds)
        await setCache(cacheKey, topProducts, 300);

        return { products: topProducts };
    } catch (error) {
        console.error('Get top products error:', error);
        const err = new Error('Failed to fetch top products');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get recent activities (last 20)
 * Cached for 1 minute
 */
export const getRecentActivities = async (limit = 20) => {
    try {
        const cacheKey = `dashboard:recent-activities:${limit}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return { activities: cached, fromCache: true };
        }

        const activities = await ActivityLog.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Cache for 1 minute (60 seconds)
        await setCache(cacheKey, activities, 60);

        return { activities };
    } catch (error) {
        console.error('Get recent activities error:', error);
        const err = new Error('Failed to fetch recent activities');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get revenue chart data (last 7 days)
 * Cached for 5 minutes
 */
export const getRevenueChart = async (days = 7) => {
    try {
        const cacheKey = `dashboard:revenue-chart:${days}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return { chart: cached, fromCache: true };
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const revenueData = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'completed',
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Cache for 5 minutes (300 seconds)
        await setCache(cacheKey, revenueData, 300);

        return { chart: revenueData };
    } catch (error) {
        console.error('Get revenue chart error:', error);
        const err = new Error('Failed to fetch revenue chart');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Invalidate dashboard cache (call this when orders/payments change)
 */
export const invalidateDashboardCache = async () => {
    try {
        await Promise.all([
            deleteCache('dashboard:stats:today'),
            deleteCache('dashboard:top-products:5'),
            deleteCache('dashboard:recent-activities:20'),
            deleteCache('dashboard:revenue-chart:7'),
        ]);
        console.log('✅ Dashboard cache invalidated');
    } catch (error) {
        console.error('Error invalidating dashboard cache:', error);
        // Don't throw - cache invalidation failure should not stop the operation
    }
};

export default {
    getDashboardStats,
    getTopProducts,
    getRecentActivities,
    getRevenueChart,
    invalidateDashboardCache,
};
