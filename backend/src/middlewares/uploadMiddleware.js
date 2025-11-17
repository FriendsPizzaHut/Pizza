/**
 * Multer Configuration for File Uploads
 * 
 * Handles multipart/form-data file uploads
 * Used for images before uploading to Cloudinary
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

/**
 * Middleware for single image upload
 * Usage: upload.single('image')
 */
export const uploadSingle = upload.single('image');

/**
 * Middleware for multiple image uploads
 * Usage: upload.array('images', 5)
 */
export const uploadMultiple = upload.array('images', 5);

/**
 * Middleware for multiple fields with images
 * Usage: upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 5 }])
 */
export const uploadFields = (fields) => upload.fields(fields);

/**
 * Cleanup temporary file after upload
 * @param {string} filePath - Path to temporary file
 */
export const cleanupTempFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('❌ Error cleaning up temp file:', error);
    }
};

/**
 * Cleanup multiple temporary files
 * @param {Array<string>} filePaths - Array of file paths
 */
export const cleanupTempFiles = (filePaths) => {
    filePaths.forEach((filePath) => cleanupTempFile(filePath));
};

export default {
    uploadSingle,
    uploadMultiple,
    uploadFields,
    cleanupTempFile,
    cleanupTempFiles,
};
