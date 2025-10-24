/**
 * Notification Service
 * 
 * API service for notification operations:
 * - Get notifications
 * - Get unread count
 * - Mark as read
 * - Mark all as read
 * - Delete notification
 */

import apiClient from '../api/apiClient';

export interface Notification {
    _id: string;
    user: string;
    type: 'order' | 'delivery' | 'payment' | 'customer' | 'system' | 'staff';
    title: string;
    message: string;
    isRead: boolean;
    priority: 'high' | 'medium' | 'low';
    relatedEntity?: {
        entityType: 'order' | 'payment' | 'user' | 'menu' | 'none';
        entityId?: string;
    };
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationParams {
    isRead?: boolean;
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    totalCount: number;
    unreadCount: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

/**
 * Get user notifications
 */
export const getNotifications = async (
    params?: NotificationParams
): Promise<NotificationResponse> => {
    try {
        const response = await apiClient.get('/notifications', { params });
        return response.data.data;
    } catch (error: any) {
        console.error('[NotificationService] Get notifications error:', error);
        throw error;
    }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
    try {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data.data.count;
    } catch (error: any) {
        console.error('[NotificationService] Get unread count error:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<Notification> => {
    try {
        const response = await apiClient.patch(`/notifications/${notificationId}/read`);
        return response.data.data;
    } catch (error: any) {
        console.error('[NotificationService] Mark as read error:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{ message: string; count: number }> => {
    try {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data.data;
    } catch (error: any) {
        console.error('[NotificationService] Mark all as read error:', error);
        throw error;
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
        await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
        console.error('[NotificationService] Delete notification error:', error);
        throw error;
    }
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
