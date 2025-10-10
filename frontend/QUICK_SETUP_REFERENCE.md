# Frontend Setup - Quick Reference Guide

## 📁 New File Structure

```
frontend/
├── src/
│   ├── api/                        # API Layer
│   │   ├── apiClient.ts           # Axios instance with interceptors
│   │   └── endpoints.ts           # All API endpoints
│   │
│   ├── services/                   # Business Services
│   │   ├── socket.ts              # Socket.io connection manager
│   │   └── notifications.ts       # Push notification service
│   │
│   ├── hooks/                      # Custom Hooks
│   │   ├── index.ts               # Hook exports
│   │   ├── useNetwork.ts          # Network connectivity
│   │   ├── useOfflineQueue.ts     # Offline request queue
│   │   └── useNotifications.ts    # Notification management
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── index.ts               # Utility exports
│   │   ├── dateFormatter.ts       # Date/time utilities
│   │   ├── calculations.ts        # Price/math calculations
│   │   └── validators.ts          # Input validation
│   │
│   └── components/
│       └── common/                 # Reusable Components
│           ├── index.ts           # Component exports
│           ├── Loader.tsx         # Loading indicator
│           ├── ErrorBoundary.tsx  # Error handling
│           └── Toast.tsx          # Toast notifications
│
├── redux/
│   └── slices/
│       └── api/                    # RTK Query
│           ├── baseApi.ts         # Base configuration
│           ├── authApi.ts         # Auth endpoints
│           └── index.ts           # API exports
│
└── app.config.js                   # Environment config
```

---

## 🔑 Key Features Implemented

### 1️⃣ **Network Detection**
```typescript
const { isConnected, type } = useNetwork();
```

### 2️⃣ **Offline Queue**
```typescript
const { addToQueue, syncQueue } = useOfflineQueue();
await addToQueue('/api/orders', 'POST', data);
```

### 3️⃣ **Socket.io Real-time**
```typescript
import socketService from '@/services/socket';
await socketService.connect(userId);
socketService.on('order:updated', handleUpdate);
```

### 4️⃣ **Push Notifications**
```typescript
const { scheduleNotification } = useNotifications();
await scheduleNotification('Title', 'Body', { data });
```

### 5️⃣ **RTK Query API**
```typescript
const [login, { isLoading }] = useLoginMutation();
await login({ email, password }).unwrap();
```

### 6️⃣ **Toast Messages**
```typescript
const { showSuccess, showError } = useToast();
showSuccess('Order placed!');
```

### 7️⃣ **Error Boundary**
```tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 8️⃣ **Utilities**
```typescript
import { formatDate, calculateOrderTotal, isValidEmail } from '@/utils';
```

---

## 🎯 Quick Commands

### Development
```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
```

### Environment Variables
Edit `.env` for API URLs and configuration:
```env
EXPO_PUBLIC_API_URL_DEVELOPMENT=http://192.168.1.36:5000
EXPO_PUBLIC_API_URL_PRODUCTION=https://your-backend.com
```

---

## 🔄 Data Flow

### API Requests
```
Component → RTK Query Hook → baseApi → Backend
                           ↓
                    Cache & State Update
```

### Offline Support
```
Component → Offline Queue → AsyncStorage
                         ↓
                   (Network restores)
                         ↓
                    Auto Sync → Backend
```

### Real-time Updates
```
Backend → Socket.io → socketService → Event Listeners → UI Update
```

---

## 📝 Common Patterns

### Making API Calls
```typescript
// Option 1: RTK Query (recommended)
const { data, isLoading, error } = useGetOrdersQuery();

// Option 2: Axios client
import apiClient from '@/api/apiClient';
const response = await apiClient.get('/api/orders');
```

### Handling Loading States
```typescript
import { Loader } from '@/components/common';

function MyScreen() {
  const { isLoading } = useGetDataQuery();
  
  if (isLoading) return <Loader />;
  return <YourContent />;
}
```

### Showing Notifications
```typescript
const { showSuccess, showError } = useToast();

try {
  await createOrder(data);
  showSuccess('Order created!');
} catch (error) {
  showError('Failed to create order');
}
```

### Validating Forms
```typescript
import { isValidEmail, validatePassword } from '@/utils';

if (!isValidEmail(email)) {
  setError('Invalid email');
}

const { isValid, errors } = validatePassword(password);
if (!isValid) {
  setErrors(errors);
}
```

---

## 🎨 UI Components

### Loader
```tsx
<Loader 
  visible={isLoading}
  overlay={true}
  text="Loading..."
/>
```

### Toast
```tsx
const { Toast, showSuccess } = useToast();

return (
  <>
    <Button onPress={() => showSuccess('Done!')} />
    {Toast}
  </>
);
```

---

## 🚀 Performance Tips

1. **Use RTK Query** for automatic caching
2. **Implement offline queue** for better UX
3. **Use ErrorBoundary** to prevent app crashes
4. **Monitor network state** before API calls
5. **Lazy load** screens and components
6. **Optimize images** with proper formats

---

## 📚 Documentation

- **Full Setup Guide**: `PROMPT_1_SETUP_COMPLETE.md`
- **API Endpoints**: `src/api/endpoints.ts`
- **Environment Config**: `app.config.js`

---

## ✅ Checklist for Next Features

- [ ] Authentication screens (login/register)
- [ ] Menu listing and filters
- [ ] Product details with customization
- [ ] Cart management
- [ ] Checkout flow
- [ ] Order tracking
- [ ] Payment integration
- [ ] User profile
- [ ] Notifications screen
- [ ] Admin dashboard

---

**Setup Status**: ✅ Complete and Ready for Development!
