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
    const { name, email, phone, password, role, address } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        const error = new Error('User with this email or phone already exists');
        error.statusCode = 400;
        throw error;
    }

    // Create new user (password will be auto-hashed by pre-save hook)
    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: role || 'customer',
        address: address || [],
    });

    // Generate tokens
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
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Check if user is active
    if (!user.isActive) {
        const error = new Error('Account is inactive. Please contact support.');
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
 * Logout user (placeholder for token blacklist logic)
 * @param {String} userId - User ID
 * @returns {Object} - Success message
 */
export const logoutUser = async (userId) => {
    // In a real application, you might want to:
    // 1. Add the token to a blacklist in Redis
    // 2. Clear any active sessions
    // 3. Log the logout event

    return {
        message: 'Logged out successfully',
    };
};

export default {
    registerUser,
    loginUser,
    logoutUser,
};
