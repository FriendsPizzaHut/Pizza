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

/**
 * Get hourly sales data for today
 * GET /api/v1/dashboard/hourly-sales
 * @access Private/Admin
 */
export const getHourlySales = async (req, res, next) => {
    try {
        const result = await dashboardService.getHourlySales();
        sendResponse(res, 200, 'Hourly sales retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get system status (database, cache, socket)
 * GET /api/v1/dashboard/system-status
 * @access Private/Admin
 */
export const getSystemStatus = async (req, res, next) => {
    try {
        const status = await dashboardService.getSystemStatus();
        sendResponse(res, 200, 'System status retrieved successfully', status);
    } catch (error) {
        next(error);
    }
};

/**
 * Get complete dashboard overview (combined endpoint)
 * GET /api/v1/dashboard/overview
 * @access Private/Admin
 * 
 * Returns all dashboard data in a single API call for optimal performance:
 * - Statistics (today & total)
 * - Weekly revenue chart
 * - Hourly sales
 * - Top products
 * - Recent activities
 * - System status
 */
export const getDashboardOverview = async (req, res, next) => {
    try {
        const overview = await dashboardService.getDashboardOverview();
        sendResponse(res, 200, 'Dashboard overview retrieved successfully', overview);
    } catch (error) {
        next(error);
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
};
