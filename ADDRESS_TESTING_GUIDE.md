# Address Management Testing Guide

## Quick Start Testing

### 1. Backend Testing (with cURL or Postman)

**Prerequisites:**
- Backend server running on `http://localhost:5000`
- Valid auth token (login first to get token)

#### Step 1: Login to get auth token
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.com",
    "password": "customer123"
  }'
```

Save the `accessToken` and `userId` from response.

#### Step 2: Add Address
```bash
curl -X POST http://localhost:5000/api/v1/users/{userId}/address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "label": "Home",
    "street": "123 Main Street, Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Central Park",
    "isDefault": true
  }'
```

#### Step 3: Get User Profile (see all addresses)
```bash
curl -X GET http://localhost:5000/api/v1/users/{userId} \
  -H "Authorization: Bearer {your_token}"
```

#### Step 4: Update Address
```bash
curl -X PUT http://localhost:5000/api/v1/users/{userId}/address/{addressId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "label": "Work",
    "street": "456 Office Plaza",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002",
    "landmark": "Behind Mall"
  }'
```

#### Step 5: Set Address as Default
```bash
curl -X PATCH http://localhost:5000/api/v1/users/{userId}/address/{addressId}/default \
  -H "Authorization: Bearer {your_token}"
```

#### Step 6: Delete Address
```bash
curl -X DELETE http://localhost:5000/api/v1/users/{userId}/address/{addressId} \
  -H "Authorization: Bearer {your_token}"
```

### 2. Frontend Testing (React Native App)

#### Test Flow 1: Add Address from Checkout
1. Open app and login
2. Add items to cart
3. Go to cart
4. Click "Proceed to Checkout"
5. See "No Address" warning
6. Click "Add Address" button
7. Fill form:
   - Select "Home" label
   - Enter street: "123 Main St"
   - Enter landmark: "Near Park"
   - Enter city: "Mumbai"
   - Enter state: "Maharashtra"
   - Enter pincode: "400001" (must be 6 digits)
   - Check "Set as default"
8. Click "Save Address"
9. Should navigate back to checkout
10. Address should appear selected

#### Test Flow 2: Manage Addresses
1. From checkout, click "Manage Addresses" (if > 3 addresses)
   OR navigate from profile
2. See list of all addresses
3. Pull down to refresh
4. Click edit icon on any address
5. Modify fields
6. Click "Update Address"
7. Should see success message
8. Address should update in list

#### Test Flow 3: Delete Address
1. In Manage Addresses screen
2. Click delete icon (red trash)
3. See confirmation dialog
4. Click "Delete"
5. Address should disappear
6. If it was default, another address becomes default

#### Test Flow 4: Set Default Address
1. In Manage Addresses screen
2. Find non-default address
3. Click "Set as Default" button
4. See success alert
5. Default badge moves to this address
6. Other addresses lose default badge

#### Test Flow 5: View Limited Addresses in Checkout
1. Add 5+ addresses
2. Go to checkout
3. Should see only 3 addresses
4. Selected address always visible
5. See "View All X Addresses" button
6. Click button → navigates to Manage Addresses

### 3. Redux State Testing (React Native Debugger)

#### Check Redux DevTools
1. Open React Native Debugger
2. Navigate to Redux tab
3. Perform actions (add, edit, delete address)
4. Watch state changes:

```javascript
state.address = {
  addresses: [...],
  selectedAddressId: "...",
  isLoading: false,
  error: null,
  lastFetched: 1697123456789
}
```

#### Verify Cache Behavior
1. Load checkout (should fetch addresses)
2. Check `lastFetched` timestamp
3. Navigate away and back within 5 minutes
4. Should NOT fetch again (cache hit)
5. Wait 6+ minutes, navigate back
6. Should fetch again (cache expired)

## Expected Results

### Backend API Responses

#### Success Response Format
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {
      "_id": "...",
      "label": "Home",
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "landmark": "Near Park",
      "isDefault": true
    }
  }
}
```

#### Error Response Format
```json
{
  "success": false,
  "message": "You can only manage your own addresses",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### Frontend UI States

#### Loading State
- Spinner with "Loading addresses..."
- Disabled buttons during save/delete

#### Empty State
- Icon + "No Addresses Yet" message
- "Add Your First Address" button

#### Error State
- Red border on invalid fields
- Error text below field
- Alert dialog for API errors

#### Success State
- Green checkmark
- Success alert
- Navigation back to previous screen
- Updated address list

## Common Issues & Solutions

### Issue 1: "User not authenticated"
**Solution:** Login again to get fresh token

### Issue 2: "Pincode must be 6 digits"
**Solution:** Enter exactly 6 numeric digits (e.g., 400001)

### Issue 3: Addresses not appearing in checkout
**Solution:** 
- Check Redux state (addresses array should have data)
- Clear cache and refetch
- Verify user ID matches

### Issue 4: Can't delete last address
**Behavior:** This is allowed. User can have zero addresses.

### Issue 5: Navigation error on save
**Solution:** Check navigation stack has AddAddress, Checkout screens

### Issue 6: "Invalid ObjectId" error
**Solution:** Make sure addressId is valid MongoDB ObjectId format

### Issue 7: Redux not updating
**Solution:**
- Check dispatch calls
- Verify reducer actions imported correctly
- Clear app data and restart

## Performance Benchmarks

### Target Performance
- Checkout load (cached): < 200ms
- Checkout load (fresh): < 500ms
- Add address: < 800ms
- Update address: < 600ms
- Delete address: < 400ms
- Manage Addresses scroll: 60fps with 100+ addresses

### Cache Hit Rate
- Target: > 80% cache hits
- Check Redux lastFetched timestamps

### API Call Reduction
- Before: 5-10 calls per session
- After: 1-2 calls per session
- Reduction: ~80%

## Automation Testing (Optional)

### Jest Unit Tests (Backend)
```bash
cd backend
npm test -- addressController.test.js
```

### React Native Testing Library (Frontend)
```bash
cd frontend
npm test -- AddAddressScreen.test.tsx
```

## Debugging Tips

1. **Backend Logs:**
   - Check terminal for error stack traces
   - Look for validation errors
   - Check MongoDB connection

2. **Frontend Logs:**
   - Open React Native Debugger
   - Check Console tab for errors
   - Use `console.log` in try-catch blocks

3. **Network Inspection:**
   - Use React Native Debugger Network tab
   - Check request/response payloads
   - Verify auth headers included

4. **Redux State:**
   - Use Redux DevTools
   - Check action dispatch logs
   - Verify state mutations

## Success Criteria

✅ Backend server starts without errors
✅ All API endpoints respond correctly
✅ Authorization checks work (can't edit other user's addresses)
✅ Validation prevents invalid data
✅ Frontend screens render correctly
✅ Forms validate input properly
✅ Redux cache reduces API calls
✅ Navigation flows work smoothly
✅ Loading/error states display properly
✅ Performance metrics meet targets

## Next Steps After Testing

1. Fix any bugs found during testing
2. Add more address fields (phone per address, etc.)
3. Integrate with order placement
4. Add map integration for address selection
5. Implement address autocomplete
6. Add delivery zone validation
