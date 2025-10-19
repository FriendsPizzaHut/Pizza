# Popular Items - Quick Testing Guide

## Test the Implementation

### 1. Start the Backend
```bash
cd backend
npm start
```

### 2. Start the Frontend
```bash
cd frontend
npm start
```

### 3. Test Scenarios

#### Scenario 1: View Popular Items
1. Open the app and navigate to **Home Screen**
2. Scroll to the **"Popular Picks"** section
3. ✅ Verify: You should see up to 6 items
4. ✅ Verify: Items are sorted by salesCount (highest first)
5. ✅ Verify: Top item has **⭐ BESTSELLER** badge (if salesCount > 0)

#### Scenario 2: Click on Pizza Item
1. Click on any pizza in Popular Picks
2. ✅ Verify: Opens **PizzaDetailsScreen**
3. ✅ Verify: Can select size (Small/Medium/Large)
4. ✅ Verify: Can customize toppings
5. ✅ Verify: Can add to cart

#### Scenario 3: Click on Non-Pizza Item
1. Click on a side, beverage, or dessert in Popular Picks
2. ✅ Verify: Opens **ItemDetailsScreen**
3. ✅ Verify: Shows single price
4. ✅ Verify: Can add to cart directly

#### Scenario 4: Bestseller Badge
1. Check which item has the most sales in database
2. ✅ Verify: That item appears first in Popular Picks
3. ✅ Verify: It has the **⭐ BESTSELLER** badge
4. ✅ Verify: Other items don't have the badge

#### Scenario 5: No Items with Sales
1. If all products have salesCount = 0
2. ✅ Verify: Items still show (sorted by other criteria)
3. ✅ Verify: No bestseller badge appears

#### Scenario 6: Veg/Non-Veg Indicators
1. Check each item card
2. ✅ Verify: Green dot for vegetarian items
3. ✅ Verify: Red dot for non-vegetarian items

#### Scenario 7: Loading State
1. Slow down network in dev tools
2. Refresh the app
3. ✅ Verify: See skeleton loaders while loading
4. ✅ Verify: Loaders disappear when items load

#### Scenario 8: Error State
1. Stop the backend server
2. Refresh the app
3. ✅ Verify: See error message
4. ✅ Verify: Error is user-friendly

## Check Database State

### View Current Product Sales
```bash
cd backend
node check-product-stats.js
```

Expected output:
```
📦 PRODUCT STATISTICS:

1. Pizza 1 (pizza)
   Sales Count: 1
   Total Revenue: ₹17.95
   Rating: 4 ⭐

2. Noodles (beverages)
   Sales Count: 0
   Total Revenue: ₹0
   Rating: 4 ⭐
```

### Test API Directly

#### Get Popular Items
```bash
curl "http://localhost:3000/api/products?limit=6&sortBy=popular&sortOrder=desc&isAvailable=true"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Pizza 1",
      "category": "pizza",
      "salesCount": 1,
      "basePrice": 199,
      "isAvailable": true,
      ...
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 6
}
```

## Verify Analytics Integration

### Place a Test Order
1. Add items to cart
2. Checkout and place order
3. Admin marks order as **delivered**
4. Run diagnostic:
   ```bash
   cd backend
   node check-product-stats.js
   ```
5. ✅ Verify: Product salesCount increased
6. ✅ Verify: totalRevenue updated
7. Refresh Home Screen
8. ✅ Verify: Popular items reordered (after cache expires - 15 min)

### Manual Analytics Trigger
```bash
cd backend
node test-analytics.js <orderId>
```

## Debug Common Issues

### Issue: Popular Items Not Loading
**Solution:**
1. Check backend is running: `curl http://localhost:3000/health`
2. Check API URL in frontend: Look for `EXPO_PUBLIC_API_URL_DEVELOPMENT`
3. Check console logs for errors

### Issue: Bestseller Badge Not Showing
**Solution:**
1. Verify product has salesCount > 0:
   ```bash
   node check-product-stats.js
   ```
2. Check if product is first in list (highest salesCount)

### Issue: Wrong Screen Opens on Click
**Solution:**
1. Check product category in database
2. Verify navigation logic:
   - `category === 'pizza'` → PizzaDetails
   - Otherwise → ItemDetails

### Issue: Images Not Loading
**Solution:**
1. Check `imageUrl` field in database
2. Verify image URLs are accessible
3. Check network tab in React Native debugger

### Issue: Cache Not Refreshing
**Solution:**
1. Wait 15 minutes (CACHE_TTL.MEDIUM)
2. Or clear cache manually:
   ```bash
   redis-cli FLUSHDB
   ```
3. Or restart the app

## Performance Checks

### Cache Hit Rate
1. Open Home Screen
2. Check backend logs for: `📊 Products query`
3. Close and reopen Home Screen
4. ✅ Verify: Data loads instantly (from cache)

### Response Time
1. First load (no cache): Should be < 500ms
2. Cached load: Should be < 50ms
3. Check backend logs for query times

## Success Criteria

- [x] Popular items load on Home Screen
- [x] Top 6 items displayed by salesCount
- [x] Bestseller badge on top item (if has sales)
- [x] Pizza items navigate to PizzaDetails
- [x] Non-pizza items navigate to ItemDetails
- [x] Veg/non-veg indicators show correctly
- [x] Loading state works
- [x] Error handling works
- [x] Cache works (15 min TTL)
- [x] Analytics integration works
- [x] Dynamic reordering based on sales

---

**Happy Testing! 🍕**
