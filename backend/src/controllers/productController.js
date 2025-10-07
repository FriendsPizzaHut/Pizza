/**
 * Product Controller
 * 
 * Handles menu item operations:
 * - List all products
 * - Get single product
 * - Create new product (admin)
 * - Update product (admin)
 * - Delete product (admin)
 * 
 * Controllers orchestrate request/response only - business logic in services
 */

import * as productService from '../services/productService.js';
import { sendResponse } from '../utils/response.js';

/**
 * Get all products with filters
 * GET /api/v1/products
 * @access Public
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts(req.query);
        sendResponse(res, 200, 'Products retrieved successfully', products);
    } catch (error) {
        next(error);
    }
};

/**
 * Get single product by ID
 * GET /api/v1/products/:id
 * @access Public
 */
export const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        sendResponse(res, 200, 'Product retrieved successfully', product);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new product
 * POST /api/v1/products
 * @access Private/Admin
 */
export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);
        sendResponse(res, 201, 'Product created successfully', product);
    } catch (error) {
        next(error);
    }
};

/**
 * Update product
 * PATCH /api/v1/products/:id
 * @access Private/Admin
 */
export const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        sendResponse(res, 200, 'Product updated successfully', product);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete product
 * DELETE /api/v1/products/:id
 * @access Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);
        sendResponse(res, 200, 'Product deleted successfully');
    } catch (error) {
        next(error);
    }
};

export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
