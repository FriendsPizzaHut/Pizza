# 🚀 Cloudinary Quick Start

## ⚡ 3-Minute Setup

### 1. Get Cloudinary Credentials (2 minutes)

1. Visit: https://cloudinary.com/users/register/free
2. Sign up with email
3. Go to Dashboard: https://console.cloudinary.com
4. Copy these 3 values:
   - **Cloud Name:** `dxxxxxxx`
   - **API Key:** `123456789012345`
   - **API Secret:** `xxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Configure Backend (1 minute)

Add to `backend/.env`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Restart Server

```bash
cd backend
npm run dev
```

Done! 🎉

---

## 🎯 Usage in Code

### Upload Product Image

```typescript
import { uploadImage } from '../../utils/imageUpload';

// In your component
const handleSave = async () => {
    try {
        // Upload image first
        const cloudUrl = await uploadImage(localImageUri, 'product');
        
        // Then save product with cloud URL
        const product = {
            name: 'Pizza',
            imageUrl: cloudUrl, // https://res.cloudinary.com/...
        };
        
        await dispatch(createProductThunk(product));
    } catch (error) {
        Alert.alert('Error', error.message);
    }
};
```

### Upload Document Image

```typescript
const licenseUrl = await uploadImage(licenseUri, 'document');
```

### Upload Multiple Images

```typescript
import { uploadMultipleImages } from '../../utils/imageUpload';

const urls = await uploadMultipleImages(
    ['file://...', 'file://...'],
    'product'
);
```

---

## 🧪 Test Upload

### Using Postman

```
POST http://localhost:5000/api/v1/upload/product-image
Headers:
  Authorization: Bearer <your-jwt-token>
Body:
  form-data
    key: image
    type: File
    value: [select image file]
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/.../image.jpg"
  }
}
```

---

## 📋 API Endpoints

| Endpoint | Type | Use For |
|----------|------|---------|
| `/api/v1/upload/product-image` | POST | Product images |
| `/api/v1/upload/document-image` | POST | User documents |
| `/api/v1/upload/image` | POST | Generic images |
| `/api/v1/upload/base64-image` | POST | Base64 images |

All require: `Authorization: Bearer <token>`

---

## ✅ Checklist

- [ ] Added Cloudinary credentials to `.env`
- [ ] Restarted backend server
- [ ] Updated AddMenuItemScreen with `uploadImage()`
- [ ] Tested image upload
- [ ] Verified URL in MongoDB: `https://res.cloudinary.com/...`

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "CLOUDINARY_CLOUD_NAME is not defined" | Check `.env` file |
| "Network error" | Check backend is running |
| "Invalid file type" | Only JPG, PNG, GIF, WebP allowed |
| "File too large" | Max 5MB per image |

---

## 📦 Before vs After

### ❌ Before (Broken)
```javascript
imageUrl: "file:///data/user/0/.../image.jpeg"
// Only works on uploader's device
```

### ✅ After (Fixed)
```javascript
imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v123/products/abc.jpg"
// Works everywhere, forever
```

---

**Full Documentation:** See `CLOUDINARY_SETUP_COMPLETE.md`
