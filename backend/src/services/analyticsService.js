/**
 * Analytics Service
 * 
 * Handles automatic updates of customer and product analytics
 * when orders are completed (delivered).
 * 
 * Updates:
 * - Customer: totalOrders, totalSpent, averageOrderValue, mostOrderedItems,
 *             favoriteCategories, lastOrderDate, orderFrequency, avgItemsPerOrder
 * - Product: salesCount, totalRevenue, rating
 */

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { Customer } from '../models/User.js';

/**
 * Update customer and product analytics when order is delivered
 * @param {string} orderId - The ID of the delivered order
 */
export const updateAnalyticsOnOrderDelivery = async (orderId) => {
    try {
        // Fetch order with populated data
        const order = await Order.findById(orderId)
            .populate('user')
            .populate('items.product');

        if (!order) {
            console.error(`❌ [ANALYTICS] Order not found: ${orderId}`);
            return;
        }

        if (order.status !== 'delivered') {
            return;
        }

        // Update customer analytics
        await updateCustomerAnalytics(order);

        // Update product analytics
        await updateProductAnalytics(order);
    } catch (error) {
        console.error(`❌ [ANALYTICS] Error updating analytics for order ${orderId}:`, error);
        // Don't throw error - analytics failure shouldn't break order flow
    }
};

/**
 * Update customer ordering behavior statistics
 * @param {Object} order - The delivered order
 */
const updateCustomerAnalytics = async (order) => {
    try {
        const customer = await Customer.findById(order.user._id);

        if (!customer) {
            return;
        }

        // 1. Update basic order statistics
        customer.orderingBehavior.totalOrders += 1;
        customer.orderingBehavior.totalSpent += order.totalAmount;
        customer.orderingBehavior.averageOrderValue =
            customer.orderingBehavior.totalSpent / customer.orderingBehavior.totalOrders;
        customer.orderingBehavior.lastOrderDate = new Date();

        // 2. Calculate total items in this order
        const totalItemsInOrder = order.items.reduce((sum, item) => sum + item.quantity, 0);

        // 3. Update average items per order
        const previousAvg = customer.orderingBehavior.avgItemsPerOrder || 0;
        const previousTotal = customer.orderingBehavior.totalOrders - 1;
        customer.orderingBehavior.avgItemsPerOrder =
            ((previousAvg * previousTotal) + totalItemsInOrder) / customer.orderingBehavior.totalOrders;

        // 4. Update most ordered items
        for (const item of order.items) {
            const productId = item.product._id.toString();
            const productName = item.product.name;
            // Calculate revenue - handle different price field formats
            const itemRevenue = item.subtotal || (item.selectedPrice * item.quantity) || (item.price * item.quantity) || 0;

            const existingItem = customer.orderingBehavior.mostOrderedItems.find(
                (i) => i.productId.toString() === productId
            );

            if (existingItem) {
                existingItem.count += item.quantity;
                existingItem.totalSpent += itemRevenue;
                existingItem.lastOrdered = new Date();
            } else {
                customer.orderingBehavior.mostOrderedItems.push({
                    productId: item.product._id,
                    count: item.quantity,
                    totalSpent: itemRevenue,
                    lastOrdered: new Date(),
                });
            }
        }

        // 5. Sort most ordered items by count (descending)
        customer.orderingBehavior.mostOrderedItems.sort((a, b) => b.count - a.count);

        // 6. Update favorite categories
        const categoriesInOrder = [...new Set(order.items.map(item => item.product.category))];

        for (const category of categoriesInOrder) {
            const existingCategory = customer.orderingBehavior.favoriteCategories.find(
                (c) => c.category === category
            );

            if (existingCategory) {
                existingCategory.count += 1;
            } else {
                customer.orderingBehavior.favoriteCategories.push({
                    category,
                    count: 1,
                });
            }
        }

        // 7. Sort favorite categories by count (descending)
        customer.orderingBehavior.favoriteCategories.sort((a, b) => b.count - a.count);

        // 8. Calculate order frequency based on account age
        const accountAgeDays = Math.ceil(
            (new Date() - customer.createdAt) / (1000 * 60 * 60 * 24)
        );
        const ordersPerMonth = (customer.orderingBehavior.totalOrders / accountAgeDays) * 30;

        if (ordersPerMonth < 2) {
            customer.orderingBehavior.orderFrequency = 'occasional';
        } else if (ordersPerMonth < 8) {
            customer.orderingBehavior.orderFrequency = 'regular';
        } else {
            customer.orderingBehavior.orderFrequency = 'frequent';
        }

        // 9. Determine preferred order time
        const orderHour = new Date(order.createdAt).getHours();
        let timePreference = 'evening'; // default

        if (orderHour >= 6 && orderHour < 12) {
            timePreference = 'morning';
        } else if (orderHour >= 12 && orderHour < 17) {
            timePreference = 'afternoon';
        } else if (orderHour >= 17 && orderHour < 21) {
            timePreference = 'evening';
        } else {
            timePreference = 'night';
        }

        customer.orderingBehavior.preferredOrderTime = timePreference;

        // Save customer updates
        await customer.save();

    } catch (error) {
        console.error(`❌ [ANALYTICS] Error updating customer analytics:`, error);
        throw error;
    }
};

/**
 * Update product sales statistics
 * @param {Object} order - The delivered order
 */
const updateProductAnalytics = async (order) => {
    try {
        // Update each product in the order
        for (const item of order.items) {
            // Get product ID - handle both populated and unpopulated cases
            const productId = item.product?._id || item.product;

            const product = await Product.findById(productId);

            if (!product) {
                continue;
            }

            // Calculate revenue based on item subtotal or price * quantity
            const itemRevenue = item.subtotal || (item.selectedPrice * item.quantity) || (item.price * item.quantity);

            // Update sales count and revenue
            product.salesCount += item.quantity;
            product.totalRevenue += itemRevenue;

            // Update rating based on sales performance (existing method)
            product.updateRating();

            // Save product updates
            await product.save();
        }

    } catch (error) {
        console.error(`❌ [ANALYTICS] Error updating product analytics:`, error);
        console.error(`   Error details:`, error.message);
        console.error(`   Stack:`, error.stack);
        // Don't throw - analytics failure shouldn't break order flow
    }
};
