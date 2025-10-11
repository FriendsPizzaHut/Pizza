# 🔄 Re-Login & Test Checklist

## 🚨 IMPORTANT: Must Re-Login!

The authentication token fix requires you to **logout and login again** to store the token correctly.

---

## Step-by-Step Instructions

### 1️⃣ Logout from App
```
1. If logged in, open the app
2. Navigate to Profile/Settings
3. Tap "Logout"
4. Confirm logout
```

**Why?** The old session doesn't have the token in the correct storage location.

---

### 2️⃣ Login as Admin
```
1. Open Login screen
2. Enter admin credentials:
   Email: admin@friendspizzahut.com (or your admin email)
   Password: your_admin_password
3. Tap "Sign In"
4. Wait for success message
```

**What happens:** Token is now stored in `@auth_token` ✅

---

### 3️⃣ Navigate to Add Menu Item
```
1. From admin dashboard, tap "Menu Management"
2. Tap "Add Menu Item" button
3. Screen should load without errors
```

---

### 4️⃣ Fill Out Form
```
Name: "Auth Test Pizza"
Description: "Testing authentication fix"
Category: Pizzas

Pricing:
- Small: $10.99
- Medium: $14.99
- Large: $18.99

Image: Tap "Upload Product Image" → Select any image

Toppings: Tap "Add Topping"
- Add: Mushrooms
- Add: Mozzarella
- Add: Tomato Sauce

Toggles:
- Vegetarian: ON
- Available: ON (default)
```

---

### 5️⃣ Submit Form
```
1. Tap "Save Menu Item" button
2. Watch console logs (if in dev mode)
```

---

### 6️⃣ Expected Success ✅

#### Console Logs Should Show:
```bash
LOG  🚀 API Request: {
  "url": "/products",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer eyJhbGc..."  ← TOKEN PRESENT!
  }
}

LOG  ✅ API Response: {
  "status": 201,
  "data": {
    "success": true,
    "message": "Product created successfully",
    "data": { ...product }
  }
}
```

#### UI Should Show:
```
✅ Success alert: "Menu item has been added successfully!"
✅ Navigate back to menu screen
✅ New item visible in menu list
```

---

### 7️⃣ If Still Getting 401 Error

#### Check Backend Logs
```bash
# Backend terminal should show:
POST /api/v1/products 201 - - 123ms   ✅ GOOD
POST /api/v1/products 401 - - 45ms    ❌ BAD
```

#### Verify Token in Storage
```bash
# In React Native Debugger console:
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('@auth_token').then(token => console.log('Token:', token));

# Should output:
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Check apiClient.ts Line 103
```typescript
// Should be:
const token = await AsyncStorage.getItem('@auth_token');  ✅

// NOT:
const authState = await AsyncStorage.getItem('authState');  ❌
```

---

### 8️⃣ Backend Verification

#### Check MongoDB
```bash
mongosh
use friendspizzahut
db.products.findOne({ name: "Auth Test Pizza" })

# Should return the created product
```

#### Check Redis Cache
```bash
redis-cli
KEYS products:*

# Should be empty (invalidated after creation)
```

---

## 🎯 Quick Test Matrix

| Action | Expected Result | Status |
|--------|----------------|--------|
| Logout from app | Success message | [ ] |
| Login as admin | Navigate to dashboard | [ ] |
| Open Add Menu Item | Screen loads | [ ] |
| Fill form with data | No errors | [ ] |
| Upload image | Preview shows | [ ] |
| Add toppings | Modal works | [ ] |
| Submit form | 201 status (not 401) | [ ] |
| Success alert | Shows & navigates back | [ ] |
| Check MongoDB | Product exists | [ ] |
| Check menu list | Item visible | [ ] |

---

## 🐛 Troubleshooting

### Issue: Still getting 401
**Solution:**
1. Close app completely (kill process)
2. Clear app data (Settings → Apps → Friends Pizza → Clear Storage)
3. Restart app
4. Login again

### Issue: Token is null
**Solution:**
1. Check `authService.ts` line 442 - should be `STORAGE_KEYS.TOKEN`
2. Check login response has `token` field
3. Check backend login endpoint returns `accessToken` or `token`

### Issue: Backend not receiving token
**Solution:**
1. Check `apiClient.ts` line ~103 uses `@auth_token` key
2. Verify Bearer prefix: `Bearer ${token}`
3. Check backend middleware expects `Authorization` header

### Issue: Login works but menu creation fails
**Solution:**
1. Check if admin role is correct: `user.role === 'admin'`
2. Backend logs should show: `POST /api/v1/products`
3. Check backend middleware: `protect` → `adminOnly`

---

## ✅ Success Criteria

**All must pass:**
- [ ] Can login as admin without errors
- [ ] Token stored in `@auth_token` key
- [ ] API requests include `Authorization: Bearer <token>` header
- [ ] Create menu item returns 201 (not 401)
- [ ] Success alert appears
- [ ] Product saved in MongoDB
- [ ] Navigation works correctly
- [ ] No console errors

---

## 📝 Notes

**Why re-login is required:**
- Old sessions stored token in wrong location (`authState` key)
- New sessions store token correctly (`@auth_token` key)
- Simply refreshing won't fix it - must logout/login

**Can I skip re-login?**
- No - the token must be in the correct storage location
- Manual fix: Use React Native Debugger to copy token from old key to new key
- Easier: Just logout and login again (takes 10 seconds)

---

**Status:** Ready to test  
**Priority:** HIGH - blocks menu creation  
**Time to fix:** 30 seconds (logout + login)
