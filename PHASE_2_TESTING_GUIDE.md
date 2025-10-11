# 🧪 Phase 2 Testing Guide

## Prerequisites

1. **Backend must be running:**
   ```bash
   cd backend
   npm start
   ```

2. **MongoDB must be running:**
   ```bash
   # Check if MongoDB is running
   mongosh
   ```

3. **Frontend must be running:**
   ```bash
   cd frontend
   npm start
   ```

4. **Login as Admin:**
   - Use your admin credentials
   - Must have `role: 'admin'` in database

---

## Test Case 1: Add First Product (Pizza)

### Steps:
1. Open app and login as admin
2. Navigate to **Menu Management** tab
3. Click **"Add Menu Item"** button (+ icon)
4. Fill in the form:
   ```
   Name: Margherita Pizza
   Description: Classic tomato sauce, fresh mozzarella, and basil leaves
   Category: Pizza (tap to select)
   Price: 12.99
   Prep Time: 20
   Image URL: https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400
   Vegetarian: Toggle ON
   Available: Keep ON
   ```
5. Verify the **preview card** shows the pizza correctly
6. Click **"Save Menu Item"**

### Expected Results:
- ✅ Button changes to "Creating..." with loading icon
- ✅ Success alert appears: "Menu item has been added successfully!"
- ✅ Navigates back to Menu Management screen
- ✅ Product appears in database

### Verify in Database:
```bash
mongosh
use friendspizzahut
db.products.find({ name: "Margherita Pizza" }).pretty()
```

Should show:
```javascript
{
  _id: ObjectId("..."),
  name: "Margherita Pizza",
  description: "Classic tomato sauce...",
  category: "pizza",
  pricing: 12.99,
  basePrice: 12.99,
  imageUrl: "https://images.unsplash.com...",
  isVegetarian: true,
  preparationTime: 20,
  discountPercent: 0,
  rating: 4.0,
  salesCount: 0,
  isAvailable: true,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## Test Case 2: Add Side Item

### Steps:
Same as Test Case 1, but use:
```
Name: Garlic Bread
Description: Toasted bread with garlic butter and herbs
Category: Sides
Price: 5.99
Prep Time: 10
Image URL: https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400
Vegetarian: ON
Available: ON
```

### Expected Results:
- ✅ Product created successfully
- ✅ Appears in database with `category: "sides"`

---

## Test Case 3: Add Beverage

### Steps:
```
Name: Coca Cola
Description: Chilled soft drink, 500ml
Category: Beverages
Price: 2.99
Prep Time: 2
Image URL: https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400
Vegetarian: ON
Available: ON
```

---

## Test Case 4: Add Dessert

### Steps:
```
Name: Chocolate Lava Cake
Description: Warm chocolate cake with molten center
Category: Desserts
Price: 7.99
Prep Time: 5
Image URL: https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400
Vegetarian: ON
Available: ON
```

---

## Test Case 5: Validation - Missing Fields

### Test 5A: Missing Name
1. Leave name empty
2. Fill other fields
3. Click Save

**Expected:** Alert "Missing Information - Please enter item name"

### Test 5B: Missing Price
1. Fill name and description
2. Leave price empty
3. Click Save

**Expected:** Alert "Invalid Price - Please enter a valid price greater than 0"

### Test 5C: Invalid Price (Zero)
1. Fill name and description
2. Enter price: 0
3. Click Save

**Expected:** Alert "Invalid Price - Please enter a valid price greater than 0"

### Test 5D: Invalid Prep Time
1. Fill name, description, price
2. Leave prep time empty or 0
3. Click Save

**Expected:** Alert "Invalid Time - Please enter a valid preparation time"

### Test 5E: Invalid Image URL
1. Fill all fields
2. Enter invalid URL: "not-a-url"
3. Click Save

**Expected:** Alert "Invalid URL - Please enter a valid image URL (starting with http:// or https://)"

---

## Test Case 6: Category Management Screen

### Steps:
1. After adding products (Test Cases 1-4), navigate to **Menu Management**
2. Click **"Category Management"** or navigate from sidebar
3. Observe the screen

### Expected Results:
- ✅ Shows loading spinner initially
- ✅ Displays 4 categories:
  - Pizza: 1 item
  - Sides: 1 item
  - Beverages: 1 item
  - Desserts: 1 item
- ✅ Statistics show:
  - Total Categories: 4
  - Active Categories: 4
  - Total Items: 4
  - Avg Items per Category: 1

### Test 6A: Reorder Categories
1. Click ⬆️ on "Sides" category
2. Verify it moves above Pizza
3. Click ⬇️ to move it back

**Expected:** UI updates immediately, order numbers change

### Test 6B: Toggle Category Inactive
1. Click **"✅ Active"** button on Pizza category
2. Verify it changes to **"❌ Inactive"** with red background
3. Click again to make it active

**Expected:** 
- UI updates immediately
- Statistics update (Active Categories count changes)

---

## Test Case 7: Error Handling - Backend Down

### Steps:
1. Stop the backend server
2. Try to create a new product
3. Click Save

### Expected Results:
- ✅ Alert appears with error message
- ✅ User stays on Add screen (doesn't navigate away)
- ✅ Form data is preserved

### Steps to Verify:
```bash
# Stop backend
# In backend terminal, press Ctrl+C

