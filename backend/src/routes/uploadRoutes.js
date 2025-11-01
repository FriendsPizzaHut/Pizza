/**
 * Upload Routes
 * 
 * Routes for handling image uploads to Cloudinary
 */

import express from 'express';
import {
    uploadImage,
    uploadProductImage,
    uploadDocumentImage,
    uploadAvatar,
    uploadBanner,
    deleteImage,
    uploadBase64Image,
} from '../controllers/uploadController.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// Upload generic image
router.post('/image', uploadSingle, uploadImage);

// Upload product image
router.post('/product-image', uploadSingle, uploadProductImage);

// Upload avatar/profile picture
router.post('/avatar', uploadSingle, uploadAvatar);

// Upload document image (for user verification documents)
router.post('/document-image', uploadSingle, uploadDocumentImage);

// Upload banner/promotional image
router.post('/banner', uploadSingle, uploadBanner);

// Upload base64 image (alternative for React Native)
router.post('/base64-image', uploadBase64Image);

// Delete image from Cloudinary
router.delete('/image/:publicId', deleteImage);

export default router;
