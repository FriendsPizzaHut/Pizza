# Avatar Upload Feature Documentation

## Overview
Users can now add their profile pictures (avatars) during account creation for both **Customer** and **Delivery Boy** signup. If no avatar is provided, the system automatically generates initials from the user's name as a fallback.

---

## Features

### 1. **Optional Avatar Upload**
- Users can optionally upload a profile picture during signup
- Square aspect ratio (1:1) for consistent display
- High-quality image upload (0.8 quality)
- Images uploaded to Cloudinary in organized folders

### 2. **Initials Fallback**
- If no avatar is uploaded, system generates initials from name
- **Single word name**: First letter only (e.g., "Naitik" → "N")
- **Multiple word name**: First and last initials (e.g., "Naitik Kumar" → "NK")
- Colored circular background generated from name hash

### 3. **Cloudinary Organization**
- **Avatars**: Uploaded to `FriendsPizzaHut/avatars/` folder
- **Documents** (for delivery boys): Uploaded to `FriendsPizzaHut/documents/` folder
- **Menu Images**: Uploaded to `FriendsPizzaHut/products/` folder
- Each type has its own folder for easy management

---

## Technical Implementation

### Frontend Components

#### 1. **Avatar Component** (`frontend/src/components/common/Avatar.tsx`)
Reusable component that displays either an image or initials:

```tsx
<Avatar
    name="Naitik Kumar"
    imageUrl="https://cloudinary.com/..."  // Optional
    size={100}                              // Default: 80
/>
```

**Props:**
- `name`: string - User's full name (required)
- `imageUrl`: string | null - Cloudinary URL or null (optional)
- `size`: number - Avatar diameter in pixels (default: 80)
- `style`: ViewStyle - Additional custom styles (optional)
- `fontSize`: number - Custom font size for initials (optional)

**Features:**
- Displays image if URL provided
- Displays initials with colored background if no image
- Circular shape with white border and shadow
- Responsive sizing
- Color generated from name for consistency

#### 2. **Avatar Utilities** (`frontend/src/utils/avatarUtils.ts`)
Helper functions for avatar logic:

```typescript
// Generate initials from name
generateInitials("Naitik Kumar") // Returns "NK"
generateInitials("Naitik")       // Returns "N"

// Get consistent color from name
getAvatarColor("Naitik Kumar")  // Returns "#4ECDC4" (consistent)

// Check if string is URL or initials
isAvatarUrl("https://...")      // Returns true
isAvatarUrl("NK")               // Returns false

// Get complete avatar data
getAvatarData("Naitik Kumar", "https://...")
// Returns: { type: 'image', content: 'https://...', color: '#ffffff' }
```

**Color Palette:**
15 professional, distinguishable colors are used for initials backgrounds:
- Red, Teal, Blue, Light Salmon, Mint, Yellow, Purple
- Sky Blue, Orange, Green, Dark Red, Steel Blue, Burnt Orange, Cyan, Crimson

Colors are consistently assigned using name hash.

### Signup Screens

#### 1. **Customer Signup** (`frontend/src/components/auth/Signup.tsx`)

**Features Added:**
- Avatar picker section above form inputs
- Image picker with camera roll permissions
- Preview of selected avatar or initials
- Upload to Cloudinary on signup
- Loading state while uploading
- Error handling with user choice to continue
- Remove avatar option

**UI Layout:**
```
┌─────────────────────────────┐
│   Profile Picture (Optional) │
│                             │
│      [Avatar Preview]       │
│   [Add Photo] [Remove]      │
│  "We'll use your initials"  │
└─────────────────────────────┘
```

**User Flow:**
1. User fills name field
2. Avatar section shows initials (e.g., "NK")
3. User can click "Add Photo" to select image
4. Preview updates to show selected image
5. User can remove image (reverts to initials)
6. On signup, avatar uploads to Cloudinary
7. profileImage URL saved to database

#### 2. **Delivery Boy Signup** (`frontend/src/components/auth/DeliveryBoySignup.tsx`)

Same features as Customer Signup, with additional considerations:
- Avatar upload happens alongside document uploads
- Documents go to `FriendsPizzaHut/documents/`
- Avatar goes to `FriendsPizzaHut/avatars/`
- Proper error handling for all uploads

