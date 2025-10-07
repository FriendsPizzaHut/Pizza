/**
 * User Routes
 * 
 * User management endpoints:
 * - GET /api/users - Get all users (admin)
 * - GET /api/users/:id - Get single user
 * - PATCH /api/users/:id - Update user profile
 * - DELETE /api/users/:id - Delete user (with cleanup)
 */

import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { updateProfileValidator } from '../utils/validators/authValidator.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, adminOnly, getAllUsers);

// Get single user by ID (authenticated users only)
router.get('/:id', protect, getUserById);

// Update user profile (authenticated, with validation)
router.patch('/:id', protect, validate(updateProfileValidator), updateUser);

// Delete user (admin only)
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;