/**
 * Cloudinary Configuration
 * 
 * Sets up Cloudinary SDK for image uploads
 * Images will be stored in the cloud instead of local file system
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { getCloudinaryFolder, getCloudinaryTransformation } from '../constants/cloudinaryFolders.js';

dotenv.config();

// Validate Cloudinary credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ CLOUDINARY CREDENTIALS MISSING!');
    console.error('Please add to .env file:');
    console.error('  CLOUDINARY_CLOUD_NAME=your-cloud-name');
    console.error('  CLOUDINARY_API_KEY=your-api-key');
    console.error('  CLOUDINARY_API_SECRET=your-api-secret');
} else {
    console.log('✅ Cloudinary credentials loaded:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY?.substring(0, 6) + '...',
    });
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    // Increase chunk size and timeout for slow connections
    upload_timeout: 120000, // 2 minutes
    chunk_size: 6000000, // 6MB chunks
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path or base64 string
 * @param {string} type - Upload type: 'product', 'avatar', 'document', 'banner', 'store', 'category', 'offer', or 'general'
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} Upload result with secure_url
 */
export const uploadToCloudinary = async (filePath, type = 'general', options = {}) => {
    try {
        // Get folder and transformation based on type
        const folder = getCloudinaryFolder(type);
        const transformation = getCloudinaryTransformation(type);

        // Try unsigned upload first (faster, no API key verification needed)
        const useUnsigned = process.env.CLOUDINARY_UPLOAD_PRESET || false;

        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            timeout: 120000, // 2 minutes timeout for slow connections
            // Use type-specific transformations
            transformation: [transformation],
            ...options,
        };

        // Add upload preset if using unsigned upload
        if (useUnsigned) {
            uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
            console.log('📤 Using unsigned upload (faster):', { filePath, folder, type, preset: useUnsigned });
        } else {
            console.log('📤 Using signed upload:', { filePath, folder, type });
        }

        console.log('⏱️  This may take 5-30 seconds depending on network speed...');

        const startTime = Date.now();

        // Use unsigned or signed upload based on preset availability
        const result = useUnsigned
            ? await cloudinary.uploader.unsigned_upload(filePath, process.env.CLOUDINARY_UPLOAD_PRESET, uploadOptions)
            : await cloudinary.uploader.upload(filePath, uploadOptions);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`✅ Cloudinary upload successful in ${duration}s:`, result.secure_url);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
        };
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);

        // Better error message handling
        let errorMessage = 'Unknown error';

        if (error.message) {
            errorMessage = error.message;
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.http_code) {
            errorMessage = `HTTP ${error.http_code}`;
            if (error.http_code === 499) {
                errorMessage += ' - Upload timeout. Network too slow or unstable.';
            }
        }

        throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: true,
            result: result.result, // 'ok' or 'not found'
        };
    } catch (error) {
        console.error('❌ Cloudinary delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} filePaths - Array of local file paths
 * @param {string} type - Upload type
 * @returns {Promise<Array<object>>} Array of upload results
 */
export const uploadMultipleToCloudinary = async (filePaths, type = 'general') => {
    try {
        const uploadPromises = filePaths.map((filePath) =>
            uploadToCloudinary(filePath, type)
        );
        const results = await Promise.all(uploadPromises);
        return {
            success: true,
            uploads: results,
        };
    } catch (error) {
        console.error('❌ Multiple upload error:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
};

/**
 * Get optimized image URL from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            ...transformations,
        ],
        secure: true,
    });
};

export default {
    uploadToCloudinary,
    deleteFromCloudinary,
    uploadMultipleToCloudinary,
    getOptimizedImageUrl,
    cloudinary,
};
