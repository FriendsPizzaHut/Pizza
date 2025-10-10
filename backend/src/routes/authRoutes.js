/**
 * Auth Routes
 * 
 * Authentication endpoints:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login
 * - POST /api/auth/logout - Logout
 */

import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { registerValidator, loginValidator } from '../utils/validators/authValidator.js';
import { protect, softProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register new user (customer, delivery, admin) - with validation
router.post('/register', validate(registerValidator), register);

// Login - with validation
router.post('/login', validate(loginValidator), login);

// Logout - accepts expired tokens (users should always be able to logout)
router.post('/logout', softProtect, logout);

export default router;
