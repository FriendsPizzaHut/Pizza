# 📸 Cloudinary Image Upload Integration

**Date:** October 12, 2025  
**Status:** ✅ Complete  
**Purpose:** Replace local file:// URIs with cloud-hosted Cloudinary URLs

---

## 🎯 Problem Statement

Previously, images were being stored as local `file://` URIs in MongoDB:
- ❌ Product images: `file:///data/user/0/.../ImagePicker/image.jpeg`
- ❌ User documents: `file:///data/user/0/.../aadharCard.jpg`

**Issues:**
- Images only accessible on the device that uploaded them
- Won't work in production or across different devices
- Database filled with invalid URLs

**Solution:**
- ✅ Upload images to Cloudinary cloud storage
- ✅ Store permanent HTTPS URLs in database
- ✅ Images accessible from anywhere

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  React Native   │
│   (Frontend)    │
└────────┬────────┘
         │ 1. Pick image (expo-image-picker)
         │    Gets: file:///...
         │
         │ 2. Upload to backend
         ▼    POST /api/v1/upload/product-image
┌─────────────────┐
│   Express API   │
│   (Backend)     │
├─────────────────┤
│ Multer saves    │ 3. Save to /uploads/temp/
│ to temp folder  │
└────────┬────────┘
         │ 4. Upload to Cloudinary
         ▼
┌─────────────────┐
│   Cloudinary    │ 5. Returns: https://res.cloudinary.com/.../image.jpg
│  Cloud Storage  │
└────────┬────────┘
         │ 6. Store URL in MongoDB
         ▼
┌─────────────────┐
│    MongoDB      │ imageUrl: "https://res.cloudinary.com/..."
│   Database      │
└─────────────────┘
```

---

## 📦 Backend Implementation

### 1. Files Created

```
backend/
├── src/
│   ├── config/
│   │   └── cloudinary.js              # Cloudinary SDK configuration
│   ├── controllers/
│   │   └── uploadController.js        # Image upload endpoints
│   ├── middlewares/
│   │   └── uploadMiddleware.js        # Multer file handling
│   ├── routes/
│   │   └── uploadRoutes.js            # Upload API routes
│   └── app.js                          # Added upload routes
├── uploads/
│   └── temp/                           # Temporary file storage
└── .env.example                        # Added Cloudinary config
```

### 2. Cloudinary Configuration

**File:** `backend/src/config/cloudinary.js`

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
```

**Key Functions:**
- `uploadToCloudinary(filePath, folder)` - Upload single image
- `deleteFromCloudinary(publicId)` - Delete image
- `uploadMultipleToCloudinary(filePaths, folder)` - Bulk upload
- `getOptimizedImageUrl(publicId, transformations)` - Get transformed URL

**Features:**
- ✅ Automatic image optimization (quality: auto, format: auto)
- ✅ Image resizing (max 1000x1000 for products)
- ✅ Organized folders (products/, documents/drivingLicense/, etc.)
- ✅ Secure HTTPS URLs

### 3. Multer Middleware

**File:** `backend/src/middlewares/uploadMiddleware.js`

**Purpose:** Handle multipart/form-data uploads

**Configuration:**
```javascript
const storage = multer.diskStorage({
    destination: 'uploads/temp/',
    filename: `${fieldname}-${timestamp}-${random}${ext}`
});
```

**Features:**
- ✅ File type validation (JPEG, PNG, GIF, WebP only)
- ✅ File size limit (5MB max)
- ✅ Unique filenames to prevent collisions
- ✅ Automatic temp file cleanup after upload

### 4. Upload Controller

**File:** `backend/src/controllers/uploadController.js`

**Endpoints:**

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/v1/upload/product-image` | POST | Upload product image | FormData with `image` | `{ url, publicId }` |
| `/api/v1/upload/document-image` | POST | Upload user document | FormData with `image` | `{ url, publicId }` |
| `/api/v1/upload/base64-image` | POST | Upload base64 image | `{ image, folder }` | `{ url, publicId }` |
| `/api/v1/upload/image` | POST | Upload generic image | FormData with `image` | `{ url, publicId }` |
| `/api/v1/upload/image/:publicId` | DELETE | Delete image | URL param | `{ success }` |

**Flow:**
1. Multer saves file to `/uploads/temp/`
2. Upload temp file to Cloudinary
3. Get permanent HTTPS URL
4. Delete temp file
5. Return Cloudinary URL to frontend

### 5. API Routes

**File:** `backend/src/routes/uploadRoutes.js`

```javascript
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

