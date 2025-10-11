/**
 * Product Thunks
 * 
 * Async actions for product management with pagination support
 */

import { AppDispatch } from '../store';
import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
    loadMoreProductsStart,
    loadMoreProductsSuccess,
    loadMoreProductsFailure,
    refreshProductsStart,
    refreshProductsSuccess,
    refreshProductsFailure,
    fetchProductByIdStart,
    fetchProductByIdSuccess,
    fetchProductByIdFailure,
    createProductStart,
    createProductSuccess,
    createProductFailure,
    updateProductStart,
    updateProductSuccess,
    updateProductFailure,
    deleteProductStart,
    deleteProductSuccess,
    deleteProductFailure,
} from '../slices/productSlice';
import * as productService from '../../src/services/productService';
import { ProductData } from '../../src/services/productService';

/**
 * Fetch products with pagination (initial load)
 */
export const fetchProductsThunk = (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => async (dispatch: AppDispatch) => {
    dispatch(fetchProductsStart());
    try {
        const response = await productService.fetchProducts(params);
        dispatch(fetchProductsSuccess({
            products: response.products,
            total: response.total,
            page: response.page,
            limit: response.limit,
            hasMore: response.hasMore,
        }));
        return { success: true, data: response };
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch products';
        dispatch(fetchProductsFailure(errorMessage));
        return { success: false, error: errorMessage };
    }
};

/**
 * Load more products (pagination)
 */
export const loadMoreProductsThunk = (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => async (dispatch: AppDispatch) => {
    dispatch(loadMoreProductsStart());
    try {
        const response = await productService.fetchProducts(params);
        dispatch(loadMoreProductsSuccess({
            products: response.products,
            total: response.total,
            page: response.page,
            hasMore: response.hasMore,
        }));
        return { success: true, data: response };
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to load more products';
        dispatch(loadMoreProductsFailure(errorMessage));
        return { success: false, error: errorMessage };
    }
};

/**
 * Refresh products (pull to refresh)
 */
export const refreshProductsThunk = (params?: {
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => async (dispatch: AppDispatch) => {
    dispatch(refreshProductsStart());
    try {
        const response = await productService.fetchProducts({
            ...params,
            page: 1,
        });
        dispatch(refreshProductsSuccess({
            products: response.products,
            total: response.total,
            page: response.page,
            hasMore: response.hasMore,
        }));
        return { success: true, data: response };
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to refresh products';
        dispatch(refreshProductsFailure(errorMessage));
        return { success: false, error: errorMessage };
    }
};

/**
 * Fetch all products with optional filters (Legacy - not paginated)
 */
export const fetchAllProductsThunk = (filters?: {
    category?: string;
    isAvailable?: boolean;
    search?: string;
}) => async (dispatch: AppDispatch) => {
    dispatch(fetchProductsStart());
    try {
        const products = await productService.fetchAllProducts(filters);
        // Convert to paginated format
        dispatch(fetchProductsSuccess({
            products,
            total: products.length,
            page: 1,
            limit: products.length,
            hasMore: false,
        }));
        return { success: true, data: products };
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch products';
        dispatch(fetchProductsFailure(errorMessage));
        return { success: false, error: errorMessage };
    }
};

/**
 * Fetch a single product by ID
 */
export const fetchProductByIdThunk = (productId: string) => async (dispatch: AppDispatch) => {
    dispatch(fetchProductByIdStart());
    try {
        const product = await productService.fetchProductById(productId);
        dispatch(fetchProductByIdSuccess(product));
    } catch (error: any) {
        dispatch(fetchProductByIdFailure(error.message));
    }
};

/**
 * Create a new product
 */
export const createProductThunk = (productData: ProductData) => async (dispatch: AppDispatch) => {
    dispatch(createProductStart());
    try {
        const newProduct = await productService.createProduct(productData);
        dispatch(createProductSuccess(newProduct));
        return { success: true, data: newProduct };
    } catch (error: any) {
        dispatch(createProductFailure(error.message));
        return { success: false, error: error.message };
    }
};

/**
 * Update an existing product
 */
export const updateProductThunk = (
    productId: string,
    updates: Partial<ProductData>
) => async (dispatch: AppDispatch) => {
    dispatch(updateProductStart());
    try {
        const updatedProduct = await productService.updateProduct(productId, updates);
        dispatch(updateProductSuccess(updatedProduct));
        return { success: true, data: updatedProduct };
    } catch (error: any) {
        dispatch(updateProductFailure(error.message));
        return { success: false, error: error.message };
    }
};

/**
 * Delete a product
 */
export const deleteProductThunk = (productId: string) => async (dispatch: AppDispatch) => {
    dispatch(deleteProductStart());
    try {
        await productService.deleteProduct(productId);
        dispatch(deleteProductSuccess(productId));
        return { success: true };
    } catch (error: any) {
        dispatch(deleteProductFailure(error.message));
        return { success: false, error: error.message };
    }
};

/**
 * Toggle product availability
 */
export const toggleProductAvailabilityThunk = (
    productId: string,
    isAvailable: boolean
) => async (dispatch: AppDispatch) => {
    dispatch(updateProductStart());
    try {
        const updatedProduct = await productService.toggleProductAvailability(productId, isAvailable);
        dispatch(updateProductSuccess(updatedProduct));
        return { success: true, data: updatedProduct };
    } catch (error: any) {
        dispatch(updateProductFailure(error.message));
        return { success: false, error: error.message };
    }
};
