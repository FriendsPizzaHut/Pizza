# 🔔 Push Notification Testing Guide

## Quick Start (3 Steps)

### Step 1: Access the Debug Screen

**Option A: Direct Navigation (Easiest)**
1. Open your app and login as **Admin**
2. In your code, add a button temporarily to any admin screen:

```tsx
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Inside your component:
const navigation = useNavigation<any>();

<TouchableOpacity 
  style={{
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  }}
  onPress={() => navigation.navigate('NotificationDebug')}
>
  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
    🔔 Test Notifications
  </Text>
</TouchableOpacity>
```

**Option B: Via React Native Debugger**
```javascript
// In any admin screen, call:
props.navigation.navigate('NotificationDebug');
```

---

### Step 2: Run the Tests

Once you're on the **Notification Debug Screen**, you'll see:

#### **Device Information Panel**
- Shows your device model, platform, and physical device status
- **Important**: Must be a physical device (not emulator) for push notifications

#### **7 Test Buttons** (Run in order):

1. **🧪 Test 1: Test Permissions**
   - Checks notification permissions
   - Requests permissions if not granted
   - **Expected**: Should show "granted" status

2. **🧪 Test 2: Get Push Token**
   - Gets your Expo push token
   - **Expected**: Token starting with `ExponentPushToken[...]`
   - Token length should be ~40-60 characters

3. **🧪 Test 3: Send Local Notification** ⭐ **MOST IMPORTANT**
   - Sends instant notification (bypasses Expo servers)
   - **Expected**: Notification appears within 1-2 seconds
   - **If this fails**: Permission or listener issue
   - **If this works**: Listeners are working correctly!

4. **🧪 Test 4: Register with Backend**
   - Registers your device token with backend
   - **Expected**: "Token registered successfully" message

5. **🧪 Test 5: Send from Backend (Ping)**
   - Backend sends you a test notification via Expo
   - **Expected**: Notification within 5-30 seconds
   - **Note**: Can be slower in development (Expo delivery delay)

6. **🧪 Test 6: Test Listeners**
   - Sets up temporary notification listeners
   - **Expected**: Alerts when notification arrives
   - Listeners active for 2 minutes

7. **🧪 Test 7: Run Full Flow**
   - Runs all tests automatically in sequence
   - **Expected**: Complete flow with notifications appearing

---

### Step 3: Test Real Order Flow

After all tests pass, test the actual feature:

#### **Setup:**
1. Keep Admin app open and logged in
2. Open Customer app on another device/account

#### **Test:**
1. Customer: Place an order from customer app
2. Admin: Should receive notification instantly
3. Admin: Check notification content (order details)
4. Admin: Tap notification → Should navigate to order details

---

## 📋 Interpreting Results

### ✅ Success Signs:
- Test 1: Permission status = "granted"
- Test 2: Valid ExponentPushToken received
- Test 3: Local notification appears immediately
- Test 5: Backend notification arrives (may take 10-30 seconds)
- Real Order: Admin gets notification when customer orders

### ❌ Common Issues:

#### **Test 3 Fails (Local notification doesn't appear)**
**Diagnosis**: Permission or listener configuration issue
**Fix**:
1. Check device notification settings:
   - Settings → Apps → Expo Go → Notifications → Enable all
2. Disable "Do Not Disturb" mode
3. Restart app and try again
4. Check logs for permission status

#### **Test 3 Works, Test 5 Doesn't**
**Diagnosis**: Expo Push delivery delay or token issue
**Fix**:
1. Wait 30-60 seconds (Expo can be slow in development)
2. Check token format: Should start with `ExponentPushToken[`
3. Verify backend logs show notification sent
4. Check Expo dashboard for delivery errors
5. **Note**: This is normal in development, production is faster

#### **Test 2 Fails (No token)**
**Diagnosis**: Not a physical device or Expo config issue
**Fix**:
1. Ensure using physical device (not emulator)
2. Check internet connection
3. Restart Expo development server
4. Check `app.json` for proper Expo configuration

#### **Test 4 Fails (Backend registration fails)**
**Diagnosis**: Backend API or authentication issue
**Fix**:
1. Verify you're logged in as admin
2. Check backend server is running
3. Check backend logs for errors
4. Verify `/api/v1/device-tokens` route exists

---

## 📱 Debug Logs Panel

At the bottom of the debug screen, you'll see a **real-time log viewer**:

- **Green text on dark background**: All operations logged
- **Timestamps**: Each log has a timestamp
- **Emoji prefixes**: 
  - 🧪 = Test operation
  - ✅ = Success
  - ❌ = Error
  - 📬 = Notification received
  - 📤 = Sending notification
  - 🎫 = Token operation

**Important Logs to Watch:**
```
✅ [NOTIFICATIONS] Token registered successfully
📬 Notification received (foreground)
✅ [NOTIFICATIONS] Permission granted
🎫 Current Token: ExponentPushToken[...]
```

---

## 🔍 Backend Verification

While testing, check backend terminal for these logs:

```bash
# When admin registers token:
✅ [NOTIFICATIONS] Token registered successfully

# When customer places order:
[NOTIFICATION] Preparing to notify admins about new order
[NOTIFICATION] Found X admin device tokens
[NOTIFICATION] Sending notifications to X admins...
[NOTIFICATION] Sent 1 notifications of type ORDER_NEW
```

---

## 🚀 Production Build Testing

After development testing passes:

1. Build production APK/IPA:
   ```bash
   cd frontend
   eas build --platform android --profile production
   ```

2. Install on physical device
3. Test again - should be **much faster** in production
4. Delivery time should be 1-3 seconds (vs 10-30 seconds in dev)

---

## 📊 What Each Test Validates

| Test | Validates | Critical? |
|------|-----------|-----------|
| Test 1 | Device permissions | ✅ Yes |
| Test 2 | Expo token generation | ✅ Yes |
| Test 3 | Local notification listeners | ✅ **MOST CRITICAL** |
| Test 4 | Backend integration | ✅ Yes |
| Test 5 | Full Expo Push flow | ⚠️ May be slow |
| Test 6 | Listener callbacks | ℹ️ Diagnostic |
| Test 7 | Complete automation | ℹ️ Convenience |

---

## 💡 Pro Tips

1. **Always run Test 3 first** - It immediately tells you if listeners work
2. **Be patient with Test 5** - Expo development push can take 30+ seconds
3. **Keep logs open** - They show exactly what's happening
4. **Test with app in background** - Close app and see if notification appears
5. **Check device notification settings** - Ensure all permissions enabled
6. **Use physical device** - Emulators don't support push notifications

---

## 🎯 Success Criteria

Your notification system is working when:

✅ Test 3 shows notification immediately  
✅ Test 5 shows notification (even if delayed)  
✅ Backend logs confirm "Sent X notifications"  
✅ Customer order triggers admin notification  
✅ Tapping notification navigates to order details  
✅ Notifications work with app in foreground AND background  

---

## 📞 Need Help?

If tests fail, check:
1. **Debug logs at bottom of screen** - Shows exact error
2. **Backend terminal** - Shows if notification sent
3. **Device notification settings** - Must be enabled
4. **Internet connection** - Required for Expo Push
5. **Physical device** - Must not be emulator

Share the debug logs and backend logs for troubleshooting!
