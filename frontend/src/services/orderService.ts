/**
 * Order Service
 * 
 * API client for order operations.
 * Handles order creation, fetching, and tracking.
 */

import apiClient from '../api/apiClient';

// ==================== TYPES ====================

export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    pincode: string;
    instructions?: string;
}

export interface OrderItem {
    product: {
        _id: string;
        name: string;
        imageUrl: string;
        category: string;
        basePrice: number;
    };
    productSnapshot: {
        name: string;
        imageUrl: string;
        basePrice: number;
        category: string;
    };
    quantity: number;
    size?: 'small' | 'medium' | 'large';
    selectedPrice: number;
    customToppings?: Array<{
        name: string;
        category: string;
        price: number;
    }>;
    specialInstructions?: string;
    subtotal: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    user: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    totalAmount: number;
    appliedCoupon?: {
        code: string;
        discountAmount: number;
    };
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
    statusHistory: Array<{
        status: string;
        timestamp: string;
        note?: string;
    }>;
    deliveryAgent?: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod: 'card' | 'cash' | 'wallet' | 'upi';
    deliveryAddress: DeliveryAddress;
    contactPhone: string;
    orderInstructions?: string;
    estimatedDeliveryTime: number;
    deliveredAt?: string;
    rating?: {
        score: number;
        review?: string;
        reviewedAt?: string;
    };
    createdAt: string;
    updatedAt: string;
    totalItems: number;
}

export interface CreateOrderParams {
    deliveryAddress: DeliveryAddress;
    contactPhone: string;
    paymentMethod: 'card' | 'cash' | 'wallet' | 'upi';
    orderInstructions?: string;
}

export interface OrderListResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            totalOrders: number;
            totalPages: number;
        };
    };
}

// ==================== API FUNCTIONS ====================

/**
 * Optimized order format for OrdersScreen (from backend)
 */
export interface MyOrder {
    id: string;
    _id: string;
    status: string;
    statusType: 'active' | 'completed' | 'cancelled';
    items: string[];
    itemsCount: number;
    firstItemImage: string | null;
    total: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    paymentMethod: string;
    deliveryAddress: string | null;
    contactPhone: string;
    date: string;
    time: string;
    estimatedTime: string | null;
}

export interface MyOrdersResponse {
    orders: MyOrder[];
    pagination: {
        total: number;
        limit: number;
        skip: number;
        hasMore: boolean;
    };
}

/**
 * Get authenticated user's orders (optimized for OrdersScreen)
 * Uses lean queries and pre-formatted data from backend
 */
export const getMyOrders = async (params?: {
    limit?: number;
    skip?: number;
    status?: string;
}): Promise<MyOrdersResponse> => {
    const response = await apiClient.get('/orders/my-orders', { params });
    return response.data.data;
};

/**
 * Create order from current cart
 */
export const createOrderFromCart = async (params: CreateOrderParams): Promise<Order> => {
    const response = await apiClient.post('/orders/from-cart', params);
    return response.data.data;
};

/**
 * Get user's orders
 */
export const getUserOrders = async (page: number = 1, limit: number = 10): Promise<OrderListResponse> => {
    const response = await apiClient.get(`/orders/user`, {
        params: { page, limit }
    });
    return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string, reason?: string): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
};

/**
 * Track order status
 */
export const trackOrder = async (orderNumber: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/track/${orderNumber}`);
    return response.data.data;
};

/**
 * Rate order
 */
export const rateOrder = async (
    orderId: string,
    rating: { score: number; review?: string }
): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${orderId}/rate`, rating);
    return response.data.data;
};

export default {
    getMyOrders,
    createOrderFromCart,
    getUserOrders,
    getOrderById,
    cancelOrder,
    trackOrder,
    rateOrder,
};
