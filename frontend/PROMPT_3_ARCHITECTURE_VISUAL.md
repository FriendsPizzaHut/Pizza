# Architecture Visual - Error Handling & Offline Support

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          React Native App                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Error Boundary                          │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │            Network Provider                           │  │ │
│  │  │  ┌────────────────────────────────────────────────┐  │  │ │
│  │  │  │              App Content                        │  │  │ │
│  │  │  │  ┌──────────────────────────────────────────┐  │  │  │ │
│  │  │  │  │         Navigation Stack               │  │  │  │ │
│  │  │  │  │  ┌──────────────────────────────────┐  │  │  │  │ │
│  │  │  │  │  │         Screens                 │  │  │  │  │ │
│  │  │  │  │  │  - Login                        │  │  │  │  │ │
│  │  │  │  │  │  - Menu                         │  │  │  │  │ │
│  │  │  │  │  │  - Orders                       │  │  │  │  │ │
│  │  │  │  │  │  - Profile                      │  │  │  │  │ │
│  │  │  │  │  └──────────────────────────────────┘  │  │  │  │ │
│  │  │  │  └──────────────────────────────────────────┘  │  │  │ │
│  │  │  │            ↓ Uses                              │  │  │ │
│  │  │  │   ┌─────────────────────────────┐             │  │  │ │
│  │  │  │   │   Optimized Components      │             │  │  │ │
│  │  │  │   │   - OptimizedList           │             │  │  │ │
│  │  │  │   │   - SkeletonLoader          │             │  │  │ │
│  │  │  │   │   - NetworkBanner           │             │  │  │ │
│  │  │  │   └─────────────────────────────┘             │  │  │ │
│  │  │  └────────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Component Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
┌─────────────────────┼────────────────────────────────────────────┐
│                     ▼          API Layer                          │
│              ┌──────────────┐                                     │
│              │  apiClient   │                                     │
│              │ ┌──────────┐ │                                     │
│              │ │Interceptor│ │                                     │
│              │ └──────────┘ │                                     │
│              └──────┬───────┘                                     │
│                     │                                             │
│       ┌─────────────┼─────────────┐                              │
│       │             │             │                              │
│       ▼             ▼             ▼                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                          │
│  │  Cache  │  │  Queue  │  │  Error  │                          │
│  │ Manager │  │ Manager │  │ Logger  │                          │
│  └─────────┘  └─────────┘  └─────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────┼────────────────────────────────────────────┐
│                     ▼        Storage Layer                        │
│              ┌──────────────┐                                     │
│              │ AsyncStorage │                                     │
│              │  - Cache     │                                     │
│              │  - Queue     │                                     │
│              │  - Errors    │                                     │
│              │  - Network   │                                     │
│              └──────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 📡 Network Flow Diagram

### Online Flow
```
User Action
    │
    ▼
Component
    │
    ▼
makeApiCall()
    │
    ├─→ Check Network ✅ (Online)
    │
    ▼
apiClient.request()
    │
    ├─→ Add Auth Token
    │
    ▼
Server Request
    │
    ▼
Server Response
    │
    ├─→ Cache Response (if GET)
    │
    ▼
Component Update
    │
    ▼
UI Updated ✅
```

### Offline Flow
```
User Action
    │
    ▼
Component
    │
    ▼
makeApiCall()
    │
    ├─→ Check Network ❌ (Offline)
    │
    ▼
Queue Manager
    │
    ├─→ Add to Queue
    │
    ├─→ Save to AsyncStorage
    │
    ▼
Show "Queued" Message
    │
    ▼
NetworkBanner Shows "X requests queued"
    
    ... User continues using app ...
    
Network Restored 🌐
    │
    ▼
Queue Manager
    │
    ├─→ Process Queue
    │
    ▼
Retry All Requests
    │
    ├─→ Request 1 ✅
    ├─→ Request 2 ✅
    ├─→ Request 3 ✅
    │
    ▼
Show "Syncing..." Message
    │
    ▼
All Complete ✅
```

## 🎯 Error Handling Flow

```
Component Error/Exception
         │
         ▼
    Error Boundary
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Catch Error  Log Error
    │         │
    │         ▼
    │    Error Logger
    │         │
    │    ┌────┴────┐
    │    │         │
    │    ▼         ▼
    │ Console   Sentry (optional)
    │
    ▼
Show Fallback UI
    │
    ├─→ User clicks "Try Again"
    │
    ▼
Reset Error State
    │
    ▼
Component Re-renders ✅
```

