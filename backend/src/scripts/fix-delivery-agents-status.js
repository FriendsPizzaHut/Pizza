/**
 * Migration Script: Fix Delivery Agents Approval Status
 * 
 * This script updates existing delivery agents in the database to ensure
 * that isActive is set correctly based on isApproved status.
 * 
 * Run this once to fix existing data.
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixDeliveryAgentsStatus = async () => {
    try {
        console.log('🔧 Starting migration: Fix Delivery Agents Status');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check if MONGODB_URI is loaded
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables. Please check your .env file.');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Find all delivery agents
        const deliveryAgents = await User.find({ role: 'delivery' });
        console.log(`📊 Found ${deliveryAgents.length} delivery agents\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const agent of deliveryAgents) {
            console.log(`\n👤 Processing: ${agent.name} (${agent.email})`);
            console.log(`   Current Status:`);
            console.log(`   - isApproved: ${agent.isApproved}`);
            console.log(`   - isRejected: ${agent.isRejected}`);
            console.log(`   - isActive: ${agent.isActive}`);

            // Determine what the status should be
            let shouldBeActive = false;
            let needsUpdate = false;

            if (agent.isApproved && !agent.isRejected) {
                // Approved agents should be active
                shouldBeActive = true;
                if (!agent.isActive) {
                    needsUpdate = true;
                }
            } else if (agent.isRejected) {
                // Rejected agents should be inactive
                shouldBeActive = false;
                if (agent.isActive) {
                    needsUpdate = true;
                }
            } else {
                // Pending agents should be inactive
                shouldBeActive = false;
                if (agent.isActive) {
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                agent.isActive = shouldBeActive;
                await agent.save();
                updatedCount++;
                console.log(`   ✅ UPDATED: isActive set to ${shouldBeActive}`);
            } else {
                skippedCount++;
                console.log(`   ⏭️  SKIPPED: Already correct`);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Migration Complete!');
        console.log(`   - Total agents: ${deliveryAgents.length}`);
        console.log(`   - Updated: ${updatedCount}`);
        console.log(`   - Skipped: ${skippedCount}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Close connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
};

// Run migration
fixDeliveryAgentsStatus();
