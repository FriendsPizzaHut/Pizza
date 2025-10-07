# 🧪 Middleware & Authentication Testing Guide

## Quick Testing Checklist

### Prerequisites
1. Ensure MongoDB is running
2. Ensure Redis is running (optional for this test)
3. Copy `.env.example` to `.env` and set `JWT_SECRET`
4. Start the server: `npm run dev`

---

## 1️⃣ Test Public Routes (No Auth Required)

### Health Check
```bash
curl http://localhost:5000/health
# Should return: { "success": true, "message": "Server is running", ... }
```

### Get Products (Public)
```bash
curl http://localhost:5000/api/products
# Should return: { "success": true, "data": [...] }
```

---

## 2️⃣ Test Registration with Validation

### Valid Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "Test123",
    "role": "customer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Invalid Registration (Testing Validation)
```bash
# Missing fields
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "invalid-email",
    "password": "123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be between 2 and 50 characters"
    },
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    },
    {
      "field": "phone",
      "message": "Phone number is required"
    }
  ]
}
```

---

## 3️⃣ Test Login & Token Generation

### Valid Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

**Save the accessToken from the response for next tests!**

### Invalid Login
```bash
# Wrong password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

---

## 4️⃣ Test Protected Routes (Auth Required)

### Test with Valid Token
```bash
# Replace YOUR_TOKEN with the accessToken from login
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Get user profile (should work)
curl -X GET http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    ...
  }
}
```

### Test without Token (Should Fail)
```bash
curl -X GET http://localhost:5000/api/users/USER_ID
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided. Please authenticate."
}
```

### Test with Invalid Token (Should Fail)
```bash
curl -X GET http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid token."
}
```

---

## 5️⃣ Test Admin-Only Routes

### Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "9876543210",
    "password": "Admin123",
    "role": "admin"
  }'
```

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123"
  }'
```

**Save the admin accessToken!**

### Test Admin Route with Customer Token (Should Fail)
```bash
# Use customer token
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Test Admin Route with Admin Token (Should Work)
```bash
# Use admin token
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Test User", "email": "test@example.com", "role": "customer" },
    { "_id": "...", "name": "Admin User", "email": "admin@example.com", "role": "admin" }
  ]
}
```

---

## 6️⃣ Test Input Validation on Protected Routes

### Create Product without Required Fields
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "P",
    "price": -10
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Product name must be between 2 and 100 characters"
    },
    {
      "field": "description",
      "message": "Product description is required"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    },
    {
      "field": "category",
      "message": "Category is required"
    }
  ]
}
```

### Create Product with Valid Data
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Classic Italian pizza with fresh mozzarella",
    "price": 299,
    "category": "pizza",
    "isAvailable": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "...",
    "name": "Margherita Pizza",
    "price": 299,
    ...
  }
}
```

---

## 7️⃣ Test Order Creation with Validation

### Create Order (Authenticated)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": "USER_ID_HERE",
    "items": [
      {
        "product": "PRODUCT_ID_HERE",
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
  }'
```

---

## 8️⃣ Test Error Handling

### Test with Invalid MongoDB ID
```bash
curl -X GET http://localhost:5000/api/products/invalid_id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid _id: invalid_id"
}
```

### Test with Non-Existent ID
```bash
curl -X GET http://localhost:5000/api/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 9️⃣ Test Delivery Agent Routes

### Register Delivery Agent
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delivery Agent",
    "email": "delivery@example.com",
    "phone": "5555555555",
    "password": "Delivery123",
    "role": "delivery"
  }'
```

### Login as Delivery Agent
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "delivery@example.com",
    "password": "Delivery123"
  }'
```

### Update Order Status (Should Work for Delivery Agent)
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "out_for_delivery"
  }'
```

### Try Admin Route as Delivery Agent (Should Fail)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $DELIVERY_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ Public routes accessible without token
- ✅ Protected routes require valid token
- ✅ Invalid tokens rejected with 401
- ✅ Missing tokens rejected with 401
- ✅ Customer cannot access admin routes (403)
- ✅ Delivery agents can update order status
- ✅ Validation errors return 400 with detailed messages
- ✅ Invalid MongoDB IDs return 400
- ✅ JWT errors caught and returned properly
- ✅ All error responses have consistent format

---

## 🐛 Common Issues

### "No token provided"
- Check Authorization header format: `Bearer <token>`
- Ensure token is copied correctly (no spaces)

### "Token expired"
- Access tokens expire in 15 minutes
- Login again to get new token
- Use refresh token endpoint (if implemented)

### "User not found"
- Token valid but user deleted
- Clear tokens and re-register/login

### "Validation failed"
- Check request body matches validator requirements
- Ensure Content-Type is `application/json`
- Verify required fields are present

---

## 📝 Postman Collection (Alternative)

You can also test using Postman:

1. Create a new collection
2. Add environment variables:
   - `base_url`: http://localhost:5000
   - `token`: (set after login)
   - `admin_token`: (set after admin login)

3. Add requests:
   - POST {{base_url}}/api/auth/register
   - POST {{base_url}}/api/auth/login
   - GET {{base_url}}/api/users (with {{token}})
   - etc.

4. Use Postman's Authorization tab:
   - Type: Bearer Token
   - Token: {{token}}

---

**Testing Complete! Your backend is secure and validated! 🔐✅**
