/**
 * Product Model
 * 
 * Stores menu items (pizzas, drinks, sides, etc.).
 * Includes pricing, categorization, and availability status.
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            trim: true,
            default: 'Pizza',
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for faster queries
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
