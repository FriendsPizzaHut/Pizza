/**
 * Auth Service
 * 
 * Business logic for authentication operations.
 * Handles user registration, login, and logout.
 * Separates database operations from controller logic.
 */

import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - Created user and tokens
 */
export const registerUser = async (userData) => {
    const { name, email, phone, password, role, address, vehicleInfo, documents } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        const error = new Error('User with this email or phone already exists');
        error.statusCode = 400;
        throw error;
    }

    // Prepare user data
    const userDataToCreate = {
        name,
        email,
        phone,
        password,
        role: role || 'customer',
        address: address || [],
        // Delivery boys need admin approval, so set isActive to false
        isActive: role === 'delivery' ? false : true,
    };

    // Add delivery-specific fields if role is delivery
    if (role === 'delivery') {
        if (vehicleInfo) {
            userDataToCreate.vehicleInfo = vehicleInfo;
        }
        if (documents) {
            userDataToCreate.documents = documents;
        }
    }

    // Create new user (password will be auto-hashed by pre-save hook)
    const user = await User.create(userDataToCreate);

    // For delivery boys, don't generate tokens (they need admin approval first)
    if (role === 'delivery') {
        return {
            user: user.getPublicProfile(),
            message: 'Registration successful! Your account is pending admin approval.',
            requiresApproval: true,
        };
    }

    // For customers and admins, generate tokens for auto-login
    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user._id,
    });

    return {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
    };
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} - User and tokens
 */
export const loginUser = async (email, password) => {
    // Find user by email and explicitly select password field (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Check if user is active - ONLY for delivery boys
    if (user.role === 'delivery' && !user.isActive) {
        const error = new Error('Your delivery partner account is pending admin approval. Please wait for verification.');
        error.statusCode = 403;
        throw error;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user._id,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
        user: user.getPublicProfile(),
        accessToken,
        refreshToken,
    };
};

/**
 * Logout user
 * @param {String} userId - User ID
 * @returns {Object} - Success message
 */
export const logoutUser = async (userId) => {
    try {
        // Update user's last activity or online status if needed
        const user = await User.findById(userId);

        if (user) {
            // For delivery boys, set them offline
            if (user.role === 'delivery' && user.status) {
                user.status.isOnline = false;
                user.status.state = 'offline';
                user.status.lastOnline = new Date();
                await user.save();
            }

            // In a production app, you might want to:
            // 1. Add the token to a blacklist in Redis
            // 2. Clear any active sessions
            // 3. Log the logout event for audit

            console.log(`User ${user.email} logged out successfully`);
        }

        return {
            message: 'Logged out successfully',
            success: true,
        };
    } catch (error) {
        console.error('Logout error:', error);
        // Don't throw error - logout should always succeed on client side
        return {
            message: 'Logged out successfully',
            success: true,
        };
    }
};

export default {
    registerUser,
    loginUser,
    logoutUser,
};
