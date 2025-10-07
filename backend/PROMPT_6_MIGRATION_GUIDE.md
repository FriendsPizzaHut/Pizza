# 🔄 Controller-to-Service Migration Guide

## Purpose
This guide shows how to refactor existing controllers to use the service layer pattern as specified in Prompt 6.

---

## 🎯 Migration Pattern

### Before (Old Pattern)
```javascript
// Controller has business logic
export const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;
    
    // ❌ Business logic in controller
    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product exists'
      });
    }
    
    // ❌ Database operation in controller
    const product = await Product.create({ name, price });
    
    // ❌ Manual response formatting
    res.status(201).json({
      success: true,
      message: 'Product created',
      data: product
    });
  } catch (error) {
    // ❌ Manual error handling
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### After (Service Pattern - Prompt 6)
```javascript
// Controller - orchestration only
import * as productService from '../services/productService.js';
import { sendResponse } from '../utils/response.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

// Service - business logic
export const createProduct = async (productData) => {
  const { name, price } = productData;
  
  // ✅ Business logic in service
  const existing = await Product.findOne({ name });
  if (existing) {
    const error = new Error('Product with this name already exists');
    error.statusCode = 400;
    throw error;
  }
  
  // ✅ Database operation in service
  const product = await Product.create({ name, price });
  return product;
};
```

---

## 📋 Step-by-Step Migration

### Step 1: Create Service File

Create `src/services/productService.js`:

```javascript
import Product from '../models/Product.js';

export const createProduct = async (productData) => {
  // Move all business logic here
  return product;
};

export const getAllProducts = async (filters) => {
  // Move all query logic here
  return products;
};

// ... more functions
```

### Step 2: Refactor Controller

Update `src/controllers/productController.js`:

```javascript
import * as productService from '../services/productService.js';
import { sendResponse } from '../utils/response.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    sendResponse(res, 200, 'Products retrieved successfully', products);
  } catch (error) {
    next(error);
  }
};
```

### Step 3: Update Imports

No changes needed in routes - they already import controllers.

---

## 🔧 Controllers to Migrate

### ✅ Already Migrated
- [x] authController.js → authService.js

### ⏳ Pending Migration

#### 1. userController.js
**Current state:** Has business logic  
**Service needed:** userService.js  
**Functions to migrate:**
- getAllUsers()
- getUserById()
- updateUser()
- deleteUser()

#### 2. productController.js
**Current state:** Has database queries  
**Service needed:** productService.js  
**Functions to migrate:**
- getAllProducts()
- getProductById()
- createProduct()
- updateProduct()
- deleteProduct()

#### 3. orderController.js
**Current state:** Has business logic  
**Service needed:** orderService.js  
**Functions to migrate:**
- createOrder()
- getAllOrders()
- getOrdersByUser()
- updateOrderStatus()
- deleteOrder()

#### 4. paymentController.js
**Current state:** Has database queries  
**Service needed:** paymentService.js  
**Functions to migrate:**
- createPayment()
- getPaymentById()
- getAllPayments()
- deletePayment()

#### 5. couponController.js
**Current state:** Has validation logic  
**Service needed:** couponService.js  
**Functions to migrate:**
- getAllCoupons()
- createCoupon()
- updateCoupon()
- deleteCoupon()

#### 6. businessController.js
**Current state:** Has business logic  
**Service needed:** businessService.js  
**Functions to migrate:**
- getBusinessDetails()
- updateBusiness()
- toggleBusinessStatus()

#### 7. notificationController.js
**Current state:** Has database queries  
**Service needed:** notificationService.js  
**Functions to migrate:**
- getUserNotifications()
- markAsRead()

#### 8. activityController.js
**Current state:** Has database queries  
**Service needed:** activityService.js  
**Functions to migrate:**
- getTodayActivities()
- cleanupOldLogs()

---

## 📝 Migration Checklist

For each controller:

- [ ] Create corresponding service file in `src/services/`
- [ ] Move all database queries to service
- [ ] Move all business logic to service
- [ ] Make service functions throw errors with `statusCode`
- [ ] Update controller to import service
- [ ] Replace direct DB calls with service calls
- [ ] Replace manual `res.json()` with `sendResponse()`
- [ ] Replace `catch` error handling with `next(error)`
- [ ] Test the refactored endpoint
- [ ] Update any related tests

---

## 🎯 Key Rules

### Controllers SHOULD:
✅ Import and call service functions  
✅ Use `sendResponse()` for success  
✅ Use `next(error)` for errors  
✅ Extract data from `req` (body, params, query)  
✅ Have 3-5 lines of code per function  

### Controllers SHOULD NOT:
❌ Have database queries  
❌ Have business logic  
❌ Have validation logic  
❌ Manually format responses  
❌ Manually handle errors  

### Services SHOULD:
✅ Contain all business logic  
✅ Perform database operations  
✅ Throw errors with `statusCode` property  
✅ Return data (not responses)  
✅ Be reusable across controllers  

### Services SHOULD NOT:
❌ Access `req` or `res` objects  
❌ Send HTTP responses  
❌ Handle HTTP-specific logic  
❌ Have routing logic  

---

## 💡 Common Patterns

### Pattern 1: CRUD Operations

```javascript
// Service
export const getById = async (id) => {
  const item = await Model.findById(id);
  if (!item) {
    const error = new Error('Item not found');
    error.statusCode = 404;
    throw error;
  }
  return item;
};

