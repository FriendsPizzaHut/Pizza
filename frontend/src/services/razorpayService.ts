/**
 * Razorpay Service (Frontend)
 * 
 * Handles Razorpay payment integration in React Native
 * Uses react-native-razorpay package for native checkout
 */

import RazorpayCheckout from 'react-native-razorpay';
import apiClient from '../api/apiClient';
import Constants from 'expo-constants';

// Get Razorpay key from app config
const RAZORPAY_KEY_ID = Constants.expoConfig?.extra?.razorpayKeyId || '';

/**
 * Interface for Razorpay order response
 */
interface RazorpayOrderResponse {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    key: string;
}

/**
 * Interface for order details
 */
interface OrderDetails {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    user: {
        name: string;
        email?: string;
        phone: string;
    };
}

/**
 * Interface for payment response from Razorpay
 */
interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * Interface for payment verification response
 */
interface PaymentVerificationResponse {
    success: boolean;
    message: string;
    data: {
        order: any;
        payment: any;
    };
}

/**
 * Create Razorpay Order
 * @param orderId - Database order ID
 * @param amount - Amount in rupees
 * @returns Razorpay order details
 */
export const createRazorpayOrder = async (
    orderId: string,
    amount: number
): Promise<RazorpayOrderResponse> => {
    try {
        console.log('💳 Creating Razorpay order:', { orderId, amount });

        const response = await apiClient.post('/payments/razorpay/create-order', {
            orderId,
            amount,
        });

        if (response.data.success) {
            console.log('✅ Razorpay order created:', response.data.data.razorpayOrderId);
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to create payment order');
        }
    } catch (error: any) {
        console.error('❌ Error creating Razorpay order:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to create payment order. Please try again.';
        throw new Error(errorMessage);
    }
};

/**
 * Open Razorpay Checkout
 * @param orderDetails - Order details from database
 * @param razorpayOrder - Razorpay order details
 * @returns Payment response
 */
export const openRazorpayCheckout = async (
    orderDetails: OrderDetails,
    razorpayOrder: RazorpayOrderResponse
): Promise<RazorpayPaymentResponse> => {
    try {
        console.log('💳 Opening Razorpay checkout for order:', orderDetails.orderNumber);

        // Razorpay checkout options
        const options = {
            description: `Order #${orderDetails.orderNumber}`,
            image: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
            currency: razorpayOrder.currency,
            key: razorpayOrder.key || RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount, // Amount in paise
            name: 'Friends Pizza Hut',
            order_id: razorpayOrder.razorpayOrderId,
            prefill: {
                name: orderDetails.user.name,
                email: orderDetails.user.email || '',
                contact: orderDetails.user.phone,
            },
            theme: {
                color: '#E23744', // Your app theme color
            },
            retry: {
                enabled: true,
                max_count: 3,
            },
            timeout: 300, // 5 minutes
            modal: {
                ondismiss: () => {
                    console.log('⚠️ Razorpay checkout dismissed');
                },
            },
        };

        console.log('🔓 Opening Razorpay checkout with options:', {
            orderId: options.order_id,
            amount: options.amount,
            name: options.prefill.name,
        });

        // Open Razorpay checkout
        const data = await RazorpayCheckout.open(options);

        console.log('✅ Payment successful:', data);

        return {
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
        };
    } catch (error: any) {
        console.error('❌ Razorpay checkout error:', error);

        // Handle cancellation vs error
        if (error.code === 0) {
            // Payment cancelled by user
            const cancelError = new Error('Payment cancelled');
            (cancelError as any).code = 'PAYMENT_CANCELLED';
            throw cancelError;
        } else if (error.code === 2) {
            // Network error
            const networkError = new Error('Network error. Please check your internet connection.');
            (networkError as any).code = 'NETWORK_ERROR';
            throw networkError;
        } else {
            // Other errors
            throw new Error(error.description || 'Payment failed. Please try again.');
        }
    }
};

/**
 * Verify Payment
 * @param orderId - Database order ID
 * @param paymentResponse - Payment response from Razorpay
 * @returns Verification result
 */
export const verifyPayment = async (
    orderId: string,
    paymentResponse: RazorpayPaymentResponse
): Promise<PaymentVerificationResponse> => {
    try {
        console.log('🔐 Verifying payment for order:', orderId);

        const response = await apiClient.post('/payments/razorpay/verify', {
            orderId,
            ...paymentResponse,
        });

        if (response.data.success) {
            console.log('✅ Payment verified successfully');
            return response.data;
        } else {
            throw new Error(response.data.message || 'Payment verification failed');
        }
    } catch (error: any) {
        console.error('❌ Payment verification error:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Payment verification failed. Please contact support.';
        throw new Error(errorMessage);
    }
};

/**
 * Get Payment Status
 * @param orderId - Database order ID
 * @returns Payment status
 */
export const getPaymentStatus = async (orderId: string) => {
    try {
        console.log('📊 Fetching payment status for order:', orderId);

        const response = await apiClient.get(`/payments/razorpay/status/${orderId}`);

        if (response.data.success) {
            console.log('✅ Payment status fetched:', response.data.data.paymentStatus);
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get payment status');
        }
    } catch (error: any) {
        console.error('❌ Error fetching payment status:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to get payment status';
        throw new Error(errorMessage);
    }
};

/**
 * Handle payment flow (create order, open checkout, verify)
 * @param orderDetails - Order details
 * @returns Verification result
 */
export const handleRazorpayPayment = async (
    orderDetails: OrderDetails
): Promise<PaymentVerificationResponse> => {
    try {
        // Step 1: Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(
            orderDetails._id,
            orderDetails.totalAmount
        );

        // Step 2: Open Razorpay checkout
        const paymentResponse = await openRazorpayCheckout(orderDetails, razorpayOrder);

        // Step 3: Verify payment
        const verificationResult = await verifyPayment(orderDetails._id, paymentResponse);

        return verificationResult;
    } catch (error: any) {
        console.error('❌ Payment flow error:', error);
        throw error;
    }
};

/**
 * Check if Razorpay is configured
 * @returns True if Razorpay key is configured
 */
export const isRazorpayConfigured = (): boolean => {
    return !!RAZORPAY_KEY_ID && RAZORPAY_KEY_ID.length > 0;
};

export default {
    createRazorpayOrder,
    openRazorpayCheckout,
    verifyPayment,
    getPaymentStatus,
    handleRazorpayPayment,
    isRazorpayConfigured,
};
