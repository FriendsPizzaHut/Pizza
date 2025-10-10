/**
 * Auth Controller
 * 
 * Handles user authentication operations:
 * - Registration (customer, delivery, admin)
 * - Login with JWT generation
 * - Logout
 * 
 * Controllers orchestrate request/response only - business logic in services
 */

import * as authService from '../services/authService.js';
import { sendResponse } from '../utils/response.js';

/**
 * Register new user
 * POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        sendResponse(res, 201, 'User registered successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        sendResponse(res, 200, 'Login successful', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 * @access Private
 */
export const logout = async (req, res, next) => {
    try {
        // Get userId from authenticated request (set by auth middleware)
        const userId = req.user?.id || req.user?.userId;

        // Call logout service (updates online status for delivery boys)
        const result = await authService.logoutUser(userId);

        sendResponse(res, 200, 'Logout successful', result);
    } catch (error) {
        next(error);
    }
};

export default { register, login, logout };
