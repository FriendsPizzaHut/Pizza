// Quick script to get user IDs from your database

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB\n');

// Get all users with their IDs and roles
const users = await User.find({}, 'name email role phone').lean();

console.log('📋 Available Users:\n');
console.log('='.repeat(80));

users.forEach(user => {
    console.log(`
👤 Name:  ${user.name || 'N/A'}
📧 Email: ${user.email}
🎭 Role:  ${user.role || 'customer'}
📱 Phone: ${user.phone || 'N/A'}
🆔 ID:    ${user._id}
${'-'.repeat(80)}`);
});

console.log('\n✅ Total users found:', users.length);
console.log('\n💡 Copy one of these IDs to use in the socket test client!');

process.exit(0);
