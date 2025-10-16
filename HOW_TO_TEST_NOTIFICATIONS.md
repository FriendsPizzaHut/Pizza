# 🎯 How to Test Push Notifications - Complete Guide

## ✅ Prerequisites Check

Before testing, ensure:
- ✅ Backend server is running (`npm start` in backend folder)
- ✅ Frontend app is running (`npm start` in frontend folder)
- ✅ Using a **physical device** (not emulator)
- ✅ Device has internet connection
- ✅ You have both admin and customer login credentials

---

## 🚀 Testing Method 1: Using Debug Screen (Recommended)

### Step 1: Open the Debug Screen

1. **Start the frontend app**:
   ```bash
   cd frontend
   npm start
   ```

2. **Login as Admin** on your physical device

3. **Access Debug Screen**:
   - You should see a **"🔔 Test Notifications"** button on the dashboard
   - Tap it to open the Notification Debug Screen
   
   **If you don't see the button**: 
   - Check if `DashboardScreen.tsx` was updated
   - Try restarting the Expo app

---

### Step 2: Run Individual Tests

On the **Notification Debug Screen**, you'll see 7 test buttons. Run them in order:

#### **Test 1: Test Permissions** ✅
**What it does**: Checks and requests notification permissions

**How to run**: Tap "1️⃣ Test Permissions"

**Expected Result**:
```
🧪 TEST 1: Checking Permissions...
Current status: undetermined (or granted)
Requesting permissions...
New status: granted
✅ Permissions already granted
```

**If it fails**: 
- Go to device Settings → Apps → Expo Go → Notifications
- Enable all notification permissions
- Try again

---

#### **Test 2: Get Push Token** ✅
**What it does**: Gets your Expo push notification token

**How to run**: Tap "2️⃣ Get Push Token"

**Expected Result**:
```
🧪 TEST 2: Getting Push Token...
✅ Token received: ExponentPushToken[xxxxxx]...
Token length: 47
Valid format: true
```

**If it fails**:
- Ensure using physical device (not emulator)
- Check internet connection
- Restart Expo development server

---

#### **Test 3: Send Local Notification** ⭐ **MOST IMPORTANT**
**What it does**: Sends an instant notification directly on your device (bypasses Expo servers)

**How to run**: Tap "3️⃣ Send Local Notification"

**Expected Result**:
```
🧪 TEST 3: Scheduling Local Notification...
✅ Local notification scheduled
⏰ Should appear in 1-2 seconds
```

**Within 1-2 seconds, you should see**:
- A notification banner at the top of your screen
- Title: "🧪 Local Test"
- Body: "This is a local notification - if you see this, listeners work!"

**Why this is critical**:
- If this works → Your device permissions and listeners are configured correctly ✅
- If this fails → There's a permission or listener setup issue ❌

**If it fails**:
- Disable "Do Not Disturb" mode
- Check notification settings for Expo Go app
- Restart the app and try again

---

#### **Test 4: Register with Backend** ✅
**What it does**: Registers your device token with the backend server

**How to run**: Tap "4️⃣ Register with Backend"

**Expected Result**:
```
🧪 TEST 4: Registering Token with Backend...
User ID: 67xxxxxxxxxxxxxxxxxx
Role: admin
Token: ExponentPushToken[xxxxx]...
✅ Token registered with backend
```

**If it fails**:
- Ensure you're logged in
- Check backend server is running
- Check backend terminal for errors

---

#### **Test 5: Send from Backend (Ping)** ⚠️
**What it does**: Backend sends you a test notification via Expo Push Notification service

**How to run**: Tap "5️⃣ Send from Backend (Ping)"

**Expected Result**:
```
🧪 TEST 5: Sending Test from Backend...
📤 Calling backend ping endpoint...
✅ Backend sent notification
⏰ Wait 5-30 seconds for delivery...
```

**Then wait 5-30 seconds** for the notification to arrive.

