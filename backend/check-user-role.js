import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUserRole = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const userId = '68eeb54ff6ca9edaf7b9c4b4';
        const user = await User.findById(userId);

        if (user) {
            console.log('\n📋 User Details:');
            console.log('  - ID:', user._id);
            console.log('  - Name:', user.name);
            console.log('  - Email:', user.email);
            console.log('  - Role:', user.role);
            console.log('  - isActive:', user.isActive);
            if (user.role === 'delivery') {
                console.log('  - isApproved:', user.isApproved);
                console.log('  - isRejected:', user.isRejected);
                console.log('  - Status:', user.status);
            }
        } else {
            console.log('❌ User not found');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkUserRole();
