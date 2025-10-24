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
            console.log('🔔 Fetching notifications...', params);
            const response = await notificationService.getNotifications(params);
            console.log('✅ Notifications fetched successfully:', response);
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
            console.log('🔔 Fetching unread count...');
            const count = await notificationService.getUnreadCount();
            console.log('✅ Unread count fetched:', count);
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
            console.log('🔔 Marking notification as read:', notificationId);
            const notification = await notificationService.markAsRead(notificationId);
            console.log('✅ Notification marked as read');
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
            console.log('🔔 Marking all notifications as read...');
            const result = await notificationService.markAllAsRead();
            console.log('✅ All notifications marked as read:', result);
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
            console.log('🔔 Deleting notification:', notificationId);
            await notificationService.deleteNotification(notificationId);
            console.log('✅ Notification deleted');
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
