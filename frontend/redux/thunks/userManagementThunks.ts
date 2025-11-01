import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../src/api/apiClient';
import {
    setLoading,
    setRefreshing,
    setLoadingDetails,
    setError,
    setUsers,
    appendUsers,
    setSelectedUser,
    removeUser,
} from '../slices/userManagementSlice';
import { RootState } from '../store';

/**
 * Fetch users with search and filter
 * Optimized with pagination
 */
export const fetchUsers = createAsyncThunk(
    'userManagement/fetchUsers',
    async (
        { refresh = false }: { refresh?: boolean } = {},
        { dispatch, getState }
    ) => {
        try {
            if (refresh) {
                dispatch(setRefreshing(true));
            } else {
                dispatch(setLoading(true));
            }

            const state = getState() as RootState;
            const { searchQuery, filterRole, pagination } = state.userManagement;

            // Build query params
            const params: any = {
                page: refresh ? 1 : pagination.page,
                limit: pagination.limit,
            };

            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            if (filterRole !== 'all') {
                params.role = filterRole;
            }

            const response = await apiClient.get('/users', { params });

            if (response.data.success) {
                if (refresh || pagination.page === 1) {
                    dispatch(setUsers({
                        users: response.data.data.users,
                        pagination: response.data.data.pagination
                    }));
                } else {
                    dispatch(appendUsers({
                        users: response.data.data.users,
                        pagination: response.data.data.pagination
                    }));
                }
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch users';
            dispatch(setError(errorMessage));
            console.error('Fetch users error:', error);
        } finally {
            dispatch(setLoading(false));
            dispatch(setRefreshing(false));
        }
    }
);

/**
 * Fetch user details by ID
 * Only called when opening user details modal
 */
export const fetchUserDetails = createAsyncThunk(
    'userManagement/fetchUserDetails',
    async (userId: string, { dispatch }) => {
        try {
            dispatch(setLoadingDetails(true));
            dispatch(setError(null));

            const response = await apiClient.get(`/users/${userId}`);

            if (response.data.success) {
                dispatch(setSelectedUser(response.data.data));
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch user details';
            dispatch(setError(errorMessage));
            console.error('Fetch user details error:', error);
        } finally {
            dispatch(setLoadingDetails(false));
        }
    }
);

/**
 * Delete user
 * With optimistic update
 */
export const deleteUserById = createAsyncThunk(
    'userManagement/deleteUser',
    async (userId: string, { dispatch }) => {
        try {
            // Optimistic update
            dispatch(removeUser(userId));
            dispatch(setSelectedUser(null));

            const response = await apiClient.delete(`/users/${userId}`);

            if (!response.data.success) {
                // Revert if failed (you might want to refetch instead)
                throw new Error(response.data.message || 'Failed to delete user');
            }

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete user';
            dispatch(setError(errorMessage));
            console.error('Delete user error:', error);
            // Refetch to restore correct state after failed deletion
            dispatch(fetchUsers({ refresh: true }));
            throw error;
        }
    }
);

/**
 * Refresh users list
 * Used for pull-to-refresh
 */
export const refreshUsers = createAsyncThunk(
    'userManagement/refreshUsers',
    async (_, { dispatch }) => {
        return dispatch(fetchUsers({ refresh: true }));
    }
);

/**
 * Load more users (pagination)
 */
export const loadMoreUsers = createAsyncThunk(
    'userManagement/loadMoreUsers',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const { hasMore, isLoading } = state.userManagement;

        if (!hasMore || isLoading) {
            return;
        }

        // Dispatch the thunk and wait for it to complete
        await dispatch(fetchUsers({}));
    }
);

export default {
    fetchUsers,
    fetchUserDetails,
    deleteUserById,
    refreshUsers,
    loadMoreUsers,
};
