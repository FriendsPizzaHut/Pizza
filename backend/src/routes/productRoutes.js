/**
 * Product Routes
 * 
 * Menu item management endpoints:
 * - GET /api/products - List all products
 * - GET /api/products/:id - Get product by ID
 * - POST /api/products - Add new product (admin)
 * - PATCH /api/products/:id - Update product (admin)
 * - DELETE /api/products/:id - Delete product (admin)
 */

import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createProductValidator, updateProductValidator } from '../utils/validators/productValidator.js';

const router = express.Router();

// Get all products (public)
router.get('/', getAllProducts);

// Get single product (public)
router.get('/:id', getProductById);

// Create new product (admin only, with validation)
router.post('/', protect, adminOnly, validate(createProductValidator), createProduct);

// Update product (admin only, with validation)
router.patch('/:id', protect, adminOnly, validate(updateProductValidator), updateProduct);

// Delete product (admin only)
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
