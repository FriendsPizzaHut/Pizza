# Quick Reference: Backend Architecture
## Friends Pizza Hut - Production-Ready Backend

---

## 🏗️ Architecture Overview

```
Client Request
    ↓
Routes (with middleware)
    ↓
Controllers (thin - orchestration only)
    ↓
Services (fat - business logic)
    ↓
Models (Mongoose schemas)
    ↓
MongoDB Database
```

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   ├── redis.js        # Redis connection
│   │   ├── jwtConfig.js    # JWT signing/verification
│   │   └── socket.js       # Socket.IO setup
│   │
│   ├── models/             # Mongoose schemas (8 models)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Coupon.js
│   │   ├── Business.js
│   │   ├── Notification.js
│   │   └── ActivityLog.js
│   │
│   ├── controllers/        # HTTP request handlers (9 controllers)
│   │   ├── authController.js       ✅ Refactored
│   │   ├── userController.js       ✅ Refactored
│   │   ├── productController.js    ✅ Refactored
│   │   ├── orderController.js      ✅ Refactored
│   │   ├── paymentController.js    ✅ Refactored
│   │   ├── couponController.js     ✅ Refactored
│   │   ├── businessController.js   ✅ Refactored
│   │   ├── notificationController.js ✅ Refactored
│   │   └── activityController.js   ✅ Refactored
│   │
│   ├── services/           # Business logic (9 services)
│   │   ├── authService.js          ✅ Implemented
│   │   ├── userService.js          ✅ Implemented
│   │   ├── productService.js       ✅ Implemented
│   │   ├── orderService.js         ✅ Implemented
│   │   ├── paymentService.js       ✅ Implemented
│   │   ├── couponService.js        ✅ Implemented
│   │   ├── businessService.js      ✅ Implemented
│   │   ├── notificationService.js  ✅ Implemented
│   │   └── activityService.js      ✅ Implemented
│   │
│   ├── routes/             # Express routers (9 routes)
│   │   ├── authRoutes.js           ✅ With auth & validation
│   │   ├── userRoutes.js           ✅ With auth & validation
│   │   ├── productRoutes.js        ✅ With auth & validation
│   │   ├── orderRoutes.js          ✅ With auth & validation
│   │   ├── paymentRoutes.js        ✅ With auth & validation
│   │   ├── couponRoutes.js         ✅ With auth & validation
│   │   ├── businessRoutes.js       ✅ With auth & validation
│   │   ├── notificationRoutes.js   ✅ With auth & validation
│   │   └── activityRoutes.js       ✅ With auth & validation
│   │
│   ├── middlewares/        # Custom middleware
│   │   ├── authMiddleware.js       ✅ protect, adminOnly, deliveryOnly
│   │   ├── validateMiddleware.js   ✅ validate(), quickValidate()
│   │   └── errorHandler.js         ✅ Global error handler
│   │
│   ├── utils/              # Utility functions
│   │   ├── validators/             # express-validator schemas
│   │   │   ├── authValidator.js    ✅ Register, login validation
│   │   │   ├── productValidator.js ✅ Product CRUD validation
│   │   │   ├── orderValidator.js   ✅ Order validation
│   │   │   ├── couponValidator.js  ✅ Coupon validation
│   │   │   ├── businessValidator.js ✅ Business validation
│   │   │   └── paymentValidator.js ✅ Payment validation
│   │   ├── response.js             ✅ sendResponse() utility
│   │   └── generateToken.js        ✅ JWT token generation
│   │
│   ├── app.js              # Express app setup
│   └── server.js           # Server startup
│
├── .env                    # Environment variables
├── package.json            # Dependencies
├── PROMPT_7_COMPLETE.md    ✅ Completion report
├── API_TESTING_GUIDE.md    ✅ Testing guide
└── CONTROLLER_REFACTORING_SUMMARY.md ✅ Summary
```

---

## 🔑 Key Components

### 1. **Authentication System** ✅
- **JWT-based** authentication
- **Access tokens** (15 min expiry)
- **Refresh tokens** (7 days expiry)
- **Password hashing** with bcrypt
- **Middleware**: `protect`, `adminOnly`, `deliveryOnly`, `optionalAuth`

### 2. **Validation System** ✅
- **express-validator** for input validation
- **6 validator files** covering all modules
- **Middleware**: `validate()` runs validation chains
- **Error format**: Returns 400 with validation errors

### 3. **Error Handling System** ✅
- **Global error handler** catches all errors
- **Custom error responses** for:
  - Mongoose CastError → 400
  - Mongoose ValidationError → 400
  - Duplicate key (11000) → 400
  - JWT errors → 401
  - Generic errors → 500
- **Consistent format**: `{ success: false, message: "..." }`

### 4. **Response Utility** ✅
- **sendResponse()** for consistent JSON responses
- **Format**: `{ success: true, message: "...", data: {...} }`
- **Used by all controllers**

### 5. **Service Layer** ✅
- **9 service files** with business logic
- **Pure functions** (easy to test)
- **Reusable** across controllers
- **Error throwing** with statusCode

---

## 🌐 API Endpoints Summary

### Base URL: `http://localhost:5000/api/v1`