router.post('/product-image', protect, uploadSingle, uploadProductImage);
```

**Security:**
- ✅ All routes require authentication (`protect` middleware)
- ✅ File type validation
- ✅ File size limits
- ✅ Rate limiting (via API limiter)

---

## 📱 Frontend Implementation

### 1. Image Upload Utility

**File:** `frontend/src/utils/imageUpload.ts`

**Main Function:**
```typescript
export const uploadImage = async (
  imageUri: string,
  type: 'product' | 'document' | 'general' = 'general'
): Promise<string>
```

**Features:**
- ✅ Converts file:// URIs to FormData
- ✅ Determines correct MIME type from extension
- ✅ Uploads to backend endpoint
- ✅ Returns Cloudinary URL
- ✅ Comprehensive error handling

**Additional Functions:**
- `uploadMultipleImages(imageUris, type)` - Parallel uploads
- `uploadBase64Image(base64Data, folder)` - Base64 support
- `deleteImage(publicId)` - Delete from Cloudinary
- `isLocalFileUri(uri)` - Check if URI is local
- `isValidImageUri(uri)` - Validate URI format

---

## 🔧 Setup Instructions

### Step 1: Get Cloudinary Credentials

1. **Sign up for free:** https://cloudinary.com/users/register/free
2. **Go to Dashboard:** https://console.cloudinary.com/console
3. **Copy credentials:**
   - Cloud Name: `dxxxxxxx`
   - API Key: `123456789012345`
   - API Secret: `xxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Configure Backend

1. **Update `.env` file:**

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

2. **Verify packages installed:**

```bash
cd backend
npm install cloudinary multer  # Already installed
```

3. **Create temp upload directory:**

```bash
mkdir -p backend/uploads/temp
```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connection established
✅ Redis Connected
🚀 Server running on port 5000
```

---

## 🧪 Testing Guide

### Test 1: Product Image Upload

**Using Postman/Thunder Client:**

1. **Request:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/v1/upload/product-image`
   - Headers: `Authorization: Bearer <your-token>`
   - Body: `form-data`
     - Key: `image`
     - Type: `File`
     - Value: Select an image file

2. **Expected Response:**
```json
{
  "success": true,
  "message": "Product image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pizza-app/products/abc123.jpg",
    "publicId": "pizza-app/products/abc123"
  }
}
```

### Test 2: From AddMenuItemScreen

**Frontend Test:**

1. Open AddMenuItemScreen
2. Tap "Pick Image" button
3. Select an image from gallery
4. Fill in other fields (name, category, etc.)
5. Tap "Save Item"

**What happens:**
1. Image picker returns: `file:///data/user/0/.../image.jpg`
2. Frontend calls `uploadImage(uri, 'product')`
3. Backend receives multipart form data
4. Multer saves to `/uploads/temp/`
5. Cloudinary upload starts
6. Returns: `https://res.cloudinary.com/.../image.jpg`
7. Product saved to MongoDB with Cloudinary URL

**Verify in MongoDB:**
```javascript
db.products.findOne({ name: "Test Product" })
// imageUrl should be: "https://res.cloudinary.com/..."
```

### Test 3: Menu Item Display