// Controller
export const get = async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id);
    sendResponse(res, 200, 'Item retrieved', item);
  } catch (error) {
    next(error);
  }
};
```

### Pattern 2: With Query Filters

```javascript
// Service
export const getAll = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.isActive) query.isActive = filters.isActive;
  
  const items = await Model.find(query).sort({ createdAt: -1 });
  return items;
};

// Controller
export const list = async (req, res, next) => {
  try {
    const items = await service.getAll(req.query);
    sendResponse(res, 200, 'Items retrieved', items);
  } catch (error) {
    next(error);
  }
};
```

### Pattern 3: With Validation

```javascript
// Service
export const create = async (data) => {
  // Check for duplicates
  const existing = await Model.findOne({ email: data.email });
  if (existing) {
    const error = new Error('Email already exists');
    error.statusCode = 400;
    throw error;
  }
  
  // Create
  const item = await Model.create(data);
  return item;
};

// Controller
export const create = async (req, res, next) => {
  try {
    const item = await service.create(req.body);
    sendResponse(res, 201, 'Item created', item);
  } catch (error) {
    next(error);
  }
};
```

### Pattern 4: With User Context

```javascript
// Service
export const getUserData = async (userId, requesterId) => {
  // Check permissions
  if (userId !== requesterId) {
    const error = new Error('Unauthorized access');
    error.statusCode = 403;
    throw error;
  }
  
  const data = await Model.findOne({ user: userId });
  return data;
};

// Controller
export const getData = async (req, res, next) => {
  try {
    const data = await service.getUserData(
      req.params.userId,
      req.user.id // from auth middleware
    );
    sendResponse(res, 200, 'Data retrieved', data);
  } catch (error) {
    next(error);
  }
};
```

---

## 🚀 Benefits After Migration

### 1. Cleaner Controllers
- Reduced from 20-30 lines to 5-7 lines per function
- Easy to understand at a glance
- Consistent pattern across all controllers

### 2. Testable Services
- Business logic isolated
- Can unit test without HTTP mocks
- Easy to write test cases

### 3. Reusable Logic
- Services can be called from multiple places
- Same logic for API, WebSocket, cron jobs
- No code duplication

### 4. Better Error Handling
- Consistent error format
- Proper HTTP status codes
- Global error handler catches everything

### 5. Maintainability
- Easy to find bugs (clear responsibility)
- Simple to add features
- Clear code organization

---

## 📊 Progress Tracking

| Controller | Service Created | Logic Migrated | Tested | Status |
|-----------|----------------|----------------|---------|---------|
| auth | ✅ | ✅ | ⏳ | 🟢 Complete |
| user | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| product | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| order | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| payment | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| coupon | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| business | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| notification | ✅ | ⏳ | ⏳ | 🟡 In Progress |
| activity | ✅ | ⏳ | ⏳ | 🟡 In Progress |

---

## ✅ Final Checklist

Once all controllers are migrated:

- [ ] All controllers use service layer
- [ ] All controllers use `sendResponse()`
- [ ] All controllers use `next(error)`
- [ ] All services implement business logic
- [ ] All services throw proper errors
- [ ] All endpoints tested
- [ ] Documentation updated
- [ ] API versioning consistent (`/api/v1`)

---

**Migration Status: IN PROGRESS (1/9 Complete)**

Continue migrating one controller at a time for a smooth transition!
