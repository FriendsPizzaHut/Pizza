/**
 * Cloudinary Folder Structure Constants
 * 
 * Defines the organized folder hierarchy in Cloudinary for image uploads.
 * Main folder: FriendsPizzaHut
 * Subfolders: products, avatars, documents, banners, etc.
 */

// Main application folder in Cloudinary
export const CLOUDINARY_ROOT_FOLDER = 'FriendsPizzaHut';

/**
 * All folder paths in Cloudinary
 */
export const CLOUDINARY_FOLDERS = {
    // Product/menu item images
    PRODUCTS: `${CLOUDINARY_ROOT_FOLDER}/products`,

    // User profile pictures/avatars (customers, delivery boys, admins)
    AVATARS: `${CLOUDINARY_ROOT_FOLDER}/avatars`,

    // Official documents (driving license, aadhar, vehicle RC, etc.)
    DOCUMENTS: `${CLOUDINARY_ROOT_FOLDER}/documents`,

    // Promotional banners and marketing images
    BANNERS: `${CLOUDINARY_ROOT_FOLDER}/banners`,

    // Store/restaurant images
    STORES: `${CLOUDINARY_ROOT_FOLDER}/stores`,

    // General/miscellaneous images
    GENERAL: `${CLOUDINARY_ROOT_FOLDER}/general`,

    // Category images (if needed)
    CATEGORIES: `${CLOUDINARY_ROOT_FOLDER}/categories`,

    // Offer/discount images
    OFFERS: `${CLOUDINARY_ROOT_FOLDER}/offers`,
};

/**
 * Get Cloudinary folder path by upload type
 * @param {string} type - Type of image being uploaded
 * @returns {string} Cloudinary folder path
 */
export const getCloudinaryFolder = (type) => {
    switch (type) {
        case 'product':
            return CLOUDINARY_FOLDERS.PRODUCTS;
        case 'avatar':
            return CLOUDINARY_FOLDERS.AVATARS;
        case 'document':
            return CLOUDINARY_FOLDERS.DOCUMENTS;
        case 'banner':
            return CLOUDINARY_FOLDERS.BANNERS;
        case 'store':
            return CLOUDINARY_FOLDERS.STORES;
        case 'category':
            return CLOUDINARY_FOLDERS.CATEGORIES;
        case 'offer':
            return CLOUDINARY_FOLDERS.OFFERS;
        case 'general':
        default:
            return CLOUDINARY_FOLDERS.GENERAL;
    }
};

/**
 * Image transformation presets for different types
 */
export const CLOUDINARY_TRANSFORMATIONS = {
    PRODUCT: {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto:good',
        format: 'auto',
    },
    AVATAR: {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
        format: 'auto',
    },
    DOCUMENT: {
        width: 1200,
        height: 1600,
        crop: 'limit',
        quality: 'auto:best',
        format: 'auto',
    },
    BANNER: {
        width: 1200,
        height: 600,
        crop: 'limit',
        quality: 'auto:good',
        format: 'auto',
    },
    GENERAL: {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
    },
};

/**
 * Get transformation preset by upload type
 * @param {string} type - Type of image being uploaded
 * @returns {object} Transformation object
 */
export const getCloudinaryTransformation = (type) => {
    switch (type) {
        case 'product':
            return CLOUDINARY_TRANSFORMATIONS.PRODUCT;
        case 'avatar':
            return CLOUDINARY_TRANSFORMATIONS.AVATAR;
        case 'document':
            return CLOUDINARY_TRANSFORMATIONS.DOCUMENT;
        case 'banner':
            return CLOUDINARY_TRANSFORMATIONS.BANNER;
        default:
            return CLOUDINARY_TRANSFORMATIONS.GENERAL;
    }
};
