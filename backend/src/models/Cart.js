/**
 * Cart Model
 * 
 * Stores user's shopping cart with items and quantities.
 * Each user has one active cart that persists across sessions.
 * Cart items reference products and include customization options.
 */

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required'],
    },
    // Store product snapshot for price consistency (in case product price changes)
    productSnapshot: {
        name: { type: String, required: true },
        imageUrl: { type: String },
        basePrice: { type: Number, required: true },
        category: { type: String, required: true },
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        max: [50, 'Quantity cannot exceed 50'],
        default: 1,
    },
    // For pizzas - size selection
    size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        // Required only for pizza category (validated in pre-save hook)
    },
    // Selected price based on size or single price
    selectedPrice: {
        type: Number,
        required: [true, 'Selected price is required'],
        min: [0, 'Price cannot be negative'],
    },
    // For pizzas - additional toppings (optional)
    customToppings: [
        {
            name: { type: String, required: true },
            category: {
                type: String,
                enum: ['vegetables', 'meat', 'cheese', 'sauce'],
                required: true,
            },
            price: {
                type: Number,
                default: 0,
                min: [0, 'Topping price cannot be negative'],
            },
        },
    ],
    // Special instructions for this item
    specialInstructions: {
        type: String,
        maxlength: [200, 'Special instructions cannot exceed 200 characters'],
        trim: true,
    },
    // Item subtotal (quantity * selectedPrice + toppings)
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
    },
}, {
    _id: true,
    timestamps: true,
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            unique: true, // Each user can have only one cart
            index: true,
        },
        items: [cartItemSchema],
        // Cart totals
        totalItems: {
            type: Number,
            default: 0,
            min: [0, 'Total items cannot be negative'],
        },
        subtotal: {
            type: Number,
            default: 0,
            min: [0, 'Subtotal cannot be negative'],
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'Tax cannot be negative'],
        },
        deliveryFee: {
            type: Number,
            default: 0,
            min: [0, 'Delivery fee cannot be negative'],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
        },
        total: {
            type: Number,
            default: 0,
            min: [0, 'Total cannot be negative'],
        },
        // Applied coupon
        appliedCoupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
        },
        // Cart expiration (auto-clear after 7 days of inactivity)
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            index: { expires: 0 }, // TTL index for auto-deletion
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
cartSchema.index({ user: 1 });
cartSchema.index({ updatedAt: 1 });

/**
 * Pre-save middleware: Calculate cart totals and validate items
 */
cartSchema.pre('save', async function (next) {
    try {
        // Calculate totals
        this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

        // Calculate subtotal from all items
        this.subtotal = this.items.reduce((sum, item) => {
            // Item subtotal = (selectedPrice * quantity) + toppings
            const toppingsTotal = item.customToppings.reduce(
                (toppingSum, topping) => toppingSum + (topping.price || 0),
                0
            );
            const itemTotal = (item.selectedPrice * item.quantity) + toppingsTotal;
            item.subtotal = itemTotal;
            return sum + itemTotal;
        }, 0);

        // Calculate tax (8% of subtotal)
        const TAX_RATE = 0.08;
        this.tax = parseFloat((this.subtotal * TAX_RATE).toFixed(2));

        // Calculate delivery fee (free above ₹2490, otherwise ₹40)
        const FREE_DELIVERY_THRESHOLD = 2490;
        const DELIVERY_FEE = 40;
        this.deliveryFee = this.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

        // Calculate total
        this.total = this.subtotal + this.tax + this.deliveryFee - this.discount;

        // Ensure total is non-negative
        if (this.total < 0) this.total = 0;

        // Update expiration
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Validate that pizza items have size selected
 */
cartItemSchema.pre('validate', function (next) {
    if (this.productSnapshot.category === 'pizza' && !this.size) {
        return next(new Error('Size is required for pizza items'));
    }
    next();
});

/**
 * Instance method: Add item to cart or update quantity if exists
 */
cartSchema.methods.addItem = async function (itemData) {
    const { product, productSnapshot, quantity, size, selectedPrice, customToppings, specialInstructions } = itemData;

    // Check if identical item already exists
    const existingItemIndex = this.items.findIndex(
        (item) =>
            item.product.toString() === product.toString() &&
            item.size === size &&
            JSON.stringify(item.customToppings) === JSON.stringify(customToppings || [])
    );

    if (existingItemIndex !== -1) {
        // Update quantity of existing item
        this.items[existingItemIndex].quantity += quantity || 1;
        // Ensure quantity doesn't exceed max
        if (this.items[existingItemIndex].quantity > 50) {
            this.items[existingItemIndex].quantity = 50;
        }
    } else {
        // Add new item
        this.items.push({
            product,
            productSnapshot,
            quantity: quantity || 1,
            size,
            selectedPrice,
            customToppings: customToppings || [],
            specialInstructions: specialInstructions || '',
            subtotal: 0, // Will be calculated in pre-save hook
        });
    }

    await this.save();
    return this;
};

/**
 * Instance method: Update item quantity
 */
cartSchema.methods.updateItemQuantity = async function (itemId, quantity) {
    const item = this.items.id(itemId);
    if (!item) {
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.items.pull(itemId);
    } else {
        // Update quantity (max 50)
        item.quantity = Math.min(quantity, 50);
    }

    await this.save();
    return this;
};

/**
 * Instance method: Remove item from cart
 */
cartSchema.methods.removeItem = async function (itemId) {
    this.items.pull(itemId);
    await this.save();
    return this;
};

/**
 * Instance method: Clear all items from cart
 */
cartSchema.methods.clearCart = async function () {
    this.items = [];
    this.appliedCoupon = undefined;
    this.discount = 0;
    await this.save();
    return this;
};

/**
 * Instance method: Apply coupon
 */
cartSchema.methods.applyCoupon = async function (couponId, discountAmount) {
    this.appliedCoupon = couponId;
    this.discount = discountAmount;
    await this.save();
    return this;
};

/**
 * Static method: Get or create cart for user
 */
cartSchema.statics.getOrCreateCart = async function (userId) {
    let cart = await this.findOne({ user: userId }).populate('items.product');

    if (!cart) {
        cart = await this.create({ user: userId, items: [] });
    }

    return cart;
};

/**
 * Virtual: Item count (alias for totalItems)
 */
cartSchema.virtual('itemCount').get(function () {
    return this.totalItems;
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
