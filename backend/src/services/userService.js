/**
 * User Service
 * 
 * Business logic for user management operations.
 * Handles CRUD operations for users.
 */

import User from '../models/User.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

/**
 * Get all users with pagination
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Object} - Users and pagination info
 */
export const getAllUsers = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get user by ID
 * @param {String} userId - User ID
 * @returns {Object} - User data
 */
export const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return user;
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user
 */
export const updateUser = async (userId, updateData) => {
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.role;

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select('-password');

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return user;
};

/**
 * Delete user and associated data
 * @param {String} userId - User ID
 * @returns {Object} - Deletion summary
 */
export const deleteUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    // Delete associated data
    const ordersDeleted = await Order.deleteMany({ user: userId });
    const paymentsDeleted = await Payment.deleteMany({ user: userId });
    const notificationsDeleted = await Notification.deleteMany({ user: userId });

    // Delete user
    await user.deleteOne();

    return {
        message: 'User and associated data deleted successfully',
        deletedCounts: {
            orders: ordersDeleted.deletedCount,
            payments: paymentsDeleted.deletedCount,
            notifications: notificationsDeleted.deletedCount,
        },
    };
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
