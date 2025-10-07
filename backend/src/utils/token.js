/**
 * JWT Token Utility
 * 
 * Handles JWT token generation and verification.
 * Used for authentication and authorization.
 */

import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 7d)
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn,
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Generate access token (short-lived)
 * @param {object} payload - User data
 * @returns {string} Access token
 */
export const generateAccessToken = (payload) => {
    return generateToken(payload, '15m'); // 15 minutes
};

/**
 * Generate refresh token (long-lived)
 * @param {object} payload - User data
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
    return generateToken(payload, '7d'); // 7 days
};

export default {
    generateToken,
    verifyToken,
    generateAccessToken,
    generateRefreshToken,
};
