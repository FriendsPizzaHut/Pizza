/**
 * Calculation Utilities
 * 
 * Provides helper functions for common calculations.
 */

/**
 * Calculate total price from cart items
 */
export const calculateCartTotal = (
    items: Array<{ price: number; quantity: number }>
): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (
    price: number,
    discountPercentage: number
): number => {
    return (price * discountPercentage) / 100;
};

/**
 * Calculate final price after discount
 */
export const calculateDiscountedPrice = (
    price: number,
    discountPercentage: number
): number => {
    return price - calculateDiscount(price, discountPercentage);
};

/**
 * Calculate tax amount
 */
export const calculateTax = (price: number, taxPercentage: number): number => {
    return (price * taxPercentage) / 100;
};

/**
 * Calculate delivery fee based on distance
 */
export const calculateDeliveryFee = (
    distance: number,
    baseRate: number = 2,
    perKmRate: number = 0.5
): number => {
    return baseRate + distance * perKmRate;
};

/**
 * Calculate order total with all charges
 */
export interface OrderTotals {
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    total: number;
}

export const calculateOrderTotal = (
    subtotal: number,
    discountPercentage: number = 0,
    taxPercentage: number = 5,
    deliveryFee: number = 0
): OrderTotals => {
    const discount = calculateDiscount(subtotal, discountPercentage);
    const amountAfterDiscount = subtotal - discount;
    const tax = calculateTax(amountAfterDiscount, taxPercentage);
    const total = amountAfterDiscount + tax + deliveryFee;

    return {
        subtotal,
        discount,
        tax,
        deliveryFee,
        total,
    };
};

/**
 * Format currency
 */
export const formatCurrency = (
    amount: number,
    currency: string = '₹',
    decimals: number = 2
): string => {
    return `${currency}${amount.toFixed(decimals)}`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

/**
 * Calculate estimated delivery time based on distance
 */
export const calculateEstimatedDeliveryTime = (
    distance: number,
    preparationTime: number = 15,
    averageSpeed: number = 30 // km/h
): number => {
    const travelTime = (distance / averageSpeed) * 60; // Convert to minutes
    return Math.ceil(preparationTime + travelTime);
};

/**
 * Round to nearest value
 */
export const roundToNearest = (value: number, nearest: number = 0.5): number => {
    return Math.round(value / nearest) * nearest;
};

/**
 * Calculate average rating
 */
export const calculateAverageRating = (ratings: number[]): number => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default {
    calculateCartTotal,
    calculateDiscount,
    calculateDiscountedPrice,
    calculateTax,
    calculateDeliveryFee,
    calculateOrderTotal,
    formatCurrency,
    calculatePercentage,
    calculateDistance,
    calculateEstimatedDeliveryTime,
    roundToNearest,
    calculateAverageRating,
    formatNumber,
};
