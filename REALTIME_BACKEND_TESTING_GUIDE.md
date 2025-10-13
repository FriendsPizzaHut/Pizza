# 🧪 Real-Time Backend Testing Guide

## ✅ Backend Setup Complete!

Your backend is now ready with real-time socket events:
- ✅ Socket.IO initialized and running
- ✅ Order creation emits `order:new` to admin
- ✅ Status update emits `order:status:update` to all parties
- ✅ Delivery assignment emits `order:assigned` to delivery agent

---

## 🔧 Testing with Postman

### Prerequisites

1. **Backend running**: `http://localhost:5000` ✅ (Already running!)
2. **MongoDB connected**: ✅
3. **Redis connected**: ✅
4. **Socket.IO active**: ✅

### Step 1: Get Admin Token

**Request:**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "role": "admin"
  }
}
```

**Save the token** - You'll need it for authenticated requests!

---

### Step 2: Test Order Creation (Socket Event: `order:new`)

**Request:**
```
POST http://localhost:5000/api/v1/orders/from-cart
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "paymentMethod": "cash"
}
```

**Expected Backend Console Log:**
```
📦 New order notification sent - Order: ORD-20251013-XXXX
```

**Socket Event Emitted:**
```javascript
Event: 'order:new'
Room: 'role:admin'
Payload: {
  orderId: "...",
  orderNumber: "ORD-20251013-XXXX",
  customerId: "...",
  customerName: "John Doe",
  items: [...],
  totalAmount: 25.99,
  status: "pending",
  message: "🔔 New order received!",
  timestamp: "2025-10-13T..."
}
```

---

### Step 3: Test Order Status Update (Socket Event: `order:status:update`)

**Request:**
```
PATCH http://localhost:5000/api/v1/orders/ORDER_ID_HERE/status
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Expected Backend Console Log:**
```
📦 Order status update sent - Order: ORD-20251013-XXXX → confirmed
```

**Socket Events Emitted:**
1. **To Customer** (`user:CUSTOMER_ID`):
   ```javascript
   Event: 'order:status:update'
   Payload: {
     orderId: "...",
     orderNumber: "ORD-20251013-XXXX",
     status: "confirmed",
     message: "✅ Order confirmed! Preparing your food..."
   }
   ```

2. **To Admin** (`role:admin`):
   ```javascript
   Event: 'order:status:changed'
   Payload: {
     orderId: "...",
     orderNumber: "ORD-20251013-XXXX",
     status: "confirmed"
   }
   ```

---

### Step 4: Test Delivery Assignment (Socket Event: `order:assigned`)

**Request:**
```
PATCH http://localhost:5000/api/v1/orders/ORDER_ID_HERE/assign-delivery
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "deliveryAgentId": "DELIVERY_AGENT_USER_ID"
}
```

**Expected Backend Console Log:**
```
🚴 Delivery assignment sent - Order: ORD-20251013-XXXX → Agent: John Smith
```

**Socket Events Emitted:**

1. **To Delivery Agent** (`user:DELIVERY_AGENT_ID`):
   ```javascript
   Event: 'order:assigned'
   Payload: {
     orderId: "...",
     orderNumber: "ORD-20251013-XXXX",
     deliveryAgent: {
       _id: "...",
       name: "John Smith",
       phone: "+1234567890"
     },
     customer: {
       name: "Jane Doe",
       phone: "+0987654321"
     },
     deliveryAddress: {...},
     items: [...],
     totalAmount: 25.99,
     message: "🚴 New delivery assigned!",
     assignedAt: "2025-10-13T..."
   }
   ```

2. **To Admin** (`role:admin`):
   ```javascript
   Event: 'order:assigned'
   Payload: {
     orderId: "...",
     orderNumber: "ORD-20251013-XXXX",
     deliveryAgent: {
       _id: "...",
       name: "John Smith"
     },
     message: "Order ORD-20251013-XXXX assigned to John Smith"
   }
   ```

3. **To Customer** (`user:CUSTOMER_ID`):
   ```javascript
   Event: 'order:delivery:assigned'
   Payload: {
     orderId: "...",
     orderNumber: "ORD-20251013-XXXX",
     deliveryAgent: {
       name: "John Smith"
     },
     message: "Your order is now out for delivery"
   }
   ```

