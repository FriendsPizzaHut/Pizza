/**
 * Rebuild Indexes Script
 * 
 * This script drops all existing indexes and rebuilds them
 * to fix duplicate index warnings.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Payment from './src/models/Payment.js';
import Offer from './src/models/Offer.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza_db';

async function rebuildIndexes() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Rebuild Payment indexes
        console.log('📋 Rebuilding Payment indexes...');
        await Payment.collection.dropIndexes();
        console.log('  ✅ Dropped all Payment indexes');
        await Payment.syncIndexes();
        console.log('  ✅ Rebuilt Payment indexes\n');

        // Rebuild Offer indexes
        console.log('📋 Rebuilding Offer indexes...');
        await Offer.collection.dropIndexes();
        console.log('  ✅ Dropped all Offer indexes');
        await Offer.syncIndexes();
        console.log('  ✅ Rebuilt Offer indexes\n');

        // Show final indexes
        console.log('📊 Current Payment indexes:');
        const paymentIndexes = await Payment.collection.getIndexes();
        Object.keys(paymentIndexes).forEach(key => {
            console.log(`  - ${key}: ${JSON.stringify(paymentIndexes[key])}`);
        });

        console.log('\n📊 Current Offer indexes:');
        const offerIndexes = await Offer.collection.getIndexes();
        Object.keys(offerIndexes).forEach(key => {
            console.log(`  - ${key}: ${JSON.stringify(offerIndexes[key])}`);
        });

        console.log('\n✅ All indexes rebuilt successfully!');
        console.log('👉 Restart your server to see the changes.');

    } catch (error) {
        console.error('❌ Error rebuilding indexes:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

rebuildIndexes();
