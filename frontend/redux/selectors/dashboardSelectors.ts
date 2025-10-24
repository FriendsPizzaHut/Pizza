/**
 * Dashboard Selectors
 * 
 * Memoized selectors for efficient dashboard state access
 * Uses Reselect for automatic memoization
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors
export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectWeeklyChart = (state: RootState) => state.dashboard.weeklyChart;
export const selectHourlySales = (state: RootState) => state.dashboard.hourlySales;
export const selectTopProducts = (state: RootState) => state.dashboard.topProducts;
export const selectRecentActivities = (state: RootState) => state.dashboard.recentActivities;
export const selectSystemStatus = (state: RootState) => state.dashboard.systemStatus;
export const selectIsLoading = (state: RootState) => state.dashboard.isLoading;
export const selectIsRefreshing = (state: RootState) => state.dashboard.isRefreshing;
export const selectError = (state: RootState) => state.dashboard.error;
export const selectLastUpdated = (state: RootState) => state.dashboard.lastUpdated;
export const selectFromCache = (state: RootState) => state.dashboard.fromCache;

// Computed selectors (memoized)

/**
 * Get maximum revenue from weekly chart
 * Used for chart scaling
 * Returns minimum 1 to prevent division by zero
 */
export const selectMaxWeeklyRevenue = createSelector(
    [selectWeeklyChart],
    (chart) => {
        if (chart.length === 0) return 1;
        const max = Math.max(...chart.map((d) => d.revenue));
        return max === 0 ? 1 : max;
    }
);

/**
 * Get maximum revenue from hourly sales
 * Used for chart scaling
 * Returns minimum 1 to prevent division by zero
 */
export const selectMaxHourlyRevenue = createSelector(
    [selectHourlySales],
    (sales) => {
        if (sales.length === 0) return 1;
        const max = Math.max(...sales.map((d) => d.revenue));
        return max === 0 ? 1 : max;
    }
);

/**
 * Get maximum orders from weekly chart
 */
export const selectMaxWeeklyOrders = createSelector(
    [selectWeeklyChart],
    (chart) => {
        if (chart.length === 0) return 0;
        return Math.max(...chart.map((d) => d.orders));
    }
);

/**
 * Get maximum orders from hourly sales
 */
export const selectMaxHourlyOrders = createSelector(
    [selectHourlySales],
    (sales) => {
        if (sales.length === 0) return 0;
        return Math.max(...sales.map((d) => d.orders));
    }
);

/**
 * Check if dashboard data is stale (older than 5 minutes)
 */
export const selectIsStale = createSelector(
    [selectLastUpdated],
    (lastUpdated) => {
        if (!lastUpdated) return true;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return new Date(lastUpdated).getTime() < fiveMinutesAgo;
    }
);

/**
 * Get formatted weekly chart data with day names
 */
export const selectFormattedWeeklyChart = createSelector(
    [selectWeeklyChart],
    (chart) => {
        return chart.map((item) => {
            const date = new Date(item.date);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
                ...item,
                day: dayNames[date.getDay()],
            };
        });
    }
);

/**
 * Get peak hour from hourly sales
 */
export const selectPeakHour = createSelector(
    [selectHourlySales, selectMaxHourlyRevenue],
    (sales, maxRevenue) => {
        if (sales.length === 0) return null;
        return sales.find((s) => s.revenue === maxRevenue) || null;
    }
);

/**
 * Get system health summary
 */
export const selectSystemHealth = createSelector(
    [selectSystemStatus],
    (status) => {
        if (!status) return 'unknown';

        const allActive =
            status.database === 'active' &&
            status.cache === 'active' &&
            status.socket === 'active';

        if (allActive) return 'healthy';

        const anyActive =
            status.database === 'active' ||
            status.cache === 'active' ||
            status.socket === 'active';

        return anyActive ? 'degraded' : 'down';
    }
);

/**
 * Check if dashboard has data
 */
export const selectHasData = createSelector(
    [selectDashboardStats],
    (stats) => stats !== null
);

/**
 * Get total revenue growth (today vs total average)
 */
export const selectRevenueGrowth = createSelector(
    [selectDashboardStats],
    (stats) => {
        if (!stats || stats.totalRevenue === 0) return 0;

        const averageDailyRevenue = stats.totalRevenue / (stats.totalOrders || 1);
        const todayVsAverage = ((stats.todayRevenue - averageDailyRevenue) / averageDailyRevenue) * 100;

        return Math.round(todayVsAverage);
    }
);

/**
 * Get formatted stats for display
 */
export const selectFormattedStats = createSelector(
    [selectDashboardStats],
    (stats) => {
        if (!stats) return [];

        return [
            {
                title: "Today's Orders",
                value: stats.todayOrders,
                icon: 'shopping-cart',
                color: '#cb202d',
            },
            {
                title: 'Total Orders',
                value: stats.totalOrders,
                icon: 'receipt',
                color: '#9C27B0',
            },
            {
                title: "Today's Revenue",
                value: `₹${stats.todayRevenue.toFixed(2)}`,
                icon: 'account-balance-wallet',
                color: '#4CAF50',
            },
            {
                title: 'Total Revenue',
                value: `₹${stats.totalRevenue.toFixed(2)}`,
                icon: 'payments',
                color: '#2196F3',
            },
            {
                title: 'Active Deliveries',
                value: stats.activeDeliveries,
                icon: 'delivery-dining',
                color: '#FF9800',
            },
            {
                title: 'Total Customers',
                value: stats.totalCustomers,
                icon: 'people',
                color: '#607D8B',
            },
        ];
    }
);
