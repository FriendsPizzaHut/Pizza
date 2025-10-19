/**
 * Product Redux Slice
 * 
 * Manages product state with pagination, loading states, and errors
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../src/services/productService';

interface ProductState {
    // List view with pagination
    products: Product[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;

    // Filters and search
    selectedCategory: string;
    searchQuery: string;

    // Selected product for detail view
    selectedProduct: Product | null;

    // Available categories
    categories: string[];

    // Loading states
    isLoading: boolean;
    isLoadingMore: boolean;
    isRefreshing: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Error and success
    error: string | null;
    successMessage: string | null;
}

const initialState: ProductState = {
    products: [],
    total: 0,
    page: 1,
    limit: 10,
    hasMore: true,
    selectedCategory: 'all',
    searchQuery: '',
    selectedProduct: null,
    categories: ['pizza', 'sides', 'beverages', 'desserts'],
    isLoading: false,
    isLoadingMore: false,
    isRefreshing: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    successMessage: null,
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        // Fetch Products (Initial load)
        fetchProductsStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchProductsSuccess: (state, action: PayloadAction<{
            products: Product[];
            total: number;
            page: number;
            limit: number;
            hasMore: boolean;
        }>) => {
            state.isLoading = false;
            state.products = action.payload.products;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.limit = action.payload.limit;
            state.hasMore = action.payload.hasMore;
            state.error = null;
        },
        fetchProductsFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Load More Products (Pagination)
        loadMoreProductsStart: (state) => {
            state.isLoadingMore = true;
            state.error = null;
        },
        loadMoreProductsSuccess: (state, action: PayloadAction<{
            products: Product[];
            total: number;
            page: number;
            hasMore: boolean;
        }>) => {
            state.isLoadingMore = false;
            state.products = [...state.products, ...action.payload.products];
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.hasMore = action.payload.hasMore;
            state.error = null;
        },
        loadMoreProductsFailure: (state, action: PayloadAction<string>) => {
            state.isLoadingMore = false;
            state.error = action.payload;
        },

        // Refresh Products (Pull to refresh)
        refreshProductsStart: (state) => {
            state.isRefreshing = true;
            state.error = null;
        },
        refreshProductsSuccess: (state, action: PayloadAction<{
            products: Product[];
            total: number;
            page: number;
            hasMore: boolean;
        }>) => {
            state.isRefreshing = false;
            state.products = action.payload.products;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.hasMore = action.payload.hasMore;
            state.error = null;
        },
        refreshProductsFailure: (state, action: PayloadAction<string>) => {
            state.isRefreshing = false;
            state.error = action.payload;
        },

        // Update Filters
        setCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
            state.page = 1;
            state.products = [];
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.page = 1;
            state.products = [];
        },
        clearFilters: (state) => {
            state.selectedCategory = 'all';
            state.searchQuery = '';
            state.page = 1;
            state.products = [];
        },

        // Fetch Single Product
        fetchProductByIdStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchProductByIdSuccess: (state, action: PayloadAction<Product>) => {
            state.isLoading = false;
            state.selectedProduct = action.payload;
            state.error = null;

            // Add product to products array if not already present
            const existingIndex = state.products.findIndex(p => p._id === action.payload._id);
            if (existingIndex >= 0) {
                // Update existing product
                state.products[existingIndex] = action.payload;
            } else {
                // Add new product to array
                state.products.push(action.payload);
            }
        },
        fetchProductByIdFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Create Product
        createProductStart: (state) => {
            state.isCreating = true;
            state.error = null;
            state.successMessage = null;
        },
        createProductSuccess: (state, action: PayloadAction<Product>) => {
            state.isCreating = false;
            state.products.push(action.payload);
            state.successMessage = 'Product created successfully!';
            state.error = null;
        },
        createProductFailure: (state, action: PayloadAction<string>) => {
            state.isCreating = false;
            state.error = action.payload;
            state.successMessage = null;
        },

        // Update Product
        updateProductStart: (state) => {
            state.isUpdating = true;
            state.error = null;
            state.successMessage = null;
        },
        updateProductSuccess: (state, action: PayloadAction<Product>) => {
            state.isUpdating = false;
            const index = state.products.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
            if (state.selectedProduct?._id === action.payload._id) {
                state.selectedProduct = action.payload;
            }
            state.successMessage = 'Product updated successfully!';
            state.error = null;
        },
        updateProductFailure: (state, action: PayloadAction<string>) => {
            state.isUpdating = false;
            state.error = action.payload;
            state.successMessage = null;
        },

        // Delete Product
        deleteProductStart: (state) => {
            state.isDeleting = true;
            state.error = null;
            state.successMessage = null;
        },
        deleteProductSuccess: (state, action: PayloadAction<string>) => {
            state.isDeleting = false;
            state.products = state.products.filter(p => p._id !== action.payload);
            if (state.selectedProduct?._id === action.payload) {
                state.selectedProduct = null;
            }
            state.successMessage = 'Product deleted successfully!';
            state.error = null;
        },
        deleteProductFailure: (state, action: PayloadAction<string>) => {
            state.isDeleting = false;
            state.error = action.payload;
            state.successMessage = null;
        },

        // Clear messages
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },

        // Clear selected product
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },

        // Reset state
        resetProductState: () => initialState,
    },
});

export const {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
    loadMoreProductsStart,
    loadMoreProductsSuccess,
    loadMoreProductsFailure,
    refreshProductsStart,
    refreshProductsSuccess,
    refreshProductsFailure,
    setCategory,
    setSearchQuery,
    clearFilters,
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
    clearMessages,
    clearSelectedProduct,
    resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
