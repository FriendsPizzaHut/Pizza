# Avatar Upload Debug Guide

## 🔍 Debugging Steps

### Step 1: Check if Upload is Starting
**Location**: Frontend - ProfileScreen.tsx
When you click the camera icon and select an image, check the console for:
```
📤 Uploading avatar to Cloudinary...
```

If you DON'T see this, the image picker might not be working.

---

### Step 2: Check Cloudinary Upload
**Location**: Frontend - imageUpload.ts
Look for these console logs:
```
📤 Uploading directly to Cloudinary...
☁️  Cloud: <your-cloud-name>
📋 Preset: <your-preset>
📁 Folder: FriendsPizzaHut/avatars
🚀 Uploading to: https://api.cloudinary.com/v1_1/...
✅ Upload successful in X.XXs!
🔗 URL: https://res.cloudinary.com/...
```

**If upload fails**, check:
- Is Cloudinary configured in `.env`?
- Are `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` set?
- Is your internet connection working?

---

### Step 3: Check Backend API Call
**Location**: Frontend - userService.ts
Look for:
```
📤 [USER SERVICE] Updating profile image
  - User ID: <userId>
  - Image URL: https://res.cloudinary.com/...
✅ [USER SERVICE] Profile image updated successfully
💾 [USER SERVICE] Updated stored user data
```

**If you DON'T see this**, check:
- Is the backend server running?
- Is `userId` valid in Redux state?
- Check network tab for API call to `/users/:id/profile-image`

---

### Step 4: Check Backend Processing
**Location**: Backend - userController.js & userService.js
Look for:
```
🖼️ [UPDATE PROFILE IMAGE] Request received
  - User ID: <userId>
  - Profile Image URL: https://res.cloudinary.com/...
  - Authenticated User: <userId>
  
🖼️ [USER SERVICE] Updating profile image for user: <userId>
  - New Profile Image: https://res.cloudinary.com/...
  
✅ [USER SERVICE] Profile image updated successfully
  - User: <name>
  - New Profile Image: https://res.cloudinary.com/...
  
✅ [UPDATE PROFILE IMAGE] Profile image updated successfully
```

**If you DON'T see this**, check:
- Is the route correctly set up?
- Is authentication working?
- Check MongoDB connection

---

### Step 5: Check MongoDB Update
**How to check**:
1. Open MongoDB Compass or Mongo Shell
2. Find your user document
3. Check if `profileImage` field exists and has Cloudinary URL

**Using MongoDB Shell**:
```bash
# Connect to database
mongosh

# Switch to your database
use pizza_delivery  # or your database name

# Find your user
db.users.findOne({ _id: ObjectId("your-user-id") })

# Check profileImage field
db.users.findOne(
  { email: "your-email@example.com" },
  { name: 1, email: 1, profileImage: 1 }
)
```

**Expected Result**:
```json
{
  "_id": "...",
  "name": "Your Name",
  "email": "your@email.com",
  "profileImage": "https://res.cloudinary.com/..."
}
```

---

### Step 6: Check AsyncStorage Update
**Location**: Frontend - userService.ts
After backend update, check for:
```
💾 [USER SERVICE] Updated stored user data
```

**Manual Check** (in React Native Debugger):
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check stored user data
AsyncStorage.getItem('@user_data').then(data => {
  console.log('Stored user:', JSON.parse(data));
});
```

---

### Step 7: Check Redux Update
**Location**: Frontend - ProfileScreen.tsx
After upload, Redux should be updated. Check:
```javascript
// In ProfileScreen or any component
const { profileImage } = useSelector((state: RootState) => state.auth);
console.log('Redux profileImage:', profileImage);
```

---

### Step 8: Check App Reload
1. Close the app completely
2. Reopen the app
3. Login again
4. Navigate to Profile

**Check console for**:
```
// During checkAuthStatusThunk
Loading user from AsyncStorage...
User data: { ..., profileImage: "https://res.cloudinary.com/..." }
```

---

## 🐛 Common Issues

### Issue 1: "Avatar changes but reverts after reload"
**Cause**: Backend not being called or database not updating
**Solution**:
- Check Step 3-5 above
- Verify backend API is being called
- Check MongoDB for `profileImage` field

### Issue 2: "Upload fails with 'Cloudinary not configured'"
**Cause**: Missing environment variables
**Solution**:
```bash
# Check frontend/.env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset

