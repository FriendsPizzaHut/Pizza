# 📝 Step-by-Step Implementation Guide

## Phase 1: Backend Socket Events (HIGH Priority) ⚡

### STEP 1.1: Update Order Controller - Emit Events on Order Create

**File:** `backend/src/controllers/orderController.js`

**Find the `createOrder` function and add:**

```javascript
import { getIO } from '../config/socket.js';

// After order is saved to database
export const createOrder = async (req, res, next) => {
    try {
        // ... existing order creation code ...
        
        const newOrder = await order.save();
        
        // 🔥 NEW: Emit socket event to admin room
        const io = getIO();
        io.to('admin').emit('order:new', {
            order: {
                _id: newOrder._id,
                orderNumber: newOrder.orderNumber,
                customer: {
                    name: newOrder.user.name,
                    phone: newOrder.user.phone
                },
                items: newOrder.items,
                total: newOrder.totalAmount,
                status: newOrder.status,
                deliveryAddress: newOrder.deliveryAddress,
                createdAt: newOrder.createdAt
            },
            message: `New order ${newOrder.orderNumber} received!`
        });
        
        console.log(`✅ Socket event sent: order:new to admin room`);
        
        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        next(error);
    }
};
```

---

### STEP 1.2: Update Order Controller - Emit Events on Status Change

**File:** `backend/src/controllers/orderController.js`

**Find or create `updateOrderStatus` function:**

```javascript
// Update order status
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id,
            { 
                status,
                [`statusHistory.${status}`]: new Date()
            },
            { new: true }
        ).populate('user', 'name phone')
         .populate('deliveryAgent', 'name phone');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // 🔥 NEW: Emit socket event to admin and delivery rooms
        const io = getIO();
        
        // Notify admin
        io.to('admin').emit('order:status:updated', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            updatedAt: new Date()
        });
        
        // Notify delivery agent if assigned
        if (order.deliveryAgent) {
            io.to(`delivery:${order.deliveryAgent._id}`).emit('order:status:updated', {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                updatedAt: new Date()
            });
        }
        
        console.log(`✅ Socket event sent: order:status:updated`);
        
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
```

---

### STEP 1.3: Update Order Controller - Emit Events on Delivery Assignment

**File:** `backend/src/controllers/orderController.js`

**Find or create `assignDeliveryAgent` function:**

```javascript
// Assign delivery agent to order
export const assignDeliveryAgent = async (req, res, next) => {
    try {
        const { id } = req.params;  // order id
        const { deliveryAgentId } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id,
            { 
                deliveryAgent: deliveryAgentId,
                status: 'out_for_delivery',
                assignedAt: new Date()
            },
            { new: true }
        ).populate('user', 'name phone')
         .populate('deliveryAgent', 'name phone');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // 🔥 NEW: Emit socket event to delivery agent
        const io = getIO();
        
        // Notify specific delivery agent
        io.to(`delivery:${deliveryAgentId}`).emit('order:assigned', {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                customer: {
                    name: order.user.name,
                    phone: order.user.phone
                },
                items: order.items,
                total: order.totalAmount,
                deliveryAddress: order.deliveryAddress,
                status: order.status,
                assignedAt: order.assignedAt
            },
            message: `New delivery assigned: Order ${order.orderNumber}`
        });
        
        // Notify admin
        io.to('admin').emit('order:assigned', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            deliveryAgent: order.deliveryAgent,
            assignedAt: order.assignedAt
        });
        
        console.log(`✅ Socket event sent: order:assigned to agent ${deliveryAgentId}`);
        
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
```

---

### STEP 1.4: Set Up Socket Room Connections

**File:** `backend/src/config/socket.js`

**Update the connection handler:**

