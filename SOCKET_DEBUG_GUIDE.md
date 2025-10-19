# Socket Debugging - Real-time Status Update Issue 🐛

## Current Problem
Delivery agent status changes (online/offline toggle) are NOT appearing in real-time on `AssignDeliveryAgentScreen.tsx` even though:
- ✅ Socket connects successfully
- ✅ Registration works
- ✅ Backend API updates database
- ❌ **Admin screen doesn't receive the socket event**

---

## Debug Logs Added

### 1. Frontend - AssignDeliveryAgentScreen.tsx

**Socket Connection Logs:**
```typescript
socket.on('connect', () => {
    console.log('✅ [ADMIN-ASSIGN] Socket connected:', socket.id);
    console.log('  - Transport:', socket.io.engine.transport.name);
    console.log('  - URL:', SOCKET_URL);
    // ... registration
});

socket.on('registered', (data) => {
    console.log('✅ [ADMIN-ASSIGN] Registration confirmed!');
    console.log('  - Response:', JSON.stringify(data, null, 2));
    console.log('  - Now listening for: delivery:agent:status:update');
});
```

**Event Listener Logs:**
```typescript
socket.on('delivery:agent:status:update', (data: any) => {
    console.log('🎯 [ADMIN-ASSIGN] ========================================');
    console.log('🎯 [ADMIN-ASSIGN] RECEIVED STATUS UPDATE EVENT!');
    console.log('🎯 [ADMIN-ASSIGN] ========================================');
    console.log('📡 [ADMIN-ASSIGN] Status update:', {
        agentId: data.deliveryAgentId,
        name: data.name,
        isOnline: data.isOnline,
        state: data.state,
        timestamp: data.timestamp
    });
    console.log('📋 [ADMIN-ASSIGN] Current agents count:', deliveryAgents.length);
    // ... state update with detailed logs
});
```

**State Update Logs:**
```typescript
setDeliveryAgents(prevAgents => {
    console.log('🔍 [ADMIN-ASSIGN] Updating agents state...');
    console.log('  - Previous agents:', prevAgents.map(a => ({ id: a.id, name: a.name, status: a.status })));
    console.log('  - Looking for agent ID:', data.deliveryAgentId);
    
    // ... mapping logic with match detection
    
    console.log('✅ [ADMIN-ASSIGN] Updated agents:', updated.map(a => ({ id: a.id, name: a.name, status: a.status })));
    return updated;
});

console.log('🎯 [ADMIN-ASSIGN] State update complete!');
```

---

### 2. Backend - deliveryAgentController.js

**Before Emit:**
```javascript
console.log('🎯 ========================================');
console.log('🎯 EMITTING SOCKET EVENT');
console.log('🎯 ========================================');
console.log('📡 Status data to emit:', JSON.stringify(statusData, null, 2));
console.log('📡 Agent ID:', agent._id);
console.log('📡 Agent Name:', agent.name);
console.log('📡 Is Online:', agent.status.isOnline);
console.log('📡 State:', agent.status.state);

emitDeliveryAgentStatusChange(statusData);

console.log(`✅ Socket event emitted successfully`);
```

---

### 3. Backend - socket/events.js

**Inside emitDeliveryAgentStatusChange:**
```javascript
console.log('🔔 ========================================');
console.log('🔔 emitDeliveryAgentStatusChange CALLED');
console.log('🔔 ========================================');
console.log('📥 Received agent data:', JSON.stringify(agentData, null, 2));

if (!global.socketEmit) {
    console.log('⚠️  Socket not initialized - ABORTING!');
    return;
}

console.log('✅ global.socketEmit exists');
console.log('✅ Checking emitToRole function...');
console.log('  - Type:', typeof global.socketEmit.emitToRole);
console.log('  - Available methods:', Object.keys(global.socketEmit));

// ... payload creation

console.log('📤 Prepared payload:', JSON.stringify(payload, null, 2));
console.log('🎯 Broadcasting to ADMIN role...');

global.socketEmit.emitToRole('admin', 'delivery:agent:status:update', payload);

console.log('✅ Broadcasted to admin role');
console.log('🎯 Broadcasting to DELIVERY role...');

global.socketEmit.emitToRole('delivery', 'delivery:agent:status:update', payload);

console.log('✅ Broadcasted to delivery role');
console.log('🔔 ========================================');
```

---

## Expected Log Flow

When delivery agent toggles status, you should see:

### Backend Logs:
```
🎯 ========================================
🎯 EMITTING SOCKET EVENT
🎯 ========================================
📡 Status data to emit: {
  "deliveryAgentId": "68eeb54ff6ca9edaf7b9c4b4",
  "name": "John Doe",
  "isOnline": false,
  "state": "offline",
  ...
}
🔔 ========================================
🔔 emitDeliveryAgentStatusChange CALLED
🔔 ========================================
📥 Received agent data: {...}
✅ global.socketEmit exists
✅ Checking emitToRole function...
  - Type: function
  - Available methods: ["emitToRole", "emitToUser", ...]
📤 Prepared payload: {...}
🎯 Broadcasting to ADMIN role...
✅ Broadcasted to admin role
🎯 Broadcasting to DELIVERY role...
✅ Broadcasted to delivery role
🔔 ========================================
```

