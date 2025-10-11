# 📱 Phase 2 Quick Reference

## 🎯 What You Can Do Now

### As Admin:
1. ✅ Add new menu items (pizzas, sides, beverages, desserts)
2. ✅ View category statistics with real item counts
3. ✅ Reorder category display
4. ✅ Toggle categories active/inactive

---

## 🚀 Quick Start

### Add Your First Product:

1. **Login as admin**
2. **Go to Menu Management tab**
3. **Click "Add Menu Item"**
4. **Fill in:**
   ```
   Name: Margherita Pizza
   Description: Fresh mozzarella, tomato sauce, basil
   Category: Pizza
   Price: 12.99
   Prep Time: 20 minutes
   Image URL: https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400
   ```
5. **Click Save**
6. **Done!** Product is now in database

---

## 📂 File Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── productService.ts          ✨ NEW - API calls
│   └── screens/
│       └── admin/
│           └── menu/
│               ├── AddMenuItemScreen.tsx     ✅ UPDATED - Functional
│               └── CategoryManagementScreen.tsx  ✅ UPDATED - Real data
│
└── redux/
    ├── slices/
    │   └── productSlice.ts            ✨ NEW - State management
    ├── thunks/
    │   └── productThunks.ts           ✨ NEW - Async actions
    └── store.ts                       ✅ UPDATED - Added product reducer
```

---

## 🔌 API Endpoints

### Products API (Backend)

```javascript
// Public - Anyone can view
GET /api/v1/products              // Get all products
GET /api/v1/products/:id          // Get single product

// Admin Only - Requires auth token + admin role
POST   /api/v1/products           // Create product ✅ WORKING
PATCH  /api/v1/products/:id       // Update product
DELETE /api/v1/products/:id       // Delete product
```

---

## 💾 Redux Usage

### In Your Component:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { createProductThunk } from '../redux/thunks/productThunks';

// In component:
const dispatch = useDispatch<AppDispatch>();
const { products, isCreating, error } = useSelector((state: RootState) => state.product);

// Create product:
const result = await dispatch(createProductThunk(productData));
if (result.success) {
  // Success!
}
```

---

## 📋 Product Data Structure

### Frontend Form:
```typescript
{
  name: string,
  description: string,
  category: 'pizza' | 'sides' | 'beverages' | 'desserts',
  price: string,              // Will be converted to number
  preparationTime: string,    // Will be converted to number
  imageUrl: string,
  isVegetarian: boolean,
  isAvailable: boolean
}
```

### Backend Database:
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  pricing: Number,
  basePrice: Number,          // Auto-calculated
  imageUrl: String,
  isVegetarian: Boolean,
  toppings: Array,            // Optional
  preparationTime: Number,
  discountPercent: Number,    // Auto-generated (0-25%)
  rating: Number,             // Default 4.0
  salesCount: Number,         // Default 0
  totalRevenue: Number,       // Default 0
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 UI Components Status

| Screen | Status | Features |
|--------|--------|----------|
| **AddMenuItemScreen** | ✅ Functional | Form, validation, API integration |
| **CategoryManagementScreen** | ✅ Real Data | Counts, reorder, toggle |
| **MenuManagementScreen** | 🔄 Mock Data | Need to connect to API (Phase 3) |
| **EditMenuItemScreen** | 🔄 Mock Data | Need to implement (Phase 3) |

---

## 🔧 Common Tasks

### 1. Fetch All Products
```typescript
dispatch(fetchProductsThunk());
```

### 2. Fetch with Filters
```typescript
dispatch(fetchProductsThunk({ 
  category: 'pizza',
  isAvailable: true,
  search: 'margherita'
}));
```

### 3. Create Product
```typescript
const productData = {
  name: 'Margherita Pizza',
  description: '...',
  category: 'pizza',
  pricing: 12.99,
  preparationTime: 20,
  imageUrl: 'https://...',
  isVegetarian: true,
  isAvailable: true
};

const result = await dispatch(createProductThunk(productData));
```

### 4. Update Product
```typescript
const updates = { price: 14.99, isAvailable: false };
await dispatch(updateProductThunk(productId, updates));
```

### 5. Delete Product
```typescript
await dispatch(deleteProductThunk(productId));
```

---

## ⚠️ Important Notes

### Categories Are Fixed
- Backend only accepts: `pizza`, `sides`, `beverages`, `desserts`
- Cannot add custom categories
- Cannot delete categories
- Can only reorder/toggle them

### Image Handling
- Currently: Manual URL input
- Future: File upload/image picker
- Use Unsplash URLs for testing

### Pricing
- Current: Single price only
- Backend supports: Multi-size pricing for pizzas
- Future: Add size-based pricing UI

### Validation
- All validation happens client-side first
- Backend also validates
- Both show user-friendly error messages

---

## 🐛 Troubleshooting

### Product not saving?
1. Check backend is running
2. Check you're logged in as admin
3. Check all required fields filled
4. Check browser/app console for errors

### Categories showing 0 items?
1. Make sure you've added products
2. Check `fetchProductsThunk()` is called
3. Verify Redux state has products array

### Image not loading?
1. Use valid HTTPS URLs
2. Test URL in browser first
3. Use Unsplash URLs (they work reliably)

### "Unauthorized" error?
1. Logout and login again
2. Check auth token exists
3. Verify user role is 'admin' in database

---

## 📊 Sample Data for Testing

### Pizza:
```
Name: Margherita Pizza
Desc: Fresh mozzarella, tomato sauce, basil
Category: pizza
Price: 12.99
Time: 20
URL: https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400
Veg: Yes
```

### Side:
```
Name: Garlic Bread
Desc: Toasted bread with garlic butter
Category: sides
Price: 5.99
Time: 10
URL: https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400
Veg: Yes
```

### Beverage:
```
Name: Coca Cola
Desc: Chilled soft drink, 500ml
Category: beverages
Price: 2.99
Time: 2
URL: https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400
Veg: Yes
```

### Dessert:
```
Name: Chocolate Lava Cake
Desc: Warm cake with molten center
Category: desserts
Price: 7.99
Time: 5
URL: https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400
Veg: Yes
```

---

## 🎯 Next Steps (Phase 3)

1. **Menu Management Screen**
   - Display all products from database
   - Filter by category
   - Search functionality
   - Edit/delete buttons

2. **Edit Menu Item Screen**
   - Load product data
   - Update via API
   - Same validation as Add

3. **Customer Menu Screen**
   - Display products to customers
   - Add to cart
   - Product details

---

## 💡 Pro Tips

1. **Always test with backend running**
2. **Use Redux DevTools to debug state**
3. **Check MongoDB to verify data**
4. **Use valid image URLs from Unsplash**
5. **Test validation by leaving fields empty**

---

**Ready to test?** Follow the [Testing Guide](./PHASE_2_TESTING_GUIDE.md)

**Need more info?** Check [Complete Documentation](./PHASE_2_IMPLEMENTATION_COMPLETE.md)
