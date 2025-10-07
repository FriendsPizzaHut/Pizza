/**
 * Socket Event Handlers
 * 
 * Handles real-time events for:
 * - Shop status (open/closed)
 * - Order updates
 * - Delivery boy tracking
 * - Payment status updates
 */

import { getIO } from '../config/socket.js';

/**
 * Emit shop status change to all clients
 * @param {object} shopData - Shop data with status
 */
export const emitShopStatusChange = (shopData) => {
    const io = getIO();
    io.emit('shop:status-changed', {
        shopId: shopData.id,
        isOpen: shopData.isOpen,
        message: shopData.isOpen ? 'Shop is now open' : 'Shop is now closed',
        timestamp: new Date(),
    });
    console.log(`📢 Shop status broadcasted: ${shopData.isOpen ? 'OPEN' : 'CLOSED'}`);
};

/**
 * Emit order update to specific user and admin
 * @param {string} userId - User ID to notify
 * @param {object} orderData - Order data
 */
export const emitOrderUpdate = (userId, orderData) => {
    const io = getIO();

    // Emit to user's room
    io.to(`user:${userId}`).emit('order:updated', {
        orderId: orderData.id,
        status: orderData.status,
        message: `Order ${orderData.status}`,
        orderDetails: orderData,
        timestamp: new Date(),
    });

    // Emit to admin room
    io.to('admin').emit('order:new-update', {
        orderId: orderData.id,
        userId: userId,
        status: orderData.status,
        timestamp: new Date(),
    });

    console.log(`📦 Order update sent to user:${userId} - Status: ${orderData.status}`);
};

/**
 * Emit delivery boy location update
 * @param {string} orderId - Order ID
 * @param {object} locationData - Location data (lat, lng, deliveryBoyId)
 */
export const emitDeliveryLocation = (orderId, locationData) => {
    const io = getIO();

    io.to(`order:${orderId}`).emit('delivery:location-update', {
        orderId,
        deliveryBoyId: locationData.deliveryBoyId,
        location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
        },
        timestamp: new Date(),
    });

    console.log(`🚴 Delivery location updated for order:${orderId}`);
};

/**
 * Emit delivery boy status change
 * @param {string} deliveryBoyId - Delivery boy ID
 * @param {object} statusData - Status data (available, busy, offline)
 */
export const emitDeliveryBoyStatus = (deliveryBoyId, statusData) => {
    const io = getIO();

    io.to('admin').emit('delivery-boy:status-changed', {
        deliveryBoyId,
        status: statusData.status,
        currentOrder: statusData.currentOrder || null,
        timestamp: new Date(),
    });

    console.log(`🚴 Delivery boy ${deliveryBoyId} status: ${statusData.status}`);
};

/**
 * Emit payment status update
 * @param {string} userId - User ID
 * @param {object} paymentData - Payment data
 */
export const emitPaymentStatus = (userId, paymentData) => {
    const io = getIO();

    io.to(`user:${userId}`).emit('payment:status-update', {
        orderId: paymentData.orderId,
        paymentId: paymentData.paymentId,
        status: paymentData.status,
        message: paymentData.message,
        timestamp: new Date(),
    });

    console.log(`💳 Payment status sent to user:${userId} - Status: ${paymentData.status}`);
};

/**
 * Emit new order notification to admin and kitchen
 * @param {object} orderData - Order data
 */
export const emitNewOrder = (orderData) => {
    const io = getIO();

    // Notify admin
    io.to('admin').emit('order:new', {
        orderId: orderData.id,
        customerName: orderData.customerName,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        timestamp: new Date(),
    });

    // Notify kitchen
    io.to('kitchen').emit('order:new-kitchen', {
        orderId: orderData.id,
        items: orderData.items,
        specialInstructions: orderData.specialInstructions,
        timestamp: new Date(),
    });

    console.log(`🔔 New order notification sent - Order ID: ${orderData.id}`);
};

export default {
    emitShopStatusChange,
    emitOrderUpdate,
    emitDeliveryLocation,
    emitDeliveryBoyStatus,
    emitPaymentStatus,
    emitNewOrder,
};
