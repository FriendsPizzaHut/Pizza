/**
 * Address Controller
 * 
 * Handles address management operations:
 * - Add new address
 * - Update existing address
 * - Delete address
 * - Set default address
 */

import User from '../models/User.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * @desc    Add new address to user profile
 * @route   POST /api/v1/users/:id/address
 * @access  Private (user can only add to their own profile)
 */
export const addAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { label, street, city, state, pincode, landmark, isDefault } = req.body;

        // Authorization check - users can only add to their own profile
        if (req.user.id !== id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'You can only manage your own addresses'));
        }

        // Validation
        if (!street || !city || !state || !pincode) {
            return next(new ApiError(400, 'Street, city, state, and pincode are required'));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // If this is marked as default, unset other defaults
        if (isDefault) {
            user.address.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // If this is the first address, make it default
        const makeDefault = isDefault || user.address.length === 0;

        // Add new address
        user.address.push({
            label: label || 'Home',
            street,
            city,
            state,
            pincode,
            landmark,
            isDefault: makeDefault,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: {
                address: user.address[user.address.length - 1],
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update existing address
 * @route   PUT /api/v1/users/:id/address/:addressId
 * @access  Private
 */
export const updateAddress = async (req, res, next) => {
    try {
        const { id, addressId } = req.params;
        const { label, street, city, state, pincode, landmark, isDefault } = req.body;

        // Authorization check
        if (req.user.id !== id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'You can only manage your own addresses'));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        const address = user.address.id(addressId);
        if (!address) {
            return next(new ApiError(404, 'Address not found'));
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            user.address.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        // Update fields
        if (label !== undefined) address.label = label;
        if (street !== undefined) address.street = street;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (pincode !== undefined) address.pincode = pincode;
        if (landmark !== undefined) address.landmark = landmark;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: {
                address,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/users/:id/address/:addressId
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
    try {
        const { id, addressId } = req.params;

        // Authorization check
        if (req.user.id !== id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'You can only manage your own addresses'));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        const address = user.address.id(addressId);
        if (!address) {
            return next(new ApiError(404, 'Address not found'));
        }

        const wasDefault = address.isDefault;

        // Remove address using pull
        user.address.pull(addressId);

        // If deleted address was default, set first remaining address as default
        if (wasDefault && user.address.length > 0) {
            user.address[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Set address as default
 * @route   PATCH /api/v1/users/:id/address/:addressId/default
 * @access  Private
 */
export const setDefaultAddress = async (req, res, next) => {
    try {
        const { id, addressId } = req.params;

        // Authorization check
        if (req.user.id !== id && req.user.role !== 'admin') {
            return next(new ApiError(403, 'You can only manage your own addresses'));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        const address = user.address.id(addressId);
        if (!address) {
            return next(new ApiError(404, 'Address not found'));
        }

        // Unset all defaults
        user.address.forEach(addr => {
            addr.isDefault = false;
        });

        // Set this as default
        address.isDefault = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            data: {
                address,
            },
        });
    } catch (error) {
        next(error);
    }
};
