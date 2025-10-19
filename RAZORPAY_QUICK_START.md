# 🚀 Razorpay Quick Start Guide

## ⚡ Get Your Razorpay Test Keys (5 Minutes)

### Step 1: Sign Up for Razorpay
1. Go to: https://dashboard.razorpay.com/signup
2. Sign up with your email (no KYC needed for test mode)
3. Verify your email

### Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click on **Generate Test Key** (if not already generated)
4. You'll see:
   - **Key Id** (starts with `rzp_test_`)
   - **Key Secret** (click to reveal)
5. Copy both keys

### Step 3: Configure Backend
1. Open `backend/.env` file
2. Replace the placeholder values:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
   RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
   ```

### Step 4: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connection established
✅ Redis connection established
🚀 Server is running in development mode
```

### Step 5: Test the Integration

**Quick Test - Check if Razorpay is configured:**
```bash
# This endpoint checks configuration without requiring actual keys
curl http://localhost:5000/health
```

**Full Test - Create Razorpay Order:**

1. First, login to get JWT token:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_CUSTOMER_EMAIL",
    "password": "YOUR_PASSWORD"
  }'
```

2. Copy the `token` from response

3. Create an order first:
```bash
curl -X POST http://localhost:5000/api/v1/orders/from-cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryAddress": {
        "street": "123 Test St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
    },
    "contactPhone": "9876543210",
    "paymentMethod": "card"
  }'
```

4. Copy the `_id` from order response

5. Create Razorpay order:
```bash
curl -X POST http://localhost:5000/api/v1/payments/razorpay/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "amount": 599
  }'
```

**Expected Success Response:**
```json
{
    "status": "success",
    "message": "Razorpay order created successfully",
    "data": {
        "razorpayOrderId": "order_MxABCDEFGH",
        "amount": 59900,
        "currency": "INR",
        "receipt": "ORDER_ID_HERE",
        "status": "created",
        "key": "rzp_test_xxxxx"
    }
}
```

If you see this response, **Phase 1 is working perfectly!** ✅

---

## 🔧 Troubleshooting

### Error: "Payment gateway not configured"
- Check if you've added the correct keys in `.env`
- Restart the backend server after updating `.env`
- Make sure keys start with `rzp_test_`

### Error: "Invalid API Key"
- Double-check Key Id and Key Secret
- Make sure there are no extra spaces
- Regenerate keys from Razorpay Dashboard if needed

### Error: "Order not found"
- Make sure you're using correct order ID
- Order must exist in database before creating Razorpay order
- Check if order belongs to the logged-in user

---

## 📱 Test Payment Methods

Once frontend is integrated, you can test with:

### **Test Cards:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

### **Test UPI IDs:**
```
success@razorpay - Always succeeds
failure@razorpay - Always fails
```

### **Test Netbanking:**
- Select any bank
- Use credentials: `test` / `test`

---

## 🎯 Next Steps

Phase 1 Complete! ✅

Now you can:
1. ✅ Test backend endpoints
2. 🔜 Proceed to Phase 2 (Frontend Integration)
3. 🔜 Test full payment flow with Razorpay checkout

**Ready to move to Phase 2?** Just say "start phase 2" and I'll implement frontend integration! 🚀
