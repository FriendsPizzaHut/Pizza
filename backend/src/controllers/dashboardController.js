/**
 * Dashboard Controller
 * 
 * Handles dashboard analytics and statistics
 * - Dashboard stats
 * - Top products
 * - Recent activities
 * - Revenue chart
 * 
 * All data is cached for performance
 */

import * as dashboardService from '../services/dashboardService.js';
import { sendResponse } from '../utils/response.js';

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 * @access Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        sendResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
    } catch (error) {
        next(error);
    }
};

/**
 * Get top selling products
 * GET /api/v1/dashboard/top-products
 * @access Private/Admin
 */
export const getTopProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const result = await dashboardService.getTopProducts(limit);
        sendResponse(res, 200, 'Top products retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent activities
 * GET /api/v1/dashboard/activities
 * @access Private/Admin
 */
export const getRecentActivities = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await dashboardService.getRecentActivities(limit);
        sendResponse(res, 200, 'Recent activities retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get revenue chart data
 * GET /api/v1/dashboard/revenue-chart
 * @access Private/Admin
 */
export const getRevenueChart = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const result = await dashboardService.getRevenueChart(days);
        sendResponse(res, 200, 'Revenue chart retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

export default {
    getDashboardStats,
    getTopProducts,
    getRecentActivities,
    getRevenueChart,
};
