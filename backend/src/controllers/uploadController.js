/**
 * Image Upload Controller
 * 
 * Handles image uploads to Cloudinary
 * Provides endpoints for uploading product images, user documents, etc.
 */

import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { cleanupTempFile } from '../middlewares/uploadMiddleware.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Upload single image to Cloudinary
 * @route POST /api/v1/upload/image
 */
export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No image file provided');
        }

        const { type = 'general' } = req.body;

        // Upload to Cloudinary with type-based folder
        const result = await uploadToCloudinary(req.file.path, type);

        // Cleanup temp file
        cleanupTempFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
                format: result.format,
                width: result.width,
                height: result.height,
            },
        });
    } catch (error) {
        // Cleanup temp file on error
        if (req.file) {
            cleanupTempFile(req.file.path);
        }
        next(error);
    }
};

/**
 * Upload product image to Cloudinary
 * @route POST /api/v1/upload/product-image
 */
export const uploadProductImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No image file provided');
        }

        // Upload to Cloudinary in products folder
        const result = await uploadToCloudinary(req.file.path, 'product');

        // Cleanup temp file
        cleanupTempFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Product image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        // Cleanup temp file on error
        if (req.file) {
            cleanupTempFile(req.file.path);
        }
        next(error);
    }
};

/**
 * Upload user document image to Cloudinary
 * @route POST /api/v1/upload/document-image
 */
export const uploadDocumentImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No image file provided');
        }

        // Upload to Cloudinary in documents folder
        const result = await uploadToCloudinary(req.file.path, 'document');

        // Cleanup temp file
        cleanupTempFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Document image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        // Cleanup temp file on error
        if (req.file) {
            cleanupTempFile(req.file.path);
        }
        next(error);
    }
};

/**
 * Delete image from Cloudinary
 * @route DELETE /api/v1/upload/image/:publicId
 */
export const deleteImage = async (req, res, next) => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            throw new ApiError(400, 'Public ID is required');
        }

        // Decode public ID (it might be URL encoded)
        const decodedPublicId = decodeURIComponent(publicId);

        const result = await deleteFromCloudinary(decodedPublicId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload base64 image to Cloudinary
 * @route POST /api/v1/upload/base64-image
 */
export const uploadBase64Image = async (req, res, next) => {
    try {
        const { image, type = 'general' } = req.body;

        if (!image) {
            throw new ApiError(400, 'No base64 image data provided');
        }

        // Validate base64 format
        if (!image.startsWith('data:image/')) {
            throw new ApiError(400, 'Invalid base64 image format');
        }

        // Upload to Cloudinary using type-based folder
        const result = await uploadToCloudinary(image, type);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload avatar/profile picture to Cloudinary
 * @route POST /api/v1/upload/avatar
 */
export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No image file provided');
        }

        // Upload to Cloudinary in avatars folder with face detection
        const result = await uploadToCloudinary(req.file.path, 'avatar');

        // Cleanup temp file
        cleanupTempFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        // Cleanup temp file on error
        if (req.file) {
            cleanupTempFile(req.file.path);
        }
        next(error);
    }
};

/**
 * Upload banner/promotional image to Cloudinary
 * @route POST /api/v1/upload/banner
 */
export const uploadBanner = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No image file provided');
        }

        // Upload to Cloudinary in banners folder
        const result = await uploadToCloudinary(req.file.path, 'banner');

        // Cleanup temp file
        cleanupTempFile(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Banner uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
            },
        });
    } catch (error) {
        // Cleanup temp file on error
        if (req.file) {
            cleanupTempFile(req.file.path);
        }
        next(error);
    }
};

export default {
    uploadImage,
    uploadProductImage,
    uploadDocumentImage,
    uploadAvatar,
    uploadBanner,
    deleteImage,
    uploadBase64Image,
};
