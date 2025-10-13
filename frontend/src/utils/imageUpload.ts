/**
 * Image Upload Utility
 * 
 * Handles uploading images from React Native to Cloudinary
 * Uses direct upload to Cloudinary (faster, bypasses backend)
 */

import axios from 'axios';

// Cloudinary configuration from .env
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload image directly to Cloudinary (bypasses backend)
 * @param {string} imageUri - Local file URI from expo-image-picker
 * @param {string} type - Upload type: 'product', 'document', or 'general'
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadImage = async (
    imageUri: string,
    type: 'product' | 'document' | 'general' = 'general'
): Promise<string> => {
    try {
        if (!imageUri) {
            throw new Error('Image URI is required');
        }

        // If already a cloud URL, return as is
        if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
            return imageUri;
        }

        // Validate Cloudinary configuration
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary not configured. Check .env file.');
        }

        console.log('📤 Uploading directly to Cloudinary...');
        console.log('☁️  Cloud:', CLOUDINARY_CLOUD_NAME);
        console.log('📋 Preset:', CLOUDINARY_UPLOAD_PRESET);

        // Create FormData for Cloudinary
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'image.jpg';

        // Determine mime type from extension
        const extension = filename.split('.').pop()?.toLowerCase();
        const mimeTypeMap: { [key: string]: string } = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
        };
        const mimeType = mimeTypeMap[extension || 'jpg'] || 'image/jpeg';

        // Append file to FormData
        formData.append('file', {
            uri: imageUri,
            name: filename,
            type: mimeType,
        } as any);

        // Append upload preset (required for unsigned upload)
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Append folder based on type
        const folderMap = {
            product: 'pizza-app/products',
            document: 'pizza-app/documents',
            general: 'pizza-app/general',
        };
        formData.append('folder', folderMap[type]);

        // Upload directly to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        console.log('🚀 Uploading to:', cloudinaryUrl);
        const startTime = Date.now();

        const response = await axios.post(cloudinaryUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 seconds
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Upload successful in ${duration}s!`);
        console.log('🔗 URL:', response.data.secure_url);

        if (response.data.secure_url) {
            return response.data.secure_url;
        } else {
            throw new Error('Failed to get image URL from Cloudinary response');
        }
    } catch (error: any) {
        console.error('❌ Image upload error:', error);

        if (error.response) {
            const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'Upload failed';
            throw new Error(`Upload failed: ${errorMessage}`);
        } else if (error.request) {
            throw new Error('Network error: Could not reach Cloudinary. Check your internet connection.');
        } else {
            throw new Error(error.message || 'Unknown upload error');
        }
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {string[]} imageUris - Array of local file URIs
 * @param {string} type - Upload type
 * @returns {Promise<string[]>} Array of Cloudinary URLs
 */
export const uploadMultipleImages = async (
    imageUris: string[],
    type: 'product' | 'document' | 'general' = 'general'
): Promise<string[]> => {
    try {
        // Upload all images in parallel
        const uploadPromises = imageUris.map((uri) => uploadImage(uri, type));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error: any) {
        console.error('❌ Multiple image upload error:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
};

/**
 * Upload base64 image to Cloudinary (NOT RECOMMENDED - use uploadImage instead)
 * @param {string} base64Data - Base64 image data
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadBase64Image = async (
    base64Data: string,
    folder: string = 'pizza-app/general'
): Promise<string> => {
    try {
        if (!base64Data) {
            throw new Error('Base64 data is required');
        }

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary not configured. Check .env file.');
        }

        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const response = await axios.post(cloudinaryUrl, formData, {
            timeout: 60000,
        });

        if (response.data.secure_url) {
            console.log('✅ Base64 image uploaded successfully:', response.data.secure_url);
            return response.data.secure_url;
        } else {
            throw new Error('Failed to get image URL from response');
        }
    } catch (error: any) {
        console.error('❌ Base64 image upload error:', error);
        throw new Error(error.message || 'Unknown upload error');
    }
};

/**
 * Delete image from Cloudinary (NOT IMPLEMENTED - requires backend)
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
    // Note: Deletion requires signed requests (backend only)
    console.warn('⚠️  Image deletion requires backend API');
    throw new Error('Image deletion not available in direct upload mode');
};

/**
 * Helper function to check if URI is a local file
 * @param {string} uri - URI to check
 * @returns {boolean} True if local file URI
 */
export const isLocalFileUri = (uri: string): boolean => {
    return (
        uri.startsWith('file://') ||
        uri.startsWith('content://') ||
        uri.startsWith('ph://')
    );
};

/**
 * Helper function to validate image before upload
 * @param {string} uri - Image URI
 * @returns {boolean} True if valid
 */
export const isValidImageUri = (uri: string): boolean => {
    if (!uri) return false;

    // Check if it's a valid URL or local file URI
    if (
        uri.startsWith('http://') ||
        uri.startsWith('https://') ||
        isLocalFileUri(uri)
    ) {
        return true;
    }

    return false;
};

export default {
    uploadImage,
    uploadMultipleImages,
    uploadBase64Image,
    deleteImage,
    isLocalFileUri,
    isValidImageUri,
};
