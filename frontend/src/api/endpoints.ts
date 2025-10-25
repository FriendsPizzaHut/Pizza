/**
 * API Endpoints
 * 
 * This file contains all API endpoint definitions.
 * Endpoints are organized by feature/module.
 * 
 * NOTE: Do NOT include /api prefix here - it's already in the baseURL
 */

// Base API path (empty since baseURL already includes /api)
const API_BASE = '';

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    VERIFY_TOKEN: `${API_BASE}/auth/verify`,
    REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
};

// User Endpoints
export const USER_ENDPOINTS = {
    PROFILE: `${API_BASE}/users/profile`,
    UPDATE_PROFILE: `${API_BASE}/users/profile`,
    UPLOAD_AVATAR: `${API_BASE}/users/avatar`,
    DELETE_ACCOUNT: `${API_BASE}/users/account`,
};

// Menu Endpoints
export const MENU_ENDPOINTS = {
    GET_ALL: `${API_BASE}/menu`,
    GET_BY_ID: (id: string) => `${API_BASE}/menu/${id}`,
    GET_BY_CATEGORY: (category: string) => `${API_BASE}/menu/category/${category}`,
    GET_CATEGORIES: `${API_BASE}/menu/categories`,
    SEARCH: `${API_BASE}/menu/search`,
};

// Order Endpoints
export const ORDER_ENDPOINTS = {
    CREATE: `${API_BASE}/orders`,
    GET_ALL: `${API_BASE}/orders`,
    GET_BY_ID: (id: string) => `${API_BASE}/orders/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/orders/${id}/status`,
    CANCEL: (id: string) => `${API_BASE}/orders/${id}/cancel`,
    TRACK: (id: string) => `${API_BASE}/orders/${id}/track`,
    HISTORY: `${API_BASE}/orders/history`,
    ACTIVE: `${API_BASE}/orders/active`,
};

// Cart Endpoints
export const CART_ENDPOINTS = {
    GET: `${API_BASE}/cart`,
    ADD_ITEM: `${API_BASE}/cart/items`,
    UPDATE_ITEM: (itemId: string) => `${API_BASE}/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `${API_BASE}/cart/items/${itemId}`,
    CLEAR: `${API_BASE}/cart/clear`,
    APPLY_COUPON: `${API_BASE}/cart/coupon`,
    REMOVE_COUPON: `${API_BASE}/cart/coupon`,
};

// Payment Endpoints
export const PAYMENT_ENDPOINTS = {
    CREATE_ORDER: `${API_BASE}/payments/create-order`,
    VERIFY_PAYMENT: `${API_BASE}/payments/verify`,
    PAYMENT_HISTORY: `${API_BASE}/payments/history`,
    RETRY_PAYMENT: (orderId: string) => `${API_BASE}/payments/${orderId}/retry`,
};

// Address Endpoints
export const ADDRESS_ENDPOINTS = {
    GET_ALL: `${API_BASE}/addresses`,
    GET_BY_ID: (id: string) => `${API_BASE}/addresses/${id}`,
    CREATE: `${API_BASE}/addresses`,
    UPDATE: (id: string) => `${API_BASE}/addresses/${id}`,
    DELETE: (id: string) => `${API_BASE}/addresses/${id}`,
    SET_DEFAULT: (id: string) => `${API_BASE}/addresses/${id}/default`,
};

// Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
    GET_ALL: `${API_BASE}/notifications`,
    MARK_READ: (id: string) => `${API_BASE}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE}/notifications/read-all`,
    DELETE: (id: string) => `${API_BASE}/notifications/${id}`,
    DELETE_ALL: `${API_BASE}/notifications/delete-all`,
    REGISTER_DEVICE: `${API_BASE}/notifications/register-device`,
    UNREGISTER_DEVICE: `${API_BASE}/notifications/unregister-device`,
};

// Admin - Menu Management Endpoints
export const ADMIN_MENU_ENDPOINTS = {
    CREATE_ITEM: `${API_BASE}/admin/menu`,
    UPDATE_ITEM: (id: string) => `${API_BASE}/admin/menu/${id}`,
    DELETE_ITEM: (id: string) => `${API_BASE}/admin/menu/${id}`,
    TOGGLE_AVAILABILITY: (id: string) => `${API_BASE}/admin/menu/${id}/availability`,
    UPLOAD_IMAGE: `${API_BASE}/admin/menu/upload-image`,
};

// Admin - Order Management Endpoints
export const ADMIN_ORDER_ENDPOINTS = {
    GET_ALL: `${API_BASE}/admin/orders`,
    GET_BY_ID: (id: string) => `${API_BASE}/admin/orders/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/admin/orders/${id}/status`,
    ASSIGN_DELIVERY: (id: string) => `${API_BASE}/admin/orders/${id}/assign`,
    GET_STATISTICS: `${API_BASE}/admin/orders/statistics`,
};

// Admin - Dashboard Endpoints
export const ADMIN_DASHBOARD_ENDPOINTS = {
    OVERVIEW: `${API_BASE}/admin/dashboard/overview`,
    REVENUE: `${API_BASE}/admin/dashboard/revenue`,
    TOP_ITEMS: `${API_BASE}/admin/dashboard/top-items`,
    CUSTOMER_ANALYTICS: `${API_BASE}/admin/dashboard/customers`,
};

// Delivery Partner Endpoints
export const DELIVERY_ENDPOINTS = {
    GET_ASSIGNED_ORDERS: `${API_BASE}/delivery/orders`,
    UPDATE_LOCATION: `${API_BASE}/delivery/location`,
    UPDATE_ORDER_STATUS: (orderId: string) => `${API_BASE}/delivery/orders/${orderId}/status`,
    MARK_DELIVERED: (orderId: string) => `${API_BASE}/delivery/orders/${orderId}/delivered`,
    GET_EARNINGS: `${API_BASE}/delivery/earnings`,
    TOGGLE_AVAILABILITY: `${API_BASE}/delivery/availability`,
};

// Review Endpoints
export const REVIEW_ENDPOINTS = {
    CREATE: `${API_BASE}/reviews`,
    GET_BY_ITEM: (itemId: string) => `${API_BASE}/reviews/item/${itemId}`,
    GET_BY_ORDER: (orderId: string) => `${API_BASE}/reviews/order/${orderId}`,
    UPDATE: (id: string) => `${API_BASE}/reviews/${id}`,
    DELETE: (id: string) => `${API_BASE}/reviews/${id}`,
};

// Socket Events (for reference)
export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // Orders
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_STATUS_CHANGED: 'order:status-changed',
    ORDER_ASSIGNED: 'order:assigned',

    // Delivery
    DELIVERY_LOCATION_UPDATED: 'delivery:location-updated',
    DELIVERY_ARRIVED: 'delivery:arrived',

    // Notifications
    NOTIFICATION_RECEIVED: 'notification:received',

    // Admin
    NEW_ORDER: 'admin:new-order',
    ORDER_CANCELLED: 'admin:order-cancelled',
};

export default {
    AUTH_ENDPOINTS,
    USER_ENDPOINTS,
    MENU_ENDPOINTS,
    ORDER_ENDPOINTS,
    CART_ENDPOINTS,
    PAYMENT_ENDPOINTS,
    ADDRESS_ENDPOINTS,
    NOTIFICATION_ENDPOINTS,
    ADMIN_MENU_ENDPOINTS,
    ADMIN_ORDER_ENDPOINTS,
    ADMIN_DASHBOARD_ENDPOINTS,
    DELIVERY_ENDPOINTS,
    REVIEW_ENDPOINTS,
    SOCKET_EVENTS,
};
