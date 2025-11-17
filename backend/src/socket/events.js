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
 * Status flow: pending → accepted → assigned → out_for_delivery → delivered
 */
export const emitOrderStatusUpdate = (orderData) => {
    try {
        if (!global.socketEmit) {
            return;
        }

        const statusMessages = {
            pending: '⏳ Order is pending confirmation',
            accepted: '✅ Order accepted! Assigning delivery agent...',
            assigned: '� Delivery agent assigned to your order',
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
            deliveryAgentDetails: orderData.deliveryAgentDetails, // Include agent details for 'assigned' status
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
            // Silent - delivery agent now available
        }
    } catch (error) {
        console.error('❌ Error emitting delivery status:', error.message);
    }
};

/**
 * Emit delivery agent online/offline status change
 * Event: delivery:agent:status:update
 * 
 * @param {Object} agentData - Delivery agent status data
 * 
 * Usage in controller:
 * emitDeliveryAgentStatusChange({ 
 *   deliveryAgentId, name, isOnline, state, vehicleInfo, rating 
 * })
 */
export const emitDeliveryAgentStatusChange = (agentData) => {
    try {
        if (!global.socketEmit) {
            return;
        }

        const statusEmojis = {
            online: '🟢',
            free: '🟢',
            busy: '🟡',
            offline: '🔴'
        };

        const payload = {
            deliveryAgentId: agentData.deliveryAgentId || agentData._id,
            name: agentData.name,
            email: agentData.email,
            phone: agentData.phone,
            isOnline: agentData.isOnline,
            state: agentData.state, // 'free', 'busy', 'offline'
            lastOnline: agentData.lastOnline,
            vehicleInfo: agentData.vehicleInfo,
            rating: agentData.rating,
            message: `${statusEmojis[agentData.state]} ${agentData.name} is now ${agentData.isOnline ? 'online' : 'offline'}`,
            timestamp: new Date()
        };

        // Broadcast to admin role for instant UI updates
        global.socketEmit.emitToRole('admin', 'delivery:agent:status:update', payload);

        // Also broadcast to all delivery agents (for coordination)
        global.socketEmit.emitToRole('delivery', 'delivery:agent:status:update', payload);
    } catch (error) {
        console.error('❌ Error emitting agent status change:', error.message);
        console.error('❌ Stack:', error.stack);
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
    } catch (error) {
        console.error('❌ Error emitting location update:', error.message);
    }
};

/**
 * Emit delivery agent assignment notification
 * Event: order:assigned
 * 
 * @param {Object} orderData - Order with assigned delivery agent
 */
export const emitDeliveryAssignment = (orderData) => {
    try {
        if (!global.socketEmit) {
            return;
        }

        const payload = {
            orderId: orderData._id || orderData.id,
            orderNumber: orderData.orderNumber,
            deliveryAgent: {
                _id: orderData.deliveryAgent._id,
                name: orderData.deliveryAgent.name,
                phone: orderData.deliveryAgent.phone,
            },
            customer: {
                name: orderData.user?.name || 'Customer',
                phone: orderData.user?.phone,
            },
            deliveryAddress: orderData.deliveryAddress,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            status: orderData.status,
            assignedAt: new Date(),
            message: `🚴 New delivery assigned!`,
        };

        // Notify specific delivery agent
        const deliveryAgentId = orderData.deliveryAgent._id || orderData.deliveryAgent;
        global.socketEmit.emitToUser(deliveryAgentId, 'order:assigned', payload);

        // Notify admin role
        global.socketEmit.emitToRole('admin', 'order:assigned', {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            deliveryAgent: payload.deliveryAgent,
            assignedAt: payload.assignedAt,
            message: `Order ${payload.orderNumber} assigned to ${payload.deliveryAgent.name}`,
        });

        // Notify customer
        const customerId = orderData.user?._id || orderData.user;
        global.socketEmit.emitToUser(customerId, 'order:delivery:assigned', {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            deliveryAgent: {
                name: payload.deliveryAgent.name,
            },
            message: `Your order is now out for delivery`,
        });
    } catch (error) {
        console.error('❌ Error emitting delivery assignment:', error.message);
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
    emitDeliveryAssignment,
    emitPaymentReceived,
    emitNewNotification,
    emitOrderCancelled,
    emitNewOffer,
};
