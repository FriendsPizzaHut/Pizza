# 🔧 Notification Authentication Fix

## Issue
```
ERROR ❌ [NOTIFICATIONS] Error registering token: Request failed with status code 401
```

## Root Cause
The NotificationService was using plain `axios` instead of the authenticated `apiClient`, so the authentication token wasn't being sent with the device token registration request.

## Fix Applied

### Before:
```typescript
import axios from 'axios';

const response = await axios.post(
    `${API_URL}/device-tokens`,
    { token, userId, userRole, deviceType },
    { timeout: 10000 }
);
```

### After:
```typescript
import apiClient from '../../api/apiClient';

const response = await apiClient.post(
    '/device-tokens',
    { token, userId, userRole, deviceType }
);
```

## Why This Works

The `apiClient` is a pre-configured axios instance that:
1. ✅ Automatically includes authentication token from Redux store
2. ✅ Handles token refresh automatically
3. ✅ Uses correct base URL
4. ✅ Has proper error handling
5. ✅ Includes retry logic for failed requests

## File Modified
- `frontend/src/services/notifications/NotificationService.ts`

## Expected Logs After Fix

```
📤 [NOTIFICATIONS] Registering token with backend...
📍 [NOTIFICATIONS] URL: http://localhost:5000/api/v1/device-tokens
📦 [NOTIFICATIONS] Payload: { userId: '...', userRole: 'admin', deviceType: 'android', tokenLength: 158 }
✅ [NOTIFICATIONS] Token registered successfully
```

## Status
✅ **FIXED** - Device token registration now uses authenticated API client

## Testing
Restart the Expo app and login again. The token should now register successfully with:
```
✅ [NOTIFICATIONS] Token registered successfully
```

---

**Fix completed:** October 16, 2025