**Important Notes**:
- ⚠️ This can be **slow in development** (10-30 seconds is normal)
- Expo Push Notification service has delays in development mode
- Production builds are much faster (1-3 seconds)

**Check Backend Terminal**:
```bash
[NOTIFICATION] Sending test notification to 1 device
✅ Successfully sent 1 notifications
```

**If notification doesn't arrive after 60 seconds**:
- Check token format (should start with `ExponentPushToken[`)
- Check backend logs for Expo API errors
- Verify Expo Push service status
- This is often just a delay - be patient!

---

#### **Test 6: Test Listeners** ℹ️
**What it does**: Sets up temporary notification listeners and alerts you when notifications arrive

**How to run**: Tap "6️⃣ Test Listeners"

**Expected Result**:
```
🧪 TEST 6: Testing Notification Listeners...
🎧 Setting up temporary listeners...
✅ Temporary listeners active
🧪 Now send a test notification (Test 3 or 5)
```

**Next steps**:
- Run Test 3 or Test 5 again
- When notification arrives, you'll see an alert popup
- Listeners auto-remove after 2 minutes

---

#### **Test 7: Run Full Flow** 🚀
**What it does**: Runs all tests automatically in sequence

**How to run**: Tap "🚀 Run Full Test Flow"

**Expected Result**: All 6 tests run automatically with 1-second delays between them

**This is useful for**:
- Quick comprehensive testing
- Verifying everything works after changes
- Demonstrating the complete flow

---

### Step 3: Check Debug Logs

At the bottom of the screen, you'll see a **real-time log viewer** with green text on a dark background.

**Important logs to look for**:
```
✅ [NOTIFICATIONS] Permission granted
✅ [NOTIFICATIONS] Token registered successfully
📬 Notification received (foreground)
🎫 Current Token: ExponentPushToken[...]
```

**Error logs**:
```
❌ Error getting permission: ...
❌ Permission test failed: ...
❌ No push token available
```

---

## 🎯 Testing Method 2: Real Order Flow

After all debug tests pass, test the actual feature:

### Setup:
1. **Admin device**: Keep app open, logged in as admin
2. **Customer device**: Open app on another device/account (or use Expo Go on another phone)

### Test Procedure:

#### **Step 1: Admin Preparation**
```bash
# Admin terminal - check backend is running
cd backend
npm start

# Look for this in logs:
✅ Server running on port 5000
✅ Connected to MongoDB
✅ Redis connected
```

