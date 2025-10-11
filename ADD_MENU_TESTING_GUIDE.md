# 🧪 AddMenuItemScreen - Testing Guide

## Quick Test Checklist

### ✅ Prerequisites
```bash
# 1. Backend running
cd backend
npm start

# 2. Frontend running
cd frontend
npm start

# 3. Logged in as Admin
# Email: admin@example.com
# Password: your_admin_password
```

---

## 🎯 Test Scenarios

### Test 1: Complete Pizza Creation
```
Steps:
1. Navigate to Add Menu Item
2. Name: "Spicy Veggie Pizza"
3. Description: "Loaded with jalapeños and veggies"
4. Category: Pizzas
5. Pricing:
   - Small: $11.99
   - Medium: $15.99
   - Large: $19.99
6. Tap "Upload Product Image" → Select image
7. Verify image preview appears
8. Tap "Add Topping" modal
   - Add: Mushrooms (vegetables)
   - Add: Jalapeños (vegetables)
   - Add: Mozzarella (cheese)
9. Toggle "Vegetarian": ON
10. Toggle "Available": ON (default)
11. Tap "Save Menu Item"

Expected Result:
✅ Success alert appears
✅ Navigates back to menu
✅ Product appears in database with:
   - pricing: { small: 11.99, medium: 15.99, large: 19.99 }
   - basePrice: 11.99
   - preparationTime: 20
   - discountPercent: 10-25 (random)
   - rating: 4.0
   - toppings: [3 items]
```

### Test 2: Side Item Creation
```
Steps:
1. Name: "Mozzarella Sticks"
2. Description: "Crispy fried cheese sticks"
3. Category: Sides
4. Price: $6.99
5. Select image
6. Toggle Vegetarian: ON
7. Save

Expected:
✅ Single pricing: 6.99
✅ preparationTime: 10
✅ No toppings array
✅ basePrice: 6.99
```

### Test 3: Beverage Creation
```
Steps:
1. Name: "Coca-Cola"
2. Description: "Refreshing cold drink"
3. Category: Beverages
4. Price: $2.99
5. Select image
6. Save

Expected:
✅ preparationTime: 2
✅ No toppings
```

### Test 4: Validation Tests

#### Missing Name
```
Steps: Leave name empty → Save
Expected: ❌ Alert: "Please enter item name"
```

#### Missing Description
```
Steps: Leave description empty → Save
Expected: ❌ Alert: "Please enter item description"
```

#### Missing Image
```
Steps: Don't select image → Save
Expected: ❌ Alert: "Please select a product image"
```

#### Missing Pizza Price
```
Steps: Pizza category, no prices entered → Save
Expected: ❌ Alert: "Please enter at least one pizza size price"
```

#### Invalid Side Price
```
Steps: Side category, price = 0 → Save
Expected: ❌ Alert: "Please enter a valid price greater than 0"
```

### Test 5: Image Operations

#### Upload Image
```
Steps: Tap "Upload Product Image" → Select from gallery
Expected: ✅ Image preview appears with X and "Change Image" buttons
```

#### Remove Image
```
Steps: After upload, tap X button
Expected: ✅ Image cleared, upload button reappears
```

#### Change Image
```
Steps: After upload, tap "Change Image"
Expected: ✅ Gallery opens again, can select new image
```

### Test 6: Topping Modal

#### Open Modal
```
Steps: Pizza category → Tap "Add Topping"
Expected: ✅ Modal slides up with 4 categories
```

#### Select Category
```
Steps: Tap "🥬 Vegetables"
Expected: ✅ Shows 8 vegetable options
```

#### Add Topping
```
Steps: Tap "Mushrooms"
Expected: ✅ Modal closes, topping appears in list
```

#### Duplicate Prevention
```
Steps: Add "Mushrooms" again
Expected: ✅ Not added twice (already exists)
```

#### Remove Topping
```
Steps: Tap X on topping item
Expected: ✅ Topping removed from list
```

### Test 7: Preview Section

#### Pizza Preview
```
When: Pizza with multiple prices entered
Expected: ✅ Shows price range "$11.99 - $19.99"
```

#### Single Price Preview
```
When: Side with $6.99 entered
Expected: ✅ Shows single price "$6.99"
```

#### Image Preview
```
When: Image selected
Expected: ✅ Preview card shows selected image
```

---

## 🔍 Backend Verification

