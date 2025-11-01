# Avatar Feature - Quick Reference Card

## 🚀 Quick Start

### Use Avatar Component Anywhere
```tsx
import Avatar from '../components/common/Avatar';

<Avatar
    name="Naitik Kumar"
    imageUrl={user.profileImage}
    size={80}
/>
```

---

## 📂 File Locations

### New Files Created
```
frontend/
  src/
    components/
      common/
        Avatar.tsx                    ✅ NEW - Avatar display component
    utils/
      avatarUtils.ts                  ✅ NEW - Initials & color logic

Documentation/
  AVATAR_FEATURE_DOCUMENTATION.md     ✅ Complete documentation
  AVATAR_IMPLEMENTATION_SUMMARY.md    ✅ Quick summary
  AVATAR_FLOW_VISUAL.md              ✅ Visual flow diagram
```

### Modified Files
```
frontend/
  src/
    components/
      auth/
        Signup.tsx                    ✅ Avatar upload added
        DeliveryBoySignup.tsx         ✅ Avatar upload added
    services/
      authService.ts                  ✅ profileImage type added

backend/
  src/
    services/
      authService.js                  ✅ profileImage parameter added
    models/
      User.js                         ✅ Already had profileImage field
```

---

## 🎨 Avatar Component Props

```typescript
interface AvatarProps {
    name: string;              // User's name (REQUIRED)
    imageUrl?: string | null;  // Cloudinary URL or null
    size?: number;             // Diameter in px (default: 80)
    style?: ViewStyle;         // Custom styles
    fontSize?: number;         // Initials font size
}
```

### Examples
```tsx
// Large avatar with image
<Avatar name="John Doe" imageUrl="https://..." size={120} />

// Medium avatar with initials
<Avatar name="Naitik Kumar" imageUrl={null} size={80} />

// Small avatar
<Avatar name="Mike" size={40} />

// Custom styling
<Avatar 
    name="Sarah" 
    size={100}
    style={{ borderColor: '#0C7C59', borderWidth: 3 }}
/>
```

---

## 🔧 Utility Functions

### Generate Initials
```typescript
import { generateInitials } from '../utils/avatarUtils';

generateInitials("Naitik Kumar")  // "NK"
generateInitials("Naitik")        // "N"
generateInitials("John Doe Smith") // "JS"
```

### Get Avatar Color
```typescript
import { getAvatarColor } from '../utils/avatarUtils';

getAvatarColor("Naitik Kumar")  // "#4ECDC4" (consistent)
```

### Check if URL
```typescript
import { isAvatarUrl } from '../utils/avatarUtils';

isAvatarUrl("https://cloudinary.com/...")  // true
isAvatarUrl("NK")                          // false
isAvatarUrl(null)                          // false
```

### Get Complete Avatar Data
```typescript
import { getAvatarData } from '../utils/avatarUtils';

const data = getAvatarData("Naitik Kumar", "https://...");
// Returns:
// {
//   type: 'image',
//   content: 'https://...',
//   color: '#ffffff'
// }

const data = getAvatarData("Naitik Kumar", null);
// Returns:
// {
//   type: 'initials',
//   content: 'NK',
//   color: '#4ECDC4'
// }
```

---

## 📤 Upload Avatar

### Frontend (During Signup)
```tsx
import { uploadImage } from '../../utils/imageUpload';

// Select image
const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],  // Square
    quality: 0.8,
});

if (!result.canceled) {
    const imageUri = result.assets[0].uri;
    
    // Upload to Cloudinary
    const cloudinaryUrl = await uploadImage(imageUri, 'avatar');
    
    // Include in signup
    dispatch(signupThunk({
        name: "Naitik Kumar",
        email: "naitik@example.com",
        phone: "9876543210",
        password: "Password123",
        role: "customer",
        profileImage: cloudinaryUrl,  // ✅ Avatar URL
    }));
}
```

### Backend (Accept in Registration)
```javascript
// backend/src/services/authService.js
export const registerUser = async (userData) => {
    const { 
        name, 
        email, 
        phone, 
        password, 
        role,
        profileImage,  // ✅ Accept avatar URL
        // ...
    } = userData;

    const userDataToCreate = {
        name,
        email,
        phone,
        password,
        role: role || 'customer',
        profileImage: profileImage || null,  // ✅ Store avatar
        // ...
    };

    const user = await User.create(userDataToCreate);
    // ...
};
```