**Upload Sequence:**
1. Avatar uploads first (if selected)
2. Documents upload next (driving license, aadhar, RC)
3. All uploads complete before signup submission
4. User notified of any upload failures

### Backend Integration

#### 1. **User Model** (`backend/src/models/User.js`)

**Field Added:**
```javascript
profileImage: {
    type: String,  // URL to profile image
    default: null, // Null if not provided
}
```

**Schema:**
- Stored in base User schema (available for all roles)
- Nullable field (optional)
- String type for Cloudinary URL

#### 2. **Auth Service** (`backend/src/services/authService.js`)

**Updated Registration:**
```javascript
export const registerUser = async (userData) => {
    const { 
        name, 
        email, 
        phone, 
        password, 
        role, 
        profileImage,  // ✅ NEW
        vehicleInfo, 
        documents 
    } = userData;

    const userDataToCreate = {
        name,
        email,
        phone,
        password,
        role: role || 'customer',
        profileImage: profileImage || null,  // ✅ NEW
        // ... other fields
    };

    const user = await User.create(userDataToCreate);
    // ...
};
```

**Changes:**
- Accepts `profileImage` parameter from request body
- Stores Cloudinary URL in User document
- Returns profileImage in user profile response

#### 3. **TypeScript Interfaces** (`frontend/src/services/authService.ts`)

**Updated Types:**
```typescript
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin' | 'delivery';
    profileImage?: string | null;  // ✅ NEW
    // ...
}

export interface SignupData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'customer' | 'admin' | 'delivery';
    profileImage?: string | null;  // ✅ NEW
    vehicleInfo?: { /* ... */ };
    documents?: { /* ... */ };
}
```

---

## Cloudinary Folder Structure

```
FriendsPizzaHut/
├── products/          # Menu item images (pizzas, burgers, etc.)
├── avatars/           # ✅ User profile pictures (NEW)
│   ├── customer_avatar_1.jpg
│   ├── delivery_avatar_2.jpg
│   └── admin_avatar_3.jpg
├── documents/         # Official verification documents
│   ├── driving_license_1.jpg
│   ├── aadhar_card_2.jpg
│   └── vehicle_rc_3.jpg
├── banners/           # Promotional banners
├── stores/            # Store/restaurant images
├── categories/        # Category images
├── offers/            # Offer/discount images
└── general/           # General purpose images
```

**Upload Configuration:**
- **Avatar Type**: `'avatar'`
- **Transformation**: 400x400px, face detection, fill crop
- **Quality**: Auto (optimized)
- **Format**: Auto (webp/jpg based on browser)

---

## Usage Examples

### Frontend

#### Customer Signup with Avatar
```tsx
// User selects avatar image
const handleAvatarPick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],  // Square
        quality: 0.8,
    });
    
    if (!result.canceled) {
        setAvatarImage(result.assets[0].uri);
    }
};

// Upload on signup
const profileImageUrl = await uploadImage(avatarImage, 'avatar');

// Submit signup with avatar
const result = await dispatch(signupThunk({
    name: 'Naitik Kumar',
    email: 'naitik@example.com',
    phone: '9876543210',
    password: 'Password123',
    role: 'customer',
    profileImage: profileImageUrl,  // Cloudinary URL
}));
```

#### Display Avatar Component
```tsx
// With image
<Avatar
    name="Naitik Kumar"
    imageUrl="https://res.cloudinary.com/.../avatar.jpg"
    size={80}
/>

// Without image (shows "NK")
<Avatar
    name="Naitik Kumar"
    imageUrl={null}
    size={80}
/>
```

### Backend

#### Registration with Avatar
```javascript
POST /api/v1/auth/register

Body:
{
    "name": "Naitik Kumar",
    "email": "naitik@example.com",
    "phone": "9876543210",
    "password": "Password123",
    "role": "customer",
    "profileImage": "https://res.cloudinary.com/.../avatar.jpg"
}

Response:
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "user_123",
            "name": "Naitik Kumar",
            "email": "naitik@example.com",
            "role": "customer",
            "profileImage": "https://res.cloudinary.com/.../avatar.jpg"
        },
        "accessToken": "jwt_token...",
        "refreshToken": "refresh_token..."
    }
}
```

---

## Error Handling

### Frontend

