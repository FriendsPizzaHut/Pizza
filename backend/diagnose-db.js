/**
 * Diagnose Database State
 * 
 * This script shows the actual state of your database
 * Run: node diagnose-db.js
 */

import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const diagnose = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza_db');
        console.log('✅ Connected to MongoDB\n');

        // Check database name
        console.log('📁 Database:', mongoose.connection.name);
        console.log('📍 Host:', mongoose.connection.host);
        console.log('');

        // Check Orders collection
        console.log('📋 ORDERS COLLECTION:\n');
        const allOrders = await Order.find().select('orderNumber status items user deliveredAt').lean();

        console.log(`   Total orders: ${allOrders.length}\n`);

        if (allOrders.length === 0) {
            console.log('   ⚠️  Orders collection is EMPTY!\n');
        } else {
            allOrders.forEach((order, index) => {
                console.log(`${index + 1}. Order #${order.orderNumber}`);
                console.log(`   ID: ${order._id}`);
                console.log(`   Status: "${order.status}" (type: ${typeof order.status})`);
                console.log(`   Items: ${order.items?.length || 0}`);
                console.log(`   User: ${order.user || 'null'}`);
                console.log(`   Delivered At: ${order.deliveredAt || 'null'}`);

                if (order.items && order.items.length > 0) {
                    console.log(`   Products in order:`);
                    order.items.forEach((item, idx) => {
                        console.log(`     ${idx + 1}. Product ID: ${item.product}`);
                        console.log(`        Quantity: ${item.quantity}`);
                        console.log(`        Subtotal: ${item.subtotal || 'N/A'}`);
                    });
                }
                console.log('');
            });

            // Check status values
            const statuses = {};
            allOrders.forEach(order => {
                const status = order.status || 'null';
                statuses[status] = (statuses[status] || 0) + 1;
            });

            console.log('📊 Status Distribution:');
            Object.entries(statuses).forEach(([status, count]) => {
                console.log(`   "${status}": ${count} orders`);
            });
            console.log('');
        }

        // Check Products collection
        console.log('\n📦 PRODUCTS COLLECTION:\n');
        const allProducts = await Product.find().select('name category salesCount totalRevenue').lean();

        console.log(`   Total products: ${allProducts.length}\n`);

        if (allProducts.length === 0) {
            console.log('   ⚠️  Products collection is EMPTY!\n');
        } else {
            allProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   ID: ${product._id}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Sales: ${product.salesCount}`);
                console.log(`   Revenue: ₹${product.totalRevenue}`);
                console.log('');
            });
        }

        // Check for specific IDs from your paste
        console.log('\n🔍 CHECKING SPECIFIC IDS FROM YOUR DATA:\n');

        const orderId1 = '68f513e76b4dcb342fa22e4c';
        const orderId2 = '68f523572d0d70b4a1be0a39';
        const productId = '68ebbd00fbe5dc7d43f3438b';

        const order1 = await Order.findById(orderId1);
        console.log(`Order 1 (${orderId1}): ${order1 ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        if (order1) {
            console.log(`   Status: "${order1.status}"`);
            console.log(`   Items: ${order1.items.length}`);
        }

        const order2 = await Order.findById(orderId2);
        console.log(`Order 2 (${orderId2}): ${order2 ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        if (order2) {
            console.log(`   Status: "${order2.status}"`);
            console.log(`   Items: ${order2.items.length}`);
        }

        const product = await Product.findById(productId);
        console.log(`Product (${productId}): ${product ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        if (product) {
            console.log(`   Name: ${product.name}`);
            console.log(`   Sales: ${product.salesCount}`);
        }

        console.log('');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Stack:', error.stack);
        await mongoose.disconnect();
        process.exit(1);
    }
};

diagnose();
