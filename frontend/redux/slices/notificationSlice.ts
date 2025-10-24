/**
 * Notification Redux Slice
 * 
 * Manages notification state including:
 * - Notification list
 * - Unread count
 * - Real-time updates via Socket.IO
 * - Read/unread status
 * 
 * Features:
 * - Pagination support
 * - Optimistic updates
 * - Real-time Socket.IO integration
 * - Error handling
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationAsync,
} from '../thunks/notificationThunks';
import { Notification } from '../../src/services/notificationService';

interface NotificationState {
    // Data
    notifications: Notification[];
    unreadCount: number;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;

    // Loading states
    loading: boolean;
    refreshing: boolean;
    loadingMore: boolean;
    countLoading: boolean;

    // Error states
    error: string | null;

    // Filter
    filter: 'all' | 'unread';
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    loading: false,
    refreshing: false,
    loadingMore: false,
    countLoading: false,
    error: null,
    filter: 'all',
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        /**
         * Add new notification from Socket.IO
         */
        addNewNotification: (state, action: PayloadAction<Notification>) => {
            // Add to the beginning of the list
            state.notifications.unshift(action.payload);
            state.totalCount += 1;

            // Update unread count if notification is unread
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },

        /**
         * Set filter (all/unread)
         */
        setFilter: (state, action: PayloadAction<'all' | 'unread'>) => {
            state.filter = action.payload;
            // Reset pagination when filter changes
            state.currentPage = 1;
            state.notifications = [];
        },

        /**
         * Clear all notifications
         */
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.totalCount = 0;
            state.currentPage = 1;
            state.totalPages = 1;
            state.hasMore = false;
        },

        /**
         * Reset error state
         */
        clearError: (state) => {
            state.error = null;
        },

        /**
         * Increment unread count (from Socket.IO)
         */
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },

        /**
         * Decrement unread count
         */
        decrementUnreadCount: (state) => {
            if (state.unreadCount > 0) {
                state.unreadCount -= 1;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Notifications
        builder
            .addCase(fetchNotifications.pending, (state, action) => {
                const isLoadingMore = action.meta.arg.page && action.meta.arg.page > 1;
                if (isLoadingMore) {
                    state.loadingMore = true;
                } else {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                const { notifications, totalCount, unreadCount, page, totalPages, hasMore } =
                    action.payload;

                if (page === 1) {
                    // First page or refresh
                    state.notifications = notifications;
                } else {
                    // Load more: append to existing
                    state.notifications = [...state.notifications, ...notifications];
                }

                state.unreadCount = unreadCount;
                state.totalCount = totalCount;
                state.currentPage = page;
                state.totalPages = totalPages;
                state.hasMore = hasMore;
                state.loading = false;
                state.loadingMore = false;
                state.refreshing = false;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.loadingMore = false;
                state.refreshing = false;
                state.error = action.payload as string;
            });

        // Fetch Unread Count
        builder
            .addCase(fetchUnreadCount.pending, (state) => {
                state.countLoading = true;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
                state.countLoading = false;
            })
            .addCase(fetchUnreadCount.rejected, (state) => {
                state.countLoading = false;
            });

        // Mark as Read
        builder
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notificationId = action.payload._id;
                const notification = state.notifications.find((n) => n._id === notificationId);

                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    notification.readAt = action.payload.readAt;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Mark All as Read
        builder
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                // Mark all notifications as read
                state.notifications = state.notifications.map((n) => ({
                    ...n,
                    isRead: true,
                    readAt: new Date().toISOString(),
                }));
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Delete Notification
        builder
            .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
                const notificationId = action.payload;
                const notification = state.notifications.find((n) => n._id === notificationId);

                // Remove from list
                state.notifications = state.notifications.filter(
                    (n) => n._id !== notificationId
                );
                state.totalCount -= 1;

                // Update unread count if notification was unread
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(deleteNotificationAsync.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const {
    addNewNotification,
    setFilter,
    clearNotifications,
    clearError,
    incrementUnreadCount,
    decrementUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
