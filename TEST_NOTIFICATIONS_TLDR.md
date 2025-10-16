# 🎯 TL;DR - Test Notifications in 5 Minutes

## 🚀 Quick Setup (2 minutes)

```bash
# 1. Start Backend
cd backend
npm start

# 2. Start Frontend  
cd frontend
npm start
```

---

## 📱 Testing Steps (3 minutes)

### Option 1: Using Debug Screen (Easiest)

1. **Login as Admin** on physical device
2. **Tap "🔔 Test Notifications"** button on dashboard
3. **Run tests in order**:
   - Test 1: Permissions → Should show "granted"
   - Test 2: Token → Should get ExponentPushToken
   - Test 3: Local Notification → **Should appear in 1-2 seconds** ⭐
   - Test 4: Backend Registration → Should succeed
   - Test 5: Backend Ping → Should arrive in 5-30 seconds

4. **If Test 3 works** → System is configured correctly ✅
5. **If Test 5 takes long** → Normal in development (Expo delay)

---

### Option 2: Real Order Test

1. **Admin**: Stay logged in on admin app
2. **Customer**: Place order from customer app
3. **Admin**: Should get notification in 5-30 seconds
4. **Tap notification** → Should navigate to order details

---

## ✅ Success Signs

```
✅ Test 3: Local notification appears instantly
✅ Test 5: Backend notification arrives (may be slow)
✅ Backend logs: "Sent 1 notifications of type ORDER_NEW"
✅ Customer order triggers admin notification
✅ Tapping notification navigates to order
```

---

## ❌ Common Issues & Quick Fixes

### "Test 3 doesn't show notification"
→ **Fix**: Check device notification settings, disable Do Not Disturb, restart app

### "Test 5 never arrives"
→ **Fix**: Wait 60 seconds (Expo can be slow), check backend logs, verify internet

### "No token in Test 2"
→ **Fix**: Use physical device (not emulator), check internet, restart app

### "Backend registration fails"
→ **Fix**: Verify logged in as admin, check backend is running

---

## 📊 What Each Test Does

| Test | What It Checks | Critical? | Speed |
|------|---------------|-----------|-------|
| 1 | Permissions | Yes | Instant |
| 2 | Token | Yes | 1-2 sec |
| 3 | Listeners | **YES** ⭐ | 1-2 sec |
| 4 | Backend API | Yes | 1-2 sec |
| 5 | Expo Push | Yes | 5-30 sec |

**Test 3 is the most important** - if it works, your listeners are configured correctly!

---

## 🎯 Quick Decision Tree

```
Test 3 works?
├─ YES → Test 5 works?
│  ├─ YES → ✅ Everything working! Test real order flow
│  └─ NO → ⏰ Wait 60 seconds (Expo delay is normal)
│
└─ NO → ❌ Fix permissions/listeners
   └─ Check device notification settings
   └─ Disable Do Not Disturb
   └─ Restart app
```

---

## 💡 Key Points

- ✅ Use **physical device** (not emulator)
- ⏰ **Test 5 can take 10-30 seconds** in development (normal!)
- 🎯 **Test 3 is instant** - best diagnostic tool
- 🚀 **Production is much faster** (1-3 seconds)
- 📝 **Check backend logs** to verify notifications sent

---

## 📞 Still Not Working?

Run this command and share the output:

```bash
# In backend terminal
cd backend
node -e "console.log('Checking backend...'); require('./src/models/DeviceToken.js').default.find().then(tokens => console.log('Device tokens:', tokens.length)).catch(e => console.log('Error:', e))"
```

Then check:
1. Which test fails? (1, 2, 3, 4, or 5)
2. What do debug logs show?
3. What do backend logs show?

---

**Read full guide**: See `HOW_TO_TEST_NOTIFICATIONS.md` for detailed troubleshooting
