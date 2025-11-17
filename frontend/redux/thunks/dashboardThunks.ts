/**
 * Dashboard Thunks
 * 
 * Async actions for fetching dashboard data from the API
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../src/api/axiosInstance';

/**
 * Fetch complete dashboard overview
 * Single API call that returns all dashboard data
 */
export const fetchDashboardOverview = createAsyncThunk(
    'dashboard/fetchOverview',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/dashboard/overview');

            if (response.data.success) {
                return {
                    stats: response.data.data.stats,
                    weeklyChart: response.data.data.weeklyChart || [],
                    hourlySales: response.data.data.hourlySales || [],
                    topProducts: response.data.data.topProducts || [],
                    recentActivities: response.data.data.recentActivities || [],
                    systemStatus: response.data.data.systemStatus || null,
                    fromCache: response.data.data.fromCache || false,
                };
            }

            throw new Error('Failed to fetch dashboard data');
        } catch (error: any) {
            console.error('❌ Dashboard fetch error:', error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch dashboard data';

            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Refresh dashboard stats (for pull-to-refresh)
 * Forces a fresh fetch from the server
 */
export const refreshDashboardStats = createAsyncThunk(
    'dashboard/refresh',
    async (_, { rejectWithValue }) => {
        try {
            // Add cache-busting parameter
            const response = await axiosInstance.get('/dashboard/overview', {
                params: {
                    refresh: new Date().getTime(),
                },
            });

            if (response.data.success) {
                return {
                    stats: response.data.data.stats,
                    weeklyChart: response.data.data.weeklyChart || [],
                    hourlySales: response.data.data.hourlySales || [],
                    topProducts: response.data.data.topProducts || [],
                    recentActivities: response.data.data.recentActivities || [],
                    systemStatus: response.data.data.systemStatus || null,
                };
            }

            throw new Error('Failed to refresh dashboard');
        } catch (error: any) {
            console.error('❌ Dashboard refresh error:', error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to refresh dashboard';

            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch only dashboard stats (lightweight)
 */
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/dashboard/stats');

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error('Failed to fetch dashboard stats');
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch dashboard stats';

            return rejectWithValue(errorMessage);
        }
    }
);
