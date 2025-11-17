/**
 * Auth Service
 * 
 * Business logic for authentication operations.
 * Handles user registration, login, and logout.
 * Separates database operations from controller logic.
 */

import User from '../models/User.js';
import DeviceToken from '../models/DeviceToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - Created user and tokens
 */
export const registerUser = async (userData) => {
    const { name, email, phone, password, role, address, vehicleInfo, documents, profileImage } = userData;

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
        // Set profile image if provided, otherwise it will be null (default in schema)
        profileImage: profileImage || null,
    };

    // Add delivery-specific fields if role is delivery
    if (role === 'delivery') {
        // Set approval status (defaults are in schema, but being explicit here)
        userDataToCreate.isApproved = false;
        userDataToCreate.isRejected = false;
        userDataToCreate.rejectionReason = null;

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

    // Verify password first (before checking approval status)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Check approval status for delivery agents
    if (user.role === 'delivery') {
        // Check if rejected
        if (user.isRejected) {
            const error = new Error(
                user.rejectionReason
                    ? `Your delivery partner application has been rejected. Reason: ${user.rejectionReason}`
                    : 'Your delivery partner application has been rejected. Please contact admin for more details.'
            );
            error.statusCode = 403;
            error.code = 'ACCOUNT_REJECTED';
            throw error;
        }

        // Check if not yet approved (pending state)
        if (!user.isApproved) {
            const error = new Error('Your delivery partner account is pending admin approval. Please wait for verification.');
            error.statusCode = 403;
            error.code = 'APPROVAL_PENDING';
            throw error;
        }

        // If approved, check if account is active
        if (!user.isActive) {
            const error = new Error('Your account has been deactivated. Please contact admin.');
            error.statusCode = 403;
            error.code = 'ACCOUNT_INACTIVE';
            throw error;
        }
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
        let tokenResult = null;

        if (user) {
            // For delivery boys, set them offline
            if (user.role === 'delivery' && user.status) {
                user.status.isOnline = false;
                user.status.state = 'offline';
                user.status.lastOnline = new Date();
                await user.save();
            }

            // ✅ NEW: Deactivate all device tokens for this user to stop notifications
            tokenResult = await DeviceToken.updateMany(
                { userId: userId, isActive: true },
                {
                    isActive: false,
                    lastUsed: new Date()
                }
            );

            // In a production app, you might want to:
            // 1. Add the token to a blacklist in Redis
            // 2. Clear any active sessions
            // 3. Log the logout event for audit
        }

        return {
            message: 'Logged out successfully',
            success: true,
            tokensDeactivated: tokenResult?.modifiedCount || 0,
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

/**
 * Refresh access token using refresh token
 * @param {String} refreshToken - Refresh token
 * @returns {Object} - New access token
 */
export const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const { verifyToken } = await import('../utils/token.js');
        const decoded = verifyToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user is active (for delivery boys)
        if (user.role === 'delivery' && !user.isActive) {
            const error = new Error('Account is not active');
            error.statusCode = 403;
            throw error;
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        return {
            accessToken: newAccessToken,
            expiresIn: 604800, // 7 days in seconds (7 * 24 * 60 * 60)
        };
    } catch (error) {
        // If token verification fails, throw proper error
        if (error.message === 'Invalid or expired token') {
            const err = new Error('Invalid or expired refresh token');
            err.statusCode = 401;
            throw err;
        }
        throw error;
    }
};

export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
};
