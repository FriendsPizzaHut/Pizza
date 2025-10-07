# API Testing Guide - Friends Pizza Hut Backend
## Complete CRUD API Testing Reference

---

## 🚀 Quick Start

### Prerequisites
1. MongoDB running on `mongodb://localhost:27017/friendspizzahut`
2. Redis running on `localhost:6379`
3. Node.js server running on `http://localhost:5000`
4. Get authentication token (login/register first)

### Base URL
```
http://localhost:5000/api/v1
```

---

## 🔐 1. Authentication APIs

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "1234567890",
    "role": "customer"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

## 👤 2. User Management APIs

### Get All Users (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=10&role=customer&search=john" \
  -H "Authorization: Bearer <admin_token>"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `role` - Filter by role: customer, admin, delivery
- `search` - Search by name or email

### Get User By ID
```bash
curl -X GET http://localhost:5000/api/v1/users/<user_id> \
  -H "Authorization: Bearer <token>"
```

### Update User
```bash
curl -X PATCH http://localhost:5000/api/v1/users/<user_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "9876543210",
    "address": "456 New Street, City",
    "isActive": true
  }'
```

### Delete User (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/v1/users/<user_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🍕 3. Product APIs

### Get All Products (Public)
```bash
curl -X GET "http://localhost:5000/api/v1/products?category=Pizza&isAvailable=true&search=margherita"
```

**Query Parameters:**
- `category` - Pizza, Burger, Beverage, Dessert, Sides
- `isAvailable` - true/false
- `search` - Search by product name

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Margherita Pizza",
      "price": 299,
      "category": "Pizza",
      "isAvailable": true,
      "description": "..."
    }
  ]
}
```

### Get Product By ID (Public)
```bash
curl -X GET http://localhost:5000/api/v1/products/<product_id>
```

### Create Product (Admin Only)
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Classic tomato and mozzarella",
    "price": 299,
    "category": "Pizza",
    "imageUrl": "https://example.com/image.jpg",
    "isAvailable": true
  }'
```

### Update Product (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/v1/products/<product_id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 349,
    "isAvailable": false
  }'
```

### Delete Product (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/v1/products/<product_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📦 4. Order APIs

### Create Order (Authenticated User)
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user": "<user_id>",
    "items": [
      {
        "product": "<product_id>",
        "quantity": 2
      }
    ],
    "deliveryAddress": "123 Main Street, City, 123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "user": {...},
    "items": [...],
    "totalAmount": 598,
    "status": "pending",
    "deliveryAddress": "..."
  }
}
```

### Get All Orders (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/v1/orders?status=delivered&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**Query Parameters:**
- `status` - pending, preparing, out-for-delivery, delivered, cancelled
- `page` - Page number
- `limit` - Items per page

### Get Orders By User
```bash
curl -X GET http://localhost:5000/api/v1/orders/user/<user_id> \
  -H "Authorization: Bearer <token>"
```

### Update Order Status (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/v1/orders/<order_id>/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing",
    "deliveryAgent": "<delivery_user_id>"
  }'
```

**Status Flow:**
- `pending` → `preparing` → `out-for-delivery` → `delivered`
- Can be set to `cancelled` at any point

### Delete Order (Admin/User)
```bash
curl -X DELETE http://localhost:5000/api/v1/orders/<order_id> \
  -H "Authorization: Bearer <token>"
```
*Note: Only pending or cancelled orders can be deleted*

---

## 💳 5. Payment APIs

### Create Payment (Record Payment)
```bash
curl -X POST http://localhost:5000/api/v1/payments \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "order": "<order_id>",
    "user": "<user_id>",
    "amount": 598,
    "paymentMethod": "credit_card",
    "transactionId": "TXN123456789"
  }'
```

**Payment Methods:**
- `credit_card`
- `debit_card`
- `upi`
- `cash_on_delivery`
- `net_banking`

### Get Payment By ID
```bash
curl -X GET http://localhost:5000/api/v1/payments/<payment_id> \
  -H "Authorization: Bearer <token>"
```

### Get All Payments (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/v1/payments?paymentStatus=completed&page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

### Delete Payment (Admin Only - Cleanup)
```bash
curl -X DELETE http://localhost:5000/api/v1/payments/<payment_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🎟️ 6. Coupon APIs

### Get All Coupons (Public)
```bash
curl -X GET "http://localhost:5000/api/v1/coupons?isActive=true"
```