1. Navigate to MenuManagementScreen
2. Images should load from Cloudinary URLs
3. Works on any device (not just uploader's device)

---

## 🔄 Migration: Update Existing Products

If you already have products with `file://` URIs in the database, you'll need to re-upload them:

### Option 1: Manual Re-upload

1. Go to AddMenuItemScreen
2. Edit each existing product
3. Re-pick the image
4. Save (new Cloudinary URL will replace old file:// URI)

### Option 2: Bulk Migration Script

**Create:** `backend/scripts/migrateImages.js`

```javascript
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

const migrateImages = async () => {
    // Find all products with file:// URIs
    const products = await Product.find({
        imageUrl: { $regex: '^file://' }
    });
    
    console.log(`Found ${products.length} products to migrate`);
    
    // Set imageUrl to empty string or a placeholder
    for (const product of products) {
        product.imageUrl = ''; // Will need to re-upload manually
        await product.save();
    }
};

// Run: node backend/scripts/migrateImages.js
```

---

## 💡 Usage Examples

### Example 1: Update AddMenuItemScreen

**Before:**
```typescript
// ❌ Old: Sends file:// URI directly
const productData = {
    name,
    category,
    imageUrl: selectedImage, // file:///...
    // ...
};
dispatch(createProductThunk(productData));
```

**After:**
```typescript
// ✅ New: Upload to Cloudinary first
import { uploadImage } from '../../utils/imageUpload';

const handleSaveItem = async () => {
    try {
        let cloudinaryUrl = '';
        
        if (selectedImage) {
            // Upload to Cloudinary
            cloudinaryUrl = await uploadImage(selectedImage, 'product');
            console.log('✅ Uploaded to:', cloudinaryUrl);
        }
        
        const productData = {
            name,
            category,
            imageUrl: cloudinaryUrl, // https://res.cloudinary.com/...
            // ...
        };
        
        dispatch(createProductThunk(productData));
    } catch (error) {
        Alert.alert('Error', `Failed to upload image: ${error.message}`);
    }
};
```

### Example 2: Update DeliveryBoySignup (Documents)

```typescript
import { uploadImage } from '../../utils/imageUpload';

// Upload driving license
if (documents.drivingLicense.imageUrl) {
    const licenseUrl = await uploadImage(
        documents.drivingLicense.imageUrl,
        'document'
    );
    documents.drivingLicense.imageUrl = licenseUrl;
}

// Upload Aadhar card
if (documents.aadharCard.imageUrl) {
    const aadharUrl = await uploadImage(
        documents.aadharCard.imageUrl,
        'document'
    );
    documents.aadharCard.imageUrl = aadharUrl;
}
```

### Example 3: Multiple Images (Gallery)

```typescript
import { uploadMultipleImages } from '../../utils/imageUpload';

// Upload product gallery
const galleryUris = ['file://...', 'file://...', 'file://...'];
const cloudinaryUrls = await uploadMultipleImages(galleryUris, 'product');

// cloudinaryUrls = ['https://...', 'https://...', 'https://...']
```

---

## 🎨 Cloudinary Features

### Image Transformations

**Automatic Optimization:**
```
https://res.cloudinary.com/your-cloud/image/upload/
  q_auto,f_auto/v1234567890/products/image.jpg
  
  q_auto = quality:auto (intelligent compression)
  f_auto = format:auto (WebP for supported browsers)
```

**Custom Transformations:**
```javascript
// Thumbnail (200x200)
https://res.cloudinary.com/.../w_200,h_200,c_fill/image.jpg

// Blur background
https://res.cloudinary.com/.../e_blur:1000/image.jpg

// Add watermark
https://res.cloudinary.com/.../l_watermark,g_south_east/image.jpg
```

### Folder Organization

```
pizza-app/
├── products/
│   ├── product-1.jpg
│   ├── product-2.jpg
│   └── ...
├── documents/
│   ├── drivingLicense/
│   │   └── user-123-license.jpg
│   └── aadharCard/
│       └── user-123-aadhar.jpg
└── general/
    └── misc-images.jpg
```

---

## 🚨 Error Handling

### Common Errors

**1. "CLOUDINARY_CLOUD_NAME is not defined"**
```
Solution: Add Cloudinary credentials to .env file
```

**2. "Invalid file type"**
```
Solution: Only JPEG, PNG, GIF, WebP allowed
Check file extension before uploading
```

**3. "File too large"**
```
Solution: Max 5MB file size
Compress image before uploading
```

**4. "Network error: Could not reach server"**
```
Solution: Check backend is running on port 5000
Verify BACKEND_URL in frontend config
```

**5. "Upload failed: timeout"**
```
Solution: Increase timeout (default 30s)
Check internet connection
```

### Frontend Error Handling

```typescript
try {
    const url = await uploadImage(imageUri, 'product');
    console.log('✅ Success:', url);
} catch (error) {
    if (error.message.includes('Network error')) {
        Alert.alert('Connection Error', 'Please check your internet');
    } else if (error.message.includes('Invalid file type')) {
        Alert.alert('Invalid File', 'Please select a valid image');
    } else {
        Alert.alert('Upload Failed', error.message);
    }
}
```

---

## 📊 Performance Considerations

### Image Optimization Tips

1. **Resize before upload:**
   ```typescript
   import * as ImageManipulator from 'expo-image-manipulator';
   
   const resized = await ImageManipulator.manipulateAsync(
       imageUri,
       [{ resize: { width: 1000 } }],
       { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
   );
   ```

2. **Use progressive loading:**
   ```typescript
   <Image 
       source={{ uri: cloudinaryUrl }}
       defaultSource={require('./placeholder.png')}
   />
   ```

3. **Cache images:**
   ```typescript
   import FastImage from 'react-native-fast-image';
   
   <FastImage
       source={{ 
           uri: cloudinaryUrl,
           priority: FastImage.priority.normal,
           cache: FastImage.cacheControl.immutable
       }}
   />
   ```

---

## 🔐 Security Best Practices

1. **Never expose API secrets:**
   - ✅ Keep in `.env` file (server-side only)
   - ❌ Never commit to Git
   - ❌ Never send to frontend

2. **Validate file types:**
   - Backend validates MIME types
   - Frontend validates extensions

3. **Set file size limits:**
   - Current: 5MB max
   - Adjust in `uploadMiddleware.js`

4. **Require authentication:**
   - All upload routes use `protect` middleware
   - Only authenticated users can upload

5. **Use signed URLs (optional):**
   ```javascript
   // For private images
   const signedUrl = cloudinary.url(publicId, { 
       sign_url: true,
       type: 'authenticated'
   });
   ```

---

## ✅ Verification Checklist

### Backend Setup
- [ ] Cloudinary credentials in `.env`
- [ ] `cloudinary` and `multer` packages installed
- [ ] Upload routes added to `app.js`
- [ ] `/uploads/temp/` directory exists
- [ ] Server restarts successfully

### Frontend Integration
- [ ] `imageUpload.ts` utility created
- [ ] Import added to screens that upload images
- [ ] Old `imageUrl: selectedImage` replaced with upload call
- [ ] Error handling added
- [ ] Loading states implemented

### Testing
- [ ] Can upload product image via API
- [ ] Image appears in Cloudinary console
- [ ] Cloudinary URL saved in MongoDB
- [ ] Images display in MenuManagementScreen
- [ ] Works from different devices
- [ ] Temp files cleaned up after upload

---

## 📚 Additional Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Multer Docs:** https://github.com/expressjs/multer
- **React Native Image Picker:** https://docs.expo.dev/versions/latest/sdk/imagepicker/
- **FormData in React Native:** https://developer.mozilla.org/en-US/docs/Web/API/FormData

---

## 🎉 Benefits of This Implementation

### Before (file:// URIs)
- ❌ Images only on uploader's device
- ❌ Won't work in production
- ❌ No optimization
- ❌ No CDN delivery
- ❌ Database filled with invalid paths

### After (Cloudinary URLs)
- ✅ Images accessible from anywhere
- ✅ Production-ready
- ✅ Automatic optimization (quality, format)
- ✅ Global CDN delivery (fast)
- ✅ Image transformations on-the-fly
- ✅ Professional cloud storage
- ✅ Valid HTTPS URLs in database

---

## 🚀 Next Steps

1. **Add to AddMenuItemScreen:** Update image upload logic
2. **Add to DeliveryBoySignup:** Update document upload logic
3. **Test thoroughly:** Verify end-to-end flow
4. **Monitor usage:** Check Cloudinary dashboard for usage stats
5. **Set up transforms:** Add thumbnails, watermarks as needed

**Free Tier Limits (Cloudinary):**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

More than enough for development and small production deployments! 🎊
