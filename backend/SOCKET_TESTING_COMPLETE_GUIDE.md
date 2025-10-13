# 🧪 Complete Socket Testing Guide

## Your User Details
- **User ID**: `68e991b36988614e28cb0993`
- **Name**: Naitik Kumar
- **Email**: naitikkumar2408@gmail.com
- **Role**: Admin

---

## 📝 Step-by-Step Testing Process

### Step 1: Open the Socket Test Client

1. Navigate to: `/home/naitik2408/Contribution/pizza2/backend/socket-test-client.html`
2. Open it in your browser (Chrome/Firefox recommended)

---

### Step 2: Connect to Socket Server

In the test client:

1. **Server URL**: Should be `http://localhost:5000` (already filled)
2. **User ID**: Enter `68e991b36988614e28cb0993`
3. **Role**: Select "Admin"
4. Click **"🔌 Connect"** button

**✅ What You Should See:**
- Status changes from "Disconnected" (red) to **"Connected" (green)**
- Socket ID appears (something like `aBc123XyZ`)
- Event appears: 
  ```json
  Event: connect
  {
    "socketId": "aBc123XyZ",
    "message": "Successfully connected to server"
  }
  ```

**🔍 Backend Console Should Show:**
```
🟢 New client connected: aBc123XyZ
```

---

### Step 3: Register as Admin

After connecting, click **"👨‍💼 Register as Admin"** button

**✅ What You Should See:**
- Event appears:
  ```json
  Event: emit:register
  {
    "userId": "68e991b36988614e28cb0993",
    "role": "admin"
  }
  ```
- Then another event:
  ```json
  Event: registered
  {
    "success": true,
    "userId": "68e991b36988614e28cb0993",
    "role": "admin",
    "message": "Successfully connected to real-time updates"
  }
  ```

**🔍 Backend Console Should Show:**
```
✅ User registered: 68e991b36988614e28cb0993 (admin) - Socket: aBc123XyZ
📊 Connected users: 1
📍 Admin joined: aBc123XyZ
```

**🎯 This means you're now in the `role:admin` room and will receive all admin events!**

---

### Step 4: Test Real-Time Order Events

Now let's trigger actual events using Postman or your frontend.

---

## 🧪 Test Scenario 1: New Order Created

### Using Postman:

First, login to get a customer token (or use your admin token):

```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "naitikkumar2408@gmail.com",
  "password": "your_password"
}
```

Save the token, then create an order:

```http
POST http://localhost:5000/api/v1/orders/from-cart
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "deliveryAddress": {
    "street": "123 Test Street",
    "city": "Muzaffarpur",
    "state": "Bihar",
    "zipCode": "842001",
    "coordinates": {
      "latitude": 26.1209,
      "longitude": 85.3647
    }
  },
  "paymentMethod": "cash"
}
```

### ✅ What You Should See in Test Client:

A new event will appear:

```json
Event: order:new
{
  "orderId": "6705...",
  "orderNumber": "ORD-20251013-0001",
  "customerId": "68e991b36988614e28cb0993",
  "customerName": "Naitik Kumar",
  "items": [
    {
      "product": {...},
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "deliveryAddress": {
    "street": "123 Test Street",
    "city": "Muzaffarpur",
    "state": "Bihar"
  },
  "status": "pending",
  "message": "🔔 New order received!",
  "timestamp": "2025-10-13T..."
}
```

### 🔍 Backend Console Should Show:
```
📦 New order notification sent - Order: ORD-20251013-0001
📤 Emitted "order:new" to role: admin
```

### ❌ Troubleshooting - If NO event appears:

**Check these:**

1. **Is the socket still connected?**
   - Look at status badge - should be green "Connected"
   - If red, click "Connect" again

2. **Did you register as admin?**
   - Must see the "registered" event
   - Click "Register as Admin" button

3. **Backend console check:**
   - Does it show "📦 New order notification sent"?
   - If NO → Order creation failed or socket event not fired
   - If YES → Check if you're in the admin room

4. **MongoDB check:**
   - Check if order was actually created in MongoDB
   - If not created → Fix order creation issue first

---

## 🧪 Test Scenario 2: Order Status Update

Get an order ID from MongoDB Compass or from the previous test, then:

