# ⚡ Socket.IO Quick Reference - Prompt 9

## 🚀 Quick Start (30 seconds)

### Backend (Already Done!)
```bash
# Server is ready - just start it
npm run dev

# Look for: "✅ Socket.IO initialized with enhanced features (Prompt 9)"
```

### Frontend (React Native)
```bash
npm install socket.io-client@^4.8.1
```

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    socket.emit('register', { userId: 'USER_ID', role: 'customer' });
});

socket.on('order:status:update', (data) => {
    console.log('Order update:', data);
});
```

---

## 📡 Event Quick Reference

### Events You Receive (Listen)

```javascript
// Business
socket.on('business:status:update', (data) => {
    // { isOpen, businessName, message, timestamp }
});

// Orders
socket.on('order:new', (data) => {
    // { orderId, customerName, items, totalAmount, timestamp }
    // Only admin receives this
});

socket.on('order:status:update', (data) => {
    // { orderId, status, message, timestamp }
    // Customer, admin, and delivery receive this
});

socket.on('order:cancelled', (data) => {
    // { orderId, orderNumber, reason, timestamp }
});

// Delivery
socket.on('delivery:status:update', (data) => {
    // { deliveryBoyId, status, message, timestamp }
    // Only admin receives this
});

socket.on('delivery:location:update', (data) => {
    // { orderId, location: { latitude, longitude }, timestamp }
});

// Payment
socket.on('payment:received', (data) => {
    // { orderId, amount, paymentMethod, status, timestamp }
    // Admin receives this
});

socket.on('payment:status:update', (data) => {
    // { orderId, paymentId, status, message, timestamp }
    // Customer receives this
});

// Notifications
socket.on('notification:new', (data) => {
    // { title, message, type, timestamp }
});

// Offers
socket.on('offer:new', (data) => {
    // { code, description, discountValue, validUntil, timestamp }
});
```

### Events You Send (Emit)

```javascript
// Register (REQUIRED after connect)
socket.emit('register', { 
    userId: 'USER_ID', 
    role: 'customer' // or 'admin' or 'delivery'
});

// Join order tracking room
socket.emit('join:order', 'ORDER_ID');

// Leave order room
socket.emit('leave:order', 'ORDER_ID');

// Send delivery location (delivery agents only)
socket.emit('delivery:location', {
    orderId: 'ORDER_ID',
    latitude: 12.345,
    longitude: 67.890
});

// Health check
socket.emit('ping'); // Server responds with 'pong'
```

---

## 🎯 Common Use Cases

### 1. Order Tracking Page (Customer)

```javascript
useEffect(() => {
    // Join order room
    socket.emit('join:order', orderId);
    
    // Listen for updates
    socket.on('order:status:update', (data) => {
        setOrderStatus(data.status);
        showNotification(data.message);
    });
    
    socket.on('delivery:location:update', (data) => {
        updateMapMarker(data.location);
    });
    
    // Cleanup
    return () => {
        socket.emit('leave:order', orderId);
        socket.off('order:status:update');
        socket.off('delivery:location:update');
    };
}, [orderId]);
```

### 2. Admin Dashboard

```javascript
useEffect(() => {
    // Listen for new orders
    socket.on('order:new', (data) => {
        playSound();
        showNotification(`New order from ${data.customerName}`);
        refreshOrdersList();
    });
    
    // Listen for payments
    socket.on('payment:received', (data) => {
        updateRevenue(data.amount);
    });
    
    // Listen for delivery status
    socket.on('delivery:status:update', (data) => {
        updateDeliveryAgentStatus(data);
    });
    
    return () => {
        socket.off('order:new');
        socket.off('payment:received');
        socket.off('delivery:status:update');
    };
}, []);
```

### 3. Delivery Agent App

```javascript
useEffect(() => {
    // Listen for order assignments
    socket.on('order:assigned', (data) => {
        Alert.alert('New Order', `Order #${data.orderNumber}`);
        navigation.navigate('OrderDetails', { orderId: data.orderId });
    });
    
    // Send location updates every 10 seconds
    const interval = setInterval(async () => {
        const location = await getCurrentPosition();
        socket.emit('delivery:location', {
            orderId: currentOrder.id,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });
    }, 10000);
    
    return () => {
        clearInterval(interval);
        socket.off('order:assigned');
    };
}, [currentOrder]);
```

### 4. Store Status Display

```javascript
const [isStoreOpen, setIsStoreOpen] = useState(true);

useEffect(() => {
    socket.on('business:status:update', (data) => {
        setIsStoreOpen(data.isOpen);
        showToast(data.message);
    });
    
    return () => socket.off('business:status:update');
}, []);

