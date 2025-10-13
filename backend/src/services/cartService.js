/**
 * Cart Service
 * 
 * Business logic for cart operations.
 * Handles cart CRUD, item management, and calculations.
 */

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Get or create user's cart
 */
export const getUserCart = async (userId) => {
    try {
        let cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name imageUrl category pricing isAvailable preparationTime',
            })
            .lean();

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
            cart = await Cart.findById(cart._id)
                .populate({
                    path: 'items.product',
                    select: 'name imageUrl category pricing isAvailable preparationTime',
                })
                .lean();
        }

        return cart;
    } catch (error) {
        throw new ApiError(`Failed to get cart: ${error.message}`, 500);
    }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (userId, itemData) => {
    try {
        const { productId, quantity, size, customToppings, specialInstructions } = itemData;

        // Validate product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError('Product not found', 404);
        }
        if (!product.isAvailable) {
            throw new ApiError('Product is not available', 400);
        }

        // Validate size for pizzas
        if (product.category === 'pizza' && !size) {
            throw new ApiError('Size is required for pizza', 400);
        }

        // Calculate selected price
        let selectedPrice;
        if (product.category === 'pizza') {
            if (!product.pricing[size]) {
                throw new ApiError(`Size ${size} not available for this pizza`, 400);
            }
            selectedPrice = product.pricing[size];
        } else {
            selectedPrice = product.pricing;
        }

        // Calculate toppings price
        const toppingsPrice = (customToppings || []).reduce((sum, topping) => sum + (topping.price || 0), 0);

        // Get or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Create product snapshot
        const productSnapshot = {
            name: product.name,
            imageUrl: product.imageUrl,
            basePrice: product.basePrice,
            category: product.category,
        };

        // Use cart instance method to add item
        await cart.addItem({
            product: productId,
            productSnapshot,
            quantity: quantity || 1,
            size,
            selectedPrice,
            customToppings: customToppings || [],
            specialInstructions: specialInstructions || '',
        });

        // Re-fetch with populated data
        cart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name imageUrl category pricing isAvailable preparationTime',
            });

        return cart;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to add item to cart: ${error.message}`, 500);
    }
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = async (userId, itemId, quantity) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError('Cart not found', 404);
        }

        // Use cart instance method
        await cart.updateItemQuantity(itemId, quantity);

        // Re-fetch with populated data
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name imageUrl category pricing isAvailable preparationTime',
            });

        return updatedCart;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to update item quantity: ${error.message}`, 500);
    }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (userId, itemId) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError('Cart not found', 404);
        }

        // Use cart instance method
        await cart.removeItem(itemId);

        // Re-fetch with populated data
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name imageUrl category pricing isAvailable preparationTime',
            });

        return updatedCart;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to remove item from cart: ${error.message}`, 500);
    }
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError('Cart not found', 404);
        }

        // Use cart instance method
        await cart.clearCart();

        return cart;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to clear cart: ${error.message}`, 500);
    }
};

/**
 * Apply coupon to cart
 */
export const applyCouponToCart = async (userId, couponCode) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError('Cart not found', 404);
        }

        // TODO: Validate coupon with Coupon model
        // For now, applying a dummy 10% discount
        const discountAmount = (cart.subtotal * 0.1).toFixed(2);

        await cart.applyCoupon(null, parseFloat(discountAmount));

        // Re-fetch with populated data
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name imageUrl category pricing isAvailable preparationTime',
            });

        return updatedCart;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to apply coupon: ${error.message}`, 500);
    }
};

/**
 * Remove coupon from cart
 */
export const removeCouponFromCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError('Cart not found', 404);
        }

        cart.appliedCoupon = undefined;
        cart.discount = 0;
        await cart.save();

        // Re-fetch with populated data
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                select: 'name imageUrl category pricing isAvailable preparationTime',
            });

        return updatedCart;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to remove coupon: ${error.message}`, 500);
    }
};

/**
 * Validate cart before checkout
 * - Check all products are still available
 * - Check prices haven't changed significantly
 * - Check stock availability
 */
export const validateCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            throw new ApiError('Cart not found', 404);
        }

        if (cart.items.length === 0) {
            throw new ApiError('Cart is empty', 400);
        }

        const issues = [];

        // Check each item
        for (const item of cart.items) {
            const product = item.product;

            // Check if product still exists
            if (!product) {
                issues.push({
                    itemId: item._id,
                    issue: 'Product no longer available',
                    action: 'remove',
                });
                continue;
            }

            // Check if product is available
            if (!product.isAvailable) {
                issues.push({
                    itemId: item._id,
                    productName: item.productSnapshot.name,
                    issue: 'Product is currently unavailable',
                    action: 'remove',
                });
            }

            // Check if price has changed significantly (more than 10%)
            let currentPrice;
            if (product.category === 'pizza' && item.size) {
                currentPrice = product.pricing[item.size];
            } else {
                currentPrice = product.pricing;
            }

            if (currentPrice) {
                const priceDifference = Math.abs(currentPrice - item.selectedPrice);
                const percentageChange = (priceDifference / item.selectedPrice) * 100;

                if (percentageChange > 10) {
                    issues.push({
                        itemId: item._id,
                        productName: item.productSnapshot.name,
                        issue: `Price changed from ₹${item.selectedPrice} to ₹${currentPrice}`,
                        action: 'update',
                        newPrice: currentPrice,
                    });
                }
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            cart,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to validate cart: ${error.message}`, 500);
    }
};
