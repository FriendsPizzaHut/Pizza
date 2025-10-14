/**
 * User Model
 * 
 * Defines the User schema for MongoDB with role-specific fields.
 * Uses discriminators for Customer, DeliveryBoy, and Admin specific data.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Base User Schema (common fields for all roles)
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
        },
        role: {
            type: String,
            enum: ['customer', 'admin', 'delivery'],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String, // URL to profile image
            default: null,
        },
        // Address field (kept for backward compatibility and all roles can have address)
        address: [
            {
                label: {
                    type: String,
                    default: 'Home',
                },
                street: String,
                city: String,
                state: String,
                pincode: String,
                landmark: String,
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        discriminatorKey: 'role', // Use 'role' field to determine the discriminator
    }
);

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        if (!this.password || !candidatePassword) {
            return false;
        }
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error.message);
        return false;
    }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
    const baseProfile = {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        role: this.role,
        profileImage: this.profileImage,
        isActive: this.isActive,
        createdAt: this.createdAt,
    };

    // Add role-specific fields
    if (this.role === 'customer') {
        baseProfile.address = this.address;
        baseProfile.mostOrderedItems = this.mostOrderedItems;
    } else if (this.role === 'delivery') {
        baseProfile.status = this.status;
        baseProfile.vehicleInfo = this.vehicleInfo;
        baseProfile.documents = this.documents;
        baseProfile.totalDeliveries = this.totalDeliveries;
        baseProfile.rating = this.rating;
        baseProfile.availability = this.availability;
    } else if (this.role === 'admin') {
        baseProfile.username = this.username;
        baseProfile.adminRole = this.adminRole;
        baseProfile.permissions = this.permissions;
    }

    return baseProfile;
};

// Create base User model
const User = mongoose.model('User', userSchema);

// ==========================================
// 👤 CUSTOMER DISCRIMINATOR
// ==========================================
const customerSchema = new mongoose.Schema({
    // Address is already in base schema, no need to duplicate
    mostOrderedItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],
    // Customer preferences
    preferences: {
        favoriteCategories: [String],
        dietaryRestrictions: [String], // e.g., "vegetarian", "vegan", "gluten-free"
    },
});

const Customer = User.discriminator('customer', customerSchema);

// ==========================================
// 🚴 DELIVERY BOY DISCRIMINATOR
// ==========================================
const deliveryBoySchema = new mongoose.Schema({
    isApproved: {
        type: Boolean,
        default: false,
    },
    isRejected: {
        type: Boolean,
        default: false,
    },
    rejectionReason: {
        type: String,
        default: null,
    },
    status: {
        isOnline: {
            type: Boolean,
            default: false,
        },
        state: {
            type: String,
            enum: ['free', 'busy', 'offline'],
            default: 'offline',
        },
        lastOnline: Date,
    },
    currentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
    },
    // All orders assigned to this delivery boy (history)
    assignedOrders: [
        {
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order',
            },
            assignedAt: {
                type: Date,
                default: Date.now,
            },
            completedAt: Date,
            status: {
                type: String,
                enum: ['assigned', 'picked', 'delivered', 'cancelled'],
                default: 'assigned',
            },
        },
    ],
    totalDeliveries: {
        type: Number,
        default: 0,
    },
    // Vehicle information
    vehicleInfo: {
        type: {
            type: String,
            enum: ['bike', 'scooter', 'bicycle', 'car'],
            required: false,
        },
        number: {
            type: String,
            required: false, // Optional - can be added later
            uppercase: true,
        },
        model: String,
    },
    // Documents for verification (image uploads)
    documents: {
        drivingLicense: {
            imageUrl: String, // Image URL/path
            verified: {
                type: Boolean,
                default: false,
            },
            verifiedAt: Date,
        },
        aadharCard: {
            imageUrl: String, // Image URL/path
            verified: {
                type: Boolean,
                default: false,
            },
            verifiedAt: Date,
        },
        vehicleRC: {
            imageUrl: String, // Image URL/path (optional)
            verified: {
                type: Boolean,
                default: false,
            },
            verifiedAt: Date,
        },
    },
    // Performance metrics
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    earnings: {
        total: {
            type: Number,
            default: 0,
        },
        pending: {
            type: Number,
            default: 0,
        },
        paid: {
            type: Number,
            default: 0,
        },
    },
    // Availability
    availability: {
        workingHours: {
            start: String, // e.g., "09:00"
            end: String,   // e.g., "21:00"
        },
        workingDays: [String], // e.g., ["Monday", "Tuesday", ...]
    },
});

const DeliveryBoy = User.discriminator('delivery', deliveryBoySchema);

// ==========================================
// 🧑‍💼 ADMIN DISCRIMINATOR
// ==========================================
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Allow null/undefined for non-admin users
        trim: true,
    },
    adminRole: {
        type: String,
        enum: ['owner', 'staff', 'manager'],
        default: 'staff',
    },
    permissions: [
        {
            type: String,
            enum: [
                'manage_users',
                'manage_products',
                'manage_orders',
                'manage_deliveries',
                'view_reports',
                'manage_coupons',
                'manage_settings',
            ],
        },
    ],
    // Admin activity tracking
    lastLogin: Date,
    loginHistory: [
        {
            timestamp: Date,
            ipAddress: String,
            userAgent: String,
        },
    ],
});

const Admin = User.discriminator('admin', adminSchema);

// Export all models
export default User;
export { Customer, DeliveryBoy, Admin };