```http
PATCH http://localhost:5000/api/v1/orders/ORDER_ID_HERE/status
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

### ✅ What You Should See in Test Client:

```json
Event: order:status:changed
{
  "orderId": "6705...",
  "orderNumber": "ORD-20251013-0001",
  "status": "confirmed",
  "previousStatus": "pending",
  "message": "✅ Order confirmed! Preparing your food...",
  "timestamp": "2025-10-13T..."
}
```

### 🔍 Backend Console Should Show:
```
📦 Order status update sent - Order: ORD-20251013-0001 → confirmed
📤 Emitted "order:status:changed" to role: admin
```

---

## 🧪 Test Scenario 3: Assign Delivery Agent

First, get a delivery agent user ID from MongoDB Compass:
- Look for a user with `"role": "delivery"`
- Copy their `_id`

Then:

```http
PATCH http://localhost:5000/api/v1/orders/ORDER_ID_HERE/assign-delivery
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "deliveryAgentId": "DELIVERY_USER_ID_HERE"
}
```

### ✅ What You Should See in Test Client:

```json
Event: order:assigned
{
  "orderId": "6705...",
  "orderNumber": "ORD-20251013-0001",
  "deliveryAgent": {
    "_id": "6705...",
    "name": "Delivery Boy Name",
    "phone": "+1234567890"
  },
  "assignedAt": "2025-10-13T...",
  "message": "Order ORD-20251013-0001 assigned to Delivery Boy Name"
}
```

### 🔍 Backend Console Should Show:
```
🚴 Delivery assignment sent - Order: ORD-20251013-0001 → Agent: Delivery Boy Name
📤 Emitted "order:assigned" to role: admin
📤 Emitted "order:assigned" to user DELIVERY_USER_ID
```

---

## 🎯 How to Know It's Working

### ✅ Success Indicators:

1. **Connection Status**: Green "Connected" badge
2. **Socket ID**: Shows actual ID (not "Not connected")
3. **Event Count**: Increases with each event (e.g., "3 events")
4. **Events Appear**: New colored boxes with JSON data
5. **Backend Logs**: Show emission logs
6. **Animation**: Events slide in smoothly

### ❌ Failure Indicators:

1. **Status**: Red "Disconnected" badge
2. **No Events**: Empty state message shows
3. **Console Errors**: Check browser console (F12)
4. **Backend Silent**: No emission logs

---

## 🐛 Common Issues & Solutions

### Issue 1: "Already connected" message

**Solution**: Click "Disconnect" first, then "Connect"

---

### Issue 2: Connected but no events

**Checklist:**
- [ ] Did you click "Register as Admin"?
- [ ] Is backend console showing emission logs?
- [ ] Are you using the correct endpoints in Postman?
- [ ] Is the order actually being created/updated?

**Solution**: 
```bash
# Check backend logs
cd /home/naitik2408/Contribution/pizza2/backend
npm run dev
# Watch for socket emission logs
```

---

### Issue 3: Connection error

**Backend not running?**
```bash
cd /home/naitik2408/Contribution/pizza2/backend
npm run dev
```

**Wrong URL?** Make sure it's `http://localhost:5000` (not HTTPS)

---

### Issue 4: Events showing but wrong data

**Check MongoDB**: Make sure the order/user data is correct

**Check Backend Code**: Verify socket events are emitting correct data

---

## 📊 Testing Checklist

After completing tests, verify:

- [ ] Socket connects successfully (green badge)
- [ ] Registration works (see "registered" event)
- [ ] Can receive `order:new` event
- [ ] Can receive `order:status:changed` event
- [ ] Can receive `order:assigned` event
- [ ] Backend console shows all emission logs
- [ ] Event data is correct and complete
- [ ] Events appear in real-time (no delay)

---

## 🎉 If Everything Works

**You're ready for Phase 2!**

Next steps:
1. ✅ Backend socket events working
2. ➡️ **Connect OrderManagementScreen.tsx** (Admin frontend)
3. ➡️ **Connect Delivery screens** (Delivery frontend)

---

## 📸 Screenshot Reference

### What Your Test Client Should Look Like:

```
┌─────────────────────────────────────────────┐
│  🔌 Real-Time Socket Test Client           │
│  Test your Pizza Order Management          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Connection Status: [Connected] ✅           │
│ Socket ID: aBc123XyZ                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🎮 Connection Controls                      │
│                                             │
│ Server URL: http://localhost:5000          │
│ User ID: 68e991b36988614e28cb0993          │
│ Role: [Admin ▼]                             │
│                                             │
│ [Connect] [Disconnect] [Register as Admin] │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📡 Real-Time Events          [3 events]    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔔 order:assigned       02:35:42       │ │
│ │ { "orderId": "...", ... }              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔔 order:status:changed  02:35:30      │ │
│ │ { "orderId": "...", ... }              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔔 order:new            02:35:15       │ │
│ │ { "orderId": "...", ... }              │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🚀 Ready to Proceed?

Once you see events appearing in the test client, you'll know the backend is working perfectly!

**Next**: Let's connect the React Native admin screen to receive these events! 🎯
