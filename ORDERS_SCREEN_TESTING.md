# Orders Screen Testing Guide

## Quick Start Testing

### 1. Start the Backend
```bash
cd backend
npm start
```

### 2. Start the Frontend
```bash
cd frontend
npm start
# or
npx expo start
```

### 3. Navigate to Orders Screen
- Open the app on your device/emulator
- Make sure you're logged in
- Tap on the "Orders" tab in the bottom navigation

---

## Test Cases

### Test 1: Initial Load (Empty State)
**Scenario**: User has no orders yet

**Steps**:
1. Open Orders screen
2. Observe the UI

**Expected Result**:
- Loading spinner shows briefly
- Empty state appears:
  - Receipt icon
  - "No Orders Found" title
  - "You haven't placed any orders yet." message

---

### Test 2: Initial Load (With Orders)
**Scenario**: User has existing orders

**Steps**:
1. Open Orders screen
2. Observe the loading and data

**Expected Result**:
1. Loading spinner shows with "Loading your orders..." text
2. Orders appear grouped by date:
   - "Today" section (if any orders today)
   - "Yesterday" section (if any orders yesterday)
   - Specific dates for older orders
3. Each order shows:
   - First item image (or hidden if null)
   - First item name (e.g., "2x Margherita Pizza")
   - Order number (e.g., "Order #ORD-123")
   - Additional items (if more than 1)
   - Order date and time
   - Status badge
   - Total in rupees (₹)

---

### Test 3: Pull to Refresh
**Scenario**: User wants to refresh order list

**Steps**:
1. Scroll to top of orders list
2. Pull down to trigger refresh
3. Release

**Expected Result**:
- Refresh spinner appears at top
- Orders list refreshes
- Updated data shows (if any changes)
- Spinner disappears

---

### Test 4: Error Handling
**Scenario**: API fails (simulate by stopping backend)

**Steps**:
1. Stop the backend server
2. Open Orders screen (or pull to refresh)

**Expected Result**:
- Error state shows:
  - Error icon
  - "Oops!" title
  - Error message
  - "Try Again" button

**Steps to Recover**:
1. Tap "Try Again" button
2. Backend should restart (or error persists)

---

### Test 5: Order Navigation
**Scenario**: User taps on an order

**Steps**:
1. Tap on any order card

**Expected Result**:
- Navigation to OrderDetails screen
- Order ID passed correctly

---

### Test 6: Currency Format
**Scenario**: Verify rupee symbol displays correctly

**Steps**:
1. Check all order totals

**Expected Result**:
- All amounts show as ₹ (not $)
- Example: ₹2488, ₹1245
- No decimal places (using toFixed(0))

---

### Test 7: Date Grouping
**Scenario**: Verify orders are grouped correctly

**Steps**:
1. Place an order today
2. Check Orders screen

**Expected Result**:
- Today's orders under "Today" section
- Yesterday's orders under "Yesterday" section
- Older orders under specific dates (e.g., "13 Oct", "5 Jan 2024")
- Sections sorted chronologically (most recent first)

---

### Test 8: Real-time Order Creation
**Scenario**: Place new order and verify it appears

**Steps**:
1. Go to home screen
2. Add items to cart
3. Complete checkout
4. Navigate to Orders screen

**Expected Result**:
- New order appears at top (under "Today")
- Status shows as "Pending" or "Confirmed"
- All order details correct

---

### Test 9: Status Display
**Scenario**: Verify different order statuses show correctly

**Expected Statuses** (from backend mapping):
- "Pending" → Pending
- "Confirmed" → Confirmed
- "Preparing" → Preparing Your Order
- "Ready" → Ready for Pickup
- "Out for Delivery" → Out for Delivery
- "Delivered" → Delivered
- "Cancelled" → Cancelled
- "Refunded" → Refunded

**Steps**:
1. Check various orders with different statuses

**Expected Result**:
- Status text displays user-friendly version
- Status badge styled correctly

---

### Test 10: Performance Check
**Scenario**: Verify optimization works

**Steps**:
1. Open backend console/logs
2. Navigate to Orders screen
3. Check backend logs

**Expected Result**:
- Single database query logged
- Query uses `.lean()` (visible in logs if you log the query)
- Fast response time (< 100ms for typical order count)

---

## API Testing (Using Postman/Thunder Client)

### Test Endpoint Directly

**Endpoint**: `GET http://localhost:5000/api/v1/orders/my-orders`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters** (optional):
```
limit: 20
skip: 0
status: out_for_delivery
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "ORD-123",
      "_id": "507f1f77bcf86cd799439011",
      "status": "Out for Delivery",
      "statusType": "active",
      "items": ["2x Margherita Pizza", "1x Pepperoni Pizza"],
      "firstItemImage": "https://...",
      "total": 2488,
      "date": "2025-10-13T14:30:00.000Z",
      "time": "2:30 PM",
      "estimatedTime": "15-20 min"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue 1: "Failed to load orders"
**Cause**: Backend not running or authentication failed

**Solution**:
1. Check backend is running: `cd backend && npm start`
2. Verify JWT token is valid (check expiry)
3. Check network connection
4. Check backend logs for errors

---

### Issue 2: Images not showing
**Cause**: Image URLs are null or invalid

**Solution**:
- This is handled gracefully - images will be hidden
- Check Order model has valid imageUrl for products
- Verify image URLs are accessible

---

### Issue 3: Orders not grouped correctly
**Cause**: Date formatting issue

**Solution**:
- Check backend returns valid ISO date strings
- Verify frontend date conversion works
- Check timezone settings

---

### Issue 4: Currency shows as $
**Cause**: Code not updated or cached

**Solution**:
1. Clear app cache
2. Reload app (Expo: press 'r')
3. Verify OrdersScreen.tsx has `₹` symbol

---

### Issue 5: Pull to refresh not working
**Cause**: ScrollView not at top or gesture conflict

**Solution**:
- Scroll to very top of list
- Try on device (may not work well on web)
- Check RefreshControl is properly integrated

---

## Debug Mode

### Enable Console Logs
Add this to OrdersScreen.tsx for debugging:

```typescript
// After fetchOrders()
console.log('Fetched orders:', orders);
console.log('Orders count:', orders.length);
console.log('Grouped orders:', groupedOrders);
```

### Backend Logs
Check backend console for:
- API request received
- Database query executed
- Response sent
- Any errors

---

## Performance Benchmarks

### Expected Timings
- **Initial Load**: < 1 second
- **Refresh**: < 500ms
- **Database Query**: < 100ms
- **Data Transfer**: < 50KB (for 20 orders)

### Monitor Performance
```javascript
// Add to fetchOrders()
const startTime = Date.now();
const data = await getMyOrders({ limit: 50 });
console.log(`Orders fetched in ${Date.now() - startTime}ms`);
```

---

## Checklist

Before marking as complete, verify:

- [ ] ✅ Orders load on screen mount
- [ ] ✅ Loading spinner shows during fetch
- [ ] ✅ Orders grouped by date correctly
- [ ] ✅ Currency displays as ₹ (rupees)
- [ ] ✅ Pull-to-refresh works
- [ ] ✅ Error handling works (test by stopping backend)
- [ ] ✅ Empty state shows when no orders
- [ ] ✅ Images load (or hidden gracefully if null)
- [ ] ✅ Order navigation works
- [ ] ✅ Status badges display correctly
- [ ] ✅ Date formatting is correct
- [ ] ✅ No TypeScript errors
- [ ] ✅ No console errors
- [ ] ✅ Performance is smooth

---

**Status**: Ready for Testing ✅

**Last Updated**: January 2025
