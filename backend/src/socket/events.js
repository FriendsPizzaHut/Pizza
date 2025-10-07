/**
 * Socket.IO Event Handlers (Prompt 9)
 * 
 * Centralized event emission functions for:
 * - Business status updates
 * - Order lifecycle events
 * - Delivery agent tracking
 * - Payment notifications
 * - General notifications
 * 
 * These functions are called from controllers/services
 */

/**
 * Emit business status change to all clients
 * Event: business:status:update
 * 
 * @param {Object} businessData - Business information
 * @param {Boolean} businessData.isOpen - Open/closed status
 * @param {String} businessData.businessName - Business name
 * 
 * Usage in controller:
 * emitBusinessStatusUpdate({ isOpen: true, businessName: 'Friends Pizza Hut' })
 */
export const emitBusinessStatusUpdate = (businessData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            isOpen: businessData.isOpen,
            businessName: businessData.businessName,
            message: businessData.isOpen
                ? '🟢 We are now accepting orders!'
                : '🔴 We are currently closed',
            timestamp: new Date()
        };

        // Broadcast to ALL connected clients
        global.socketEmit.emitToAll('business:status:update', payload);

        console.log(`📢 Business status broadcasted: ${businessData.isOpen ? 'OPEN' : 'CLOSED'}`);
    } catch (error) {
        console.error('❌ Error emitting business status:', error.message);
    }
};

/**
 * Emit new order notification to admin and assigned delivery agent
 * Event: order:new
 * 
 * @param {Object} orderData - Order information
 * 
 * Usage in controller:
 * emitNewOrder(orderData)
 */
export const emitNewOrder = (orderData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            orderId: orderData._id || orderData.id,
            orderNumber: orderData.orderNumber,
            customerId: orderData.user?._id || orderData.user,
            customerName: orderData.user?.name || 'Customer',
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            status: orderData.status,
            message: '🔔 New order received!',
        };

        // Emit to admin role
        global.socketEmit.emitToRole('admin', 'order:new', payload);

        // If delivery agent assigned, notify them
        if (orderData.deliveryBoy) {
            global.socketEmit.emitToUser(orderData.deliveryBoy, 'order:assigned', payload);
        }

        console.log(`📦 New order notification sent - Order: ${payload.orderNumber}`);
    } catch (error) {
        console.error('❌ Error emitting new order:', error.message);
    }
};

/**
 * Emit order status update to customer, admin, and delivery agent
 * Event: order:status:update
 * 
 * @param {Object} orderData - Updated order data
 * 
 * Status flow: pending → confirmed → preparing → out_for_delivery → delivered
 */
export const emitOrderStatusUpdate = (orderData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const statusMessages = {
            pending: '⏳ Order is pending confirmation',
            confirmed: '✅ Order confirmed! Preparing your food...',
            preparing: '👨‍🍳 Your order is being prepared',
            out_for_delivery: '🚴 Order is out for delivery',
            delivered: '🎉 Order delivered successfully!',
            cancelled: '❌ Order has been cancelled'
        };

        const payload = {
            orderId: orderData._id || orderData.id,
            orderNumber: orderData.orderNumber,
            status: orderData.status,
            previousStatus: orderData.previousStatus,
            message: statusMessages[orderData.status] || 'Order status updated',
            estimatedDeliveryTime: orderData.estimatedDeliveryTime,
            deliveryBoy: orderData.deliveryBoy,
        };

        // Emit to customer
        const customerId = orderData.user?._id || orderData.user;
        global.socketEmit.emitToUser(customerId, 'order:status:update', payload);

        // Emit to order-specific room (for tracking page)
        global.socketEmit.emitToOrder(payload.orderId, 'order:status:update', payload);

        // Emit to admin
        global.socketEmit.emitToRole('admin', 'order:status:changed', payload);

        // If delivery agent assigned, notify them
        if (orderData.deliveryBoy) {
            global.socketEmit.emitToUser(orderData.deliveryBoy, 'order:status:update', payload);
        }

        console.log(`📦 Order status update sent - Order: ${payload.orderNumber} → ${payload.status}`);
    } catch (error) {
        console.error('❌ Error emitting order status update:', error.message);
    }
};

/**
 * Emit delivery agent status change to admin
 * Event: delivery:status:update
 * 
 * @param {Object} deliveryData - Delivery agent data
 * 
 * Status: available | busy | offline
 */
export const emitDeliveryStatusUpdate = (deliveryData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const statusEmojis = {
            available: '🟢',
            busy: '🟡',
            offline: '🔴'
        };

        const payload = {
            deliveryBoyId: deliveryData._id || deliveryData.id,
            deliveryBoyName: deliveryData.name,
            status: deliveryData.deliveryStatus,
            currentOrder: deliveryData.currentOrder || null,
            location: deliveryData.currentLocation,
            message: `${statusEmojis[deliveryData.deliveryStatus]} ${deliveryData.name} is now ${deliveryData.deliveryStatus}`,
        };

        // Emit to admin role
        global.socketEmit.emitToRole('admin', 'delivery:status:update', payload);

        // If they're now available and there are pending orders, could trigger auto-assignment
        if (deliveryData.deliveryStatus === 'available') {
            console.log(`🚴 Delivery agent ${deliveryData.name} is now available`);
        }

        console.log(`🚴 Delivery status update sent - ${payload.deliveryBoyName}: ${payload.status}`);
    } catch (error) {
        console.error('❌ Error emitting delivery status:', error.message);
    }
};

