# Cloudinary Image Upload Organization

## Overview
All images uploaded to Cloudinary are now organized in a structured folder hierarchy under the main folder **`FriendsPizzaHut`**.

## Folder Structure

```
FriendsPizzaHut/
├── products/          # Menu item images (pizzas, burgers, etc.)
├── avatars/           # User profile pictures (customers, delivery boys, admins)
├── documents/         # Official documents (driving license, aadhar, vehicle RC)
├── banners/           # Promotional banners and marketing images
├── stores/            # Store/restaurant images
├── categories/        # Category images (if needed)
├── offers/            # Offer/discount images
└── general/           # General purpose images
```

## Image Types

### 1. **Products** (`FriendsPizzaHut/products`)
- **Usage**: Menu item images
- **Transformation**: 800x800px, limit crop, auto quality
- **Examples**: Pizza images, burger photos, dessert pictures
- **Upload Type**: `'product'`

### 2. **Avatars** (`FriendsPizzaHut/avatars`)
- **Usage**: User profile pictures
- **Transformation**: 400x400px, face detection, fill crop
- **Examples**: Customer avatars, delivery boy photos, admin pictures
- **Upload Type**: `'avatar'`

### 3. **Documents** (`FriendsPizzaHut/documents`)
- **Usage**: Official verification documents
- **Transformation**: 1200x1600px, limit crop, best quality
- **Examples**: Driving license, Aadhar card, Vehicle RC
- **Upload Type**: `'document'`

### 4. **Banners** (`FriendsPizzaHut/banners`)
- **Usage**: Promotional and marketing images
- **Transformation**: 1200x600px, limit crop, good quality
- **Examples**: Homepage banners, promotional offers, announcements
- **Upload Type**: `'banner'`

### 5. **Stores** (`FriendsPizzaHut/stores`)
- **Usage**: Store/restaurant images
- **Transformation**: 800x800px, limit crop, auto quality
- **Examples**: Store front photos, interior shots
- **Upload Type**: `'store'`

### 6. **Categories** (`FriendsPizzaHut/categories`)
- **Usage**: Food category images
- **Transformation**: 800x800px, limit crop, auto quality
- **Examples**: Category icons, representative images
- **Upload Type**: `'category'`

### 7. **Offers** (`FriendsPizzaHut/offers`)
- **Usage**: Offer and discount images
- **Transformation**: 800x800px, limit crop, auto quality
- **Examples**: Discount badges, special offer graphics
- **Upload Type**: `'offer'`

### 8. **General** (`FriendsPizzaHut/general`)
- **Usage**: Miscellaneous images
- **Transformation**: 800x800px, limit crop, auto quality
- **Examples**: Any other images that don't fit specific categories
- **Upload Type**: `'general'`

---

## Frontend Usage

### Import the Upload Function
```typescript
import { uploadImage, ImageUploadType } from '../utils/imageUpload';
```

### Upload Examples

#### 1. Upload Product Image
```typescript
const imageUri = 'file://path/to/image.jpg';
const cloudinaryUrl = await uploadImage(imageUri, 'product');
```

#### 2. Upload Avatar/Profile Picture
```typescript
const avatarUri = 'file://path/to/avatar.jpg';
const cloudinaryUrl = await uploadImage(avatarUri, 'avatar');
```

#### 3. Upload Document
```typescript
const documentUri = 'file://path/to/license.jpg';
const cloudinaryUrl = await uploadImage(documentUri, 'document');
```

#### 4. Upload Banner
```typescript
const bannerUri = 'file://path/to/banner.jpg';
const cloudinaryUrl = await uploadImage(bannerUri, 'banner');
```

### Multiple Image Upload
```typescript
import { uploadMultipleImages } from '../utils/imageUpload';

const imageUris = ['file://img1.jpg', 'file://img2.jpg', 'file://img3.jpg'];
const cloudinaryUrls = await uploadMultipleImages(imageUris, 'product');
```

