/**
 * Dashboard Redux Slice
 * 
 * Manages admin dashboard state including:
 * - Quick statistics (today & total)
 * - Weekly revenue chart
 * - Hourly sales data
 * - Top products
 * - Recent activities
 * - System status
 * 
 * Features:
 * - Optimistic updates for real-time events
 * - Cache awareness
 * - Error handling
 * - Loading states
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchDashboardOverview,
    refreshDashboardStats,
} from '../thunks/dashboardThunks';

// Types
export interface DashboardStats {
    todayOrders: number;
    totalOrders: number;
    todayRevenue: number;
    totalRevenue: number;
    activeDeliveries: number;
    totalCustomers: number;
    completedOrders?: number;
    cancelledOrders?: number;
}

export interface ChartDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface HourlySalesPoint {
    hour: string;
    hourValue: number;
    orders: number;
    revenue: number;
}

export interface TopProduct {
    _id: string;
    name: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface Activity {
    _id?: string;
    action: string;
    time: string;
    id: string;
    icon: string;
    color: string;
    user?: {
        name: string;
    };
}

export interface SystemStatus {
    database: 'active' | 'inactive';
    cache: 'active' | 'inactive';
    socket: 'active' | 'inactive';
    lastChecked: string;
}

interface DashboardState {
    // Data
    stats: DashboardStats | null;
    weeklyChart: ChartDataPoint[];
    hourlySales: HourlySalesPoint[];
    topProducts: TopProduct[];
    recentActivities: Activity[];
    systemStatus: SystemStatus | null;

    // Meta
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastUpdated: string | null;
    fromCache: boolean;
}

const initialState: DashboardState = {
    stats: null,
    weeklyChart: [],
    hourlySales: [],
    topProducts: [],
    recentActivities: [],
    systemStatus: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    fromCache: false,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // Real-time update: New order received
        incrementTodayOrders: (state) => {
            if (state.stats) {
                state.stats.todayOrders += 1;
                state.stats.totalOrders += 1;
            }
        },

        // Real-time update: Order delivered
        incrementCompletedOrders: (state) => {
            if (state.stats && state.stats.completedOrders !== undefined) {
                state.stats.completedOrders += 1;
            }
        },

        // Real-time update: Order cancelled
        incrementCancelledOrders: (state) => {
            if (state.stats && state.stats.cancelledOrders !== undefined) {
                state.stats.cancelledOrders += 1;
            }
        },

        // Real-time update: Active delivery count
        updateActiveDeliveries: (state, action: PayloadAction<number>) => {
            if (state.stats) {
                state.stats.activeDeliveries = action.payload;
            }
        },

        // Real-time update: Revenue increase
        updateRevenue: (state, action: PayloadAction<number>) => {
            if (state.stats) {
                state.stats.todayRevenue += action.payload;
                state.stats.totalRevenue += action.payload;
            }
        },

        // Real-time update: Add activity to timeline
        addActivity: (state, action: PayloadAction<Activity>) => {
            state.recentActivities.unshift(action.payload);
            // Keep only last 5 activities
            if (state.recentActivities.length > 5) {
                state.recentActivities = state.recentActivities.slice(0, 5);
            }
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Reset dashboard
        resetDashboard: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch Dashboard Overview
        builder
            .addCase(fetchDashboardOverview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload.stats;
                state.weeklyChart = action.payload.weeklyChart;
                state.hourlySales = action.payload.hourlySales;
                state.topProducts = action.payload.topProducts;
                state.recentActivities = action.payload.recentActivities;
                state.systemStatus = action.payload.systemStatus;
                state.lastUpdated = new Date().toISOString();
                state.fromCache = action.payload.fromCache || false;
            })
            .addCase(fetchDashboardOverview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Refresh Dashboard Stats (pull-to-refresh)
        builder
            .addCase(refreshDashboardStats.pending, (state) => {
                state.isRefreshing = true;
                state.error = null;
            })
            .addCase(refreshDashboardStats.fulfilled, (state, action) => {
                state.isRefreshing = false;
                state.stats = action.payload.stats;
                state.weeklyChart = action.payload.weeklyChart;
                state.hourlySales = action.payload.hourlySales;
                state.topProducts = action.payload.topProducts;
                state.recentActivities = action.payload.recentActivities;
                state.systemStatus = action.payload.systemStatus;
                state.lastUpdated = new Date().toISOString();
                state.fromCache = false; // Refresh always fetches fresh data
            })
            .addCase(refreshDashboardStats.rejected, (state, action) => {
                state.isRefreshing = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    incrementTodayOrders,
    incrementCompletedOrders,
    incrementCancelledOrders,
    updateActiveDeliveries,
    updateRevenue,
    addActivity,
    clearError,
    resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