/**
 * Emit real-time location update from delivery agent
 * Event: delivery:location:update
 * 
 * @param {Object} locationData - Location information
 */
export const emitDeliveryLocationUpdate = (locationData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            orderId: locationData.orderId,
            deliveryBoyId: locationData.deliveryBoyId,
            deliveryBoyName: locationData.deliveryBoyName,
            location: {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
            },
            speed: locationData.speed,
            heading: locationData.heading,
            accuracy: locationData.accuracy,
        };

        // Emit to order room (customer tracking)
        global.socketEmit.emitToOrder(locationData.orderId, 'delivery:location:update', payload);

        // Also emit to admin
        global.socketEmit.emitToRole('admin', 'delivery:location:update', payload);

        console.log(`📍 Location update sent for order ${locationData.orderId}`);
    } catch (error) {
        console.error('❌ Error emitting location update:', error.message);
    }
};

/**
 * Emit payment received notification
 * Event: payment:received
 * 
 * @param {Object} paymentData - Payment information
 */
export const emitPaymentReceived = (paymentData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            orderId: paymentData.order?._id || paymentData.order,
            paymentId: paymentData._id || paymentData.id,
            transactionId: paymentData.transactionId,
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            status: paymentData.status,
            message: paymentData.status === 'completed'
                ? '💰 Payment received successfully!'
                : '⚠️ Payment status updated',
        };

        // Emit to admin
        global.socketEmit.emitToRole('admin', 'payment:received', payload);

        // Emit to customer
        if (paymentData.user) {
            global.socketEmit.emitToUser(paymentData.user, 'payment:status:update', payload);
        }

        console.log(`💳 Payment notification sent - Order: ${payload.orderId}`);
    } catch (error) {
        console.error('❌ Error emitting payment notification:', error.message);
    }
};

/**
 * Emit new notification to specific user
 * Event: notification:new
 * 
 * @param {Object} notificationData - Notification data
 */
export const emitNewNotification = (notificationData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            notificationId: notificationData._id || notificationData.id,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            relatedEntity: notificationData.relatedEntity,
            priority: notificationData.priority || 'normal',
        };

        // Emit to specific user
        global.socketEmit.emitToUser(notificationData.user, 'notification:new', payload);

        console.log(`🔔 Notification sent to user ${notificationData.user}`);
    } catch (error) {
        console.error('❌ Error emitting notification:', error.message);
    }
};

/**
 * Emit order cancelled notification
 * Event: order:cancelled
 * 
 * @param {Object} orderData - Cancelled order data
 */
export const emitOrderCancelled = (orderData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            orderId: orderData._id || orderData.id,
            orderNumber: orderData.orderNumber,
            reason: orderData.cancellationReason,
            message: '❌ Order has been cancelled',
        };

        // Emit to customer
        const customerId = orderData.user?._id || orderData.user;
        global.socketEmit.emitToUser(customerId, 'order:cancelled', payload);

        // Emit to admin
        global.socketEmit.emitToRole('admin', 'order:cancelled', payload);

        // If delivery agent was assigned, notify them
        if (orderData.deliveryBoy) {
            global.socketEmit.emitToUser(orderData.deliveryBoy, 'order:cancelled', payload);
        }

        console.log(`❌ Order cancellation sent - Order: ${payload.orderNumber}`);
    } catch (error) {
        console.error('❌ Error emitting order cancellation:', error.message);
    }
};

/**
 * Emit coupon/offer update to all customers
 * Event: offer:new
 * 
 * @param {Object} offerData - Offer/coupon data
 */
export const emitNewOffer = (offerData) => {
    try {
        if (!global.socketEmit) {
            console.log('⚠️  Socket not initialized');
            return;
        }

        const payload = {
            couponId: offerData._id || offerData.id,
            code: offerData.code,
            description: offerData.description,
            discountType: offerData.discountType,
            discountValue: offerData.discountValue,
            validUntil: offerData.validUntil,
            message: '🎉 New offer available!',
        };

        // Broadcast to all customers
        global.socketEmit.emitToRole('customer', 'offer:new', payload);

        console.log(`🎉 New offer broadcasted - Code: ${payload.code}`);
    } catch (error) {
        console.error('❌ Error emitting new offer:', error.message);
    }
};

// Export all event emitters
export default {
    emitBusinessStatusUpdate,
    emitNewOrder,
    emitOrderStatusUpdate,
    emitDeliveryStatusUpdate,
    emitDeliveryLocationUpdate,
    emitPaymentReceived,
    emitNewNotification,
    emitOrderCancelled,
    emitNewOffer,
};
