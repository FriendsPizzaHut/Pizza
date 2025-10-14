/**
 * Order Service
 * 
 * Business logic for order management.
 * Handles order creation, status updates, and retrieval.
 */

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { invalidateDashboardCache } from './dashboardService.js';
import { processOrderUpdates } from './postOrderService.js';

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {Object} - Created order
 */
export const createOrder = async (orderData) => {
    const { items } = orderData;

    // Validate all products exist and are available
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            const error = new Error(`Product ${item.product} not found`);
            error.statusCode = 404;
            throw error;
        }

        if (!product.isAvailable) {
            const error = new Error(`Product ${product.name} is currently unavailable`);
            error.statusCode = 400;
            throw error;
        }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderData.totalAmount = totalAmount;

    // Create order
    const order = await Order.create(orderData);
    await order.populate('items.product', 'name price category');

    // Invalidate dashboard cache (new order affects stats)
    await invalidateDashboardCache();

    // Process post-order updates asynchronously (don't await - fire and forget)
    // This updates product sales/revenue and user preferences without blocking response
    processOrderUpdates(order, orderData.user).catch(err => {
        console.error('Post-order processing failed:', err.message);
    });

    return order;
};

/**
 * Create order from cart
 * @param {String} userId - User ID
 * @param {Object} orderData - Order data (delivery address, payment method, etc.)
 * @returns {Object} - Created order
 */
export const createOrderFromCart = async (userId, orderData) => {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        const error = new Error('Cart is empty');
        error.statusCode = 400;
        throw error;
    }

    // Use the Order model's static method to create from cart
    const order = await Order.createFromCart(cart, userId, orderData);

    // Clear the cart after successful order
    await cart.clearCart();

    // Populate order details
    await order.populate('user', 'name email phone');
    await order.populate('items.product', 'name imageUrl category');

    // Invalidate dashboard cache (new order affects stats)
    await invalidateDashboardCache();

    // Process post-order updates asynchronously (don't await - fire and forget)
    // This updates product sales/revenue and user preferences without blocking response
    processOrderUpdates(order, userId).catch(err => {
        console.error('Post-order processing failed:', err.message);
    });

    return order;
};

/**
 * Get all orders (admin)
 * @param {Object} filters - Optional filters
 * @returns {Array} - List of orders
 */
export const getAllOrders = async (filters = {}) => {
    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price category')
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 });

    return orders;
};

/**
 * Get orders by user
 * @param {String} userId - User ID
 * @returns {Array} - User's orders
 */
export const getOrdersByUser = async (userId) => {
    const orders = await Order.find({ user: userId })
        .populate('items.product', 'name price category imageUrl')
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 });

    return orders;
};

/**
 * Get single order by ID with full details
 * @param {String} orderId - Order ID
 * @returns {Object} - Order with full details
 */
export const getOrderById = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate('user', 'name email phone profileImage')
        .populate({
            path: 'items.product',
            select: 'name price category imageUrl description'
        })
        .populate('deliveryAgent', 'name phone email profileImage');

    return order;
};

/**
 * Accept order (pending → confirmed)
 * @param {String} orderId - Order ID
 * @returns {Object} - Updated order
 */
export const acceptOrder = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate('user', 'name email phone')
        .populate('items.product', 'name imageUrl');

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (order.status !== 'pending') {
        const error = new Error(`Cannot accept order with status: ${order.status}`);
        error.statusCode = 400;
        throw error;
    }

    order.status = 'confirmed';
    order.confirmedAt = new Date();
    await order.save();

    // Invalidate dashboard cache
    await invalidateDashboardCache();

    return order;
};

/**
 * Reject order (set status to cancelled)
 * @param {String} orderId - Order ID
 * @param {String} reason - Rejection reason
 * @returns {Object} - Updated order
 */
export const rejectOrder = async (orderId, reason) => {
    const order = await Order.findById(orderId)
        .populate('user', 'name email phone')
        .populate('items.product', 'name imageUrl');

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
        const error = new Error(`Cannot reject order with status: ${order.status}`);
        error.statusCode = 400;
        throw error;
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Rejected by admin';
    order.cancelledAt = new Date();
    await order.save();

    // Invalidate dashboard cache
    await invalidateDashboardCache();

    return order;
};

/**
 * Get orders for OrdersScreen (optimized for mobile)
 * Returns minimal data for list view with proper formatting
 * @param {String} userId - User ID
 * @param {Object} options - Pagination and filtering options
 * @returns {Object} - Formatted orders with pagination info
 */
