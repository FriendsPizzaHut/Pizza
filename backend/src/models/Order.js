/**
 * Order Model
 * 
 * Handles order details with references to users and products.
 * Tracks order status, delivery, and payment information.
 * Enhanced for cart-to-order flow with item customization.
 */

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    // Product snapshot at time of order (immutable)
    productSnapshot: {
        name: { type: String, required: true },
        imageUrl: { type: String },
        basePrice: { type: Number, required: true },
        category: { type: String, required: true },
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    // For pizzas - size selection
    size: {
        type: String,
        enum: ['small', 'medium', 'large'],
    },
    selectedPrice: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    // Custom toppings for pizzas
    customToppings: [
        {
            name: String,
            category: String,
            price: { type: Number, default: 0 },
        },
    ],
    specialInstructions: {
        type: String,
        maxlength: 200,
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
    },
}, {
    _id: false,
});

const orderSchema = new mongoose.Schema(
    {
        // Order identification
        orderNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
            index: true,
        },

        items: {
            type: [orderItemSchema],
            validate: {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: 'Order must have at least one item',
            },
        },

        // Order financials
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative'],
        },
        tax: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Tax cannot be negative'],
        },
        deliveryFee: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Delivery fee cannot be negative'],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative'],
        },

        // Applied coupon
        appliedCoupon: {
            code: String,
            discountAmount: Number,
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'awaiting_payment', 'delivered', 'cancelled', 'refunded'],
            default: 'pending',
            index: true,
        },

        // Status history
        statusHistory: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                note: String,
            },
        ],

        deliveryAgent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },

        paymentMethod: {
            type: String,
            enum: ['card', 'cash', 'wallet', 'upi'],
            default: 'cash',
        },

        deliveryAddress: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
            instructions: String,
        },

        contactPhone: {
            type: String,
            required: true,
        },

        orderInstructions: {
            type: String,
            maxlength: 500,
        },

        estimatedDeliveryTime: {
            type: Number, // in minutes
            default: 30,
        },

        deliveredAt: {
            type: Date,
        },

        rating: {
            score: {
                type: Number,
                min: 1,
                max: 5,
            },
            review: String,
            reviewedAt: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for analytics and cleanup
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // For sorting recent orders
orderSchema.index({ orderNumber: 1 });

/**
 * Pre-save middleware: Add status to history when status changes
 */
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
        });
    }
    next();
});

/**
 * Static method: Generate unique order number
 */
orderSchema.statics.generateOrderNumber = async function () {
    const prefix = 'ORD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `${prefix}-${timestamp}-${random}`;

    // Ensure uniqueness
    const exists = await this.findOne({ orderNumber });
    if (exists) {
        return this.generateOrderNumber();
    }

    return orderNumber;
};

/**
 * Static method: Create order from cart
 */
orderSchema.statics.createFromCart = async function (cart, userId, additionalData) {
    const {
        deliveryAddress,
        contactPhone,
        paymentMethod,
        orderInstructions,
    } = additionalData;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order items from cart items
    const orderItems = cart.items.map((item) => ({
        product: item.product._id || item.product,
        productSnapshot: item.productSnapshot,
        quantity: item.quantity,
        size: item.size,
        selectedPrice: item.selectedPrice,
        customToppings: item.customToppings || [],
        specialInstructions: item.specialInstructions || '',
        subtotal: item.subtotal,
    }));

    // Create order
    const order = await this.create({
        orderNumber,
        user: userId,
        items: orderItems,
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee,
        discount: cart.discount,
        totalAmount: cart.total,
        appliedCoupon: cart.appliedCoupon
            ? {
                code: cart.appliedCoupon.code || 'DISCOUNT',
                discountAmount: cart.discount,
            }
            : undefined,
        deliveryAddress,
        contactPhone,
        paymentMethod: paymentMethod || 'cash',
        orderInstructions,
        estimatedDeliveryTime: 30,
    });

    return order;
};

/**
 * Virtual: Total items count
 */
orderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
