/**
 * Type definitions for react-native-razorpay
 * Razorpay checkout for React Native
 */

declare module 'react-native-razorpay' {
    export interface RazorpayOptions {
        description: string;
        image?: string;
        currency: string;
        key: string;
        amount: number;
        name: string;
        order_id: string;
        prefill?: {
            name?: string;
            email?: string;
            contact?: string;
        };
        theme?: {
            color?: string;
            backdrop_color?: string;
            hide_topbar?: boolean;
        };
        retry?: {
            enabled?: boolean;
            max_count?: number;
        };
        timeout?: number;
        modal?: {
            ondismiss?: () => void;
            escape?: boolean;
            backdropclose?: boolean;
        };
        subscription_id?: string;
        subscription_card_change?: boolean;
        recurring?: boolean;
        callback_url?: string;
        redirect?: boolean;
        customer_id?: string;
        remember_customer?: boolean;
        readonly?: {
            contact?: boolean;
            email?: boolean;
            name?: boolean;
        };
        hidden?: {
            contact?: boolean;
            email?: boolean;
        };
        notes?: Record<string, string>;
        config?: {
            display?: {
                language?: string;
            };
        };
    }

    export interface RazorpaySuccessResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }

    export interface RazorpayErrorResponse {
        code: number;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id?: string;
            payment_id?: string;
        };
    }

    export default class RazorpayCheckout {
        static open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
    }
}
