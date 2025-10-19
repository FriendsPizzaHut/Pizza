# 🧪 Analytics Testing Guide

## 🎯 Quick Test - Verify Analytics Updates

Follow these steps to test that customer and product analytics are updating correctly when orders are delivered.

---

## 📋 Prerequisites

1. Backend server running
2. At least one customer account
3. At least one product in database
4. Access to MongoDB (Compass or CLI)

---

## 🚀 Test Scenario: Complete One Order

### **Step 1: Check Initial State**

**Query Customer Before Order:**
```javascript
// MongoDB Shell or Compass
db.users.findOne(
  { email: "your-customer@example.com", role: "customer" },
  { 
    name: 1,
    "orderingBehavior.totalOrders": 1,
    "orderingBehavior.totalSpent": 1,
    "orderingBehavior.mostOrderedItems": 1
  }
)
```

**Expected:**
```javascript
{
  _id: "...",
  name: "John Doe",
  orderingBehavior: {
    totalOrders: 0,  // or current count
    totalSpent: 0,
    mostOrderedItems: []
  }
}
```

**Query Product Before Order:**
```javascript
db.products.findOne(
  { name: "Margherita Pizza" },
  { name: 1, salesCount: 1, totalRevenue: 1, rating: 1 }
)
```

**Expected:**
```javascript
{
  _id: "...",
  name: "Margherita Pizza",
  salesCount: 0,  // or current count
  totalRevenue: 0,
  rating: 4.0
}
```

---

### **Step 2: Complete Full Order Flow**

1. **Customer Places Order:**
   - Login as customer
   - Add 2x Margherita Pizza to cart
   - Place order
   - Note the order ID

2. **Admin Accepts Order:**
   - Login as admin
   - Go to Order Management
   - Accept the order

3. **Admin Assigns Delivery Agent:**
   - Click "Assign Agent" button
   - Select delivery agent
   - Confirm assignment

4. **Agent Picks Up Order:**
   - Login as delivery agent
   - See order in Active Orders
   - Swipe "Slide to Pickup"
   - Order status → `out_for_delivery`

5. **Agent Delivers Order:**
   - Swipe "Slide to Complete" (or collect payment first if COD)
   - Order status → `delivered` ✅
   - **Analytics should trigger here!**

---

### **Step 3: Check Backend Logs**

**Watch for these logs in terminal:**

```
📊 [ANALYTICS] Starting analytics update for order: 67123abc...
👤 [ANALYTICS] Updating customer analytics: John Doe
   - Total Orders: 1
   - Total Spent: ₹598
   - Average Order Value: ₹598.00
   - Average Items Per Order: 2.00
   - Added new item: Margherita Pizza (count: 2)
   - Added new category: pizza (count: 1)
   - Order Frequency: occasional (1.0 orders/month)
   - Preferred Order Time: evening
✅ [ANALYTICS] Customer analytics updated successfully
📦 [ANALYTICS] Updating product analytics for 1 items
   - Margherita Pizza:
     • Sales Count: 0 → 2 (+2)
     • Revenue: ₹0 → ₹598 (+₹598)
     • Rating: 4.0 → 4.0
✅ [ANALYTICS] Product analytics updated successfully
✅ [ANALYTICS] Successfully updated analytics for order: 67123abc...
```

**If you see these logs → Analytics is working! ✅**

---

### **Step 4: Verify Database Updates**

**Re-Query Customer:**
```javascript
db.users.findOne(
  { email: "your-customer@example.com", role: "customer" },
  { 
    name: 1,
    "orderingBehavior.totalOrders": 1,
    "orderingBehavior.totalSpent": 1,
    "orderingBehavior.averageOrderValue": 1,
    "orderingBehavior.mostOrderedItems": 1,
    "orderingBehavior.favoriteCategories": 1,
    "orderingBehavior.avgItemsPerOrder": 1
  }
)
```

**Expected After 1 Order:**
```javascript
{
  _id: "...",
  name: "John Doe",
  orderingBehavior: {
    totalOrders: 1,  // ✅ Incremented
    totalSpent: 598,  // ✅ Updated
    averageOrderValue: 598,  // ✅ Calculated
    avgItemsPerOrder: 2,  // ✅ 2 items in order
    mostOrderedItems: [
      {
        productId: ObjectId("..."),
        count: 2,  // ✅ Ordered 2 pizzas
        totalSpent: 598,
        lastOrdered: ISODate("2025-10-19T...")
      }
    ],
    favoriteCategories: [
      {
        category: "pizza",
        count: 1  // ✅ Ordered from pizza category
      }
    ]
  }
}
```

