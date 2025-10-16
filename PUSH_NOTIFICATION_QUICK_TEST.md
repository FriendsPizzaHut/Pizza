# 🚀 Push Notifications - Quick Testing Guide

## ⚡ Start Here

### 1. Start Backend
```bash
cd backend
npm start
```

Wait for: `✅ Server running on port 5000`

### 2. Start Frontend
```bash
cd frontend
npx expo start
```

Scan QR code with Expo Go app on **physical device** (required for push notifications)

### 3. Login as Admin
- Open app on device
- Login with admin credentials
- Watch console logs for:
  ```
  🔔 [NOTIFICATIONS] Initializing notification system...
  ✅ [NOTIFICATIONS] Permission granted
  ✅ [NOTIFICATIONS] Expo push token: ExponentPushToken[xxxxx]
  ✅ [NOTIFICATIONS] Token registered successfully
  ```

---

## 🧪 Test #1: App Open (Foreground)

**Steps:**
1. Keep admin app open on OrderManagement screen
2. From another device/browser, create a new order
3. Watch for notification

**Expected:**
- ✅ Alert dialog appears with order notification
- ✅ Console shows: `📬 [NotificationInitializer] Foreground notification:`
- ✅ Real-time Socket.IO also updates order list

---

## 🧪 Test #2: App Background

**Steps:**
1. Open admin app
2. Press home button (don't swipe away)
3. From another device, create a new order
4. Watch for banner notification

**Expected:**
- ✅ Banner notification appears at top of screen
- ✅ Sound plays
- ✅ Tap notification → Opens app to order details

---

## 🧪 Test #3: App Closed ⭐ **MOST IMPORTANT**

**Steps:**
1. Open admin app
2. **Close app completely** (swipe away from recent apps)
3. Wait 5-10 seconds
4. From another device, create a new order
5. Watch device for notification

**Expected:**
- ✅ **System notification appears** (even though app is closed!)
- ✅ Sound plays
- ✅ Tap notification → App launches and opens order details

**Important:**
- ✅ Android: Works in Expo Go immediately
- ⚠️ iOS: Only works in production build (not Expo Go for closed state)

---

## 🔍 How to Create Test Order

### Option A: Use Customer App (Easiest)
1. Install app on second device
2. Login as customer
3. Add items to cart and checkout

### Option B: Use API (Fastest)
```bash
curl -X POST http://YOUR_IP:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID",
        "quantity": 1,
        "price": 10.99
      }
    ],
    "deliveryAddress": {
      "street": "123 Test St",
      "city": "Test City",
      "state": "Test State",
      "zipCode": "12345"
    },
    "paymentMethod": "card",
    "totalAmount": 10.99
  }'
```

### Option C: Use Postman
1. Open Postman
2. POST to `http://YOUR_IP:5000/api/v1/orders`
3. Add Authorization header with token
4. Use request body from Option B

---

## 🐛 Troubleshooting

### ❌ No notification received

**Check:**
1. Backend logs show: `Notifications sent successfully`
2. Frontend logs show: `✅ [NOTIFICATIONS] Token registered successfully`
3. Device has internet connection
4. App has notification permission (check device settings)
5. Using physical device (not simulator)

### ❌ Permission not granted

**Solution:**
1. Delete app from device
2. Reinstall via Expo Go
3. Allow permissions when prompted

### ❌ Token registration failed

**Check:**
1. Backend is running
2. API URL is correct in Constants
3. Device can reach backend (check network)
4. Look at backend logs for errors

---

## ✅ Success Checklist

- [ ] Backend running
- [ ] Frontend running on physical device
- [ ] Admin logged in
- [ ] Permission granted (check console)
- [ ] Token registered (check console)
- [ ] Test notification (app open) ✅
- [ ] Test notification (app background) ✅
- [ ] **Test notification (app closed) ⭐ KEY TEST**
- [ ] Navigation works on tap
- [ ] No errors in console

---

## 📊 Expected Console Output

### Frontend (Admin App)
```
🔔 [NOTIFICATIONS] Initializing notification system...
✅ [NOTIFICATIONS] Permission granted
✅ [NOTIFICATIONS] Expo push token: ExponentPushToken[xxxxxx]
📤 [NOTIFICATIONS] Registering token with backend...
✅ [NOTIFICATIONS] Token registered successfully
✅ [NOTIFICATIONS] Initialization complete
```

### Frontend (When Order Created - App Open)
```
📬 [NotificationInitializer] Foreground notification: {
  request: { content: { title: 'New Order!', body: '...' } }
}
```

### Frontend (When Notification Tapped)
```
👆 [NotificationInitializer] Notification tapped: {...}
📍 [NotificationInitializer] Navigating to order: 507f1f77bcf86cd799439011
```

### Backend (When Order Created)
```
📧 [EXPO_SERVICE] Sending notifications to admins...
📤 [EXPO_SERVICE] Sending to: ExponentPushToken[xxxxx]
✅ [EXPO_SERVICE] Notifications sent successfully
```

---

## 🎯 Test Result Matrix

| Test Scenario | Android (Expo Go) | iOS (Expo Go) | iOS (Production) |
|---------------|-------------------|---------------|------------------|
| App Open      | ✅ Works          | ✅ Works      | ✅ Works         |
| App Background| ✅ Works          | ✅ Works      | ✅ Works         |
| App Closed    | ✅ Works          | ❌ Doesn't work | ✅ Works       |

**Note:** iOS Expo Go limitation for closed state is expected behavior. Production builds work perfectly.

---

## 🎉 Success!

If you see system notification when admin app is closed, **you're done!** 

The push notification system is working correctly.

---

## 📚 Full Documentation

See `PUSH_NOTIFICATION_IMPLEMENTATION.md` for:
- Complete architecture details
- API reference
- Troubleshooting guide
- Next steps (delivery agent, customer notifications)
- Advanced features