### Check Database
```bash
# Connect to MongoDB
mongosh

# Switch to database
use friendspizzahut

# Find all products
db.products.find().pretty()

# Find specific product
db.products.findOne({ name: "Spicy Veggie Pizza" })

# Expected fields:
{
  _id: ObjectId("..."),
  name: "Spicy Veggie Pizza",
  description: "Loaded with jalapeños and veggies",
  category: "pizza",
  pricing: { small: 11.99, medium: 15.99, large: 19.99 },
  basePrice: 11.99,
  imageUrl: "file:///...",
  preparationTime: 20,
  discountPercent: 15,  // Random 10-25
  rating: 4.0,
  salesCount: 0,
  totalRevenue: 0,
  isVegetarian: true,
  isAvailable: true,
  toppings: [
    { name: "Mushrooms", category: "vegetables" },
    { name: "Jalapeños", category: "vegetables" },
    { name: "Mozzarella", category: "cheese" }
  ],
  createdAt: ISODate("..."),
  updatedAt: ISODate("..."),
  __v: 0
}
```

### Check Redis Cache
```bash
# Connect to Redis
redis-cli

# Check if cache was invalidated
KEYS products:*

# Expected: Empty or old cache (new product invalidates cache)
```

### API Test with cURL
```bash
# Get all products (should include new one)
curl -X GET http://localhost:5000/api/v1/products

# Get specific product
curl -X GET http://localhost:5000/api/v1/products/<product_id>

# Expected response:
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": { ...product }
}
```

---

## 📱 UI/UX Tests

### Loading State
```
Steps: Fill form → Tap Save
Expected: ✅ Button shows "Creating..." with loading icon
```

### Success State
```
Steps: After successful creation
Expected: 
✅ Alert: "Menu item has been added successfully!"
✅ Navigation back to menu screen
```

### Error State
```
Steps: Network error or invalid data
Expected: ✅ Alert with error message
```

### Form Persistence
```
Steps: Fill form → Switch category → Switch back
Expected: ✅ Previously entered data preserved
```

---

## 🐛 Edge Cases to Test

### 1. Network Offline
```
Steps: Turn off WiFi → Try to save
Expected: ❌ Error alert: "Network request failed"
```

### 2. Token Expired
```
Steps: Wait for token expiry → Try to save
Expected: ❌ Redirect to login or refresh token
```

### 3. Not Admin
```
Steps: Login as customer → Try to access screen
Expected: ❌ 403 Forbidden or navigation blocked
```

### 4. Large Image
```
Steps: Select very large image (>10MB)
Expected: ✅ Works (quality: 0.8 compresses it)
```

### 5. Special Characters in Name
```
Steps: Name with emoji "🍕 Pizza"
Expected: ✅ Saved correctly
```

### 6. Very Long Description
```
Steps: 500+ character description
Expected: ❌ Backend validation: "Max 500 characters"
```

### 7. Negative Price
```
Steps: Enter price: -5.99
Expected: ❌ Alert: "Please enter valid price greater than 0"
```

### 8. All Pizza Sizes Same
```
Steps: Small=10, Medium=10, Large=10
Expected: ✅ Saved correctly
```

---

## ✅ Success Criteria

### Must Pass:
- [ ] Can create pizza with multi-size pricing
- [ ] Can create side/beverage/dessert with single price
- [ ] Image upload works (gallery selection)
- [ ] Image preview/remove/change works
- [ ] Toppings modal works (add/remove)
- [ ] Form validation catches all errors
- [ ] Success alert appears after save
- [ ] Product appears in database
- [ ] Backend auto-generates 6 fields correctly
- [ ] Navigation works after success

### Performance:
- [ ] Modal opens instantly (< 100ms)
- [ ] Image preview loads quickly
- [ ] No lag when typing
- [ ] Save completes in < 2 seconds
- [ ] No memory leaks

### Visual:
- [ ] Image preview looks good (250px height)
- [ ] Buttons styled correctly
- [ ] Loading state visible
- [ ] Errors clearly displayed
- [ ] Preview card matches design

---

## 🔧 Debug Tips

### Enable Redux DevTools
```typescript
// See what's happening in Redux
console.log('Product State:', productState);
console.log('Creating:', isCreating);
console.log('Error:', error);
```

### Log API Calls
```typescript
// In handleSaveItem
console.log('Sending to API:', productData);
```

### Check Network Tab
```
React Native Debugger → Network
- Should see POST to /api/v1/products
- Check request payload
- Check response
```

### Backend Logs
```bash
# In backend terminal, watch for:
✅ Product caches invalidated after create
✅ POST /api/v1/products 201
```

---

## 📸 Screenshot Checklist

Take screenshots of:
1. Empty form
2. Filled form (before save)
3. Image upload button
4. Image preview with controls
5. Topping modal (category view)
6. Topping modal (topping selection)
7. Success alert
8. Product in menu list

---

**Test Date:** ___________  
**Tester:** ___________  
**Result:** ✅ Pass / ❌ Fail  
**Notes:** ___________

