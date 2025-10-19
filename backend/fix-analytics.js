/**
 * Fix Analytics - Retroactive Update
 * 
 * This script:
 * 1. Creates missing products referenced in orders
 * 2. Retroactively updates analytics for all delivered orders
 * 
 * Run: node fix-analytics.js
 */

import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import { updateAnalyticsOnOrderDelivery } from './src/services/analyticsService.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAnalytics = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza_db');
        console.log('✅ Connected to MongoDB\n');

        // Step 1: Find all unique product IDs from orders
        console.log('📦 Step 1: Finding missing products...\n');

        const orders = await Order.find();
        const productIds = new Set();

        orders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.product?._id?.toString() || item.product?.toString();
                if (productId) {
                    productIds.add(productId);
                }
            });
        });

        console.log(`   Found ${productIds.size} unique product IDs in orders`);

        // Step 2: Check which products are missing
        const missingProducts = [];
        for (const productId of productIds) {
            const exists = await Product.findById(productId);
            if (!exists) {
                missingProducts.push(productId);
            }
        }

        console.log(`   Missing products: ${missingProducts.length}\n`);

        // Step 3: Create missing products
        if (missingProducts.length > 0) {
            console.log('🔨 Step 2: Creating missing products...\n');

            for (const productId of missingProducts) {
                // Find an order with this product to get details
                const orderWithProduct = await Order.findOne({
                    'items.product': productId
                });

                if (orderWithProduct) {
                    const item = orderWithProduct.items.find(
                        i => (i.product?._id?.toString() || i.product?.toString()) === productId
                    );

                    if (item && item.productSnapshot) {
                        const productData = {
                            _id: productId,
                            name: item.productSnapshot.name || 'Unknown Product',
                            description: `Product from order ${orderWithProduct.orderNumber}`,
                            category: item.productSnapshot.category || 'pizza',
                            imageUrl: item.productSnapshot.imageUrl || 'https://via.placeholder.com/300',
                            isVegetarian: false,
                            isAvailable: true,
                            salesCount: 0,
                            totalRevenue: 0,
                            rating: 4.0
                        };

                        // Set pricing based on category
                        if (productData.category === 'pizza') {
                            productData.pricing = {
                                small: item.productSnapshot.basePrice || 9.99,
                                medium: (item.productSnapshot.basePrice || 9.99) * 1.5,
                                large: (item.productSnapshot.basePrice || 9.99) * 2
                            };
                            productData.toppings = [];
                        } else {
                            productData.pricing = item.productSnapshot.basePrice || 9.99;
                        }

                        const product = new Product(productData);
                        await product.save();

                        console.log(`   ✅ Created: ${product.name} (ID: ${productId})`);
                    }
                }
            }
            console.log('');
        }

        // Step 4: Find all delivered orders
        console.log('📊 Step 3: Processing delivered orders...\n');

        const deliveredOrders = await Order.find({ status: 'delivered' })
            .sort({ deliveredAt: 1 });

        console.log(`   Found ${deliveredOrders.length} delivered orders\n`);

        if (deliveredOrders.length === 0) {
            console.log('⚠️  No delivered orders found. Orders must have status="delivered".\n');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Step 5: Process each delivered order
        console.log('🔄 Step 4: Updating analytics for each order...\n');

        for (const order of deliveredOrders) {
            console.log(`📝 Processing Order #${order.orderNumber} (${order._id})`);

            try {
                await updateAnalyticsOnOrderDelivery(order._id.toString());
            } catch (error) {
                console.error(`   ❌ Failed to update analytics: ${error.message}`);
            }

            console.log('');
        }

        // Step 6: Show updated product stats
        console.log('\n📊 Step 5: Final Product Statistics:\n');

        const products = await Product.find()
            .select('name category salesCount totalRevenue rating')
            .sort({ salesCount: -1 });

        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (${product.category})`);
            console.log(`   Sales Count: ${product.salesCount}`);
            console.log(`   Total Revenue: ₹${product.totalRevenue.toFixed(2)}`);
            console.log(`   Rating: ${product.rating} ⭐\n`);
        });

        console.log('✅ Analytics fix completed!\n');

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

fixAnalytics();