**Re-Query Product:**
```javascript
db.products.findOne(
  { name: "Margherita Pizza" },
  { name: 1, salesCount: 1, totalRevenue: 1, rating: 1 }
)
```

**Expected:**
```javascript
{
  _id: "...",
  name: "Margherita Pizza",
  salesCount: 2,  // ✅ Incremented by 2
  totalRevenue: 598,  // ✅ Updated
  rating: 4.0  // ✅ Rating updated
}
```

---

## ✅ Success Criteria

### **Test Passes If:**

1. ✅ Backend logs show analytics update execution
2. ✅ Customer `totalOrders` incremented
3. ✅ Customer `totalSpent` increased by order amount
4. ✅ Customer `mostOrderedItems` contains ordered products
5. ✅ Customer `favoriteCategories` updated
6. ✅ Product `salesCount` incremented
7. ✅ Product `totalRevenue` increased
8. ✅ No errors in console

### **Test Fails If:**

- ❌ No analytics logs appear
- ❌ Customer stats unchanged after delivery
- ❌ Product stats unchanged after delivery
- ❌ Errors in console related to analytics

---

## 🔧 Troubleshooting

### **Issue: No Analytics Logs**

**Possible Causes:**
1. Order status didn't change to 'delivered'
2. Analytics service not imported correctly
3. Function not being called

**Debug:**
```javascript
// Add temporary console.log in orderService.js
if (updateData.status === 'delivered') {
    console.log('🔍 DEBUG: About to call analytics update');
    updateAnalyticsOnOrderDelivery(orderId).catch(error => {
        console.error('Analytics update failed:', error);
    });
}
```

### **Issue: Customer Not Found Error**

**Possible Causes:**
- User is not a Customer (wrong role)
- Order.user is not populated

**Fix:**
Ensure order is populated in analytics service:
```javascript
const order = await Order.findById(orderId)
    .populate('user')  // ✅ Must populate
    .populate('items.product');
```

### **Issue: Product Not Found Error**

**Possible Causes:**
- items.product not populated
- Product was deleted

**Fix:**
Check if product exists before updating.

---

## 🎯 Advanced Testing

### **Test Multiple Orders:**

1. Complete 3 orders for same customer
2. Check `totalOrders` = 3
3. Check `averageOrderValue` = totalSpent / 3
4. Check `mostOrderedItems` counts accumulate
5. Check `orderFrequency` classification

### **Test Different Categories:**

1. Order pizza in order 1
2. Order beverages in order 2
3. Check `favoriteCategories` has both

### **Test Time Preferences:**

1. Place order at 10 AM → Check `preferredOrderTime` = 'morning'
2. Place order at 3 PM → Check `preferredOrderTime` = 'afternoon'
3. Place order at 7 PM → Check `preferredOrderTime` = 'evening'

---

## 📊 Sample MongoDB Queries

### **Get All Customer Analytics:**
```javascript
db.users.find(
  { role: "customer" },
  { 
    name: 1, 
    email: 1,
    "orderingBehavior.totalOrders": 1,
    "orderingBehavior.totalSpent": 1,
    "orderingBehavior.orderFrequency": 1
  }
).sort({ "orderingBehavior.totalOrders": -1 })
```

### **Get Top Selling Products:**
```javascript
db.products.find(
  {},
  { name: 1, category: 1, salesCount: 1, totalRevenue: 1, rating: 1 }
).sort({ salesCount: -1 }).limit(10)
```

### **Get Customer's Favorite Items:**
```javascript
db.users.findOne(
  { email: "customer@example.com" },
  { "orderingBehavior.mostOrderedItems": 1 }
)
```

### **Calculate Total Revenue:**
```javascript
db.products.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalRevenue" },
      totalSales: { $sum: "$salesCount" }
    }
  }
])
```

---

## ✅ Final Checklist

- [ ] Backend server running
- [ ] Customer account exists
- [ ] Product exists in database
- [ ] Completed full order flow (pending → delivered)
- [ ] Checked backend logs for analytics execution
- [ ] Verified customer stats updated in database
- [ ] Verified product stats updated in database
- [ ] No errors in console
- [ ] Analytics update is non-blocking (order completes fast)

---

## 🎉 Success!

If all checks pass, your analytics system is working correctly! 

**What this enables:**
- ✅ Personalized product recommendations
- ✅ Customer segmentation (occasional/regular/frequent)
- ✅ Business intelligence dashboards
- ✅ Top sellers tracking
- ✅ Customer lifetime value calculation

**Next Steps:**
- Build API endpoints to expose analytics data
- Create frontend components to display recommendations
- Add admin dashboard for analytics visualization
