/**
 * Product Service
 * 
 * Handles all product/menu-related API calls
 */

import apiClient from '../api/apiClient';

export interface ProductData {
    name: string;
    description: string;
    category: 'pizza' | 'sides' | 'beverages' | 'desserts';
    pricing: number | { small?: number; medium?: number; large?: number };
    imageUrl: string;
    isVegetarian?: boolean;
    toppings?: Array<{
        name: string;
        category: 'vegetables' | 'meat' | 'cheese' | 'sauce';
    }>;
    preparationTime?: number;
    isAvailable?: boolean;
}

export interface Product extends ProductData {
    _id: string;
    basePrice: number;
    discountPercent: number;
    rating: number;
    salesCount: number;
    totalRevenue: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedProductsResponse {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

/**
 * Fetch products with pagination, search, and filters (Optimized for large datasets)
 */
export const fetchProducts = async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isAvailable?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedProductsResponse> => {
    try {
        const queryParams = new URLSearchParams();

        // Pagination
        queryParams.append('page', String(params?.page || 1));
        queryParams.append('limit', String(params?.limit || 10));

        // Filters
        if (params?.category && params.category !== 'all') {
            queryParams.append('category', params.category);
        }
        if (params?.search) {
            queryParams.append('search', params.search);
        }
        if (params?.isAvailable !== undefined) {
            queryParams.append('isAvailable', String(params.isAvailable));
        }

        // Sorting
        if (params?.sortBy) {
            queryParams.append('sortBy', params.sortBy);
            queryParams.append('sortOrder', params.sortOrder || 'desc');
        }

        const response = await apiClient.get(`/products?${queryParams.toString()}`);

        // Backend returns: { success, data: [...products], total, page, limit }
        const data = response.data;
        const products = data.data || [];
        const total = data.total || products.length;
        const page = data.page || params?.page || 1;
        const limit = data.limit || params?.limit || 10;
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
            products,
            total,
            page,
            limit,
            totalPages,
            hasMore,
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
};

/**
 * Fetch all products with optional filters (Legacy - not paginated)
 */
export const fetchAllProducts = async (filters?: {
    category?: string;
    isAvailable?: boolean;
    search?: string;
}): Promise<Product[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));
        if (filters?.search) params.append('search', filters.search);

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';

        const response = await apiClient.get(endpoint);
        return response.data.data || [];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
};

/**
 * Fetch a single product by ID
 */
export const fetchProductById = async (productId: string): Promise<Product> => {
    console.log('🔍 productService.fetchProductById called with:', productId);
    try {
        console.log('📡 Making API call to: /products/' + productId);
        const response = await apiClient.get(`/products/${productId}`);
        console.log('✅ API response received:', {
            status: response.status,
            success: response.data.success,
            hasData: !!response.data.data,
            productId: response.data.data?._id,
            productName: response.data.data?.name
        });
        return response.data.data;
    } catch (error: any) {
        console.error('❌ productService.fetchProductById error:', {
            productId,
            status: error.response?.status,
            message: error.response?.data?.message,
            url: error.config?.url,
            fullError: error
        });
        throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
};

/**
 * Create a new product (Admin only)
 */
export const createProduct = async (productData: ProductData): Promise<Product> => {
    try {
        const response = await apiClient.post('/products', productData);
        return response.data.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to create product';
        throw new Error(message);
    }
};

/**
 * Update an existing product (Admin only)
 */
export const updateProduct = async (
    productId: string,
    updates: Partial<ProductData>
): Promise<Product> => {
    try {
        const response = await apiClient.patch(`/products/${productId}`, updates);
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update product');
    }
};

/**
 * Delete a product (Admin only)
 */
export const deleteProduct = async (productId: string): Promise<void> => {
    try {
        await apiClient.delete(`/products/${productId}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
};

/**
 * Toggle product availability (Admin only)
 */
export const toggleProductAvailability = async (
    productId: string,
    isAvailable: boolean
): Promise<Product> => {
    try {
        const response = await apiClient.patch(`/products/${productId}`, { isAvailable });
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update product availability');
    }
};

/**
 * Get unique categories from products
 */
export const fetchCategories = async (): Promise<string[]> => {
    try {
        const products = await fetchAllProducts();
        const categories = [...new Set(products.map(p => p.category))];
        return categories;
    } catch (error: any) {
        throw new Error('Failed to fetch categories');
    }
};

export default {
    fetchProducts,
    fetchAllProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    fetchCategories,
};
