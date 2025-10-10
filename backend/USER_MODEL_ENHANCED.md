# 🎯 Enhanced User Model with Role-Specific Fields

## Overview
The User model now uses **MongoDB Discriminators** to support role-specific fields while maintaining a single collection. This is a best practice for polymorphic data.

---

## 📊 Base User Schema (Common to All Roles)

```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  phone: String (required, 10 digits),
  role: String (enum: 'customer', 'delivery', 'admin'),
  isActive: Boolean (default: true),
  profileImage: String (URL, optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 👤 1. Customer Discriminator

### Additional Fields:
```javascript
{
  address: [{
    label: String (e.g., "Home", "Work"),
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String (optional),
    isDefault: Boolean
  }],
  
  mostOrderedItems: [ObjectId ref Product],
  
  preferences: {
    favoriteCategories: [String],
    dietaryRestrictions: [String] // e.g., "vegetarian", "vegan"
  }
}
```

### Usage Example:
```javascript
import { Customer } from './models/User.js';

const customer = await Customer.create({
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  password: "Password123",
  role: "customer",
  address: [{
    label: "Home",
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: true
  }]
});
```

---

## 🚴 2. DeliveryBoy Discriminator

### Additional Fields:
```javascript
{
  // Status tracking
  status: {
    isOnline: Boolean (default: false),
    state: String (enum: 'free', 'busy', 'offline'),
    lastOnline: Date
  },
  
  // Current active order
  currentOrderId: ObjectId ref Order,
  
  // Order history with details
  assignedOrders: [{
    orderId: ObjectId ref Order,
    assignedAt: Date (default: now),
    completedAt: Date,
    status: String (enum: 'assigned', 'picked', 'delivered', 'cancelled')
  }],
  
  totalDeliveries: Number (default: 0),
  
  // Vehicle details
  vehicleInfo: {
    type: String (enum: 'bike', 'scooter', 'bicycle', 'car'),
    number: String (uppercase),
    model: String
  },
  
  // Document verification
  documents: {
    drivingLicense: {
      number: String,
      imageUrl: String,
      verified: Boolean (default: false),
      verifiedAt: Date
    },
    aadharCard: {
      number: String,
      imageUrl: String,
      verified: Boolean,
      verifiedAt: Date
    },
    vehicleRC: {
      number: String,
      imageUrl: String,
      verified: Boolean,
      verifiedAt: Date
    }
  },
  
  // Performance tracking
  rating: {
    average: Number (0-5, default: 0),
    count: Number (default: 0)
  },
  
  // Earnings management
  earnings: {
    total: Number (default: 0),
    pending: Number (default: 0),
    paid: Number (default: 0)
  },
  
  // Work schedule
  availability: {
    workingHours: {
      start: String (e.g., "09:00"),
      end: String (e.g., "21:00")
    },
    workingDays: [String] (e.g., ["Monday", "Tuesday"])
  }
}
```

### Usage Example:
```javascript
import { DeliveryBoy } from './models/User.js';

const deliveryBoy = await DeliveryBoy.create({
  name: "Raj Kumar",
  email: "raj@delivery.com",
  phone: "9876543210",
  password: "Password123",
  role: "delivery",
  vehicleInfo: {
    type: "bike",
    number: "MH01AB1234",
    model: "Honda Activa"
  },
  documents: {
    drivingLicense: {
      number: "DL1234567890",
      imageUrl: "https://...jpg"
    }
  }
});

// Update status when online
await DeliveryBoy.findByIdAndUpdate(deliveryBoy._id, {
  'status.isOnline': true,
  'status.state': 'free'
});

// Assign order
await DeliveryBoy.findByIdAndUpdate(deliveryBoy._id, {
  currentOrderId: orderId,
  'status.state': 'busy',
  $push: {
    assignedOrders: {
      orderId: orderId,
      status: 'assigned'
    }
  }
});
```

---

## 🧑‍💼 3. Admin Discriminator

### Additional Fields:
```javascript
{
  username: String (unique, required),
  
  adminRole: String (enum: 'owner', 'staff', 'manager', default: 'staff'),
  
  permissions: [String] (enum: [
    'manage_users',
    'manage_products',
    'manage_orders',
    'manage_deliveries',
    'view_reports',
    'manage_coupons',
    'manage_settings'
  ]),
  
  // Activity tracking
  lastLogin: Date,
  
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }]
}
```

### Usage Example:
```javascript
import { Admin } from './models/User.js';

const admin = await Admin.create({
  name: "Admin User",
  email: "admin@pizza.com",
  phone: "9876543210",
  password: "Admin@123",
  role: "admin",
  username: "admin",
  adminRole: "owner",
  permissions: [
    'manage_users',
    'manage_products',
    'manage_orders',
    'view_reports'
  ]
});

// Track login
await Admin.findByIdAndUpdate(admin._id, {
  lastLogin: new Date(),
  $push: {
    loginHistory: {
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  }
});
```

---

## 🔧 Common Methods

### 1. Password Hashing (Automatic)
```javascript
// Automatically hashed before saving
const user = new User({...});
await user.save(); // Password is hashed
```

### 2. Password Comparison
```javascript
const isMatch = await user.comparePassword('Password123');
```

### 3. Get Public Profile
```javascript
const profile = user.getPublicProfile();
// Returns role-specific fields without sensitive data
```

---

## 📝 Query Examples

### Find all delivery boys who are free
```javascript
const freeDeliveryBoys = await DeliveryBoy.find({
  'status.isOnline': true,
  'status.state': 'free'
});
```

### Find customer's most ordered items
```javascript
const customer = await Customer.findById(customerId)
  .populate('mostOrderedItems');
```

### Find admin with specific permission
```javascript
const admins = await Admin.find({
  permissions: 'manage_products'
});
```

---

## ✅ Benefits of This Approach

1. **Single Collection**: All users in one MongoDB collection
2. **Type Safety**: Role-specific fields only for that role
3. **Clean Queries**: Easy to query specific role types
4. **Maintainable**: Changes to role-specific fields don't affect others
5. **Flexible**: Easy to add new roles or fields
6. **Best Practice**: Industry-standard pattern for polymorphic data

---

## 🔄 Migration Note

**Existing users will continue to work!** MongoDB will automatically add the `role` discriminator key. Role-specific fields are optional by default, so no data migration needed.

---

## 📦 Export Pattern

```javascript
import User, { Customer, DeliveryBoy, Admin } from './models/User.js';

// Use base User for login/authentication
const user = await User.findOne({ email });

// Use specific discriminators for role-specific operations
const customer = await Customer.findById(userId);
const deliveryBoy = await DeliveryBoy.findById(userId);
const admin = await Admin.findById(userId);
```