#### Upload Failures
```tsx
try {
    profileImageUrl = await uploadImage(avatarImage, 'avatar');
} catch (uploadError) {
    // Ask user if they want to continue without avatar
    Alert.alert(
        'Avatar Upload Failed',
        `Failed to upload avatar: ${uploadError.message}\n\n` +
        'Would you like to continue without a profile picture?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => proceedWithoutAvatar() }
        ]
    );
}
```

**Handled Scenarios:**
1. **Network failure**: Prompt user to retry or continue
2. **Cloudinary error**: Show error message with continue option
3. **File too large**: Show validation error before upload
4. **Invalid file type**: Validate image format before upload
5. **No permissions**: Request permissions with explanation

### Backend

#### Validation
```javascript
// profileImage is optional - no validation error if missing
// If provided, must be valid Cloudinary URL

const userDataToCreate = {
    // ...
    profileImage: profileImage || null,  // Defaults to null
};
```

---

## Testing Checklist

### ✅ Customer Signup
- [ ] Avatar picker appears in signup form
- [ ] Initials display correctly before image selection
- [ ] Image picker opens with correct permissions
- [ ] Selected image previews correctly
- [ ] Remove button works
- [ ] Avatar uploads to `FriendsPizzaHut/avatars/`
- [ ] Signup succeeds with avatar URL
- [ ] Signup succeeds without avatar (null)
- [ ] Loading states work correctly
- [ ] Error handling works (network failure, upload failure)

### ✅ Delivery Boy Signup
- [ ] Avatar picker appears in signup form
- [ ] All features from Customer Signup work
- [ ] Documents upload to `FriendsPizzaHut/documents/`
- [ ] Avatar uploads to `FriendsPizzaHut/avatars/`
- [ ] Both uploads can happen independently
- [ ] Proper error handling for all uploads

### ✅ Avatar Component
- [ ] Displays image when URL provided
- [ ] Displays initials when no URL
- [ ] Single name → single initial (e.g., "N")
- [ ] Multiple names → two initials (e.g., "NK")
- [ ] Color generated consistently from name
- [ ] Size prop works correctly
- [ ] Circular shape with border and shadow
- [ ] Handles edge cases (empty name, special characters)

### ✅ Backend
- [ ] profileImage field accepts Cloudinary URL
- [ ] profileImage field accepts null
- [ ] User document saves with profileImage
- [ ] User response includes profileImage
- [ ] Works for all roles (customer, delivery, admin)

### ✅ Cloudinary
- [ ] Avatars uploaded to correct folder
- [ ] Documents uploaded to correct folder
- [ ] Products uploaded to correct folder
- [ ] No folder mixing or overlap
- [ ] Images accessible via URLs
- [ ] Transformations applied correctly

---

## Future Enhancements

### Phase 1 (Completed ✅)
- [x] Optional avatar upload during signup
- [x] Initials generation fallback
- [x] Cloudinary folder organization
- [x] Avatar component for display

### Phase 2 (Future)
- [ ] Avatar editing in profile settings
- [ ] Crop/rotate image before upload
- [ ] Camera capture option (not just gallery)
- [ ] Avatar compression optimization
- [ ] Social media profile picture import
- [ ] Avatar templates/styles selection

### Phase 3 (Future)
- [ ] Admin dashboard avatar management
- [ ] Bulk avatar moderation
- [ ] Avatar analytics (upload rate, etc.)
- [ ] AI-generated avatar options
- [ ] Avatar badges/borders for premium users

---

## API Reference

### Upload Avatar
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

### Register with Avatar
```
POST /api/v1/auth/register

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password123",
  "role": "customer",
  "profileImage": "https://res.cloudinary.com/.../avatar.jpg"  // Optional
}
```

---

## Support

For issues or questions:
1. Check Cloudinary dashboard for upload logs
2. Check browser console for frontend errors
3. Check backend logs for API errors
4. Verify environment variables are set
5. Test with smaller image sizes if upload fails

**Common Issues:**
- **Upload fails**: Check internet connection, Cloudinary credentials
- **Image not showing**: Verify Cloudinary URL is correct
- **Wrong folder**: Ensure using correct upload type ('avatar' vs 'document')
- **Initials wrong**: Verify name format (spaces, special characters)

---

## Conclusion

The avatar upload feature provides users with a personalized experience while maintaining a clean fallback system with initials. The implementation is scalable, maintainable, and follows best practices for image management and cloud storage organization.
