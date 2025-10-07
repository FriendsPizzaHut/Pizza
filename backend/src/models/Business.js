/**
 * Business (Restaurant) Model
 * 
 * Stores business-level information for the restaurant.
 * Includes contact details, operational status, and bank details for payments.
 */

import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Business name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
        },
        isOpen: {
            type: Boolean,
            default: false,
        },
        bankDetails: {
            accountHolder: {
                type: String,
                trim: true,
            },
            accountNumber: {
                type: String,
                trim: true,
            },
            ifsc: {
                type: String,
                uppercase: true,
                trim: true,
            },
            bankName: {
                type: String,
                trim: true,
            },
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for quick dashboard queries
businessSchema.index({ name: 1 });
businessSchema.index({ isOpen: 1 });

const Business = mongoose.model('Business', businessSchema);

export default Business;
