# ✅ PROMPT 3 - Mongoose Models (Schemas) - COMPLETED

## 📋 Summary

All **8 Mongoose models** have been successfully created as specified in Prompt 3. Each model follows best practices with proper validation, indexing, and relationships.

---

## 📁 Models Created

```
src/models/
├── ActivityLog.js     ✅ System activity tracking with cleanup
├── Business.js        ✅ Restaurant information & bank details
├── Coupon.js          ✅ Discount coupons with date validation
├── Notification.js    ✅ User notifications with read status
├── Order.js           ✅ Order management with references
├── Payment.js         ✅ Payment transactions
├── Product.js         ✅ Menu items with availability
└── User.js            ✅ User authentication & profiles
```

---

## 🔍 Model Details

### 1️⃣ User Model (`User.js`)

**Purpose:** Stores customer, admin, and delivery agent details

**Fields:**
- ✅ `name` - String, required
- ✅ `email` - String, unique, required
- ✅ `phone` - String, unique, required
- ✅ `password` - String, required (hashed with bcrypt)
- ✅ `role` - Enum: ["customer", "admin", "delivery"], default: "customer"
- ✅ `address` - Array of { street, city, state, pincode }
- ✅ `isActive` - Boolean, default: true
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `email` (unique)
- ✅ `phone` (unique)
- ✅ `role`

**Methods:**
- ✅ `comparePassword(candidatePassword)` - Verify password
- ✅ `getPublicProfile()` - Return safe user data

**Hooks:**
- ✅ Pre-save hook to hash password with bcrypt

---

### 2️⃣ Business Model (`Business.js`)

**Purpose:** Stores restaurant information and operational status

**Fields:**
- ✅ `name` - String, required
- ✅ `phone` - String, required
- ✅ `email` - String, required
- ✅ `address` - String, required
- ✅ `isOpen` - Boolean, default: false
- ✅ `bankDetails` - Object:
  - `accountHolder` - String
  - `accountNumber` - String
  - `ifsc` - String (uppercase)
  - `bankName` - String
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `name`
- ✅ `isOpen` (for dashboard queries)

---

### 3️⃣ Product Model (`Product.js`)

**Purpose:** Stores menu items (pizzas, drinks, sides)

**Fields:**
- ✅ `name` - String, required
- ✅ `description` - String
- ✅ `price` - Number, required, min: 0
- ✅ `category` - String (e.g., "Pizza", "Drinks")
- ✅ `imageUrl` - String (Cloudinary URL)
- ✅ `isAvailable` - Boolean, default: true
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `name`
- ✅ `category`

---

### 4️⃣ Order Model (`Order.js`)

**Purpose:** Handles order lifecycle and tracking

**Fields:**
- ✅ `user` - ObjectId ref: "User", required
- ✅ `items` - Array of:
  - `product` - ObjectId ref: "Product"
  - `quantity` - Number, min: 1
  - `price` - Number
- ✅ `totalAmount` - Number, required
- ✅ `status` - Enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
- ✅ `deliveryAgent` - ObjectId ref: "User" (optional)
- ✅ `paymentStatus` - Enum: ["pending", "completed", "failed"]
- ✅ `deliveryAddress` - Embedded object:
  - `street`, `city`, `state`, `pincode` - all required
- ✅ `deliveredAt` - Date (optional)
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `user`
- ✅ `status`
- ✅ `createdAt` (descending for recent orders)

---

### 5️⃣ Payment Model (`Payment.js`)

**Purpose:** Stores payment transaction details

**Fields:**
- ✅ `order` - ObjectId ref: "Order", required
- ✅ `user` - ObjectId ref: "User", required
- ✅ `amount` - Number, required, min: 0
- ✅ `paymentMethod` - Enum: ["card", "upi", "cod"], required
- ✅ `paymentStatus` - Enum: ["pending", "completed", "failed"]
- ✅ `transactionId` - String, unique, sparse (for online payments)
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `order`
- ✅ `user`
- ✅ `paymentStatus`

**Note:** Old payments will be deleted periodically; aggregate stats stored elsewhere

---

### 6️⃣ Coupon Model (`Coupon.js`)

**Purpose:** Manages discount coupons

**Fields:**
- ✅ `code` - String, unique, uppercase, required
- ✅ `description` - String
- ✅ `discountType` - Enum: ["percentage", "flat"], required
- ✅ `discountValue` - Number, required, min: 0
- ✅ `minOrderAmount` - Number, default: 0
- ✅ `startDate` - Date
- ✅ `endDate` - Date
- ✅ `isActive` - Boolean, default: true
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `code` (unique)
- ✅ `isActive`
- ✅ `startDate, endDate` (compound)

---

### 7️⃣ Notification Model (`Notification.js`)

**Purpose:** User notifications (admin, delivery, customers)

**Fields:**
- ✅ `user` - ObjectId ref: "User", required (receiver)
- ✅ `type` - String, required (e.g., "new_order", "order_assigned")
- ✅ `message` - String, required
- ✅ `isRead` - Boolean, default: false
- ✅ `timestamps` - createdAt, updatedAt

**Indexes:**
- ✅ `user`
- ✅ `isRead`
- ✅ `user, isRead` (compound for filtering)

**Supported Types:**
- "new_order" - Admin notification
- "order_assigned" - Delivery agent notification
- "order_delivered" - Customer notification
- "payment_received" - Admin notification

---

### 8️⃣ ActivityLog Model (`ActivityLog.js`)

**Purpose:** System activity tracking (auto-cleaned daily)

**Fields:**
- ✅ `type` - String, required (e.g., "order_received", "payment_received")
- ✅ `message` - String, required
- ✅ `timestamp` - Date, default: now

**Indexes:**
- ✅ `timestamp` (for efficient cleanup)