export const getMyOrders = async (userId, options = {}) => {
    const { limit = 10, skip = 0, status } = options;

    // Build query
    const query = { user: userId };
    if (status) {
        query.status = status;
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);

    // Fetch orders with minimal data and lean() for performance
    const orders = await Order.find(query)
        .select('orderNumber items status totalAmount subtotal tax deliveryFee discount createdAt deliveryAddress contactPhone estimatedDeliveryTime deliveredAt paymentMethod')
        .populate({
            path: 'items.product',
            select: 'name imageUrl category',
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(); // Returns plain JS objects, 5x faster

    // Format orders for mobile UI
    const formattedOrders = orders.map(order => {
        // Get first item image
        const firstItem = order.items[0];
        const firstItemImage = firstItem?.productSnapshot?.imageUrl || firstItem?.product?.imageUrl || null;

        // Build items array with quantity and size
        const items = order.items.map(item => {
            const name = item.productSnapshot?.name || item.product?.name || 'Unknown Item';
            const size = item.size ? ` (${item.size.charAt(0).toUpperCase() + item.size.slice(1)})` : '';
            const toppings = item.customToppings?.length > 0 ? ` +${item.customToppings.length} toppings` : '';
            return `${item.quantity}x ${name}${size}${toppings}`;
        });

        // Count total items
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

        // Determine status type for UI
        let statusType = 'completed';
        if (['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)) {
            statusType = 'active';
        } else if (order.status === 'cancelled') {
            statusType = 'cancelled';
        }

        // Calculate estimated time for active orders
        let estimatedTime = null;
        if (statusType === 'active') {
            const minutesElapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const remainingMinutes = Math.max(0, order.estimatedDeliveryTime - minutesElapsed);
            estimatedTime = `${remainingMinutes}-${remainingMinutes + 5} min`;
        }

        // Format status for display
        const statusDisplayMap = {
            'pending': 'Order Placed',
            'confirmed': 'Confirmed',
            'preparing': 'Preparing',
            'ready': 'Ready',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'refunded': 'Refunded',
        };

        // Format delivery address
        const deliveryAddressFormatted = order.deliveryAddress
            ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
            : null;

        return {
            id: order.orderNumber,
            _id: order._id.toString(),
            status: statusDisplayMap[order.status] || order.status,
            statusType,
            items,
            itemsCount: totalItems,
            firstItemImage,
            total: order.totalAmount,
            subtotal: order.subtotal,
            tax: order.tax,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            paymentMethod: order.paymentMethod,
            deliveryAddress: deliveryAddressFormatted,
            contactPhone: order.contactPhone,
            date: order.createdAt,
            time: new Date(order.createdAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }),
            estimatedTime,
        };
    });

    return {
        orders: formattedOrders,
        pagination: {
            total: totalOrders,
            limit,
            skip,
            hasMore: skip + orders.length < totalOrders,
        },
    };
};

/**
 * Update order status
 * @param {String} orderId - Order ID
 * @param {Object} updateData - Status and other data
 * @returns {Object} - Updated order
 */
export const updateOrderStatus = async (orderId, updateData) => {
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    // Update status
    order.status = updateData.status;

    // Set delivered timestamp if status is delivered
    if (updateData.status === 'delivered') {
        order.deliveredAt = new Date();
    }

    // Update delivery agent if provided
    if (updateData.deliveryAgent) {
        order.deliveryAgent = updateData.deliveryAgent;
    }

    await order.save();
    await order.populate('items.product user deliveryAgent');

    // Invalidate dashboard cache (order status change affects stats)
    await invalidateDashboardCache();

    return order;
};

/**
 * Assign delivery agent to order
 * @param {String} orderId - Order ID
 * @param {String} deliveryAgentId - Delivery agent user ID
 * @returns {Object} - Updated order with delivery agent
 */
export const assignDeliveryAgent = async (orderId, deliveryAgentId) => {
    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    // Check if order is in valid status for assignment
    if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
        const error = new Error('Order must be confirmed, preparing, or ready to assign delivery agent');
        error.statusCode = 400;
        throw error;
    }

    // Update order with delivery agent
    order.deliveryAgent = deliveryAgentId;
    order.status = 'out_for_delivery';

    if (!order.statusHistory) {
        order.statusHistory = {};
    }
    order.statusHistory.out_for_delivery = new Date();

    await order.save();

    // Populate order details for response
    await order.populate([
        { path: 'user', select: 'name phone email' },
        { path: 'deliveryAgent', select: 'name phone' },
        { path: 'items.product', select: 'name images price' }
    ]);

    // Invalidate dashboard cache
    await invalidateDashboardCache();

    return order;
};

/**
 * Delete order
 * @param {String} orderId - Order ID
 * @returns {Object} - Success message
 */
export const deleteOrder = async (orderId) => {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    return { message: 'Order deleted successfully' };
};

export default {
    createOrder,
    createOrderFromCart,
    getAllOrders,
    getOrdersByUser,
    getMyOrders,
    updateOrderStatus,
    assignDeliveryAgent,
    deleteOrder,
};