### Frontend Logs (Admin):
```
🎯 [ADMIN-ASSIGN] ========================================
🎯 [ADMIN-ASSIGN] RECEIVED STATUS UPDATE EVENT!
🎯 [ADMIN-ASSIGN] ========================================
📡 [ADMIN-ASSIGN] Status update: {
  agentId: '68eeb54ff6ca9edaf7b9c4b4',
  name: 'John Doe',
  isOnline: false,
  state: 'offline',
  timestamp: '...'
}
📋 [ADMIN-ASSIGN] Current agents count: 1
🔍 [ADMIN-ASSIGN] Updating agents state...
  - Previous agents: [{ id: '...', name: 'John Doe', status: 'online' }]
  - Looking for agent ID: 68eeb54ff6ca9edaf7b9c4b4
🔄 [ADMIN-ASSIGN] FOUND MATCH! John Doe: online → offline
  - Old isOnline: true → New isOnline: false
  - Old status: online → New status: offline
✅ [ADMIN-ASSIGN] Updated agents: [{ id: '...', name: 'John Doe', status: 'offline' }]
🎯 [ADMIN-ASSIGN] State update complete!
🎯 [ADMIN-ASSIGN] ========================================
```

---

## Diagnostic Questions to Answer

Based on the logs, we can identify:

### Question 1: Is the backend emitting the event?
**Look for:** `🔔 emitDeliveryAgentStatusChange CALLED`
- ✅ **YES** → Backend is trying to emit
- ❌ **NO** → Controller not calling the function

### Question 2: Does global.socketEmit exist?
**Look for:** `✅ global.socketEmit exists`
- ✅ **YES** → Socket system initialized
- ❌ **NO** → Socket system not initialized (BIG PROBLEM)

### Question 3: What's the type of emitToRole?
**Look for:** `- Type: function`
- ✅ **function** → Method exists and is callable
- ❌ **undefined** → Method doesn't exist (CHECK socket/index.js)

### Question 4: Is the event being broadcasted?
**Look for:** `✅ Broadcasted to admin role`
- ✅ **YES** → Event sent to admin room
- ❌ **NO** → Error occurred before broadcast

### Question 5: Is the frontend receiving the event?
**Look for:** `🎯 [ADMIN-ASSIGN] RECEIVED STATUS UPDATE EVENT!`
- ✅ **YES** → Event received, check state update
- ❌ **NO** → **EVENT NOT REACHING FRONTEND** (socket issue)

### Question 6: Is the socket registered correctly?
**Look for:** `✅ [ADMIN-ASSIGN] Registration confirmed!`
- ✅ **YES** → Admin is in the 'admin' room
- ❌ **NO** → Registration failed (check backend socket/index.js)

### Question 7: What rooms is the admin socket in?
**Look in registration response:**
```json
{
  "success": true,
  "userId": "...",
  "role": "admin",
  "rooms": ["admin", "user:..."]  // <-- IMPORTANT!
}
```
- ✅ Contains **"admin"** → Correctly in admin room
- ❌ Missing **"admin"** → Not in admin room (can't receive broadcasts)

---

## Test Steps

1. **Open delivery app** (HomeScreen.tsx)
2. **Open admin app** on separate device
3. **Navigate to** AssignDeliveryAgentScreen
4. **Toggle status** on delivery app
5. **Watch console logs** on:
   - Backend terminal
   - Admin device console
   - Delivery device console

---

## Possible Issues & Solutions

### Issue 1: Event not emitted from backend
**Symptoms:** No `🔔 emitDeliveryAgentStatusChange CALLED` log
**Solution:** Check if controller is calling the function

### Issue 2: global.socketEmit undefined
**Symptoms:** `⚠️ Socket not initialized - ABORTING!`
**Solution:** Check `backend/src/socket/index.js` initialization

### Issue 3: emitToRole is not a function
**Symptoms:** `- Type: undefined`
**Solution:** Check socket/index.js - ensure emitToRole is exported in global.socketEmit

### Issue 4: Admin not in 'admin' room
**Symptoms:** Registration response missing "admin" in rooms array
**Solution:** Check backend socket 'register' handler - ensure `socket.join('admin')`

### Issue 5: Event listener not attached
**Symptoms:** No logs from `socket.on('delivery:agent:status:update')`
**Solution:** Check if useEffect is running, check dependencies array

### Issue 6: Socket URL mismatch
**Symptoms:** Different URLs between delivery and admin
**Solution:** Ensure both use same SOCKET_URL constant

---

## Comparison with OrderManagementScreen

OrderManagementScreen works correctly because it:
1. ✅ Uses `socket.emit('register', { userId, role })` 
2. ✅ Listens for socket events
3. ✅ Updates state in real-time

AssignDeliveryAgentScreen should work the same way now after the fix!

---

## Next Steps

After running the test:

1. **Copy all console logs** from both backend and frontend
2. **Answer the diagnostic questions** above
3. **Identify which step fails** in the flow
4. **Apply the corresponding solution**

---

## Quick Debug Commands

### Backend
```bash
# Watch backend logs in real-time
cd backend
npm start | grep -E "🎯|🔔|📡|✅|❌"
```

### Frontend (Android)
```bash
# Filter React Native logs
adb logcat *:S ReactNative:V ReactNativeJS:V | grep -E "ADMIN-ASSIGN|STATUS"
```

---

**Status:** 🐛 Debugging logs added - Ready for testing
**Date:** October 19, 2025
**Files Modified:**
- ✅ `frontend/src/screens/admin/orders/AssignDeliveryAgentScreen.tsx`
- ✅ `backend/src/controllers/deliveryAgentController.js`
- ✅ `backend/src/socket/events.js`
