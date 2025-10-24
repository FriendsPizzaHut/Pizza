# Dynamic Dashboard - Quick Testing Guide ⚡

**Test this in 5 minutes!**

## 🚀 Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm start

# Expected output:
# ✅ Server running on port 5000
# ✅ MongoDB Connected
# ✅ Redis connected successfully
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm start

# Press 'a' for Android or 'i' for iOS
```

### 3. Login as Admin
```
Email: admin@pizzahut.com
Password: admin123
```

---

## ✅ Test Checklist (5 Tests)

### Test 1: Initial Load ⏱️
**Steps:**
1. Open Dashboard screen
2. Watch for loading spinner
3. Data should appear in <2 seconds

**Expected:**
- ✅ Loading spinner shows
- ✅ 6 stat cards display (Today's Orders, Total Orders, etc.)
- ✅ Weekly chart appears
- ✅ Hourly sales chart appears
- ✅ Activity timeline shows recent events
- ✅ No console errors

**Screenshot:** 
```
[Loading...] → [Dashboard with data]
```

---

### Test 2: Pull-to-Refresh 🔄
**Steps:**
1. Pull down on dashboard
2. Release
3. Watch refresh indicator

**Expected:**
- ✅ Refresh indicator appears
- ✅ Data updates (check timestamps)
- ✅ Smooth animation
- ✅ New data from server (not cache)

**Check Cache Bust:**
```javascript
// Backend logs should show:
"Dashboard overview fetched from MongoDB"
// Not:
"Dashboard overview fetched from cache"
```

---

### Test 3: Real-time Update 🔴
**Steps:**
1. Keep dashboard open
2. From **another device/browser**, place a new order as customer
3. Watch dashboard **without refreshing**

**Expected:**
- ✅ "Today's Orders" increments by 1 instantly
- ✅ Activity timeline shows "New order received" at top
- ✅ Update happens in <1 second
- ✅ No page refresh needed

**Socket Connection Check:**
```javascript
// Open DevTools Console, should see:
✅ Dashboard Socket connected
📦 New order received: #ORD-XXX
```

---

### Test 4: Error Handling 🚨
**Steps:**
1. **Stop backend server** (Ctrl+C in Terminal 1)
2. Pull to refresh dashboard
3. Observe error screen
4. **Restart backend** (`npm start`)
5. Click "Retry" button

**Expected:**
- ✅ Error icon appears
- ✅ Clear error message shown
- ✅ "Retry" button visible
- ✅ After retry, data loads successfully
- ✅ No app crash

---

### Test 5: Performance 🏎️
**Steps:**
1. Open dashboard
2. Note load time
3. Navigate away
4. Come back to dashboard
5. Note load time again

**Expected:**
- ✅ First load: 0.5-1.5 seconds
- ✅ Second load: <0.2 seconds (cached)
- ✅ Smooth scrolling (60 FPS)
- ✅ Charts render without lag

**Performance Check:**
```javascript
// Console should show:
"✅ Dashboard overview fetched successfully (285ms)"
"✅ Dashboard overview fetched from cache (18ms)" // 2nd time
```

---

## 🔍 Advanced Tests (Optional)

### Test 6: Multiple Real-time Events
**Steps:**
1. Place 5 orders quickly from customer app
2. Mark 2 orders as delivered
3. Process 3 payments

**Expected:**
- ✅ All events appear in activity feed
- ✅ Stats update correctly
- ✅ No duplicate events
- ✅ Events in correct chronological order

---

### Test 7: Chart Accuracy
**Steps:**
1. Check weekly chart data
2. Verify against MongoDB data:
```bash
mongo pizzahut
db.orders.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" } } }
])
```
3. Compare chart bars with query results

**Expected:**
- ✅ Chart bars match database totals
- ✅ Highest bar highlighted
- ✅ Correct day labels

---

### Test 8: Cache Invalidation
**Steps:**
1. Open dashboard (data cached for 2 min)
2. Create new order from backend/Postman
3. Check dashboard within 2 minutes
4. Old data should show (cached)
5. Wait 2 minutes OR pull-to-refresh
6. New data should appear

**Expected:**
- ✅ Cache serves old data initially
- ✅ After TTL expiry, fresh data fetched
- ✅ Manual refresh bypasses cache

**Redis Check:**
```bash
redis-cli
> TTL cache:dashboard:overview
# Should show remaining seconds (120 max)
```

---

## 🐛 Common Issues & Fixes

### Issue: "Network request failed"
**Fix:**
```bash
# Check backend is running
curl http://localhost:5000/api/v1/dashboard/overview

# Check auth token
# AsyncStorage → authToken should exist
```

---

### Issue: Socket not connecting
**Fix:**
```javascript
// Check Socket.IO URL in .env
EXPO_PUBLIC_API_URL=http://<YOUR_IP>:5000

// Restart frontend
npm start --reset-cache
```

---

### Issue: Charts not showing
**Fix:**
```javascript
// Check data exists in Redux
console.log(weeklyChart); // Should be array with 7 items
console.log(hourlySales); // Should be array with items

// If empty, check backend data:
db.orders.find().limit(1); // Should have orders
```

---

### Issue: Slow loading
**Fix:**
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Check MongoDB indexes
db.orders.getIndexes()

# Monitor API response time
# Should be <300ms for first request
# Should be <50ms for cached request
```

---

## 📊 Test Results Template

Copy this and fill in your results:

```
Dashboard Testing Results
Date: ____________
Tester: ____________

Test 1: Initial Load
⬜ Passed  ⬜ Failed
Load Time: _____ ms
Notes: _______________________

Test 2: Pull-to-Refresh
⬜ Passed  ⬜ Failed
Notes: _______________________

Test 3: Real-time Update
⬜ Passed  ⬜ Failed
Update Lag: _____ ms
Notes: _______________________

Test 4: Error Handling
⬜ Passed  ⬜ Failed
Notes: _______________________

Test 5: Performance
⬜ Passed  ⬜ Failed
First Load: _____ ms
Cached Load: _____ ms
Notes: _______________________

Overall Status: ⬜ All Passed  ⬜ Some Failed
```

---

## 🎯 Success Criteria

**Minimum Requirements:**
- ✅ All 5 basic tests pass
- ✅ No console errors
- ✅ Load time <2 seconds
- ✅ Real-time updates work
- ✅ Smooth scrolling

**Optimal Performance:**
- ✅ Load time <1 second
- ✅ Real-time lag <500ms
- ✅ Cache hit rate >80%
- ✅ 60 FPS scrolling
- ✅ Zero crashes

---

## 🚀 Ready for Production?

Check all boxes:
- ⬜ All 5 tests passed
- ⬜ Redis connected and caching works
- ⬜ Socket.IO real-time updates functional
- ⬜ Error handling graceful
- ⬜ Performance meets targets
- ⬜ No memory leaks (test for 5 min continuous use)
- ⬜ Works on both Android and iOS
- ⬜ Admin authentication verified

**If all checked → ✅ DEPLOY TO PRODUCTION!**

---

## 📞 Need Help?

**Error Logs:**
```bash
# Backend logs
tail -f backend/logs/combined-YYYY-MM-DD.log

# Frontend logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

**Debug Mode:**
```javascript
// Enable Redux logging
console.log('Redux State:', store.getState().dashboard);

// Enable Socket debugging
socket.on('*', (event, data) => console.log(event, data));
```

---

**Happy Testing! 🎉**

If all tests pass, the dashboard is production-ready!
