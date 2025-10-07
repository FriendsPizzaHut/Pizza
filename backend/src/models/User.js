/**
 * User Model
 * 
 * Defines the User schema for MongoDB.
 * Handles user data, authentication, and profile information.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
            default: 'customer',
        },
        address: [
            {
                street: String,
                city: String,
                state: String,
                pincode: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for faster queries
// Note: email already has unique:true which creates an index automatically
// userSchema.index({ email: 1 }); // Removed duplicate - email has unique: true
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
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        role: this.role,
        address: this.address,
        isActive: this.isActive,
        createdAt: this.createdAt,
    };
};

const User = mongoose.model('User', userSchema);

export default User;