**Admin App**: 
- Login as admin
- Stay on any screen (doesn't matter which)
- Keep app open (or put in background)

---

#### **Step 2: Customer Places Order**

**Customer App**:
1. Login as customer
2. Add items to cart
3. Go to checkout
4. Fill delivery address
5. Select payment method (COD or UPI)
6. **Place Order** 🚀

---

#### **Step 3: Admin Receives Notification**

**What should happen (within 5-30 seconds)**:

**If Admin app is OPEN (foreground)**:
- Notification banner appears at top
- Title: "🆕 New Order Received!"
- Body: "Order #ORD-XXX has been placed"
- In-app alert may also appear

**If Admin app is CLOSED/BACKGROUND**:
- Push notification appears on device
- Title: "🆕 New Order Received!"
- Body: "Order #ORD-XXX has been placed"

**Admin Action**:
- **Tap the notification**
- Should navigate to Order Details screen
- Should show the new order with all details

---

#### **Step 4: Verify in Backend Logs**

**Backend terminal should show**:
```bash
[ORDER] New order created: ORD-XXX
[NOTIFICATION] Preparing to notify admins about new order
[NOTIFICATION] Found 1 admin device tokens
[NOTIFICATION] Sending notifications to 1 admins...
[EXPO] Sending push notification batch of 1
✅ [NOTIFICATION] Sent 1 notifications of type ORDER_NEW
```

---

## 🔍 Troubleshooting Guide

### Issue 1: No notification appears at all

**Check**:
1. ✅ Test 3 passed? (If no, it's a permission/listener issue)
2. ✅ Backend running? (Check terminal)
3. ✅ Admin logged in? (Check app)
4. ✅ Token registered? (Check Test 4)
5. ✅ Internet connection? (Required for Expo Push)

**Solution**:
```bash
# Restart backend
cd backend
npm start

# Restart frontend  
cd frontend
npm start

# In app: Logout and login again
# Run debug tests 1-5 again
```

---

### Issue 2: Test 3 works, but Test 5 doesn't

**Diagnosis**: Expo Push delivery delay (common in development)

**Solution**: 
- ⏰ **Wait 30-60 seconds** - Expo can be slow
- Check backend logs - if it says "Sent successfully", Expo received it
- Verify token format starts with `ExponentPushToken[`
- This is **normal behavior in development**
- Production builds are much faster

---

### Issue 3: Notification appears but tap doesn't navigate

**Check**:
- Notification data includes `orderId`
- Navigation listeners are set up
- Order exists in database

**Solution**: Check `NotificationInitializer.tsx` response handler:
```typescript
// Should navigate when tapped
if (data.type === 'order:new' && data.orderId) {
  navigation.navigate('OrderDetails', { orderId: data.orderId });
}
```

---

### Issue 4: Backend shows error when sending notification

**Common errors**:

**"DeviceNotRegistered"**: Token is invalid/expired
- Solution: Logout and login again to get new token

**"InvalidCredentials"**: Expo API issue
- Solution: Check `app.json` for proper Expo configuration

**"MessageTooBig"**: Notification content too large
- Solution: Reduce notification body text

---

## 📊 Expected Behavior Summary

| Scenario | Expected Behavior | Time |
|----------|------------------|------|
| Test 1 (Permissions) | Permission granted | Instant |
| Test 2 (Token) | Valid ExponentPushToken | 1-2 seconds |
| Test 3 (Local) | Notification appears | 1-2 seconds |
| Test 4 (Backend Register) | Token saved to database | 1-2 seconds |
| Test 5 (Backend Ping) | Notification via Expo | 5-30 seconds |
| Customer order | Admin gets notification | 5-30 seconds |
| Tap notification | Navigate to order details | Instant |

---

## ✅ Success Checklist

Your notification system is **fully working** when:

- [ ] Test 1 shows "granted" permission status
- [ ] Test 2 returns valid ExponentPushToken
- [ ] Test 3 shows notification immediately (1-2 seconds)
- [ ] Test 4 registers token with backend successfully
- [ ] Test 5 shows notification (even if delayed)
- [ ] Backend logs confirm "Sent X notifications"
- [ ] Customer order triggers admin notification
- [ ] Notification includes correct order number
- [ ] Tapping notification navigates to order details
- [ ] Works with app in foreground AND background

---

## 🚀 Production Deployment

Once testing passes in development:

### Build Production App:
```bash
cd frontend
eas build --platform android --profile production
```

### Install and Test:
1. Install production APK on device
2. Test notification flow again
3. **Should be MUCH faster** (1-3 seconds vs 10-30 seconds)

### Monitor in Production:
- Check notification delivery rates
- Monitor backend logs for failures
- Track user engagement with notifications

---

## 💡 Pro Tips

1. **Always use physical device** - Emulators don't support push notifications
2. **Be patient in development** - Expo Push can be slow (10-30 seconds)
3. **Test 3 is your friend** - Instant feedback on listener configuration
4. **Check backend logs** - Shows exactly what's being sent
5. **Production is faster** - Development delays are normal
6. **Keep app updated** - Logout/login to refresh token if issues persist

---

## 📞 Need Help?

If notifications still don't work after following this guide:

1. **Share debug logs** from the debug screen
2. **Share backend logs** from terminal
3. **Confirm which test failed** (1, 2, 3, 4, or 5)
4. **Device info** (model, OS version, physical vs emulator)
5. **Expo SDK version** (from package.json)

Happy Testing! 🎉
