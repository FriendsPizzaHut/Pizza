# Popular Items - Switched to axiosInstance

## Problem
Popular items in HomeScreen showing "loading" indefinitely on detail screens, while MenuScreen items load instantly.

## Root Cause Analysis
**Different HTTP Clients:**
- ❌ HomeScreen: Using `fetchWithRetry` (custom fetch wrapper)
- ✅ MenuScreen: Using Redux which uses `axiosInstance`
- ✅ Offers (working): Using `axiosInstance` directly

**Why This Matters:**
- `axiosInstance` has proper base URL configuration
- `axiosInstance` includes authentication headers automatically
- `axiosInstance` has consistent error handling
- `fetchWithRetry` might have URL concatenation issues or missing headers

## Solution Implemented

### Changed Popular Items API Call

**Before:**
```typescript
const response = await fetchWithRetry<{ success: boolean; data: MenuItem[]; }>(
    `${API_URL}/products?limit=6&sortBy=popular&sortOrder=desc&isAvailable=true`,
    {},
    CACHE_KEYS.POPULAR_ITEMS,
    CACHE_TTL.MEDIUM
);
```

**After:**
```typescript
const response = await axiosInstance.get('/products', {
    params: {
        limit: 6,
        sortBy: 'popular',
        sortOrder: 'desc',
        isAvailable: true
    }
});
```

### Benefits
1. **Consistency:** Same HTTP client as offers (which work perfectly)
2. **Better URL Handling:** `axiosInstance` manages base URL automatically
3. **Auth Headers:** Automatic token injection
4. **Cleaner Code:** Built-in params serialization
5. **Error Handling:** Consistent with rest of app

### Enhanced Logging

Added detailed console logs to track:
- API request status
- Response data structure
- Item count
- Sample item fields (for validation)

**Sample Output:**
```
🔄 Loading popular items from API...
📦 Popular items API response: { success: true, dataCount: 6, total: 3 }
✅ Loaded 6 popular items
📝 First item sample: {
  id: '68ebbd00fbe5dc7d43f3438b',
  name: 'Pizza 1',
  category: 'pizza',
  hasBasePrice: true,
  hasPricing: true
}
🔍 Navigating to item: { id: '...', name: '...', category: '...' }
→ Navigating to PizzaDetails with pizzaId: 68ebbd00fbe5dc7d43f3438b
```

## Files Modified

### `/frontend/src/screens/customer/main/HomeScreen.tsx`

**Line ~308-350:** Replaced `fetchWithRetry` with `axiosInstance.get`
- Uses `params` object for query parameters
- Accesses data as `response.data.data` (axios response structure)
- Enhanced error logging

**Line ~362-384:** Updated navigation logging
- Changed `logger.log` → `console.log` for consistency
- Added parameter name in logs (`pizzaId`, `itemId`)

## Testing Steps

### 1. Restart Metro Bundler
```bash
cd frontend
npm start -- --reset-cache
```

### 2. Test Popular Items
1. Open HomeScreen
2. Check console for logs:
   - `🔄 Loading popular items from API...`
   - `✅ Loaded X popular items`
3. Click a popular item
4. Verify detail screen loads instantly (not infinite loading)

### 3. Compare with MenuScreen
- Both should now have identical behavior
- Both use axios-based HTTP clients
- Data structure should match exactly

### 4. Check Console Logs
Look for these specific logs:
```
📦 Popular items API response: ...
📝 First item sample: ...
🔍 Navigating to item: ...
→ Navigating to PizzaDetails with pizzaId: ...
```

## Expected Behavior

### ✅ Success Criteria
- [ ] Popular items load within 2 seconds
- [ ] No 404 errors in console
- [ ] Detail screens load instantly (like MenuScreen)
- [ ] No "loading" screen hang
- [ ] Both pizza and non-pizza items work

### ❌ Failure Indicators
- Infinite loading on detail screen
- 404 API errors
- Missing product data
- Console errors about undefined fields

## Rollback Plan

If this doesn't work, alternative approaches:

### Option 1: Use Redux Store (Like MenuScreen)
```typescript
import { fetchProductsThunk } from '../../../../redux/thunks/productThunks';

// In component:
const { products } = useSelector((state: RootState) => state.product);

// On mount:
dispatch(fetchProductsThunk({ limit: 6, sortBy: 'popular' }));

// Use first 6 products:
const popularItems = products.slice(0, 6);
```

### Option 2: Pass Full Product Data
```typescript
// In navigation:
navigation.navigate('PizzaDetails', { 
    pizzaId: item._id,
    productData: item  // Pass complete product
});

// In PizzaDetailsScreen:
const { pizzaId, productData } = route.params;
if (productData) {
    setProduct(productData);  // Use immediately
}
```

## Related Files
- `frontend/src/api/axiosInstance.ts` - Base axios configuration
- `frontend/src/screens/customer/main/MenuScreen.tsx` - Working reference
- `frontend/redux/thunks/productThunks.ts` - Redux product fetching

## Status
✅ **Changes Applied**
⏳ **Awaiting Test Results**

---

**Next:** Run the app and verify that popular items now load detail screens instantly like MenuScreen does.