---

## 🎯 What Each Socket Event Does

### 1. `order:new` (Admin receives)
- **When**: Customer places order
- **Who receives**: All admins in `role:admin` room
- **Purpose**: Notify admin of new order instantly
- **Frontend action**: Add order to top of OrderManagementScreen list

### 2. `order:status:update` (Customer receives)
- **When**: Admin/Delivery updates order status
- **Who receives**: Customer who placed order
- **Purpose**: Keep customer informed of order progress
- **Frontend action**: Update order status in customer's order history

### 3. `order:status:changed` (Admin receives)
- **When**: Order status is updated
- **Who receives**: All admins
- **Purpose**: Keep admin dashboard updated
- **Frontend action**: Update order card in OrderManagementScreen

### 4. `order:assigned` (Delivery Agent receives)
- **When**: Admin assigns order to delivery agent
- **Who receives**: Specific delivery agent
- **Purpose**: Notify agent of new delivery assignment
- **Frontend action**: Add order to delivery agent's active orders

### 5. `order:assigned` (Admin receives)
- **When**: Admin assigns order to delivery agent
- **Who receives**: All admins
- **Purpose**: Confirm assignment was successful
- **Frontend action**: Update order card to show assigned agent

### 6. `order:delivery:assigned` (Customer receives)
- **When**: Delivery agent is assigned
- **Who receives**: Customer
- **Purpose**: Inform customer their order is out for delivery
- **Frontend action**: Show "Out for Delivery" status

---

## 🔍 How to Monitor Socket Events

### Option 1: Check Backend Console Logs

When backend emits events, you'll see:
```
📦 New order notification sent - Order: ORD-20251013-XXXX
📦 Order status update sent - Order: ORD-20251013-XXXX → confirmed
🚴 Delivery assignment sent - Order: ORD-20251013-XXXX → Agent: John Smith
```

### Option 2: Use Socket.IO Test Client

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Socket.IO Test Client</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
    <h1>Socket.IO Test Client</h1>
    <div id="events"></div>

    <script>
        const socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            console.log('✅ Connected:', socket.id);
            
            // Register as admin
            socket.emit('register', { 
                userId: 'ADMIN_USER_ID', 
                role: 'admin' 
            });
        });

        // Listen for new orders
        socket.on('order:new', (data) => {
            console.log('📦 New Order:', data);
            document.getElementById('events').innerHTML += 
                `<p>📦 New Order: ${data.orderNumber}</p>`;
        });

        // Listen for status updates
        socket.on('order:status:changed', (data) => {
            console.log('🔄 Status Update:', data);
            document.getElementById('events').innerHTML += 
                `<p>🔄 Status: ${data.orderNumber} → ${data.status}</p>`;
        });

        // Listen for assignments
        socket.on('order:assigned', (data) => {
            console.log('🚴 Assignment:', data);
            document.getElementById('events').innerHTML += 
                `<p>🚴 Assigned: ${data.orderNumber}</p>`;
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected');
        });
    </script>
</body>
</html>
```

Save as `socket-test.html` and open in browser.

---

## ✅ Success Checklist

After testing, verify:

- [ ] Backend console shows socket event logs
- [ ] Order creation emits to admin room
- [ ] Status update emits to customer and admin
- [ ] Delivery assignment emits to agent, admin, and customer
- [ ] No errors in backend console
- [ ] MongoDB updates reflect in database

---

## 🚀 Next Steps

Now that backend is working, you can:

1. **Connect Frontend Admin Screen** (`OrderManagementScreen.tsx`)
   - Connect to socket
   - Listen for `order:new` event
   - Update orders list in real-time

2. **Connect Frontend Delivery Screen**
   - Connect to socket
   - Listen for `order:assigned` event
   - Show new deliveries instantly

3. **Add Redis Pub/Sub** (Optional - for multi-server scaling)
   - Currently works for single server
   - Add Redis pub/sub for horizontal scaling

---

## 🎉 You're Done with Phase 1!

Backend real-time events are complete and working! 

**Next**: Move to Phase 2 - Connect `OrderManagementScreen.tsx` to socket! 🚀
