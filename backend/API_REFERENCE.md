# 🚀 Backend API Reference

## Base URL
```
http://localhost:5000/api
```

---

## 📍 Endpoints Overview

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |

### 👤 Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Yes |
| PATCH | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Admin |

### 🏢 Business (`/api/business`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/business` | Get business details | No |
| PATCH | `/business` | Update business | Admin |
| PATCH | `/business/status` | Toggle open/closed | Admin |

### 🍕 Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/:id` | Get product by ID | No |
| POST | `/products` | Create product | Admin |
| PATCH | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Create order | Yes |
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/user/:userId` | Get user orders | Yes |
| PATCH | `/orders/:id/status` | Update order status | Admin |
| DELETE | `/orders/:id` | Delete order | Admin |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments` | Create payment | Yes |
| GET | `/payments/:id` | Get payment by ID | Yes |
| GET | `/payments` | Get all payments | Admin |
| DELETE | `/payments/:id` | Delete payment | Admin |

### 🎟️ Coupons (`/api/coupons`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/coupons` | Get all coupons | No |
| POST | `/coupons` | Create coupon | Admin |
| PATCH | `/coupons/:id` | Update coupon | Admin |
| DELETE | `/coupons/:id` | Delete coupon | Admin |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications/:userId` | Get user notifications | Yes |
| PATCH | `/notifications/:id/read` | Mark as read | Yes |

### 📊 Activity Logs (`/api/activity`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/activity` | Get today's activities | Admin |
| DELETE | `/activity/cleanup` | Cleanup old logs | Admin |

---

## 📝 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securePassword123",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}

# Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "123...",
    "token": "jwt.token.here"
  }
}
```

### Create Order
```bash
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "user": "userId",
  "items": [
    {
      "product": "productId1",
      "quantity": 2,
      "price": 299
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}

# Response
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "123...",
    "totalAmount": 598,
    "status": "pending"
  }
}
```

### Get Products
```bash
GET /api/products?category=pizza

# Response
{
  "success": true,
  "data": [
    {
      "_id": "123...",
      "name": "Margherita",
      "category": "pizza",
      "price": 299,
      "description": "Classic cheese pizza",
      "isAvailable": true
    }
  ]
}
```

### Apply Coupon (Check Validity)
```bash
# First get the coupon
GET /api/coupons

# Use coupon model's isValid method in application logic
# Coupons have:
# - code: "SAVE20"
# - discountType: "percentage" | "fixed"
# - discountValue: 20
# - validFrom/validUntil dates
# - minOrderAmount
# - maxUses
```

---

## 🔧 Query Parameters

### Products
- `?category=pizza` - Filter by category

### Notifications  
- `?isRead=true` - Filter by read status
- `?isRead=false` - Get only unread

### Users
- Pagination ready (can be added to controller)

---

## ⚠️ Error Responses

All errors follow consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Authentication (To Be Implemented)

### Header Format
```
Authorization: Bearer <JWT_TOKEN>
```

### Token Structure
```javascript
{
  "userId": "123...",
  "email": "user@example.com",
  "role": "customer" | "admin" | "delivery"
}
```

---

## 📌 Notes

1. **Auth Middleware Not Yet Applied**: All endpoints are currently unprotected
2. **Rate Limiting**: Not yet implemented
3. **Input Validation**: Basic validation in place, can be enhanced
4. **Pagination**: Ready to implement in controllers
5. **File Uploads**: Not yet implemented (for product images)

---

## 🧪 Testing with cURL

### Complete User Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","phone":"1234567890"}'

# 2. Login (save the token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Get Products
curl http://localhost:5000/api/products

# 4. Create Order (use token from step 2)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"user":"userId","items":[{"product":"productId","quantity":2,"price":299}]}'
```

---

## 📚 Related Documentation

- [PROMPT_4_COMPLETE.md](./PROMPT_4_COMPLETE.md) - Implementation details
- [README.md](./README.md) - Project overview
- [.env.example](./.env.example) - Environment variables

---

**Last Updated:** Prompt 4 Completion