---

## Backend Usage

### Import Upload Functions
```javascript
import { uploadToCloudinary } from '../config/cloudinary.js';
```

### Upload Examples

#### 1. Upload Product Image
```javascript
const result = await uploadToCloudinary(filePath, 'product');
console.log(result.url); // Uploaded image URL
```

#### 2. Upload Avatar
```javascript
const result = await uploadToCloudinary(filePath, 'avatar');
console.log(result.url);
```

#### 3. Upload Document
```javascript
const result = await uploadToCloudinary(filePath, 'document');
console.log(result.url);
```

### API Endpoints

#### Upload Product Image
```
POST /api/v1/upload/product-image
Content-Type: multipart/form-data

Body:
- file: [image file]

Response:
{
  "success": true,
  "message": "Product image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../FriendsPizzaHut/products/...",
    "publicId": "FriendsPizzaHut/products/xyz123"
  }
}
```

#### Upload Avatar
```
POST /api/v1/upload/avatar
Content-Type: multipart/form-data

Body:
- file: [image file]

Response:
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../FriendsPizzaHut/avatars/...",
    "publicId": "FriendsPizzaHut/avatars/abc456"
  }
}
```

#### Upload Document
```
POST /api/v1/upload/document-image
Content-Type: multipart/form-data

Body:
- file: [image file]

Response:
{
  "success": true,
  "message": "Document image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../FriendsPizzaHut/documents/...",
    "publicId": "FriendsPizzaHut/documents/def789"
  }
}
```

#### Upload Banner
```
POST /api/v1/upload/banner
Content-Type: multipart/form-data

Body:
- file: [image file]

Response:
{
  "success": true,
  "message": "Banner uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../FriendsPizzaHut/banners/...",
    "publicId": "FriendsPizzaHut/banners/ghi012"
  }
}
```

#### Generic Upload (with type parameter)
```
POST /api/v1/upload/image
Content-Type: multipart/form-data

Body:
- file: [image file]
- type: 'product' | 'avatar' | 'document' | 'banner' | 'store' | 'category' | 'offer' | 'general'

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../FriendsPizzaHut/[type]/...",
    "publicId": "FriendsPizzaHut/[type]/xyz123"
  }
}
```

---

## Image Transformations

Each image type has optimized transformations applied automatically:

### Product Images
- **Size**: 800x800px
- **Crop**: Limit (maintains aspect ratio)
- **Quality**: Auto (good quality with optimization)
- **Format**: Auto (best format for browser)

### Avatars
- **Size**: 400x400px
- **Crop**: Fill (with face detection)
- **Gravity**: Face (centers on face if detected)
- **Quality**: Auto (good quality)
- **Format**: Auto

### Documents
- **Size**: 1200x1600px
- **Crop**: Limit
- **Quality**: Auto (best quality for readability)
- **Format**: Auto

### Banners
- **Size**: 1200x600px
- **Crop**: Limit
- **Quality**: Auto (good quality)
- **Format**: Auto

### General
- **Size**: 800x800px
- **Crop**: Limit
- **Quality**: Auto
- **Format**: Auto

---

## Constants Reference

### Frontend
```typescript
// File: frontend/src/constants/cloudinaryFolders.ts

import { 
  CLOUDINARY_FOLDERS, 
  ImageUploadType, 
  getCloudinaryFolder,
  getCloudinaryTransformation 
} from '../constants/cloudinaryFolders';

// Get folder path
const folder = getCloudinaryFolder('product'); // "FriendsPizzaHut/products"

// Get transformation settings
const transform = getCloudinaryTransformation('avatar');
```

### Backend
```javascript
// File: backend/src/constants/cloudinaryFolders.js

import { 
  CLOUDINARY_FOLDERS, 
  getCloudinaryFolder,
  getCloudinaryTransformation 
} from '../constants/cloudinaryFolders.js';

// Get folder path
const folder = getCloudinaryFolder('product'); // "FriendsPizzaHut/products"

// Get transformation settings
const transform = getCloudinaryTransformation('document');
```