---

## 🗂️ Cloudinary Folders

### Upload Types → Folders
```
'avatar'   → FriendsPizzaHut/avatars/
'document' → FriendsPizzaHut/documents/
'product'  → FriendsPizzaHut/products/
'banner'   → FriendsPizzaHut/banners/
'store'    → FriendsPizzaHut/stores/
'category' → FriendsPizzaHut/categories/
'offer'    → FriendsPizzaHut/offers/
'general'  → FriendsPizzaHut/general/
```

### Usage
```typescript
// Upload avatar
await uploadImage(imageUri, 'avatar');
// Goes to: FriendsPizzaHut/avatars/

// Upload document
await uploadImage(imageUri, 'document');
// Goes to: FriendsPizzaHut/documents/

// Upload product
await uploadImage(imageUri, 'product');
// Goes to: FriendsPizzaHut/products/
```

---

## 🎨 Color Palette (15 Colors)

Initials are displayed with these colors (consistent per name):

```
#FF6B6B  Red
#4ECDC4  Teal
#45B7D1  Blue
#FFA07A  Light Salmon
#98D8C8  Mint
#F7DC6F  Yellow
#BB8FCE  Purple
#85C1E2  Sky Blue
#F8B739  Orange
#52B788  Green
#E63946  Dark Red
#457B9D  Steel Blue
#F77F00  Burnt Orange
#06AED5  Cyan
#DD1C1A  Crimson
```

Color is picked based on name hash for consistency.

---

## ✅ Testing Checklist

### Customer Signup
- [ ] Avatar picker shows with initials
- [ ] Can select image from gallery
- [ ] Image previews correctly
- [ ] Can remove selected image
- [ ] Upload shows loading state
- [ ] Signup works with avatar
- [ ] Signup works without avatar
- [ ] Avatar goes to `FriendsPizzaHut/avatars/`

### Delivery Boy Signup
- [ ] All customer tests pass
- [ ] Documents go to `FriendsPizzaHut/documents/`
- [ ] Avatar goes to `FriendsPizzaHut/avatars/`
- [ ] Both uploads work independently

### Avatar Component
- [ ] Shows image when URL provided
- [ ] Shows initials when no URL
- [ ] Initials correct for different names
- [ ] Colors consistent per name
- [ ] Size prop works
- [ ] Custom styles work

---

## 🐛 Common Issues & Solutions

### Image not uploading
**Check:**
- Internet connection
- Cloudinary credentials in `.env`
- Image picker permissions

**Solution:**
```bash
# Check frontend .env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Check backend .env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Wrong folder in Cloudinary
**Check:**
- Upload type parameter: `uploadImage(uri, 'avatar')` not `'document'`

**Solution:**
```typescript
// For avatars
await uploadImage(imageUri, 'avatar');  // ✅ Correct

// For documents
await uploadImage(imageUri, 'document');  // ✅ Correct
```

### Initials not showing
**Check:**
- Name field has value
- Avatar component imported correctly

**Solution:**
```tsx
// Make sure name is passed
<Avatar name={formData.name || 'User'} />
```

---

## 📊 Data Flow

```
User Input → Image Picker → Upload → Cloudinary → URL → Backend → Database
```

### Details
1. **User selects image** → Local URI
2. **Upload to Cloudinary** → Type: 'avatar'
3. **Get Cloudinary URL** → https://res.cloudinary.com/...
4. **Send to backend** → profileImage field
5. **Store in database** → User.profileImage
6. **Return to frontend** → user.profileImage
7. **Display with Avatar component** → Everywhere in app

---

## 🔗 Related Documentation

- **Complete Docs**: `AVATAR_FEATURE_DOCUMENTATION.md`
- **Implementation Summary**: `AVATAR_IMPLEMENTATION_SUMMARY.md`
- **Visual Flow**: `AVATAR_FLOW_VISUAL.md`
- **Cloudinary Org**: `CLOUDINARY_ORGANIZATION.md`

---

## 📞 Need Help?

1. Check console logs (frontend & backend)
2. Verify Cloudinary dashboard for uploads
3. Test with smaller images first
4. Ensure all env variables set
5. Check network connectivity

---

**Last Updated**: Implementation Complete ✅  
**Status**: Ready for Production 🚀
