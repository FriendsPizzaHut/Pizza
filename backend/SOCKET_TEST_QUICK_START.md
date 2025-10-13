# 🧪 Quick Socket Testing Guide

## Step 1: Open the Test Client

Open `socket-test-client.html` in your browser:

```bash
# From the backend directory
open socket-test-client.html

# Or on Linux
xdg-open socket-test-client.html

# Or just double-click the file
```

## Step 2: Connect and Register

1. **Click "Connect"** - Should see "Connected" status with socket ID
2. **Click "Register as Admin"** - Joins the admin room to receive order events

## Step 3: Test with Postman

### Test 1: Create Order (No Auth Required for Testing)

If you have a customer user token, create an order:

```http
POST http://localhost:5000/api/v1/orders/from-cart
Authorization: Bearer YOUR_CUSTOMER_TOKEN
Content-Type: application/json

{
  "deliveryAddress": {
    "street": "123 Test Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "cash"
}
```

**Expected Result in Test Client:**
```json
Event: order:new
{
  "orderId": "...",
  "orderNumber": "ORD-20251013-XXXX",
  "customerName": "...",
  "items": [...],
  "totalAmount": 25.99,
  "status": "pending",
  "message": "🔔 New order received!"
}
```

---

### Test 2: Update Order Status

```http
PATCH http://localhost:5000/api/v1/orders/ORDER_ID/status
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Expected Result in Test Client:**
```json
Event: order:status:changed
{
  "orderId": "...",
  "orderNumber": "ORD-20251013-XXXX",
  "status": "confirmed",
  "message": "✅ Order confirmed! Preparing your food..."
}
```

---

### Test 3: Assign Delivery Agent

```http
PATCH http://localhost:5000/api/v1/orders/ORDER_ID/assign-delivery
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "deliveryAgentId": "DELIVERY_AGENT_USER_ID"
}
```

**Expected Result in Test Client:**
```json
Event: order:assigned
{
  "orderId": "...",
  "orderNumber": "ORD-20251013-XXXX",
  "deliveryAgent": {
    "_id": "...",
    "name": "John Delivery",
    "phone": "+1234567890"
  },
  "message": "Order ORD-20251013-XXXX assigned to John Delivery"
}
```

---

## 🎯 What You Should See

### In the Test Client:
- ✅ Green "Connected" badge
- ✅ Socket ID displayed
- ✅ Events appearing in real-time
- ✅ JSON data for each event

### In the Backend Console:
```
📦 New order notification sent - Order: ORD-20251013-XXXX
📦 Order status update sent - Order: ORD-20251013-XXXX → confirmed
🚴 Delivery assignment sent - Order: ORD-20251013-XXXX → Agent: John Delivery
```

---

## 🐛 Troubleshooting

### No events appearing?

1. **Check connection status** - Should be green "Connected"
2. **Register as Admin** - Must register to join the admin room
3. **Check backend console** - Should see socket connection logs
4. **Verify backend is running** - `http://localhost:5000` should be accessible

### "Already connected" message?

Click "Disconnect" first, then "Connect" again.

### Backend not emitting events?

Check that:
- ✅ Backend is running (`npm run dev`)
- ✅ Order creation/update is successful (check Postman response)
- ✅ `emitNewOrder`, `emitOrderStatusUpdate`, `emitDeliveryAssignment` are being called

---

## ✅ Success Checklist

After testing, verify:

- [ ] Test client connects successfully
- [ ] Registration works (see "registered" event)
- [ ] New order creates `order:new` event
- [ ] Status update creates `order:status:changed` event  
- [ ] Delivery assignment creates `order:assigned` event
- [ ] All events show correct data in JSON format

---

## 🚀 Next: Phase 2 - Frontend Integration

Once socket events are working, we'll connect:

1. **OrderManagementScreen.tsx** (Admin)
   - Listen for `order:new`
   - Add orders to list instantly

2. **Delivery Screens** (Delivery Agent)
   - Listen for `order:assigned`
   - Show new deliveries instantly

Ready to move forward! 🎉