# Try to add product in app
# Should see error alert

# Restart backend
cd backend
npm start

# Try again - should work now
```

---

## Test Case 8: Backend Validation Error

### Steps:
1. Try to create product with very long name (>100 chars)
2. Click Save

### Expected Results:
- ✅ Backend returns validation error
- ✅ Alert shows: "Product name cannot exceed 100 characters"

---

## Test Case 9: Image Preview

### Steps:
1. Navigate to Add Menu Item
2. Enter a valid image URL
3. Observe the preview

### Expected Results:
- ✅ "Preview:" label appears below input
- ✅ Image loads and displays in preview container
- ✅ Customer preview card shows the same image

### Test Invalid Image:
1. Enter URL: `https://invalid-url.com/nonexistent.jpg`
2. Observe preview

**Expected:** Image fails to load, shows broken image icon

---

## Test Case 10: Multiple Products Same Category

### Steps:
1. Add 3 more pizzas:
   - Pepperoni Pizza ($14.99)
   - Veggie Supreme ($13.99)
   - BBQ Chicken Pizza ($15.99)

2. Navigate to Category Management

### Expected Results:
- ✅ Pizza category shows: 4 items
- ✅ Total Items: 7
- ✅ Avg Items per Category: 1.75 (rounded to 2)

---

## Debugging Commands

### Check Products in Database:
```bash
mongosh
use friendspizzahut
db.products.find().pretty()
db.products.countDocuments()
db.products.find({ category: "pizza" }).count()
```

### Check Backend Logs:
```bash
# In backend terminal
# Watch for:
# POST /api/v1/products 201 (Success)
# POST /api/v1/products 400 (Validation error)
# POST /api/v1/products 500 (Server error)
```

### Check Frontend Redux State:
```javascript
// In React Native Debugger or browser console (if web)
// Add this to AddMenuItemScreen temporarily:
console.log('Product State:', useSelector(state => state.product));
```

---

## Common Issues & Solutions

### Issue 1: "Network Error" when saving
**Solution:** 
- Check backend is running on port 5000
- Check frontend `apiClient.ts` has correct base URL
- Verify MongoDB is running

### Issue 2: "Unauthorized" error
**Solution:**
- Logout and login again as admin
- Check auth token is present: `AsyncStorage.getItem('authToken')`
- Verify user role is 'admin' in database

### Issue 3: Products not showing in Category Management
**Solution:**
- Check Redux state: Products array should have items
- Verify `fetchProductsThunk()` is being called
- Check backend endpoint: `GET /api/v1/products` returns data

### Issue 4: Image not loading
**Solution:**
- Use valid image URLs (https://images.unsplash.com/... works well)
- Check URL is properly formatted
- Test URL in browser first

### Issue 5: Button stays in "Creating..." state
**Solution:**
- Check backend response
- Look for errors in terminal
- Verify Promise is resolving in thunk

---

## Performance Testing

### Load Test:
1. Add 20+ products
2. Navigate to Category Management
3. Observe loading time

**Expected:** 
- Should load in < 2 seconds
- No UI freezing
- Loading spinner visible during fetch

### Stress Test:
1. Add products with very long descriptions (500 chars)
2. Add products with large image URLs
3. Toggle categories rapidly

**Expected:**
- No crashes
- UI remains responsive
- All operations complete successfully

---

## Checklist

- [ ] Test Case 1: Add Pizza ✅
- [ ] Test Case 2: Add Side ✅
- [ ] Test Case 3: Add Beverage ✅
- [ ] Test Case 4: Add Dessert ✅
- [ ] Test Case 5: All Validation Tests ✅
- [ ] Test Case 6: Category Management ✅
- [ ] Test Case 7: Backend Down Error ✅
- [ ] Test Case 8: Validation Error ✅
- [ ] Test Case 9: Image Preview ✅
- [ ] Test Case 10: Multiple Products ✅
- [ ] Verify in Database ✅
- [ ] Check Backend Logs ✅

---

**Testing Complete?** Move to Phase 3!

Next: Implement Menu Management screen to display all products with edit/delete functionality.
