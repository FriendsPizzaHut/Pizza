/**
 * JWT Configuration
 * 
 * Handles JWT token signing and verification.
 * Uses JWT_SECRET from environment variables.
 * Default token expiry: 7 days
 */

import jwt from 'jsonwebtoken';

/**
 * Sign a JWT token with payload
 * @param {Object} payload - Data to encode in token (usually { id, email, role })
 * @returns {String} - Signed JWT token
 */
export const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export default {
    signToken,
    verifyToken,
};
