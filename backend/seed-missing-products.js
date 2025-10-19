/**
 * Seed Missing Products
 * 
 * This script creates the product that is referenced in your orders
 * Run: node seed-missing-products.js
 */

import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const seedProducts = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza_db');
        console.log('✅ Connected to MongoDB\n');

        // Check if product already exists
        const existingProduct = await Product.findById('68ebbd00fbe5dc7d43f3438b');

        if (existingProduct) {
            console.log('✅ Product already exists:', existingProduct.name);
            await mongoose.disconnect();
            process.exit(0);
        }

        // Create the missing product with the exact ID from your order
        const product = new Product({
            _id: '68ebbd00fbe5dc7d43f3438b',
            name: 'Pizza 1',
            description: 'Delicious pizza with your choice of toppings',
            category: 'pizza',
            pricing: {
                small: 9.99,
                medium: 14.99,
                large: 19.99
            },
            imageUrl: 'https://res.cloudinary.com/dm38ptmzl/image/upload/v1760279808/pizza-app/products/mlepg7wleroq36dwwjti.png',
            isVegetarian: false,
            toppings: [
                { name: 'Onions', category: 'vegetables' },
                { name: 'Pepperoni', category: 'meat' },
                { name: 'Feta', category: 'cheese' },
                { name: 'Alfredo', category: 'sauce' }
            ],
            isAvailable: true,
            salesCount: 0,
            totalRevenue: 0,
            rating: 4.0
        });

        await product.save();

        console.log('✅ Product created successfully!');
        console.log('   ID:', product._id);
        console.log('   Name:', product.name);
        console.log('   Category:', product.category);
        console.log('   Base Price:', product.basePrice);
        console.log('\n📊 Now you can run: node test-analytics.js 68f513e76b4dcb342fa22e4c');
        console.log('   This will update the product stats based on the delivered order.\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedProducts();
