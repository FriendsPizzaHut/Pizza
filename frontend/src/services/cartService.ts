/**
 * Cart Service
 * 
 * API client for cart operations.
 * All requests include authentication token via apiClient.
 */

import apiClient from '../api/apiClient';

// ==================== TYPES ====================

export interface CartItem {
    _id: string;
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

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    appliedCoupon?: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddItemParams {
    productId: string;
    quantity: number;
    size?: 'small' | 'medium' | 'large';
    customToppings?: Array<{
        name: string;
        category: string;
        price: number;
    }>;
    specialInstructions?: string;
}

export interface UpdateQuantityParams {
    itemId: string;
    quantity: number;
}

export interface ApplyCouponParams {
    couponCode: string;
}

export interface CartValidation {
    isValid: boolean;
    cart?: Cart;
    issues?: Array<{
        type: string;
        message: string;
        itemId?: string;
    }>;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Handle API errors consistently
 */
const handleApiError = (error: any) => {
    if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
        throw new Error(message);
    } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
    } else {
        // Error setting up request
        throw new Error(error.message || 'Failed to make request');
    }
};

// ==================== API FUNCTIONS ====================

/**
 * Get user's cart
 */
export const getCart = async (): Promise<Cart> => {
    try {
        const response = await apiClient.get('/cart');
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (params: AddItemParams): Promise<Cart> => {
    try {
        const response = await apiClient.post('/cart/items', params);
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (params: UpdateQuantityParams): Promise<Cart> => {
    try {
        const { itemId, quantity } = params;
        const response = await apiClient.patch(
            `/cart/items/${itemId}`,
            { quantity }
        );
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (itemId: string): Promise<Cart> => {
    try {
        const response = await apiClient.delete(`/cart/items/${itemId}`);
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<Cart> => {
    try {
        const response = await apiClient.delete('/cart');
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Apply coupon to cart
 */
export const applyCoupon = async (params: ApplyCouponParams): Promise<Cart> => {
    try {
        const response = await apiClient.post('/cart/coupon', params);
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Remove coupon from cart
 */
export const removeCoupon = async (): Promise<Cart> => {
    try {
        const response = await apiClient.delete('/cart/coupon');
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

/**
 * Validate cart before checkout
 */
export const validateCart = async (): Promise<CartValidation> => {
    try {
        const response = await apiClient.get('/cart/validate');
        return response.data.data;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};