### Create Coupon (Admin Only)
```bash
curl -X POST http://localhost:5000/api/v1/coupons \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PIZZA50",
    "description": "50% off on all pizzas",
    "discountType": "percentage",
    "discountValue": 50,
    "minOrderAmount": 299,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "isActive": true
  }'
```

**Discount Types:**
- `percentage` - Discount as percentage (e.g., 50 = 50%)
- `flat` - Flat discount amount (e.g., 100 = ₹100 off)

### Update Coupon (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/v1/coupons/<coupon_id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "discountValue": 30
  }'
```

### Delete Coupon (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/v1/coupons/<coupon_id> \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🏢 7. Business APIs

### Get Business Details (Public)
```bash
curl -X GET http://localhost:5000/api/v1/business
```

**Response:**
```json
{
  "success": true,
  "message": "Business details retrieved successfully",
  "data": {
    "name": "Friends Pizza Hut",
    "phone": "1234567890",
    "email": "info@friendspizza.com",
    "address": "...",
    "isOpen": true,
    "bankDetails": {...}
  }
}
```

### Update Business (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/v1/business \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Friends Pizza Hut",
    "phone": "9876543210",
    "email": "info@friendspizza.com",
    "address": "456 Business St, City",
    "bankDetails": {
      "accountNumber": "123456789",
      "ifscCode": "BANK0001234",
      "accountHolderName": "Friends Pizza Hut"
    }
  }'
```

### Toggle Business Status (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/v1/business/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isOpen": false
  }'
```

---

## 🔔 8. Notification APIs

### Get User Notifications
```bash
curl -X GET "http://localhost:5000/api/v1/notifications/<user_id>?isRead=false" \
  -H "Authorization: Bearer <user_token>"
```

**Query Parameters:**
- `isRead` - true/false (filter by read status)

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "_id": "...",
      "user": "<user_id>",
      "title": "Order Delivered",
      "message": "Your order has been delivered",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Mark Notification as Read
```bash
curl -X PATCH http://localhost:5000/api/v1/notifications/<notification_id>/read \
  -H "Authorization: Bearer <user_token>"
```

---

## 📊 9. Activity Log APIs

### Get Today's Activities (Admin Only)
```bash
curl -X GET http://localhost:5000/api/v1/activity \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Activities retrieved successfully",
  "data": [
    {
      "_id": "...",
      "user": {...},
      "action": "CREATE_ORDER",
      "details": "Order #12345 created",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Cleanup Old Logs (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/v1/activity/cleanup \
  -H "Authorization: Bearer <admin_token>"
```

*Deletes activity logs older than 30 days*

---

## 🧪 Testing Workflows

### Workflow 1: Customer Order Flow
```bash
# 1. Register customer
curl -X POST http://localhost:5000/api/v1/auth/register -d '...'

# 2. Login
curl -X POST http://localhost:5000/api/v1/auth/login -d '...'

# 3. Browse products
curl -X GET http://localhost:5000/api/v1/products

# 4. Create order
curl -X POST http://localhost:5000/api/v1/orders -d '...'

# 5. Make payment
curl -X POST http://localhost:5000/api/v1/payments -d '...'

# 6. Check order status
curl -X GET http://localhost:5000/api/v1/orders/user/<user_id>
```

### Workflow 2: Admin Management Flow
```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login -d '...'

# 2. View all orders
curl -X GET http://localhost:5000/api/v1/orders

# 3. Update order status
curl -X PATCH http://localhost:5000/api/v1/orders/<id>/status -d '...'

# 4. View all users
curl -X GET http://localhost:5000/api/v1/users

# 5. View today's activities
curl -X GET http://localhost:5000/api/v1/activity
```

---

## ⚠️ Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error: Email is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Notes

1. **Authentication Token**: Include in `Authorization: Bearer <token>` header for protected routes
2. **Content-Type**: Always use `application/json` for POST/PATCH requests
3. **Pagination**: Most list endpoints support `page` and `limit` query params
4. **Filtering**: Check each endpoint's available filters
5. **Date Format**: Use ISO 8601 format (YYYY-MM-DD or full timestamp)

---

## 🚀 Next Steps

1. Test all endpoints using Postman/Insomnia
2. Set up automated API tests (Jest + Supertest)
3. Monitor error rates and response times
4. Implement rate limiting for production
5. Add API documentation (Swagger/OpenAPI)

---

**Happy Testing! 🎉**