```javascript
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.on('connection', (socket) => {
        console.log(`✅ New socket connection: ${socket.id}`);

        // 🔥 NEW: Handle admin joining admin room
        socket.on('join:admin', () => {
            socket.join('admin');
            console.log(`📍 Admin joined: ${socket.id}`);
        });

        // 🔥 NEW: Handle delivery agent joining their room
        socket.on('join:delivery', (agentId) => {
            socket.join('delivery');
            socket.join(`delivery:${agentId}`);
            console.log(`📍 Delivery agent ${agentId} joined: ${socket.id}`);
        });

        // Generic room join (keep existing)
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room: ${roomId}`);
        });

        // 🔥 NEW: Handle leaving rooms
        socket.on('leave:admin', () => {
            socket.leave('admin');
            console.log(`📍 Admin left: ${socket.id}`);
        });

        socket.on('leave:delivery', (agentId) => {
            socket.leave('delivery');
            socket.leave(`delivery:${agentId}`);
            console.log(`📍 Delivery agent ${agentId} left: ${socket.id}`);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`❌ Socket disconnected: ${socket.id}, Reason: ${reason}`);
        });
    });

    console.log('✅ Socket.IO initialized successfully');
    return io;
};
```

---

## Phase 2: Admin Real-Time Updates (HIGH Priority) ⚡

### STEP 2.1: Connect OrderManagementScreen to Socket

**File:** `frontend/src/screens/admin/main/OrderManagementScreen.tsx`

**Add at the top:**

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

// Get socket URL from environment
const SOCKET_URL = __DEV__
    ? Constants.expoConfig?.extra?.EXPO_PUBLIC_SOCKET_URL_DEVELOPMENT
    : Constants.expoConfig?.extra?.EXPO_PUBLIC_SOCKET_URL_PRODUCTION;
```

**Replace the static `orders` array with state:**

```typescript
export default function OrderManagementScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // 🔥 NEW: State for real-time orders
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);

    // 🔥 NEW: Fetch initial orders
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Call your order API here
            const response = await fetch(`${API_URL}/orders`);
            const data = await response.json();
            setOrders(data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 NEW: Socket connection and event listeners
    useEffect(() => {
        // Connect to socket
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            // Join admin room
            socket.emit('join:admin');
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        // 🔥 Listen for new orders
        socket.on('order:new', (data) => {
            console.log('📦 New order received:', data);
            
            // Add new order to the top of the list
            setOrders((prevOrders) => [data.order, ...prevOrders]);
            
            // Optional: Show toast notification
            // Toast.show({ text: data.message, type: 'success' });
        });

        // 🔥 Listen for order status updates
        socket.on('order:status:updated', (data) => {
            console.log('🔄 Order status updated:', data);
            
            // Update the order in the list
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === data.orderId
                        ? { ...order, status: data.status, updatedAt: data.updatedAt }
                        : order
                )
            );
        });

        // 🔥 Listen for delivery assignments
        socket.on('order:assigned', (data) => {
            console.log('🚚 Order assigned:', data);
            
            // Update the order in the list
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === data.orderId
                        ? { 
                            ...order, 
                            deliveryAgent: data.deliveryAgent,
                            status: 'out_for_delivery',
                            assignedAt: data.assignedAt
                          }
                        : order
                )
            );
        });

        // Cleanup on unmount
        return () => {
            socket.emit('leave:admin');
            socket.disconnect();
        };
    }, []);

    // ... rest of the component stays the same
}
```

---

### STEP 2.2: Add Loading and Empty States

**In the same file, update the ScrollView:**

```typescript
<ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
    {/* Advertisement Banner */}
    <View style={styles.advertisementBanner}>
        {/* ... existing banner code ... */}
    </View>

    {/* Orders Section */}
    <View style={styles.ordersSection}>
        <View style={styles.sectionHeader}>
            {/* ... existing header ... */}
        </View>

        {/* 🔥 NEW: Loading State */}
        {loading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#cb202d" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        ) : filteredOrders.length === 0 ? (
            // 🔥 NEW: Empty State
            <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyText}>
                    {selectedFilter === 'all'
                        ? 'No orders yet. New orders will appear here automatically.'
                        : `No ${selectedFilter} orders found.`}
                </Text>
            </View>
        ) : (
            // Existing orders map
            filteredOrders.map((order) => (
                /* ... existing order card ... */
            ))
        )}
    </View>
</ScrollView>
```

