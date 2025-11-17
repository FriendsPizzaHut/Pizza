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
            totalRevenue,
            todayOrders,
            totalOrders,
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

            // Total revenue (all time)
            Payment.aggregate([
                {
                    $match: {
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

            // Total orders count (all time)
            Order.countDocuments(),

            // Total users count (customers only)
            User.countDocuments({ role: 'customer', isActive: true }),

            // Active deliveries (out-for-delivery status)
            Order.countDocuments({
                status: 'out-for-delivery',
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
            todayOrders,
            totalOrders,
            todayRevenue: todayRevenue[0]?.total || 0,
            totalRevenue: totalRevenue[0]?.total || 0,
            activeDeliveries: activeOrders,
            totalCustomers: totalUsers,
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
 * Get revenue chart data (last 7 days) in IST
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

        // Get revenue data with order counts using IST timezone
        const revenueData = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'completed',
                },
            },
            {
                $addFields: {
                    // Convert UTC to IST (UTC+5:30)
                    istDate: {
                        $add: ['$createdAt', 330 * 60 * 1000]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$istDate' },
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Get order counts for the same period using IST
        const orderData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $addFields: {
                    // Convert UTC to IST (UTC+5:30)
                    istDate: {
                        $add: ['$createdAt', 330 * 60 * 1000]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$istDate' },
                    },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Merge revenue and order data
        const orderMap = new Map(orderData.map(d => [d._id, d.orders]));
        const chartData = revenueData.map(d => ({
            date: d._id,
            revenue: d.revenue,
            orders: orderMap.get(d._id) || 0,
        }));

        // Cache for 5 minutes (300 seconds)
        await setCache(cacheKey, chartData, 300);

        return { chart: chartData };
    } catch (error) {
        console.error('Get revenue chart error:', error);
        const err = new Error('Failed to fetch revenue chart');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get hourly sales data for today (9 AM - 9 PM) in IST
 * Cached for 5 minutes
 */
export const getHourlySales = async () => {
    try {
        const cacheKey = 'dashboard:hourly-sales:today';
        const cached = await getCache(cacheKey);
        if (cached) {
            return { hourlySales: cached, fromCache: true };
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Aggregate orders by hour with IST timezone conversion
        const hourlyData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: { $nin: ['cancelled'] },
                },
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'payment',
                },
            },
            {
                $unwind: {
                    path: '$payment',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    // Convert UTC to IST (UTC+5:30) by adding 330 minutes (5 hours 30 minutes)
                    istDate: {
                        $add: ['$createdAt', 330 * 60 * 1000] // 330 minutes in milliseconds
                    }
                }
            },
            {
                $group: {
                    _id: { $hour: '$istDate' }, // Extract hour from IST date
                    orders: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$payment.paymentStatus', 'completed'] },
                                '$payment.amount',
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Format hours as "9AM", "10AM", etc.
        const formatHour = (hour) => {
            if (hour === 0) return '12AM';
            if (hour === 12) return '12PM';
            if (hour < 12) return `${hour}AM`;
            return `${hour - 12}PM`;
        };

        const formattedData = hourlyData.map(d => ({
            hour: formatHour(d._id),
            hourValue: d._id,
            orders: d.orders,
            revenue: d.revenue,
        }));

        // Filter for business hours (9 AM - 9 PM)
        const businessHoursData = formattedData.filter(
            d => d.hourValue >= 9 && d.hourValue <= 21
        );

        // Cache for 5 minutes (300 seconds)
        await setCache(cacheKey, businessHoursData, 300);

        return { hourlySales: businessHoursData };
    } catch (error) {
        console.error('Get hourly sales error:', error);
        const err = new Error('Failed to fetch hourly sales');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get system status (database, cache, socket connections)
 * Not cached - real-time check
 */
export const getSystemStatus = async () => {
    try {
        const status = {
            database: 'inactive',
            cache: 'inactive',
            socket: 'inactive',
            lastChecked: new Date().toISOString(),
        };

        // Check MongoDB connection
        try {
            await Order.findOne().limit(1);
            status.database = 'active';
        } catch (error) {
            console.error('Database check failed:', error);
        }

        // Check Redis cache
        try {
            await setCache('health-check', { status: 'ok' }, 10);
            const cacheTest = await getCache('health-check');
            if (cacheTest) {
                status.cache = 'active';
            }
        } catch (error) {
            console.error('Cache check failed:', error);
        }

        // Check Socket.IO
        try {
            if (global.socketEmit && typeof global.socketEmit.emitToAll === 'function') {
                status.socket = 'active';
            }
        } catch (error) {
            console.error('Socket check failed:', error);
        }

        return status;
    } catch (error) {
        console.error('Get system status error:', error);
        const err = new Error('Failed to fetch system status');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get combined dashboard overview (all data in one call)
 * Cached for 2 minutes - optimized for single API call
 */
export const getDashboardOverview = async () => {
    try {
        const cacheKey = 'dashboard:overview:combined';
        const cached = await getCache(cacheKey);
        if (cached) {
            return { ...cached, fromCache: true };
        }

        // Execute all queries in parallel for maximum performance
        const [stats, weeklyChart, hourlySales, topProducts, activities, systemStatus] = await Promise.all([
            getDashboardStats(),
            getRevenueChart(7),
            getHourlySales(),
            getTopProducts(6),
            getRecentActivities(5),
            getSystemStatus(),
        ]);

        const overview = {
            stats: stats,
            weeklyChart: weeklyChart.chart || [],
            hourlySales: hourlySales.hourlySales || [],
            topProducts: topProducts.products || [],
            recentActivities: activities.activities || [],
            systemStatus,
            lastUpdated: new Date().toISOString(),
        };

        // Cache for 2 minutes (120 seconds)
        await setCache(cacheKey, overview, 120);

        return overview;
    } catch (error) {
        console.error('Get dashboard overview error:', error);
        const err = new Error('Failed to fetch dashboard overview');
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
            deleteCache('dashboard:top-products:6'),
            deleteCache('dashboard:recent-activities:20'),
            deleteCache('dashboard:recent-activities:5'),
            deleteCache('dashboard:revenue-chart:7'),
            deleteCache('dashboard:hourly-sales:today'),
            deleteCache('dashboard:overview:combined'),
        ]);
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
    getHourlySales,
    getSystemStatus,
    getDashboardOverview,
    invalidateDashboardCache,
};
