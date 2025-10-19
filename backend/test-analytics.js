/**
 * Test Analytics Manually
 * 
 * This script tests the analytics update for a specific order.
 * Run: node test-analytics.js <orderId>
 */

import mongoose from 'mongoose';
import { updateAnalyticsOnOrderDelivery } from './src/services/analyticsService.js';
import dotenv from 'dotenv';

dotenv.config();

const testAnalytics = async (orderId) => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza_db');
        console.log('✅ Connected to MongoDB');

        console.log(`\n📊 Testing analytics for order: ${orderId}\n`);

        await updateAnalyticsOnOrderDelivery(orderId);

        console.log('\n✅ Analytics test completed');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

// Get order ID from command line
const orderId = process.argv[2];

if (!orderId) {
    console.error('❌ Please provide an order ID');
    console.log('Usage: node test-analytics.js <orderId>');
    process.exit(1);
}

testAnalytics(orderId);
