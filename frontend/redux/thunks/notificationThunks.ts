/**
 * Notification Thunks
 * 
 * Async actions for notification operations:
 * - Fetch notifications
 * - Fetch unread count
 * - Mark as read
 * - Mark all as read
 * - Delete notification
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '../../src/services/notificationService';
import { NotificationParams } from '../../src/services/notificationService';

/**
 * Fetch notifications with optional filters
 */
export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async (params: NotificationParams = {}, { rejectWithValue }) => {
        try {
            const response = await notificationService.getNotifications(params);
            return response;
        } catch (error: any) {
            console.error('❌ Fetch notifications error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch notifications';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch unread notification count
 */
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const count = await notificationService.getUnreadCount();
            return count;
        } catch (error: any) {
            console.error('❌ Fetch unread count error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch unread count';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            const notification = await notificationService.markAsRead(notificationId);
            return notification;
        } catch (error: any) {
            console.error('❌ Mark as read error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to mark notification as read';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const result = await notificationService.markAllAsRead();
            return result;
        } catch (error: any) {
            console.error('❌ Mark all as read error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to mark all notifications as read';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete notification
 */
export const deleteNotificationAsync = createAsyncThunk(
    'notifications/delete',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await notificationService.deleteNotification(notificationId);
            return notificationId; // Return ID for optimistic update
        } catch (error: any) {
            console.error('❌ Delete notification error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to delete notification';
            return rejectWithValue(errorMessage);
        }
    }
);

export default {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationAsync,
};