**Static Methods:**
- ✅ `cleanupOldLogs()` - Deletes logs older than 24 hours

**Cleanup Strategy:**
```javascript
// Use node-cron to run daily at midnight
import cron from 'node-cron';
import ActivityLog from './models/ActivityLog.js';

cron.schedule('0 0 * * *', async () => {
  await ActivityLog.cleanupOldLogs();
});
```

---

## 🎯 Key Features Implemented

### ✅ Proper Validation
- Required fields marked with `required: true`
- Enum validation for status fields
- Min/max validation for numbers
- Email format validation
- Phone number format validation

### ✅ Indexing Strategy
- Single field indexes for frequent queries
- Compound indexes for common filter combinations
- Unique indexes where appropriate
- Sparse indexes for optional unique fields

### ✅ Relationships
- `Order.user` → `User`
- `Order.items.product` → `Product`
- `Order.deliveryAgent` → `User` (role: delivery)
- `Payment.order` → `Order`
- `Payment.user` → `User`
- `Notification.user` → `User`

### ✅ Timestamps
- All models include `timestamps: true`
- Automatic `createdAt` and `updatedAt` fields
- Custom `timestamp` field in ActivityLog

### ✅ Data Optimization
- **No soft deletes** - actual deletion to save space
- Activity logs cleaned up automatically after 24 hours
- Old payments can be deleted with aggregate stats preserved
- Sparse indexes to allow null values where needed

### ✅ Security
- Password hashing with bcrypt (10 salt rounds)
- Password not returned by default (`select: false`)
- Password comparison method for authentication
- Public profile method to exclude sensitive data

---

## 📊 Model Relationships Diagram

```
User ────┐
         ├──> Order ──> Payment
         │      └──> Product (items array)
         │
         ├──> Notification
         └──> (deliveryAgent) Order

Business (standalone)
Product (standalone)
Coupon (standalone)
ActivityLog (standalone)
```

---

## 🚀 Usage Examples

### Creating a User
```javascript
import User from './models/User.js';

const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  password: 'password123', // Will be hashed automatically
  role: 'customer',
  address: [{
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  }]
});
```

### Creating an Order
```javascript
import Order from './models/Order.js';

const order = await Order.create({
  user: userId,
  items: [
    {
      product: productId,
      quantity: 2,
      price: 399
    }
  ],
  totalAmount: 798,
  deliveryAddress: {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  }
});
```

### Verifying Password
```javascript
const user = await User.findOne({ email }).select('+password');
const isValid = await user.comparePassword(candidatePassword);
```

### Cleaning Up Activity Logs
```javascript
import ActivityLog from './models/ActivityLog.js';

// Run this daily via cron job
await ActivityLog.cleanupOldLogs();
```

---

## 📝 File Structure Verification

Run this command to verify all models are created:

```bash
ls -la src/models/
```

**Expected Output:**
```
-rw-r--r-- ActivityLog.js
-rw-r--r-- Business.js
-rw-r--r-- Coupon.js
-rw-r--r-- Notification.js
-rw-r--r-- Order.js
-rw-r--r-- Payment.js
-rw-r--r-- Product.js
-rw-r--r-- User.js
```

---

## ✅ Checklist

### Model Structure
- [x] All 8 models created in `src/models/`
- [x] Each model in separate file
- [x] All models use `timestamps: true` (except ActivityLog)
- [x] All models exported with `export default`

### Field Validation
- [x] Required fields marked appropriately
- [x] Enums used for status fields
- [x] Min/max validation for numbers
- [x] String validation (trim, lowercase, uppercase)
- [x] Unique constraints where needed

### Indexing
- [x] User: email, phone, role
- [x] Business: name, isOpen
- [x] Product: name, category
- [x] Order: user, status, createdAt
- [x] Payment: order, user, paymentStatus
- [x] Coupon: code, isActive, startDate+endDate
- [x] Notification: user, isRead, user+isRead
- [x] ActivityLog: timestamp

### References
- [x] Order → User (user field)
- [x] Order → User (deliveryAgent field)
- [x] Order → Product (items array)
- [x] Payment → Order
- [x] Payment → User
- [x] Notification → User

### Special Features
- [x] User password hashing (bcrypt)
- [x] User password comparison method
- [x] User public profile method
- [x] ActivityLog cleanup static method
- [x] Proper enum values
- [x] Embedded documents (address, deliveryAddress, bankDetails)

### Data Optimization
- [x] No soft delete fields
- [x] ActivityLog cleanup strategy documented
- [x] Sparse indexes for optional unique fields
- [x] Minimal but meaningful fields

---

## 🔜 Next Steps (Prompt 4)

With all models in place, you're ready to:

1. **Create Controllers** - Business logic for each model
2. **Create Routes** - API endpoints for CRUD operations
3. **Add Validation Middleware** - Request validation
4. **Implement Services** - Reusable business logic
5. **Add Real-time Events** - Socket.IO integration
6. **Set up Cron Jobs** - ActivityLog cleanup

---

## 📚 Documentation

Each model file includes:
- ✅ JSDoc comments explaining purpose
- ✅ Field descriptions
- ✅ Index explanations
- ✅ Usage notes
- ✅ Cleanup strategies where applicable

---

## 🎉 Status: COMPLETE

**All 8 Mongoose models successfully created!**

- ✅ User Model (updated to match spec)
- ✅ Business Model
- ✅ Product Model
- ✅ Order Model
- ✅ Payment Model
- ✅ Coupon Model
- ✅ Notification Model
- ✅ ActivityLog Model

**Ready for Prompt 4:** Controllers, Routes, and API Implementation

---

**Date:** October 7, 2025  
**Prompt:** 3 of N - Mongoose Models Complete