---

## Migration Notes

### Old vs New Folder Structure

**Before:**
```
pizza-app/
├── products/
├── documents/
└── general/
```

**After:**
```
FriendsPizzaHut/
├── products/
├── avatars/
├── documents/
├── banners/
├── stores/
├── categories/
├── offers/
└── general/
```

### Breaking Changes
1. **Folder paths changed**: Update any hardcoded folder references
2. **Upload function signature changed**: Now accepts type instead of folder path
3. **New image types added**: avatar, banner, store, category, offer

### Migration Steps
1. ✅ Constants files created (frontend & backend)
2. ✅ Upload utilities updated
3. ✅ Backend controllers updated
4. ✅ New API endpoints added
5. ⏳ Update existing screens to use new upload types
6. ⏳ Test all upload flows

---

## Best Practices

1. **Always use correct type**: Choose the most appropriate type for your image
2. **Don't hardcode folders**: Use the constants file
3. **Handle upload errors**: Always wrap uploads in try-catch blocks
4. **Show upload progress**: Provide user feedback during uploads
5. **Validate before upload**: Check file size, type, and dimensions
6. **Clean up temp files**: Backend automatically cleans up temp files
7. **Use appropriate transformations**: Let the system apply optimized transformations

---

## Example Implementations

### Menu Item Upload (Frontend)
```typescript
// In AddMenuItemScreen.tsx or EditMenuItemScreen.tsx
const handleImageUpload = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Upload to Cloudinary in products folder
      const cloudinaryUrl = await uploadImage(imageUri, 'product');
      
      // Use the URL
      setItemData({ ...itemData, imageUrl: cloudinaryUrl });
    }
  } catch (error) {
    Alert.alert('Upload Failed', error.message);
  }
};
```

### Profile Picture Upload (Frontend)
```typescript
// In ProfileScreen.tsx
const handleAvatarUpload = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Upload to Cloudinary in avatars folder with face detection
      const cloudinaryUrl = await uploadImage(imageUri, 'avatar');
      
      // Update user profile
      await updateProfile({ profileImage: cloudinaryUrl });
    }
  } catch (error) {
    Alert.alert('Upload Failed', error.message);
  }
};
```

### Document Upload (Frontend)
```typescript
// In DeliveryBoySignup.tsx
const handleDocumentUpload = async (documentType: string) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9, // Higher quality for documents
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Upload to Cloudinary in documents folder
      const cloudinaryUrl = await uploadImage(imageUri, 'document');
      
      // Store document URL
      setDocuments({ ...documents, [documentType]: cloudinaryUrl });
    }
  } catch (error) {
    Alert.alert('Upload Failed', error.message);
  }
};
```

---

## Troubleshooting

### Issue: Upload fails with "Cloudinary not configured"
**Solution**: Ensure environment variables are set:
```env
# Frontend (.env)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset

# Backend (.env)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Issue: Images appear in wrong folder
**Solution**: Check that you're using the correct upload type parameter

### Issue: Upload is slow
**Solution**: 
- Reduce image quality (0.7-0.8 is usually sufficient)
- Compress images before upload
- Check internet connection

### Issue: Face detection not working for avatars
**Solution**: Ensure the upload type is set to `'avatar'` - this automatically applies face detection transformation

---

## Future Enhancements

- [ ] Add progress tracking for uploads
- [ ] Implement image compression before upload
- [ ] Add batch upload functionality
- [ ] Create image gallery management
- [ ] Add image cropping/editing before upload
- [ ] Implement CDN optimization
- [ ] Add image versioning
- [ ] Create admin panel for managing Cloudinary assets

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Test with Cloudinary dashboard
4. Contact development team

---

**Last Updated**: October 26, 2025
**Version**: 2.0.0