return (
    <View>
        <Text>{isStoreOpen ? '🟢 We are Open!' : '🔴 We are Closed'}</Text>
    </View>
);
```

---

## 🔧 Backend Usage (In Controllers)

### Emit to Specific User
```javascript
global.socketEmit.emitToUser(userId, 'notification:new', {
    title: 'Order Confirmed',
    message: 'Your order has been confirmed!'
});
```

### Emit to All Users with Role
```javascript
global.socketEmit.emitToRole('admin', 'order:new', {
    orderId: order._id,
    customerName: order.user.name
});
```

### Emit to Order Room
```javascript
global.socketEmit.emitToOrder(orderId, 'order:status:update', {
    orderId,
    status: 'preparing',
    message: 'Your order is being prepared'
});
```

### Broadcast to Everyone
```javascript
global.socketEmit.emitToAll('business:status:update', {
    isOpen: true,
    businessName: 'Friends Pizza Hut'
});
```

---

## 🧪 Testing Commands

### 1. Test Connection
```bash
node test-socket-client.js
```

### 2. Test Business Status
```bash
curl -X PATCH http://localhost:5000/api/v1/business/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": true}'
```

### 3. Run Full Test Suite
```bash
./test-socket-events.sh
```

### 4. Check Connected Users
```javascript
// In backend code
console.log('Connected users:', global.socketEmit.getConnectedUsers());
console.log('Total connections:', global.socketEmit.getConnectedUsersCount());
```

---

## 🐛 Troubleshooting

### "Socket not connecting"
```javascript
// Enable debug mode
const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    forceNew: true
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
});
```

### "Not receiving events"
```javascript
// 1. Check if registered
socket.on('registered', (data) => {
    console.log('Registered:', data); // Should see this
});

// 2. Check if listening to correct event
socket.onAny((event, ...args) => {
    console.log('Event:', event, args); // See all events
});

// 3. Make sure you called register
socket.emit('register', { userId: 'YOUR_ID', role: 'customer' });
```

### "Events duplicating"
```javascript
// Clean up listeners properly
useEffect(() => {
    const handler = (data) => console.log(data);
    socket.on('order:status:update', handler);
    
    return () => {
        socket.off('order:status:update', handler); // Remove exact handler
    };
}, []);
```

---

## 📊 Performance Tips

### 1. Debounce Location Updates
```javascript
// Don't send every GPS update
const debouncedLocationUpdate = debounce((location) => {
    socket.emit('delivery:location', location);
}, 5000); // Send every 5 seconds max
```

### 2. Only Join Rooms When Needed
```javascript
// Join order room only on tracking page
useEffect(() => {
    if (isTrackingOrder) {
        socket.emit('join:order', orderId);
    }
    return () => {
        if (isTrackingOrder) {
            socket.emit('leave:order', orderId);
        }
    };
}, [isTrackingOrder, orderId]);
```

### 3. Disconnect When Not Needed
```javascript
// Disconnect when app goes to background
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background') {
        socket.disconnect();
    } else if (nextAppState === 'active') {
        socket.connect();
    }
});
```

---

## 🔒 Security Best Practices

### 1. Enable JWT Authentication
```javascript
// Backend: Uncomment in src/socket/index.js
io.use(verifySocketToken);

// Frontend: Send token
const token = await AsyncStorage.getItem('accessToken');
const socket = io('http://localhost:5000', {
    auth: { token: `Bearer ${token}` }
});
```

### 2. Validate All Data
```javascript
socket.on('delivery:location', (data) => {
    if (!data.orderId || !data.latitude || !data.longitude) {
        socket.emit('error', { message: 'Invalid data' });
        return;
    }
    // Process valid data
});
```

### 3. Use Rooms for Privacy
```javascript
// Users only receive events for their own orders
socket.join(`user:${userId}`);

// Emit only to specific user
io.to(`user:${userId}`).emit('order:status:update', data);
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `src/socket/index.js` | Main Socket.IO setup |
| `src/socket/events.js` | Event emitter functions |
| `src/middlewares/socketAuth.js` | JWT authentication |
| `test-socket-client.js` | Node.js test client |
| `test-socket-events.sh` | Bash test script |
| `PROMPT_9_COMPLETE.md` | Full documentation (1000+ lines) |
| `PROMPT_9_SUMMARY.md` | Quick summary |

---

## ✅ Checklist

Before going to production:

- [ ] Server runs without errors
- [ ] Socket.IO initialized (check logs)
- [ ] Test client can connect
- [ ] Events are being emitted (check logs)
- [ ] Frontend receives events
- [ ] JWT authentication enabled (optional)
- [ ] CORS configured correctly
- [ ] Error handling tested
- [ ] Reconnection works
- [ ] Performance tested under load

---

## 🎯 Next Steps

1. **Test locally**: Run test client, trigger events
2. **Integrate frontend**: Implement socket service in React Native
3. **Test real scenarios**: Order creation, status updates, delivery tracking
4. **Enable auth**: Uncomment JWT middleware
5. **Deploy**: Test on staging, then production

---

**Quick Help:**
- Full Guide: `PROMPT_9_COMPLETE.md`
- Test Client: `node test-socket-client.js`
- Test Script: `./test-socket-events.sh`
- Check Logs: Look for "📤 Emitted" and "🟢 New client connected"

**Support:**
- Issue: Socket not connecting → Check server is running, CORS config
- Issue: Events not received → Check registered, check event name
- Issue: Memory leak → Check disconnect cleanup

---

🎉 **You now have real-time communication!** ⚡
