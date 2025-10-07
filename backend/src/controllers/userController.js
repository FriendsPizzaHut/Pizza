/**
 * User Controller
 * 
 * Handles user-related operations:
 * - Get all users (admin)
 * - Get single user
 * - Update user profile
 * - Delete user (with data cleanup)
 * 
 * Controllers orchestrate request/response only - business logic in services
 * Emits real-time Socket.IO events for delivery agent status changes
 */

import * as userService from '../services/userService.js';
import { sendResponse } from '../utils/response.js';
import { emitDeliveryStatusUpdate } from '../socket/events.js';

/**
 * Get all users with pagination and filters
 * GET /api/v1/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const result = await userService.getAllUsers(req.query);
        sendResponse(res, 200, 'Users retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get single user by ID
 * GET /api/v1/users/:id
 * @access Private
 */
export const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        sendResponse(res, 200, 'User retrieved successfully', user);
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PATCH /api/v1/users/:id
 * @access Private
 */
export const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);

        // Emit real-time update if delivery agent status changed
        if (user.role === 'delivery' && req.body.deliveryStatus) {
            emitDeliveryStatusUpdate({
                _id: user._id,
                name: user.name,
                deliveryStatus: user.deliveryStatus,
                currentOrder: user.currentOrder,
                currentLocation: user.currentLocation,
            });
        }

        sendResponse(res, 200, 'User updated successfully', user);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (with data cleanup)
 * DELETE /api/v1/users/:id
 * @access Private/Admin
 */
export const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        sendResponse(res, 200, 'User and related data deleted successfully');
    } catch (error) {
        next(error);
    }
};

export default { getAllUsers, getUserById, updateUser, deleteUser };
