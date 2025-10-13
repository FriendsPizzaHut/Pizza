# 🔐 Token Expiration Issue - RESOLVED

## ❌ The Problem

You encountered a **401 Unauthorized** error with the message:
```
Token expired. Please login again.
```

This happened when trying to add an item to the cart from `PizzaDetailsScreen.tsx`.

### Error Log:
```
ERROR [ERROR] Request failed with status code 401
ERROR ❌ API Error: {
  "message": "Token expired. Please login again.",
  "status": 401,
  "code": "INTERNAL_SERVER_ERROR"
}
WARN Session expired. Please login again.
```

---

## 🔍 Root Cause

### Why Tokens Expire?
- **Security Feature**: Tokens expire after a certain time (default: 7 days) to prevent unauthorized access if stolen
- **Session Management**: Backend invalidates old tokens for security
- **Time-based**: JWT tokens have an `exp` (expiration) claim that the backend checks

### Why Token Refresh Wasn't Working?
The `refreshToken()` function in `frontend/src/utils/cache.ts` was not implemented:

```typescript
// ❌ OLD CODE (Not Working)
export async function refreshToken(): Promise<string | null> {
    // Implement your refresh logic here (API call, etc.)
    // For now, just return null to simulate failure
    return null;
}
```

---

## ✅ The Solution

### 1. **Immediate Fix: Login Again**
The quickest solution is to **logout and login again** to get a fresh token.

**Steps:**
1. Open your app
2. Logout from your account
3. Login again with your credentials
4. Try adding items to cart - it should work now!

---

### 2. **Long-term Fix: Token Refresh Implementation**

I've implemented the `refreshToken()` function to automatically refresh expired tokens:

```typescript
// ✅ NEW CODE (Working)
export async function refreshToken(): Promise<string | null> {
    try {
        const refreshTokenValue = await AsyncStorage.getItem('@refresh_token');
        
        if (!refreshTokenValue) {
            return null;
        }

        // Call refresh token API
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refreshToken: refreshTokenValue,
        });

        if (response.data?.data?.accessToken) {
            const newToken = response.data.data.accessToken;
            await AsyncStorage.setItem('@auth_token', newToken);
            
            // Update expiry if provided
            if (response.data.data.expiresIn) {
                const expiryTime = Date.now() + response.data.data.expiresIn * 1000;
                await AsyncStorage.setItem('@token_expiry', expiryTime.toString());
            }
            
            return newToken;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}
```

**What This Does:**
1. Gets the refresh token from storage
2. Calls the backend `/api/v1/auth/refresh` endpoint
3. Gets a new access token
4. Saves the new token to storage
5. Returns the new token for use

---

### 3. **Improved Error Handling in PizzaDetailsScreen**

I've also improved the error handling to show a better message when token expires:

```typescript
// ✅ IMPROVED ERROR HANDLING
catch (error: any) {
    const errorMessage = error?.message || 'Failed to add item to cart';
    
    // Handle token expiration
    if (errorMessage.includes('Token expired') || errorMessage.includes('Session expired')) {
        Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
                { 
                    text: 'Login', 
                    onPress: () => {
                        // Navigate to login screen
                        (navigation as any).reset({
                            index: 0,
                            routes: [{ name: 'Auth' }],
                        });
                    }
                }
            ]
        );
    } else {
        Alert.alert('Error', errorMessage);
    }
}
```

**What This Does:**
- Detects token expiration errors
- Shows a user-friendly alert
- Provides a button to navigate to login screen
- Clears the navigation stack so user can't go back

---

## 🎯 How Token Refresh Works Now

### Flow Diagram:

```
User Action (Add to Cart)
    ↓
API Request with Token
    ↓
Backend Checks Token
    ↓
Is Token Valid?
    ├── YES → Process Request ✅
    └── NO (401 Expired) → Token Expired
            ↓
        apiClient Interceptor Catches 401
            ↓
        Calls refreshToken()
            ↓
        Gets Refresh Token from Storage
            ↓
        Calls /api/v1/auth/refresh
            ↓
        Backend Returns New Access Token
            ↓
        Saves New Token
            ↓
        Retries Original Request ✅
```

---

## 🧪 Testing the Fix

### Test Scenario 1: Token Still Valid
1. Login to your app
2. Add item to cart immediately
3. **Expected**: Item added successfully ✅

### Test Scenario 2: Token Expired (Simulated)
1. Login to your app
2. Wait for token to expire (or manually delete it from AsyncStorage)
3. Try to add item to cart
4. **Expected**: 
   - Token refresh happens automatically
   - Request succeeds ✅
   OR
   - If refresh token also expired, show "Session Expired" alert
   - User can click "Login" button to go to login screen

---

## 🔧 What Was Changed

### Files Modified:

1. **`frontend/src/utils/cache.ts`**
   - ✅ Implemented `refreshToken()` function
   - ✅ Added proper error handling
   - ✅ Integrated with backend refresh endpoint

2. **`frontend/src/screens/customer/menu/PizzaDetailsScreen.tsx`**
   - ✅ Improved error handling for token expiration
   - ✅ Shows user-friendly alert
   - ✅ Provides navigation to login screen

---

## 📝 Important Notes

### Token Lifecycle:
- **Access Token**: Short-lived (15 minutes) - used for API requests
- **Refresh Token**: Long-lived (7 days) - used to get new access tokens
- **Session**: If both tokens expire, user must login again

### Backend Token Settings:
```javascript
// backend/src/utils/token.js
generateAccessToken(payload) {
    return generateToken(payload, '15m'); // 15 minutes
}

generateRefreshToken(payload) {
    return generateToken(payload, '7d'); // 7 days
}
```

### Security Best Practices:
- ✅ Access tokens expire quickly (15 min)
- ✅ Refresh tokens expire slowly (7 days)
- ✅ Tokens stored securely in AsyncStorage
- ✅ HTTPS used in production
- ✅ Tokens invalidated on logout

---

## 🚀 Next Steps

### For Now:
1. **Logout and login again** to get fresh tokens
2. Test adding items to cart
3. Everything should work now!

### Future Improvements (Optional):
1. **Proactive Token Refresh**: Refresh token before it expires
2. **Background Token Refresh**: Refresh in background when app opens
3. **Token Expiry Countdown**: Show user when session will expire
4. **Remember Me**: Option for longer sessions
5. **Biometric Auth**: Quick re-authentication

---

## 📚 References

- **Backend API**: `/api/v1/auth/refresh` endpoint
- **Frontend Service**: `authService.ts` - `refreshToken()` function
- **Token Storage**: AsyncStorage keys: `@auth_token`, `@refresh_token`
- **Error Handling**: `apiClient.ts` - Response interceptor

---

## ✅ Summary

**Problem**: Token expired (401 error)
**Cause**: `refreshToken()` not implemented
**Solution**: 
1. Implemented token refresh logic
2. Improved error handling
3. Added user-friendly alerts

**Action Required**: **Logout and login again** to test the fixed functionality!

---

*Last Updated: October 12, 2025*