## 🗄️ Cache Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Cache Manager                      │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         AsyncStorage                        │    │
│  │                                             │    │
│  │  @cache:api:/menu_{}                       │    │
│  │  ├─ data: [...]                            │    │
│  │  ├─ timestamp: 1696789234567               │    │
│  │  └─ expiresAt: 1696789534567               │    │
│  │                                             │    │
│  │  @cache:api:/orders_{"userId":123}         │    │
│  │  ├─ data: [...]                            │    │
│  │  ├─ timestamp: 1696789234567               │    │
│  │  └─ expiresAt: 1696789834567               │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Operations:                                         │
│  - set(key, data, { ttl })                          │
│  - get(key)                                          │
│  - remove(key)                                       │
│  - clear()                                           │
│  - clearExpired()                                    │
└─────────────────────────────────────────────────────┘
```

## 📦 Request Queue Architecture

```
┌─────────────────────────────────────────────────────┐
│               Request Queue Manager                  │
│                                                      │
│  Queue: [                                           │
│    {                                                 │
│      id: "123_abc",                                 │
│      config: {                                      │
│        method: "POST",                              │
│        url: "/api/menu",                            │
│        data: {...}                                  │
│      },                                             │
│      status: "pending",                             │
│      retryCount: 0,                                 │
│      maxRetries: 3,                                 │
│      priority: 0                                    │
│    },                                               │
│    { ... },                                         │
│    { ... }                                          │
│  ]                                                  │
│                                                      │
│  Operations:                                         │
│  - enqueue(config, options)                         │
│  - processQueue(handler)                            │
│  - remove(id)                                        │
│  - clear()                                           │
│  - getStats()                                        │
└─────────────────────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
├── ErrorBoundary
│   └── Provider (Redux)
│       └── NetworkProvider
│           └── SafeAreaProvider
│               └── GestureHandlerRootView
│                   └── NavigationContainer
│                       ├── RootNavigator
│                       │   ├── Auth Stack
│                       │   │   └── Login Screen
│                       │   └── Main Stack
│                       │       ├── Home Screen
│                       │       ├── Menu Screen
│                       │       ├── Orders Screen
│                       │       └── Profile Screen
│                       ├── NetworkBanner
│                       └── StatusBar
```

## 🔌 Hook Usage Flow

```
Component
    │
    ├─→ useNetwork()
    │   │
    │   └─→ Returns:
    │       - isConnected
    │       - isInternetReachable
    │       - isSlowConnection
    │       - connectionType
    │       - networkState
    │       - checkConnection()
    │
    ├─→ useToast()
    │   │
    │   └─→ Returns:
    │       - showSuccess()
    │       - showError()
    │       - showInfo()
    │       - Toast component
    │
    └─→ useAuth()
        │
        └─→ Returns:
            - user
            - login()
            - logout()
            - isAuthenticated
```

## ⚡ Performance Optimization Stack

```
┌─────────────────────────────────────────────────────┐
│              Component Level                         │
│                                                      │
│  React.memo()                                       │
│  ├─→ Prevents re-render if props unchanged         │
│                                                      │
│  useCallback()                                       │
│  ├─→ Memoizes functions                            │
│                                                      │
│  useMemo()                                           │
│  ├─→ Memoizes computed values                      │
└─────────────────────────────────────────────────────┘
         │
┌────────┴──────────────────────────────────────────┐
│              List Level                            │
│                                                    │
│  OptimizedList                                    │
│  ├─→ keyExtractor (stable keys)                  │
│  ├─→ getItemLayout (fixed heights)               │
│  ├─→ removeClippedSubviews                       │
│  ├─→ maxToRenderPerBatch: 10                     │
│  ├─→ windowSize: 21                              │
│  └─→ initialNumToRender: 10                      │
└────────────────────────────────────────────────────┘
         │
┌────────┴──────────────────────────────────────────┐
│           Data Loading Level                       │
│                                                    │
│  Skeleton Loaders                                 │
│  ├─→ Instant feedback                            │
│  ├─→ Perceived performance                       │
│  └─→ Progressive loading                         │
└────────────────────────────────────────────────────┘
```

## 📊 State Management Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                   Global State                       │
│                  (Redux Store)                       │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │    Auth     │  │    Cart     │                  │
│  │   Slice     │  │   Slice     │                  │
│  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────┘
         │
┌────────┴──────────────────────────────────────────┐
│                Context State                       │
│                                                    │
│  NetworkContext                                   │
│  ├─→ isConnected                                 │
│  ├─→ isInternetReachable                        │
│  └─→ connectionType                              │
└────────────────────────────────────────────────────┘
         │
┌────────┴──────────────────────────────────────────┐
│              Component State                       │
│                  (useState)                        │
│                                                    │
│  Local component data                             │
│  ├─→ Form inputs                                 │
│  ├─→ UI states                                   │
│  └─→ Temporary data                              │
└────────────────────────────────────────────────────┘
```

## 🎭 User Experience Flow

```
App Launch
    │
    ├─→ Initialize Error Logger
    ├─→ Initialize API Client
    ├─→ Load Cached Data
    ├─→ Process Offline Queue
    │
    ▼
Show Skeleton Loaders
    │
    ▼
Fetch Fresh Data
    │
    ├─→ Success: Update UI
    ├─→ Error: Show cached data
    ├─→ Offline: Use cached data
    │
    ▼
Smooth UI Transition
    │
    ▼
User Interacts
    │
    ├─→ Online: Instant response
    ├─→ Offline: Queue + Notify
    │
    ▼
Network Status Changes
    │
    ├─→ Online → Offline: Show banner
    ├─→ Offline → Online: Sync queue
    │
    ▼
Continuous Smooth Experience ✅
```

---

**Legend:**
- ✅ Success
- ❌ Error/Offline
- 🌐 Network
- 📦 Cache
- 🔄 Process
- ⚡ Performance
- 🎨 UI/UX

---

This architecture ensures:
- **Resilience:** No crashes, graceful degradation
- **Performance:** Fast rendering, efficient updates
- **UX:** Instant feedback, smooth transitions
- **Reliability:** Offline support, auto-recovery
- **Maintainability:** Clear structure, separation of concerns