| Module | Endpoints | Methods | Auth Required |
|--------|-----------|---------|---------------|
| **Auth** | `/auth/register` | POST | No |
| | `/auth/login` | POST | No |
| | `/auth/logout` | POST | Yes |
| **Users** | `/users` | GET | Admin |
| | `/users/:id` | GET, PATCH, DELETE | Yes |
| **Products** | `/products` | GET, POST | Public/Admin |
| | `/products/:id` | GET, PATCH, DELETE | Public/Admin |
| **Orders** | `/orders` | GET, POST | Admin/User |
| | `/orders/:id/status` | PATCH | Admin |
| | `/orders/user/:userId` | GET | User |
| **Payments** | `/payments` | GET, POST | Admin/User |
| | `/payments/:id` | GET, DELETE | Yes/Admin |
| **Coupons** | `/coupons` | GET, POST | Public/Admin |
| | `/coupons/:id` | PATCH, DELETE | Admin |
| **Business** | `/business` | GET, PATCH | Public/Admin |
| | `/business/status` | PATCH | Admin |
| **Notifications** | `/notifications/:userId` | GET | User |
| | `/notifications/:id/read` | PATCH | User |
| **Activity** | `/activity` | GET | Admin |
| | `/activity/cleanup` | DELETE | Admin |

---

## 🛡️ Security Features

### Implemented:
- ✅ **JWT Authentication** (access + refresh tokens)
- ✅ **Password Hashing** (bcrypt with salt rounds)
- ✅ **Input Validation** (express-validator)
- ✅ **CORS** configured
- ✅ **Helmet** for security headers
- ✅ **Rate Limiting** (optional - can be added)
- ✅ **Role-based Access Control** (customer, admin, delivery)

### Environment Variables:
```env
MONGO_URI=mongodb://localhost:27017/friendspizzahut
PORT=5000
JWT_SECRET=your_secret_key_here
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## 📊 Database Models

| Model | Fields | Relationships |
|-------|--------|---------------|
| **User** | name, email, password, phone, role, address, isActive | → Orders, Payments, Notifications |
| **Product** | name, description, price, category, imageUrl, isAvailable | ← Orders (items) |
| **Order** | user, items, totalAmount, status, deliveryAddress, deliveryAgent | → User, Product, Payment |
| **Payment** | order, user, amount, paymentMethod, transactionId, paymentStatus | → Order, User |
| **Coupon** | code, discountType, discountValue, minOrderAmount, startDate, endDate, isActive | (Standalone) |
| **Business** | name, phone, email, address, isOpen, bankDetails | (Single record) |
| **Notification** | user, title, message, isRead | → User |
| **ActivityLog** | user, action, details | → User |

---

## 🎯 Controller Pattern

**Every controller follows this pattern:**

```javascript
import * as serviceModule from '../services/serviceModule.js';
import { sendResponse } from '../utils/response.js';

export const functionName = async (req, res, next) => {
    try {
        // Extract data from request
        const data = req.body / req.params / req.query;
        
        // Call service (business logic)
        const result = await serviceModule.functionName(data);
        
        // Send consistent response
        sendResponse(res, statusCode, 'Success message', result);
    } catch (error) {
        // Pass to global error handler
        next(error);
    }
};
```

**That's it! Only 7 lines per function.**

---

## 🧪 Testing Quick Commands

### Start Server:
```bash
cd backend
npm install
npm run dev
```

### Test Authentication:
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!","phone":"1234567890"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Test Products (Public):
```bash
curl http://localhost:5000/api/v1/products
```

### Test Protected Route:
```bash
curl http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer <your_token>"
```

---

## 📚 Documentation Files

1. **PROMPT_5_COMPLETE.md** - Security implementation (JWT, validation, error handling)
2. **PROMPT_6_COMPLETE.md** - Service layer creation and API versioning
3. **PROMPT_7_COMPLETE.md** - Full CRUD implementation completion
4. **API_TESTING_GUIDE.md** - Complete API testing reference
5. **CONTROLLER_REFACTORING_SUMMARY.md** - Before/after comparison
6. **QUICK_REFERENCE.md** - This file

---

## 🚀 Deployment Checklist

- [ ] Set production MongoDB URI
- [ ] Set production Redis URL
- [ ] Generate strong JWT_SECRET
- [ ] Enable rate limiting
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production
- [ ] Add monitoring (PM2, New Relic, etc.)
- [ ] Set up logging (Winston, Morgan)
- [ ] Add API documentation (Swagger)
- [ ] Implement caching layer
- [ ] Set up CI/CD pipeline
- [ ] Configure backup strategy

---

## 💡 Quick Tips

### Adding a New Feature:
1. Create/update model if needed
2. Create service function with business logic
3. Create controller function (call service)
4. Add route with middleware (auth, validation)
5. Create validator if needed
6. Test with curl/Postman

### Debugging:
- Check terminal for server logs
- Check MongoDB for data
- Check Redis for cache (if using)
- Use error handler output for stack traces
- Check middleware execution order

### Common Issues:
- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Wrong route or resource doesn't exist
- **500 Internal Error**: Check server logs for details

---

## 📞 Support

For questions or issues:
1. Check documentation files
2. Review API testing guide
3. Check error messages in terminal
4. Verify database connection
5. Check environment variables

---

**Happy Coding! 🎉**
