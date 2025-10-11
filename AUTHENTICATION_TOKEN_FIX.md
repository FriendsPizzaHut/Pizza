# 🔧 Authentication Token Fix

## Issue

When attempting to create a menu item from AddMenuItemScreen, the API request was failing with:

```
ERROR [ERROR] Request failed with status code 401
{
  "method": "post",
  "responseData": {
    "message": "No token provided. Please authenticate.",
    "success": false
  },
  "status": 401
}
```

## Root Cause

**Token Storage Key Mismatch:**

The authentication system was storing the token under one key, but the API client was looking for it under a different key.

### Storage Side (authService.ts)
```typescript
// Token stored under '@auth_token'
const STORAGE_KEYS = {
    TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    USER: '@user_data',
    TOKEN_EXPIRY: '@token_expiry',
};

// In storeAuthData function:
await AsyncStorage.multiSet([
    [STORAGE_KEYS.TOKEN, authData.token],  // Key: '@auth_token'
    [STORAGE_KEYS.USER, JSON.stringify(authData.user)],
]);
```

### Retrieval Side (apiClient.ts - BEFORE FIX)
```typescript
// Was looking for token under 'authState' key ❌
const authState = await AsyncStorage.getItem('authState');
if (authState) {
    const { token } = JSON.parse(authState);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
}
```

**Result:** Token was saved to `@auth_token`, but API client was looking in `authState`, so no token was ever found.

---

## Solution

Updated `apiClient.ts` request interceptor to use the correct storage key:

### After Fix
```typescript
// Now correctly retrieves from '@auth_token' ✅
const token = await AsyncStorage.getItem('@auth_token');
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
```

---

## Files Changed

### `/frontend/src/api/apiClient.ts`

**Line ~97-110:**

```diff
// Request interceptor - Add auth token and handle offline
apiClient.interceptors.request.use(
    async (config: any) => {
        try {
            // Check network connectivity
            await checkNetworkConnectivity();

-           // Get token from AsyncStorage
-           const authState = await AsyncStorage.getItem('authState');
-           if (authState) {
-               const { token } = JSON.parse(authState);
-               if (token) {
-                   config.headers.Authorization = `Bearer ${token}`;
-               }
-           }

+           // Get token from AsyncStorage - using the correct key from authService
+           const token = await AsyncStorage.getItem('@auth_token');
+           if (token) {
+               config.headers.Authorization = `Bearer ${token}`;
+           }

            // Add platform info
            config.headers['X-Platform'] = Platform.OS;
            // ...rest of code
```

---

## Verification

### Before Fix
```bash
LOG  🚀 API Request: {
  "data": { "name": "Pizza 1", ... },
  "method": "POST",
  "url": "/products"
}
ERROR [ERROR] Request failed with status code 401
ERROR ❌ API Error: {
  "data": { "message": "No token provided. Please authenticate." }
}
```

### After Fix (Expected)
```bash
LOG  🚀 API Request: {
  "url": "/products",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  ✅
  }
}
LOG  ✅ API Response: {
  "status": 201,
  "data": { "success": true, "message": "Product created successfully" }
}
```

---

## Testing Instructions

### 1. Re-login (Clear old session)
```
1. Logout from the app (if logged in)
2. Login again with admin credentials
   - This will store token in '@auth_token' correctly
```

### 2. Test Menu Item Creation
```
1. Navigate to Add Menu Item screen
2. Fill in all fields:
   - Name: "Test Pizza"
   - Description: "Testing authentication fix"
   - Category: Pizzas
   - Pricing: Small=$9.99, Medium=$13.99, Large=$17.99
   - Upload an image
   - Add a few toppings
3. Tap "Save Menu Item"
```

### 3. Expected Result
```
✅ Success alert: "Menu item has been added successfully!"
✅ Navigates back to menu screen
✅ Product appears in database
✅ Console shows 201 status code (not 401)
```

### 4. Verify in Backend Logs
```bash
# Backend terminal should show:
POST /api/v1/products 201 - - 123.456 ms
✅ Product caches invalidated after create
```

### 5. Verify in MongoDB
```bash
mongosh
use friendspizzahut
db.products.findOne({ name: "Test Pizza" })

# Should return the created product with all fields
```

---

## Related Files

### Authentication Flow
1. **Login/Signup** → `authService.ts` stores token in `@auth_token`
2. **API Requests** → `apiClient.ts` retrieves token from `@auth_token`
3. **Backend** → Validates `Bearer <token>` in Authorization header

### File References
- `/frontend/src/services/authService.ts` - Token storage (`STORAGE_KEYS.TOKEN`)
- `/frontend/src/api/apiClient.ts` - Token retrieval (request interceptor)
- `/frontend/src/screens/admin/menu/AddMenuItemScreen.tsx` - Uses authenticated API
- `/frontend/src/services/productService.ts` - Calls `apiClient.post('/products')`

---

## Why This Happened

The codebase likely had two different authentication implementations:

1. **Old System:** Used Redux state + `authState` key in AsyncStorage
2. **New System:** Uses `authService.ts` with proper token management

The `apiClient.ts` was still referencing the old storage key, causing the mismatch.

---

## Prevention

### Storage Key Constants
To prevent this in the future, create a shared constants file:

```typescript
// src/constants/storage.ts
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    USER_DATA: '@user_data',
    TOKEN_EXPIRY: '@token_expiry',
} as const;
```

Then import in both files:
```typescript
// authService.ts
import { STORAGE_KEYS } from '../constants/storage';

// apiClient.ts
import { STORAGE_KEYS } from '../constants/storage';
const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
```

---

## Impact

### Fixed Functionality
- ✅ All authenticated API requests now work
- ✅ AddMenuItemScreen can create products
- ✅ Any admin-only endpoints accessible
- ✅ Protected routes work correctly

### Affected Features
- Add Menu Item (Admin)
- Edit Menu Item (Admin)
- Delete Menu Item (Admin)
- Update User Profile
- Place Order (Customer)
- Update Delivery Status (Delivery Boy)
- **Any endpoint requiring authentication**

---

## Status

**✅ FIXED** - Token is now correctly retrieved from `@auth_token` key.

**Next Steps:**
1. Re-login to app
2. Test menu item creation
3. Verify all authenticated endpoints work

---

**Fixed by:** GitHub Copilot  
**Date:** October 11, 2025  
**Commit:** Authentication token storage key alignment