**Add new styles:**

```typescript
const styles = StyleSheet.create({
    // ... existing styles ...
    
    centerContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
```

---

## Phase 3: Delivery Real-Time Updates (HIGH Priority) ⚡

### STEP 3.1: Connect Delivery Screen to Socket

**File:** `frontend/src/screens/delivery/main/ActiveOrdersScreen.tsx` (or similar)

```typescript
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';

export default function ActiveOrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    
    // Get delivery agent ID from Redux auth state
    const { userId } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/delivery/orders`);
            const data = await response.json();
            setOrders(data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Socket connection
    useEffect(() => {
        if (!userId) return;

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Delivery socket connected');
            // Join delivery rooms
            socket.emit('join:delivery', userId);
        });

        // 🔥 Listen for new assigned orders
        socket.on('order:assigned', (data) => {
            console.log('📦 New order assigned:', data);
            
            // Add to top of list
            setOrders((prev) => [data.order, ...prev]);
            
            // Show notification
            // PlaySound or Vibration
        });

        // 🔥 Listen for status updates
        socket.on('order:status:updated', (data) => {
            console.log('🔄 Order status updated:', data);
            
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === data.orderId
                        ? { ...order, status: data.status }
                        : order
                )
            );
        });

        return () => {
            socket.emit('leave:delivery', userId);
            socket.disconnect();
        };
    }, [userId]);

    // ... rest of component
}
```

---

## Testing Steps

### Backend Testing:

**Test 1: Check Socket Server**
```bash
cd backend
npm run dev
# Look for "✅ Socket.IO initialized successfully"
```

**Test 2: Create Order via Postman**
```
POST http://localhost:5000/api/v1/orders
Body: { order data }

Expected Console Log:
✅ Socket event sent: order:new to admin room
```

**Test 3: Update Order Status**
```
PATCH http://localhost:5000/api/v1/orders/:id/status
Body: { "status": "preparing" }

Expected Console Log:
✅ Socket event sent: order:status:updated
```

---

### Frontend Testing:

**Test 1: Admin Screen**
1. Open OrderManagementScreen
2. Check console: "✅ Socket connected"
3. Check console: "📍 Admin joined"
4. Create new order from customer app
5. See new order appear instantly in admin screen

**Test 2: Status Update**
1. Click "Accept Order" or "Mark Ready"
2. See order status change instantly
3. Order moves to correct filter tab

**Test 3: Delivery Assignment**
1. Assign delivery from admin
2. Delivery agent sees order appear instantly
3. Admin sees "assigned" status update

---

## Success Metrics

### Phase 1 Complete ✅:
- [ ] Backend emits socket events on order create
- [ ] Backend emits socket events on status update
- [ ] Backend emits socket events on delivery assignment
- [ ] Console logs show events being sent

### Phase 2 Complete ✅:
- [ ] Admin connects to socket successfully
- [ ] New orders appear in admin screen instantly
- [ ] Order status updates instantly without refresh
- [ ] No errors in console

### Phase 3 Complete ✅:
- [ ] Delivery agent connects to socket
- [ ] Assigned orders appear instantly
- [ ] Status updates reflect in real-time

---

## 🎯 Implementation Priority

**Day 1 (2-3 hours):**
- ✅ Step 1.1: Emit event on order create
- ✅ Step 1.2: Emit event on status update
- ✅ Step 1.3: Emit event on delivery assignment
- ✅ Step 1.4: Set up socket rooms
- ✅ Test backend events

**Day 2 (2-3 hours):**
- ✅ Step 2.1: Connect admin screen to socket
- ✅ Step 2.2: Add loading/empty states
- ✅ Test admin real-time updates

**Day 3 (1-2 hours):**
- ✅ Step 3.1: Connect delivery screen to socket
- ✅ Test delivery real-time updates
- ✅ End-to-end testing

---

## 🚀 Ready to Start!

**Which step would you like to implement first?**

I recommend starting with **Step 1.1** - Emit socket event when order is created. This is the foundation for everything else!

Let me know when you're ready and I'll guide you through it step by step! 🎉
