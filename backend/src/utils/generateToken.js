/**
 * Token Generation Utility
 * 
 * Helper function to generate JWT tokens for authenticated users.
 * Uses jwtConfig to sign tokens with user data.
 */

import { signToken } from '../config/jwtConfig.js';

/**
 * Generate JWT token for a user
 * @param {Object} user - User object from database
 * @returns {String} - Signed JWT token
 */
export const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };

    return signToken(payload);
};

export default generateToken;