# Restart Expo
cd frontend
npm start -- --clear
```

### Issue 3: "Backend returns 401 Unauthorized"
**Cause**: Authentication token issue
**Solution**:
- Check if user is logged in
- Verify token is valid
- Check Redux state for `token`

### Issue 4: "Backend returns 403 Forbidden"
**Cause**: Trying to update another user's profile
**Solution**:
- Verify `userId` matches logged-in user
- Check backend logs for user ID mismatch

### Issue 5: "Image shows temporarily but avatar stays as initials after reload"
**Cause**: Database updated but AsyncStorage not synced
**Solution**:
- Check Step 6 above
- Verify userService.ts updates AsyncStorage
- Clear app data and login again

---

## 🧪 Testing Checklist

### ✅ Upload Test
- [ ] Select image from gallery
- [ ] See loading indicator
- [ ] See success message
- [ ] Avatar shows new image immediately

### ✅ Backend Test
- [ ] Check backend logs for API call
- [ ] Check MongoDB for updated profileImage
- [ ] Verify Cloudinary URL is saved

### ✅ Persistence Test
- [ ] Close app completely
- [ ] Reopen app
- [ ] Login again
- [ ] Navigate to Profile
- [ ] **Avatar should show uploaded image (not initials)**

### ✅ Multi-Screen Test
- [ ] Avatar shows on Profile screen
- [ ] Avatar shows on Account Settings
- [ ] Avatar shows in navigation (if applicable)

---

## 🔧 Quick Debug Commands

### Frontend Console
```javascript
// Check Redux state
console.log('Auth State:', store.getState().auth);

// Check AsyncStorage
AsyncStorage.getItem('@user_data').then(d => console.log('Stored:', d));

// Check current profileImage
const { profileImage } = useSelector(state => state.auth);
console.log('Current profileImage:', profileImage);
```

### Backend Logs
```bash
# Watch backend logs
cd backend
npm run dev

# Or check logs file
tail -f logs/combined-*.log
```

### Database Check
```bash
mongosh

use pizza_delivery

# Find user by email
db.users.findOne({ email: "admin@example.com" })

# Check all users with profileImage
db.users.find({ profileImage: { $exists: true } }, { name: 1, profileImage: 1 })
```

---

## 📊 Expected Flow

```
User clicks camera icon
        ↓
Picks image from gallery
        ↓
Confirms upload
        ↓
[1] Upload to Cloudinary ✅
    → Console: "📤 Uploading to Cloudinary..."
    → Console: "✅ Upload successful!"
    → Returns: https://res.cloudinary.com/...
        ↓
[2] Call Backend API ✅
    → Console: "📤 [USER SERVICE] Updating profile image"
    → PUT /api/v1/users/:id/profile-image
        ↓
[3] Update MongoDB ✅
    → Console: "🖼️ [USER SERVICE] Updating profile image"
    → User.profileImage = cloudinaryUrl
        ↓
[4] Update AsyncStorage ✅
    → Console: "💾 [USER SERVICE] Updated stored user data"
    → @user_data updated with profileImage
        ↓
[5] Update Redux ✅
    → dispatch(updateProfileImageAction(cloudinaryUrl))
    → state.auth.profileImage = cloudinaryUrl
        ↓
[6] UI Updates ✅
    → Avatar component re-renders
    → Shows new image
        ↓
[7] App Reload Test ✅
    → Close app → Reopen → Login
    → checkAuthStatusThunk loads from AsyncStorage
    → Redux state restored with profileImage
    → Avatar shows persisted image ✅
```

---

## 🚨 If Still Not Working

1. **Clear all data and test fresh**:
```bash
# Frontend - Clear app data
cd frontend
rm -rf node_modules/.cache
npm start -- --clear

# Backend - Restart
cd backend
npm run dev
```

2. **Add temporary debug logs**:
In ProfileScreen.tsx after upload:
```typescript
console.log('=== DEBUG INFO ===');
console.log('User ID:', userId);
console.log('Cloudinary URL:', cloudinaryUrl);
console.log('Redux profileImage:', profileImage);

AsyncStorage.getItem('@user_data').then(data => {
    console.log('AsyncStorage user:', data);
});
```

3. **Check database directly**:
```bash
mongosh
use pizza_delivery
db.users.findOne({ email: "your-email" }, { profileImage: 1 })
```

4. **Test with Postman**:
```
PUT http://localhost:5000/api/v1/users/:userId/profile-image
Authorization: Bearer <your-token>
Body:
{
  "profileImage": "https://res.cloudinary.com/test/image.jpg"
}
```

---

**Next**: Follow the steps above and tell me which step fails or shows an error!
