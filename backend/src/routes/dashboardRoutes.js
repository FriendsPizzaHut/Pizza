/**
 * Dashboard Routes
 * 
 * Routes for dashboard analytics and statistics
 * All routes require admin authentication
 */

import express from 'express';
import {
    getDashboardStats,
    getTopProducts,
    getRecentActivities,
    getRevenueChart,
    getHourlySales,
    getSystemStatus,
    getDashboardOverview,
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All dashboard routes require admin authentication
router.use(protect, adminOnly);

/**
 * GET /api/v1/dashboard/overview
 * Get complete dashboard overview (RECOMMENDED - single API call)
 * Returns: stats, weeklyChart, hourlySales, topProducts, activities, systemStatus
 */
router.get('/overview', getDashboardOverview);

/**
 * GET /api/v1/dashboard/stats
 * Get dashboard statistics (revenue, orders, users)
 */
router.get('/stats', getDashboardStats);

/**
 * GET /api/v1/dashboard/top-products
 * Get top selling products
 * Query params: limit (default: 5)
 */
router.get('/top-products', getTopProducts);

/**
 * GET /api/v1/dashboard/activities
 * Get recent activities
 * Query params: limit (default: 20)
 */
router.get('/activities', getRecentActivities);

/**
 * GET /api/v1/dashboard/revenue-chart
 * Get revenue chart data
 * Query params: days (default: 7)
 */
router.get('/revenue-chart', getRevenueChart);

/**
 * GET /api/v1/dashboard/hourly-sales
 * Get hourly sales data for today (9 AM - 9 PM)
 */
router.get('/hourly-sales', getHourlySales);

/**
 * GET /api/v1/dashboard/system-status
 * Get real-time system status (database, cache, socket)
 */
router.get('/system-status', getSystemStatus);

export default router;
