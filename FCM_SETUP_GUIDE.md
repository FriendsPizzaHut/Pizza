# 🔔 FCM Setup Guide for Expo Push Notifications

## 🔴 The Problem

You're getting this error:
```
Unable to retrieve the FCM server key for the recipient's app.
Error: InvalidCredentials
```

This happens because:
- Android devices use **Firebase Cloud Messaging (FCM)** for push notifications
- Expo needs FCM credentials to send notifications to Android
- Your Expo project doesn't have FCM configured yet

---

## ✅ Solutions (Choose One)

### **Option 1: Enable Legacy FCM API (Quick - 5 minutes)**

#### Step 1: Enable Cloud Messaging API (Legacy)

1. Go to [Firebase Console](https://console.firebase.google.com/project/friends-pizza-hut-33e1a/settings/cloudmessaging)

2. Look for **"Cloud Messaging API (Legacy)"** section

3. If you don't see "Server key", the legacy API might be disabled

4. Click **"Manage API in Google Cloud Console"** or the three dots (⋮)

5. Enable **"Firebase Cloud Messaging API"** (the old version)

6. Go back to Firebase Console and refresh

7. You should now see **"Server key"** under Cloud Messaging API (Legacy)

#### Step 2: Upload FCM Key to Expo

```bash
cd /home/naitik2408/Contribution/pizza2/frontend

# Upload the server key to Expo
npx expo push:android:upload --api-key YOUR_SERVER_KEY_HERE
```

Replace `YOUR_SERVER_KEY_HERE` with the actual key from Firebase.

#### Step 3: Test Again

Run Test 5 in the debug screen - it should work now!

---

### **Option 2: Get API Key from Google Cloud Console**

If you can't find the server key in Firebase:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Select project: **friends-pizza-hut-33e1a**

3. Go to **APIs & Services** → **Credentials**

4. Look for **API Keys** section

5. Find the key for your Android app

6. Click on it and verify these APIs are enabled:
   - ✅ Cloud Messaging
   - ✅ Firebase Cloud Messaging API

7. Copy the API key (looks like: `AIzaSy...`)

8. Upload to Expo:
   ```bash
   cd frontend
   npx expo push:android:upload --api-key YOUR_API_KEY_HERE
   ```

---

### **Option 3: Build with EAS (Recommended for Production)**

EAS Build automatically handles all FCM configuration. This is the **best long-term solution**.

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo

```bash
eas login
```

#### Step 3: Configure EAS Build

```bash
cd /home/naitik2408/Contribution/pizza2/frontend
eas build:configure
```

#### Step 4: Build for Android

```bash
# Development build (for testing)
eas build --platform android --profile development

# Or production build
eas build --platform android --profile production
```

#### Step 5: Install and Test

- Download the APK from EAS dashboard
- Install on your device
- FCM will work automatically!

---

### **Option 4: Use Expo's Default Push Tokens (Development Only)**

For **development testing only**, we can modify the backend to handle the FCM error gracefully:

This won't fix the issue but will let you continue testing other features. The notification just won't be delivered to Android devices.

---

## 🎯 Which Option Should You Choose?

| Option | Time | Best For | Pros | Cons |
|--------|------|----------|------|------|
| **Option 1** | 5 min | Quick testing | Fast, works with Expo Go | Requires legacy API |
| **Option 2** | 10 min | Alternative to Option 1 | Works if legacy API unavailable | Might need API enablement |
| **Option 3** | 30 min | Production | Best for production, automatic FCM setup | Takes longer, requires EAS account |
| **Option 4** | 2 min | Just want to continue | Keeps development going | Notifications won't work |

**Recommendation:** Start with **Option 1 or 2** for immediate testing, then move to **Option 3** for production.

---

## 📋 Detailed Steps for Option 1

### Finding the Server Key

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/friends-pizza-hut-33e1a/settings/cloudmessaging
   ```

2. **Look for these sections:**
   - **Firebase Cloud Messaging API** (has Sender ID)
   - **Cloud Messaging API (Legacy)** ← You need this one!
   
3. **If "Cloud Messaging API (Legacy)" is missing:**
   - Click the hamburger menu → **Project settings**
   - Go to **Cloud Messaging** tab
   - Look for a button like **"Manage Cloud Messaging API in Google Cloud Console"**
   - Click it and **enable the API**
   - Come back to Firebase Console

4. **Copy the Server Key:**
   - Under "Cloud Messaging API (Legacy)"
   - Look for **"Server key"**
   - It starts with `AAAA...` (long string)
   - Click the copy icon

5. **Upload to Expo:**
   ```bash
   cd frontend
   npx expo push:android:upload --api-key AAAA_YOUR_SERVER_KEY_HERE
   ```

6. **Verify:**
   ```bash
   # Check if key is uploaded
   npx expo push:android:show
   ```

---

## 🧪 After Configuration - Test Again

1. **Restart Expo App**
   ```bash
   cd frontend
   npm start
   # Then reload app on device (shake device → Reload)
   ```

2. **Run Test 5 Again**
   - Open Notification Debug screen
   - Tap "5️⃣ Send from Backend (Ping)"
   - Check backend logs - should show success
   - Wait 5-30 seconds for notification

3. **Expected Backend Logs:**
   ```
   [DEVICE_TOKEN] Sending test notification to user...
   [DEVICE_TOKEN] Test notification sent successfully
   [DEVICE_TOKEN] Ticket: { status: 'ok', id: '...' }
   ```
   (No more "InvalidCredentials" error!)

---

## 🆘 Still Can't Find Server Key?

If Firebase has completely removed the legacy API and you can't find the server key anywhere:

### Try This:

1. **Check if FCM API is enabled:**
   ```bash
   # Open Google Cloud Console for your project
   https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=friends-pizza-hut-33e1a
   ```
   Click **ENABLE** if it's disabled

2. **Check API Keys:**
   ```bash
   # Go to credentials
   https://console.cloud.google.com/apis/credentials?project=friends-pizza-hut-33e1a
   ```
   Look for any API key and try using that

3. **Create New API Key:**
   - Click **"+ CREATE CREDENTIALS"** → **API key**
   - Restrict it to **Firebase Cloud Messaging API**
   - Copy the key
   - Upload to Expo

---

## 💡 Why This Happens

- **Expo Go** (development) uses Expo's push notification service
- Expo's service needs to forward notifications to Android devices via FCM
- FCM requires authentication (the server key)
- Without the key, FCM rejects the notification with "InvalidCredentials"

In **production builds** (via EAS), this is all handled automatically by Expo!

---

## ✅ Success Criteria

After configuration, you should see:

**Backend logs:**
```bash
✅ [DEVICE_TOKEN] Test notification sent successfully
✅ [DEVICE_TOKEN] Ticket: { status: 'ok', id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
```

**Device:**
- Notification appears in 5-30 seconds
- Title: "🧪 Backend Test"
- Body: "Test from backend at [time]"

---

## 📞 Need Help?

If you're still stuck:
1. Share a screenshot of your Firebase Cloud Messaging page
2. Share the output of: `npx expo push:android:show`
3. Let me know which option you tried

Good luck! 🚀
