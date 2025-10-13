/**
 * Backfill Order Analytics Script
 * 
 * Run this script to update product statistics and user preferences
 * for all existing orders that were created before the post-order
 * processing system was implemented.
 * 
 * Usage:
 *   node scripts/backfillOrderAnalytics.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import { batchProcessOrderUpdates } from '../src/services/postOrderService.js';

// Load environment variables
dotenv.config();

const backfillAnalytics = async () => {
    try {
        console.log('🔄 Starting order analytics backfill...\n');

        // Connect to MongoDB
        console.log('📡 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Fetch all orders with populated products
        console.log('📦 Fetching orders...');
        const orders = await Order.find()
            .populate('items.product')
            .populate('user')
            .sort({ createdAt: 1 }); // Process oldest first

        console.log(`✅ Found ${orders.length} orders to process\n`);

        if (orders.length === 0) {
            console.log('ℹ️  No orders to process');
            process.exit(0);
        }

        // Show date range
        const oldestOrder = orders[0];
        const newestOrder = orders[orders.length - 1];
        console.log(`📅 Date range:`);
        console.log(`   From: ${oldestOrder.createdAt.toLocaleDateString()}`);
        console.log(`   To:   ${newestOrder.createdAt.toLocaleDateString()}\n`);

        // Confirm before proceeding
        console.log('⚠️  This will update:');
        console.log('   - Product sales count and revenue');
        console.log('   - Product ratings');
        console.log('   - User most ordered items');
        console.log('   - User favorite categories\n');

        // Process in batches
        const startTime = Date.now();
        await batchProcessOrderUpdates(orders);
        const endTime = Date.now();

        // Summary
        console.log('\n✅ Backfill completed successfully!');
        console.log(`⏱️  Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
        console.log(`📊 Orders processed: ${orders.length}`);
        console.log(`⚡ Average: ${((endTime - startTime) / orders.length).toFixed(0)}ms per order\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Backfill failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// Run the script
backfillAnalytics();
