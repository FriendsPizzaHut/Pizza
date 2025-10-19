/**
 * Product Model
 * 
 * Stores menu items (pizzas, sides, beverages, desserts).
 * Supports multi-size pricing for pizzas and single pricing for other items.
 * Includes auto-generation of preparation time, discount, and rating calculation.
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            enum: {
                values: ['pizza', 'sides', 'beverages', 'desserts'],
                message: 'Category must be one of: pizza, sides, beverages, desserts',
            },
        },
        // Mixed type to support both multi-size (object) and single price (number)
        pricing: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Pricing information is required'],
            validate: {
                validator: function (value) {
                    // For pizza category: pricing must be an object with size keys
                    if (this.category === 'pizza') {
                        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                            return false;
                        }
                        // Must have at least one size
                        const validSizes = ['small', 'medium', 'large'];
                        const pricingSizes = Object.keys(value);
                        if (pricingSizes.length === 0) {
                            return false;
                        }
                        // All keys must be valid sizes, all values must be positive numbers
                        return pricingSizes.every(
                            (size) => validSizes.includes(size) && typeof value[size] === 'number' && value[size] > 0
                        );
                    } else {
                        // For other categories: pricing must be a positive number
                        return typeof value === 'number' && value > 0;
                    }
                },
                message: function (props) {
                    if (this.category === 'pizza') {
                        return 'Pizza pricing must be an object with size keys (small, medium, large) and positive number values';
                    }
                    return 'Pricing must be a positive number for non-pizza items';
                },
            },
        },
        // Base price for sorting and filtering (auto-generated from pricing)
        basePrice: {
            type: Number,
            // Not required - will be auto-generated in pre-save hook
        },
        imageUrl: {
            type: String,
            required: [true, 'Product image is required'],
            // Removed URL validation to allow file:// URIs for development
            // In production, implement proper cloud storage (Cloudinary/S3)
        },
        isVegetarian: {
            type: Boolean,
            default: false,
        },
        // Toppings only for pizza category
        toppings: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                category: {
                    type: String,
                    enum: ['vegetables', 'meat', 'cheese', 'sauce'],
                    required: true,
                },
            },
        ],
        // Auto-generated based on category (in minutes)
        preparationTime: {
            type: Number,
            // Not required - will be auto-generated in pre-save hook
            min: [5, 'Preparation time must be at least 5 minutes'],
        },
        // Auto-generated random discount between 10-25%
        discountPercent: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
        },
        // Rating based on sales performance (updated via method)
        rating: {
            type: Number,
            default: 4.0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot exceed 5'],
        },
        // Track total sales count for rating calculation
        salesCount: {
            type: Number,
            default: 0,
            min: [0, 'Sales count cannot be negative'],
        },
        // Track total revenue for analytics
        totalRevenue: {
            type: Number,
            default: 0,
            min: [0, 'Revenue cannot be negative'],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook: Auto-generate preparationTime based on category
productSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('category')) {
        const prepTimes = {
            pizza: 20,
            sides: 10,
            beverages: 2,
            desserts: 5,
        };
        this.preparationTime = prepTimes[this.category] || 15;
    }
    next();
});

// Pre-save hook: Auto-generate discountPercent (10-25%) for new products
productSchema.pre('save', function (next) {
    if (this.isNew && this.discountPercent === 0) {
        this.discountPercent = Math.floor(Math.random() * 16) + 10; // Random between 10-25
    }
    next();
});

// Pre-save hook: Calculate basePrice from pricing
productSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('pricing')) {
        if (this.category === 'pizza' && typeof this.pricing === 'object') {
            // For pizza, use the smallest available size price as base
            const prices = Object.values(this.pricing);
            this.basePrice = Math.min(...prices);
        } else if (typeof this.pricing === 'number') {
            // For other items, use the single price
            this.basePrice = this.pricing;
        }
    }
    next();
});

// Pre-save hook: Clear toppings for non-pizza items
productSchema.pre('save', function (next) {
    if (this.category !== 'pizza') {
        this.toppings = [];
    }
    next();
});

// Instance method: Get discounted price for a specific size (or base price)
productSchema.methods.getDiscountedPrice = function (size = null) {
    let price;

    if (this.category === 'pizza' && size && typeof this.pricing === 'object') {
        price = this.pricing[size] || this.basePrice;
    } else {
        price = this.basePrice;
    }

    const discount = (price * this.discountPercent) / 100;
    return Math.round(price - discount);
};

// Instance method: Update rating based on sales performance
productSchema.methods.updateRating = function () {
    // Simple rating algorithm based on sales count
    // More sales = higher rating (up to 5.0)
    if (this.salesCount === 0) {
        this.rating = 4.0; // Default for new products
    } else if (this.salesCount < 10) {
        this.rating = 4.0;
    } else if (this.salesCount < 50) {
        this.rating = 4.2;
    } else if (this.salesCount < 100) {
        this.rating = 4.5;
    } else if (this.salesCount < 200) {
        this.rating = 4.7;
    } else {
        this.rating = 5.0;
    }
    return this.rating;
};

// Instance method: Increment sales count and revenue
productSchema.methods.incrementSales = async function (amount) {
    this.salesCount += 1;
    this.totalRevenue += amount;
    this.updateRating();
    await this.save();
};

// Indexes for efficient queries
productSchema.index({ category: 1, isAvailable: 1 }); // Category filtering with availability
productSchema.index({ basePrice: 1 }); // Price-based sorting
productSchema.index({ rating: -1 }); // Rating-based sorting
productSchema.index({ salesCount: -1 }); // Popularity-based sorting
productSchema.index({ createdAt: -1 }); // New items sorting
productSchema.index({ category: 1, rating: -1, salesCount: -1 }); // Compound index for recommendations
productSchema.index({ isAvailable: 1, salesCount: -1 }); // Available + popular items

const Product = mongoose.model('Product', productSchema);

export default Product;
