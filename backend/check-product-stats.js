/**
 * Check Product Stats
 * 
 * This script shows current product statistics and recent delivered orders.
 * Run: node check-product-stats.js
 */

import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const checkStats = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza_db');
        console.log('✅ Connected to MongoDB\n');

        // Get all products with their stats
        console.log('📦 PRODUCT STATISTICS:\n');
        const products = await Product.find().select('name category salesCount totalRevenue rating').sort({ salesCount: -1 });

        if (products.length === 0) {
            console.log('No products found in database');
        } else {
            products.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} (${product.category})`);
                console.log(`   Sales Count: ${product.salesCount}`);
                console.log(`   Total Revenue: ₹${product.totalRevenue}`);
                console.log(`   Rating: ${product.rating} ⭐`);
                console.log('');
            });
        }

        // Get recent delivered orders
        console.log('\n📋 RECENT DELIVERED ORDERS:\n');
        const deliveredOrders = await Order.find({ status: 'delivered' })
            .populate('items.product', 'name')
            .populate('user', 'name')
            .sort({ deliveredAt: -1 })
            .limit(10);

        if (deliveredOrders.length === 0) {
            console.log('❌ No delivered orders found!');
            console.log('   This is why analytics are not updating.');
            console.log('   Orders must have status="delivered" for analytics to run.\n');
        } else {
            deliveredOrders.forEach((order, index) => {
                console.log(`${index + 1}. Order #${order.orderNumber}`);
                console.log(`   ID: ${order._id}`);
                console.log(`   Customer: ${order.user?.name || 'Unknown'}`);
                console.log(`   Status: ${order.status}`);
                console.log(`   Delivered: ${order.deliveredAt ? order.deliveredAt.toLocaleString() : 'Not set'}`);
                console.log(`   Items: ${order.items.length}`);
                order.items.forEach((item, idx) => {
                    console.log(`     ${idx + 1}. ${item.product?.name || item.name} x${item.quantity} @ ₹${item.price}`);
                });
                console.log(`   Total: ₹${order.totalAmount}`);
                console.log('');
            });
        }

        // Check for orders in other statuses
        const otherOrders = await Order.find({ status: { $ne: 'delivered' } })
            .select('orderNumber status createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        if (otherOrders.length > 0) {
            console.log('\n📦 RECENT NON-DELIVERED ORDERS:\n');
            otherOrders.forEach((order, index) => {
                console.log(`${index + 1}. Order #${order.orderNumber} - Status: ${order.status} (${order.createdAt.toLocaleString()})`);
            });
            console.log('\n💡 TIP: Mark these orders as "delivered" to trigger analytics update.');
            console.log('   You can test with: node test-analytics.js <orderId>\n');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

checkStats();
