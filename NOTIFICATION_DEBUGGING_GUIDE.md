# 🧪 Notification Delivery Test

## Issue: Notifications Not Appearing

### Diagnosis:
The backend is sending notifications successfully, but they're not appearing on the admin device.

### Possible Causes:

1. **Expo Push Notification Delay** ⏱️
   - Expo Push Notifications are not instant
   - Can take 2-10 seconds to arrive
   - Development builds may have longer delays

2. **Notification Channel Issues** 📱
   - Android requires notification channels
   - Channel might not be configured properly

3. **Foreground vs Background** 🎯
   - Foreground notifications need special handling
   - Background notifications use system UI

### Testing Steps:

#### Test 1: Manual Local Notification (Instant)
This bypasses Expo servers and shows notification immediately:

```typescript
// Add to Admin Dashboard or any screen
import NotificationService from '../services/notifications/NotificationService';

// Test button handler
const testNotification = async () => {
  await NotificationService.showLocalNotification(
    '🧪 Test Notification',
    'If you see this, notification listeners are working!',
    { type: 'order:new', orderId: 'test123' }
  );
};
```

#### Test 2: Backend Ping Endpoint
Test the full flow including Expo servers:

```bash
# Get your token from logs (ExponentPushToken[...])
# Get your auth token from login response

curl -X POST http://192.168.1.9:5000/api/v1/device-tokens/ping \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[h3saqtF7VAGCA9NnHGu4Tw]",
    "title": "🧪 Backend Test",
    "body": "Testing from backend"
  }'
```

#### Test 3: Wait Longer After Order
- Place order
- **Wait 10-30 seconds**
- Check if notification appears

#### Test 4: Check Notification Settings
```bash
# On Android device:
Settings → Apps → Expo Go → Notifications
- Ensure "Show notifications" is ON
- Ensure "Orders" channel is enabled
- Check notification priority is set to High
```

### Expected Logs After Adding Debug:

```
🎧 [NOTIFICATIONS] Setting up notification listeners...
🎧 [NOTIFICATIONS] setupListeners called with callbacks: {hasReceivedCallback: true, hasTapCallback: true}
✅ [NOTIFICATIONS] Foreground listener registered
✅ [NOTIFICATIONS] Tap listener registered
✅ [NOTIFICATIONS] Listeners setup complete
```

**When notification arrives:**
```
📬 [NOTIFICATIONS] Notification received (foreground): {...}
📦 [NOTIFICATIONS] Notification data: {title: "🍕 New Order!", body: "Order #...", data: {...}}
📬 [NotificationInitializer] Foreground notification: {...}
```

### Common Issues:

#### Issue: Expo Push Notification Quota
**Check:** Expo has rate limits for free tier
**Solution:** Usually not an issue for testing, but check Expo dashboard

#### Issue: Invalid Push Token
**Check:** Token should start with `ExponentPushToken[` and be ~41 chars
**Solution:** Current token looks valid: `ExponentPushToken[h3saqtF7VAGCA9NnHGu4Tw]`

#### Issue: Notification Permission Revoked
**Check:** App settings → Notifications
**Solution:** Re-enable notifications in system settings

#### Issue: Do Not Disturb Mode
**Check:** Phone's Do Not Disturb settings
**Solution:** Disable DND or allow Expo Go notifications

### Quick Fix: Add Test Button

Add this to AdminDashboard or OrderManagementScreen:

```typescript
import { Button } from 'react-native';
import NotificationService from '../../services/notifications/NotificationService';

// In your component:
<Button 
  title="🧪 Test Local Notification"
  onPress={async () => {
    console.log('🧪 Testing local notification...');
    await NotificationService.showLocalNotification(
      '🍕 Test Order',
      'This is a local test notification',
      { type: 'order:new', orderId: 'test123' }
    );
  }}
/>
```

If this works → Listeners are fine, issue is with Expo Push delivery
If this doesn't work → Issue is with notification permissions or channel setup

### Next Steps:

1. ✅ Add debug logs (DONE)
2. 🔄 Restart Expo app to see new logs
3. 🔄 Login as admin
4. 🔄 Check for new setup logs
5. 🔄 Place order and **wait 30 seconds**
6. 🔄 If no notification, add test button
7. 🔄 Test local notification
8. 🔄 Check device notification settings

### Backend Verification:

Your backend logs show notification is being sent:
```
[NOTIFICATION] Notifying admins about new order: 68f00211f0c0ada6dfd5d1f6
[NOTIFICATION] Sent 1 notifications of type ORDER_NEW
```

This means:
- ✅ Backend found the device token
- ✅ Backend called Expo Push API
- ✅ Expo accepted the notification
- ⏱️ Waiting for Expo to deliver to device

### Expo Push Receipt Check:

The backend should check push receipts to see if Expo delivered successfully. Let me check if that's implemented...

Looking at the expoService.js, it returns `tickets` but doesn't check receipts. This is normal - receipts come later.

### Most Likely Cause:

**Expo Push Notification Delay** - Especially in development, notifications can take 10-30 seconds to arrive. The notification was sent successfully, just needs time to be delivered by Expo's servers.

### Action Items:

1. Restart Expo app to get new debug logs
2. Login as admin
3. Look for listener setup logs
4. Place order
5. **Wait patiently for 30 seconds**
6. If still no notification, add test button for local notification

---

**Status:** Investigating delivery delay
**Next:** Restart app and wait longer for notifications to arrive
