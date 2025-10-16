# 🧪 Push Notification Testing - Step by Step

## Issue Found
The admin logged out **BEFORE** the customer placed the order, so the notification was sent but the admin wasn't there to receive it.

## Correct Testing Procedure

### Step 1: Prepare Two Devices/Sessions
- **Device 1:** Admin logged in
- **Device 2:** Customer logged in (or use different browser)

### Step 2: Admin Setup (Device 1)
1. Open admin app
2. Login as admin
3. **KEEP THE APP OPEN** (important!)
4. Check logs for:
   ```
   ✅ [NOTIFICATIONS] Token registered successfully
   ```
5. Go to Order Management screen
6. **Leave app visible on screen**

### Step 3: Place Order (Device 2)
1. Open customer app
2. Login as customer
3. Add items to cart
4. Place order
5. Confirm order placed

### Step 4: Check Admin Notification (Device 1)
**Expected behavior:**

**Scenario A: Admin app is in foreground (visible)**
- ✅ Alert popup should appear with order details
- ✅ Order should appear in real-time via Socket.IO
- ✅ Logs should show:
  ```
  📬 [NotificationInitializer] Foreground notification
  ```

**Scenario B: Admin app in background (home button pressed)**
- ✅ Banner notification should appear at top of screen
- ✅ Notification sound should play
- ✅ Tap notification → Opens app to order details

**Scenario C: Admin app completely closed**
- ✅ System notification should appear
- ✅ Notification sound should play
- ✅ Tap notification → Opens app to order details

### Step 5: Backend Verification
Check backend terminal for:
```
📤 Emitted "order:new" to role: admin
[NOTIFICATION] Notifying admins about new order: <order_id>
[NOTIFICATION] Sent 1 notifications of type ORDER_NEW
```

---

## Common Mistakes

### ❌ WRONG: Admin logs out, then customer orders
**Result:** No one receives notification (admin not logged in)

### ✅ RIGHT: Admin stays logged in, then customer orders
**Result:** Admin receives notification

---

## Test Scenarios Matrix

| Admin State | Customer Action | Expected Result |
|-------------|-----------------|-----------------|
| ✅ Logged in + Foreground | Places order | Alert popup + Socket update |
| ✅ Logged in + Background | Places order | Banner notification |
| ✅ Logged in + App closed | Places order | System notification |
| ❌ Logged out | Places order | **No notification** (expected) |

---

## Quick Test Script

### Terminal 1: Watch Backend Logs
```bash
cd backend
npm run dev | grep NOTIFICATION
```

### Terminal 2: Watch Frontend Logs  
Look for these logs in Expo:
```
✅ [NOTIFICATIONS] Token registered successfully
📬 [NotificationInitializer] Foreground notification
👆 [NotificationInitializer] Notification tapped
```

---

## Manual Notification Test

To test without placing an order, use the ping endpoint:

```bash
# Get your Expo Push Token from frontend logs
# Then send test notification:

curl -X POST http://192.168.1.9:5000/api/v1/device-tokens/ping \
  -H "Authorization: Bearer YOUR_ADMIN_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[h3saqtF7VAGCA9NnHGu4Tw]",
    "title": "🧪 Test Notification",
    "body": "If you see this, notifications work!"
  }'
```

---

## Debugging Checklist

### If notification doesn't appear:

1. **Check admin is logged in**
   ```
   Look for: ✅ [NOTIFICATIONS] Token registered successfully
   ```

2. **Check permission granted**
   ```
   Look for: ✅ [NOTIFICATIONS] Permission granted
   ```

3. **Check backend sent notification**
   ```
   Backend logs: [NOTIFICATION] Sent 1 notifications of type ORDER_NEW
   ```

4. **Check device settings**
   - Go to phone Settings → Apps → Expo Go
   - Ensure notifications are enabled
   - Check "Do Not Disturb" is off

5. **Check Expo Push Token is valid**
   ```
   Should start with: ExponentPushToken[...]
   Length should be ~41 characters
   ```

6. **Try manual ping test**
   - Use curl command above
   - Should receive test notification immediately

---

## Success Criteria

✅ Test passes when:
1. Admin logged in with token registered
2. Customer places order
3. Admin receives notification within 2 seconds
4. Notification shows correct order details
5. Tapping notification navigates to order

---

## Current Status from Your Logs

### ✅ What's Working:
- Backend sending notifications (`Sent 1 notifications`)
- Frontend token registration (`Token registered successfully`)
- Order creation successful

### ⚠️ What Happened:
Admin logged out → Customer ordered → Notification sent to logged-out admin → Admin didn't receive it

### 🔄 Next Test:
1. Login as admin
2. Keep app open
3. Place order from customer
4. Admin should receive notification

---

## Quick Retry Instructions

### Device 1 (Admin):
```
1. Open admin app
2. Login
3. Wait for: ✅ [NOTIFICATIONS] Token registered successfully
4. Stay on Order Management screen
5. KEEP APP VISIBLE
```

### Device 2 (Customer):
```
1. Open customer app  
2. Login
3. Add pizza to cart
4. Place order
```

### Device 1 (Admin) - Expected:
```
🔔 Alert popup appears
📬 [NotificationInitializer] Foreground notification
Order appears in list via Socket.IO
```

---

**Ready to test again!** 🚀

Make sure admin stays logged in this time.
