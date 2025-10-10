# 🍕 Friends Pizza Hut - Complete Frontend Documentation

## 📋 Table of Contents
1. [Current App Situation](#-current-app-situation)
2. [Complete Folder Structure](#-complete-folder-structure)
3. [User Journeys (All Roles)](#-user-journeys-all-roles)
4. [Package.json Dependencies](#-packagejson-dependencies)
5. [Services & Functionality Mapping](#-services--functionality-mapping)
6. [What's Implemented](#-whats-implemented)
7. [What Needs Implementation](#-what-needs-implementation)
8. [Installation & Setup](#-installation--setup)

---

## 🎯 Current App Situation

**Friends Pizza Hut** is a **React Native mobile application** built with **Expo framework (v54.0.12)**. It's a **multi-role food delivery platform** supporting three distinct user types with completely different interfaces.

### App Status Overview
✅ **Currently Implemented:**
- Multi-role navigation system (Customer, Delivery, Admin)
- Authentication flow with onboarding
- Redux Toolkit state management
- Basic screen structure for all roles
- Firebase Cloud Messaging integration
- Socket.IO client setup
- Razorpay payment integration
- Image picker and camera functionality
- AsyncStorage for offline persistence

⏳ **Needs Implementation/Enhancement:**
- RTK Query API integration
- Complete offline queue system
- Real-time Socket.IO event handlers
- Push notification handlers
- All screen UI implementations
- API endpoint connections
- Error boundary and toast notifications
- Network status detection
- Complete Redux slices

---

## 📂 Complete Folder Structure

```
frontend/
│
├── 📱 App Entry & Configuration
│   ├── index.ts                            # Main app entry point
│   ├── App.tsx                             # Root component with providers
│   ├── app.json                            # Expo configuration
│   ├── eas.json                            # Expo Application Services config
│   ├── tsconfig.json                       # TypeScript configuration
│   ├── package.json                        # Dependencies & scripts
│   ├── .env                                # Environment variables (API URLs)
│   └── .npmrc                              # NPM configuration
│
├── 🔌 Native Platform Code
│   ├── android/                            # Android native code
│   │   ├── app/
│   │   │   ├── build.gradle                # Android build configuration
│   │   │   ├── google-services.json        # Firebase config (Android)
│   │   │   └── src/
│   │   │       ├── main/
│   │   │       │   ├── AndroidManifest.xml # Android permissions & settings
│   │   │       │   ├── java/               # Native Java/Kotlin code
│   │   │       │   └── res/                # Android resources
│   │   │       ├── debug/                  # Debug build config
│   │   │       └── debugOptimized/         # Optimized debug config
│   │   └── gradle/                         # Gradle wrapper files
│   │
│   └── ios/                                # iOS native code
│       ├── FriendsPizzaHut/
│       │   ├── AppDelegate.swift           # iOS app lifecycle
│       │   ├── Info.plist                  # iOS app configuration
│       │   ├── GoogleService-Info.plist    # Firebase config (iOS)
│       │   ├── FriendsPizzaHut.entitlements # iOS capabilities
│       │   ├── SplashScreen.storyboard     # iOS splash screen
│       │   └── Images.xcassets/            # iOS assets & icons
│       ├── Podfile                         # iOS CocoaPods dependencies
│       └── FriendsPizzaHut.xcodeproj/      # Xcode project files
│
├── 🎨 Assets & Resources
│   └── assets/
│       ├── adaptive-icon.png               # Android adaptive icon
│       ├── icon.png                        # App icon (512x512)
│       ├── splash-icon.png                 # Splash screen icon
│       ├── favicon.png                     # Web favicon
│       └── pizza.jpeg                      # Placeholder/demo image
│
├── 🔧 Plugins & Extensions
│   └── plugins/
│       └── withRazorpay.js                 # Expo config plugin for Razorpay
│
├── 🗄️ State Management (Redux)
│   └── redux/
│       ├── store.ts                        # Redux store configuration
│       └── slices/                         # Redux state slices
│           ├── authSlice.ts                # ✅ Authentication state
│           └── onboardingSlice.ts          # ✅ Onboarding state
│           │
│           ├── 📝 NEEDS IMPLEMENTATION:
│           ├── cartSlice.ts                # ⏳ Shopping cart state
│           ├── orderSlice.ts               # ⏳ Order management state
│           ├── menuSlice.ts                # ⏳ Menu/products state
│           ├── userSlice.ts                # ⏳ User profile state
│           ├── notificationSlice.ts        # ⏳ Notifications state
│           ├── deliverySlice.ts            # ⏳ Delivery tracking state
│           ├── adminSlice.ts               # ⏳ Admin dashboard state
│           └── api/                        # ⏳ RTK Query API slices
│               ├── authApi.ts              # ⏳ Auth API endpoints
│               ├── orderApi.ts             # ⏳ Order API endpoints
│               ├── menuApi.ts              # ⏳ Menu API endpoints
│               ├── userApi.ts              # ⏳ User API endpoints
│               └── paymentApi.ts           # ⏳ Payment API endpoints
│
├── 💻 Source Code (src/)
│   │
│   ├── 🧩 components/                      # Reusable UI components
│   │   ├── auth/
│   │   │   └── Login.tsx                   # ✅ Login form component
│   │   ├── onboarding/
│   │   │   └── OnboardingCarousel.tsx      # ✅ Onboarding carousel
│   │   │
│   │   ├── 📝 NEEDS IMPLEMENTATION:
│   │   ├── common/                         # ⏳ Shared components
│   │   │   ├── Button.tsx                  # ⏳ Custom button
│   │   │   ├── Input.tsx                   # ⏳ Custom input field
│   │   │   ├── Loader.tsx                  # ⏳ Loading spinner
│   │   │   ├── ErrorBoundary.tsx           # ⏳ Error boundary wrapper
│   │   │   ├── Toast.tsx                   # ⏳ Toast notifications
│   │   │   ├── Modal.tsx                   # ⏳ Custom modal
│   │   │   └── Card.tsx                    # ⏳ Card component
│   │   ├── customer/                       # ⏳ Customer-specific components
│   │   │   ├── ProductCard.tsx             # ⏳ Menu item card
│   │   │   ├── CartItem.tsx                # ⏳ Cart item component
│   │   │   └── OrderCard.tsx               # ⏳ Order history card
│   │   ├── delivery/                       # ⏳ Delivery-specific components
│   │   │   ├── OrderCard.tsx               # ⏳ Delivery order card
│   │   │   └── MapView.tsx                 # ⏳ Delivery map
│   │   └── admin/                          # ⏳ Admin-specific components
│   │       ├── StatCard.tsx                # ⏳ Dashboard stat card
│   │       └── DataTable.tsx               # ⏳ Data table component
│   │
│   ├── 📱 screens/                         # Screen components
│   │   │
│   │   ├── ✅ onboarding/
│   │   │   └── OnboardingScreen.tsx        # ✅ Welcome carousel
│   │   │
│   │   ├── ✅ auth/
│   │   │   └── LoginScreen.tsx             # ✅ Login page
│   │   │
│   │   ├── ✅ common/
│   │   │   └── LoadingScreen.tsx           # ✅ Loading screen
│   │   │
│   │   ├── 📝 customer/ (NEEDS FULL IMPLEMENTATION)
│   │   │   ├── main/
│   │   │   │   ├── HomeScreen.tsx          # ⏳ Customer home page
│   │   │   │   ├── MenuScreen.tsx          # ⏳ Browse menu
│   │   │   │   ├── CartScreen.tsx          # ⏳ Shopping cart
│   │   │   │   ├── OrdersScreen.tsx        # ⏳ Order history
│   │   │   │   └── ProfileScreen.tsx       # ⏳ Customer profile
│   │   │   ├── menu/
│   │   │   │   ├── ProductDetailsScreen.tsx    # ⏳ Product details
│   │   │   │   └── CategoryScreen.tsx          # ⏳ Category view
│   │   │   ├── orders/
│   │   │   │   ├── OrderDetailsScreen.tsx      # ⏳ Order details
│   │   │   │   ├── OrderTrackingScreen.tsx     # ⏳ Real-time tracking
│   │   │   │   └── RateOrderScreen.tsx         # ⏳ Rate order
│   │   │   └── profile/
│   │   │       ├── AddressManagementScreen.tsx # ⏳ Manage addresses
│   │   │       ├── PaymentMethodsScreen.tsx    # ⏳ Payment methods
│   │   │       └── SettingsScreen.tsx          # ⏳ User settings
│   │   │
│   │   ├── 📝 delivery/ (NEEDS FULL IMPLEMENTATION)
│   │   │   ├── main/
│   │   │   │   ├── HomeScreen.tsx              # ⏳ Delivery dashboard
│   │   │   │   ├── ActiveOrdersScreen.tsx      # ⏳ Active deliveries
│   │   │   │   └── PaymentCollectionScreen.tsx # ⏳ COD collection
│   │   │   ├── orders/
│   │   │   │   ├── OrderDetailsScreen.tsx      # ⏳ Delivery order details
│   │   │   │   ├── NavigationScreen.tsx        # ⏳ GPS navigation
│   │   │   │   └── CustomerContactScreen.tsx   # ⏳ Contact customer
│   │   │   └── profile/
│   │   │       ├── EarningsHistoryScreen.tsx   # ⏳ Earnings report
│   │   │       ├── VehicleInfoScreen.tsx       # ⏳ Vehicle details
│   │   │       ├── AccountSettingsScreen.tsx   # ⏳ Account settings
│   │   │       └── DeliverySettingsScreen.tsx  # ⏳ Delivery preferences
│   │   │
│   │   └── 📝 admin/ (NEEDS FULL IMPLEMENTATION)
│   │       ├── analytics/                      # ⏳ Analytics screens
│   │       ├── main/                           # ⏳ Main admin screens
│   │       ├── management/                     # ⏳ Management screens
│   │       ├── menu/                           # ⏳ Menu management
│   │       ├── notifications/                  # ⏳ Notification management
│   │       ├── offers/                         # ⏳ Offers management
│   │       ├── orders/                         # ⏳ Order management
│   │       ├── settings/                       # ⏳ Settings screens
│   │       └── users/                          # ⏳ User management
│   │
│   ├── 🧭 navigation/                      # Navigation configuration
│   │   ├── RootNavigator.tsx               # ✅ Root navigation logic
│   │   ├── AuthNavigator.tsx               # ✅ Auth flow navigation
│   │   ├── CustomerNavigator.tsx           # ✅ Customer tab navigator
│   │   ├── DeliveryNavigator.tsx           # ✅ Delivery tab navigator
│   │   └── AdminNavigator.tsx              # ✅ Admin tab navigator
│   │
│   ├── 🎨 constants/
│   │   └── designSystem.ts                 # ✅ Design tokens & theme
│   │
│   ├── 📝 types/
│   │   └── navigation.ts                   # ✅ Navigation type definitions
│   │
│   └── 📝 NEEDS IMPLEMENTATION:
│       ├── api/                            # ⏳ API client & endpoints
│       │   ├── apiClient.ts                # ⏳ Axios instance with interceptors
│       │   ├── endpoints.ts                # ⏳ API endpoint constants
│       │   └── offlineQueue.ts             # ⏳ Offline request queue
│       ├── hooks/                          # ⏳ Custom React hooks
│       │   ├── useNetwork.ts               # ⏳ Network status detection
│       │   ├── useOfflineQueue.ts          # ⏳ Offline queue management
│       │   ├── useNotifications.ts         # ⏳ Push notifications
│       │   ├── useSocket.ts                # ⏳ Socket.IO connection
│       │   └── useAuth.ts                  # ⏳ Authentication hook
│       ├── utils/                          # ⏳ Utility functions
│       │   ├── formatters.ts               # ⏳ Date/currency formatters
│       │   ├── validators.ts               # ⏳ Input validators
│       │   └── storage.ts                  # ⏳ AsyncStorage helpers
│       └── services/                       # ⏳ Service modules
│           ├── socket.ts                   # ⏳ Socket.IO setup
│           ├── notifications.ts            # ⏳ FCM setup
│           └── payment.ts                  # ⏳ Razorpay integration
│
└── 📚 Documentation
    ├── README.md                           # Basic README (to be replaced)
    ├── OFFER_MANAGEMENT_QUICK_START.md     # Offers feature guide
    └── OFFER_MANAGEMENT_SETUP.md           # Offers setup guide
```

---

## 👥 User Journeys (All Roles)

### 🚀 First Time User (Any Role)

```
📱 App Install
    ↓
🎬 Onboarding Screen (3 slides carousel)
    ├─ Slide 1: "Welcome to Friends Pizza Hut"
    ├─ Slide 2: "Real-time Order Tracking"
    └─ Slide 3: "Fast & Fresh Delivery"
    ↓
🔐 Login Screen
    ├─ Email input
    ├─ Password input
    └─ Login button
    ↓
🔄 Authentication Check (API call)
    ↓
✅ Role Detection (customer/delivery/admin)
    ↓
📍 Route to Role-Specific Home
```

---

### 🛒 Customer Journey (Complete Flow)

```
🏠 Customer Home Screen
    ├─ Welcome banner
    ├─ Featured pizzas
    ├─ Categories (Pizza, Sides, Drinks, Desserts)
    └─ Special offers
    ↓
📋 Browse Menu Screen
    ├─ Search bar
    ├─ Category filters
    ├─ Product cards (image, name, price)
    └─ Add to cart button
    ↓
🍕 Product Details Screen
    ├─ Large product image
    ├─ Description
    ├─ Size selection (Small/Medium/Large)
    ├─ Toppings/customization
    ├─ Quantity selector
    └─ Add to cart
    ↓
🛒 Cart Screen
    ├─ Cart items list
    ├─ Edit quantity/remove items
    ├─ Apply coupon code
    ├─ View price breakdown
    │   ├─ Subtotal
    │   ├─ Taxes
    │   ├─ Delivery fee
    │   └─ Total
    └─ Proceed to checkout
    ↓
📍 Delivery Address Selection
    ├─ Saved addresses list
    ├─ Add new address
    └─ Confirm address
    ↓
💳 Payment Method Selection
    ├─ Cash on Delivery (COD)
    ├─ Razorpay (UPI/Card/Wallet)
    └─ Confirm payment
    ↓
✅ Order Confirmation
    ├─ Order ID
    ├─ Estimated delivery time
    └─ Track order button
    ↓
🚚 Order Tracking Screen (Real-time Socket.IO)
    ├─ Order status updates:
    │   ├─ Order Placed ✅
    │   ├─ Preparing 👨‍🍳
    │   ├─ Out for Delivery 🚗
    │   └─ Delivered 🎉
    ├─ Delivery partner details
    │   ├─ Name
    │   ├─ Phone
    │   └─ Vehicle number
    ├─ Live location on map
    └─ Call delivery partner
    ↓
⭐ Rate Order Screen (After delivery)
    ├─ Food rating (5 stars)
    ├─ Delivery rating (5 stars)
    ├─ Written feedback (optional)
    └─ Submit review
    ↓
📜 Order History Screen
    ├─ Past orders list
    ├─ Reorder button
    └─ View order details
    ↓
👤 Profile Screen
    ├─ User info (name, email, phone)
    ├─ Manage addresses
    ├─ Payment methods
    ├─ Order history
    ├─ Notifications settings
    └─ Logout
```

**Customer Tab Navigation:**
- 🏠 Home
- 📋 Menu
- 🛒 Cart
- 📦 Orders
- 👤 Profile

---

### 🚴 Delivery Partner Journey (Complete Flow)

```
🏠 Delivery Home Screen (Dashboard)
    ├─ Availability toggle (Online/Offline)
    ├─ Today's earnings (₹)
    ├─ Total deliveries completed
    ├─ Current delivery status
    └─ Available orders notification
    ↓
📦 Available Orders List
    ├─ Order cards showing:
    │   ├─ Order ID
    │   ├─ Customer location
    │   ├─ Delivery distance
    │   ├─ Delivery fee
    │   └─ Pickup location
    └─ Accept order button
    ↓
✅ Accept Order
    ↓
📦 Active Orders Screen
    ├─ Current delivery details
    ├─ Customer name & phone
    ├─ Pickup address (Restaurant)
    ├─ Delivery address
    ├─ Order items list
    ├─ Payment method (COD/Prepaid)
    └─ Action buttons:
        ├─ Start navigation
        ├─ Call customer
        ├─ Mark picked up
        └─ Mark delivered
    ↓
🗺️ Navigation Screen
    ├─ Integrated Google Maps
    ├─ Turn-by-turn directions
    ├─ Real-time location sharing
    └─ ETA display
    ↓
📞 Customer Contact Screen
    ├─ Customer name
    ├─ Phone number
    ├─ Call button
    ├─ Send message
    └─ View delivery address
    ↓
🏪 Mark Picked Up (From Restaurant)
    ↓
🚗 Start Delivery (Update status to "Out for Delivery")
    ↓
📍 Mark Delivered
    ├─ Delivery confirmation
    ├─ Collect COD (if applicable)
    ├─ Get customer signature (optional)
    └─ Submit delivery proof
    ↓
💰 Payment Collection Screen (If COD)
    ├─ Order total
    ├─ Amount received
    ├─ Change to return
    └─ Confirm collection
    ↓
📊 Earnings History Screen
    ├─ Daily earnings
    ├─ Weekly summary
    ├─ Monthly summary
    ├─ Delivery count
    └─ Payout history
    ↓
🚗 Vehicle Info Screen
    ├─ Vehicle type (Bike/Car/Cycle)
    ├─ Vehicle number
    ├─ License number
    └─ Insurance details
    ↓
👤 Delivery Profile Screen
    ├─ Personal info
    ├─ Bank account details
    ├─ Vehicle information
    ├─ Delivery settings
    ├─ Performance stats
    └─ Logout
```

**Delivery Tab Navigation:**
- 🏠 Home (Dashboard)
- 📦 Active Orders
- 💰 Earnings
- 👤 Profile

---

### 👨‍💼 Admin Journey (Complete Flow)

```
📊 Admin Dashboard Screen
    ├─ Today's statistics:
    │   ├─ Total orders (count)
    │   ├─ Revenue (₹)
    │   ├─ Active orders
    │   ├─ Completed orders
    │   ├─ Cancelled orders
    │   └─ Active delivery partners
    ├─ Revenue chart (last 7 days)
    ├─ Recent orders table
    └─ Quick actions:
        ├─ View all orders
        ├─ Manage menu
        ├─ Manage users
        └─ Send notifications
    ↓
📦 Order Management Screen
    ├─ Orders list (All/Pending/Active/Completed)
    ├─ Filters:
    │   ├─ Date range
    │   ├─ Status
    │   ├─ Payment method
    │   └─ Search by order ID
    ├─ Order cards showing:
    │   ├─ Order ID
    │   ├─ Customer name
    │   ├─ Items
    │   ├─ Status
    │   ├─ Total amount
    │   └─ Time
    └─ Actions:
        ├─ View details
        ├─ Change status
        ├─ Assign delivery partner
        └─ Cancel order
    ↓
📋 Order Details Screen
    ├─ Customer information
    ├─ Delivery address
    ├─ Order items & prices
    ├─ Payment details
    ├─ Order timeline
    ├─ Assigned delivery partner
    └─ Admin actions:
        ├─ Update status
        ├─ Reassign delivery partner
        ├─ Cancel order
        └─ Refund (if applicable)
    ↓
🚴 Assign Delivery Partner Screen
    ├─ Available delivery partners list
    ├─ Partner details:
    │   ├─ Name
    │   ├─ Current location
    │   ├─ Distance from restaurant
    │   ├─ Active deliveries
    │   └─ Rating
    └─ Assign button
    ↓
🍕 Menu Management Screen
    ├─ Categories list (Pizza, Sides, Drinks, Desserts)
    ├─ Add new category
    ├─ Products list
    └─ Actions:
        ├─ Add product
        ├─ Edit product
        ├─ Delete product
        └─ Toggle availability
    ↓
➕ Add/Edit Product Screen
    ├─ Product image upload
    ├─ Product name
    ├─ Description
    ├─ Category selection
    ├─ Price
    ├─ Discount (optional)
    ├─ Available sizes
    ├─ Toppings/add-ons
    ├─ Stock status (In Stock/Out of Stock)
    └─ Save button
    ↓
📂 Category Management Screen
    ├─ Category list
    ├─ Add new category
    ├─ Edit category name
    ├─ Delete category
    └─ Reorder categories
    ↓
👥 User Management Screen
    ├─ Tabs:
    │   ├─ Customers
    │   ├─ Delivery Partners
    │   └─ Admins
    ├─ User list showing:
    │   ├─ Name
    │   ├─ Email
    │   ├─ Phone
    │   ├─ Join date
    │   ├─ Status (Active/Blocked)
    │   └─ Total orders (customers)
    │       or Total deliveries (delivery partners)
    └─ Actions:
        ├─ View details
        ├─ Block/Unblock user
        ├─ Delete user
        └─ Send notification
    ↓
👤 User Details Screen
    ├─ Full user information
    ├─ Order history (for customers)
    ├─ Delivery history (for delivery partners)
    ├─ Performance stats
    └─ Admin actions:
        ├─ Edit user details
        ├─ Change role
        ├─ Block/Unblock
        └─ Send message
    ↓
🎁 Offers Management Screen
    ├─ Active offers list
    ├─ Expired offers
    ├─ Add new offer
    └─ Offer details:
        ├─ Offer title
        ├─ Discount percentage
        ├─ Coupon code
        ├─ Validity dates
        ├─ Minimum order value
        ├─ Max uses per user
        └─ Total usage limit
    ↓
📢 Notification Management Screen
    ├─ Send notification to:
    │   ├─ All customers
    │   ├─ All delivery partners
    │   ├─ Specific user
    │   └─ By role
    ├─ Notification content:
    │   ├─ Title
    │   ├─ Message
    │   ├─ Image (optional)
    │   └─ Action link (optional)
    └─ Send button
    ↓
📈 Analytics Screen
    ├─ Revenue analytics:
    │   ├─ Daily/Weekly/Monthly/Yearly
    │   ├─ Revenue chart
    │   └─ Growth percentage
    ├─ Order analytics:
    │   ├─ Total orders
    │   ├─ Order value trends
    │   └─ Peak hours
    ├─ Product analytics:
    │   ├─ Top-selling items
    │   ├─ Category-wise sales
    │   └─ Low-performing items
    ├─ Delivery analytics:
    │   ├─ Average delivery time
    │   ├─ Delivery partner performance
    │   └─ Delivery success rate
    └─ Customer analytics:
        ├─ New vs returning customers
        ├─ Customer lifetime value
        └─ Customer satisfaction (ratings)
    ↓
📊 Reports Screen
    ├─ Generate reports:
    │   ├─ Sales report (daily/weekly/monthly)
    │   ├─ Inventory report
    │   ├─ Delivery partner report
    │   └─ Customer report
    ├─ Date range selector
    ├─ Export options (PDF/Excel)
    └─ Download button
    ↓
⚙️ Business Settings Screen
    ├─ Restaurant information
    ├─ Opening hours
    ├─ Delivery settings:
    │   ├─ Delivery radius (km)
    │   ├─ Minimum order value
    │   ├─ Delivery charge
    │   └─ Free delivery threshold
    ├─ Tax settings
    ├─ Payment gateway settings
    └─ App settings:
        ├─ Maintenance mode
        ├─ New order notifications
        └─ Auto-assign delivery partners
    ↓
🔧 Admin Profile Screen
    ├─ Admin info
    ├─ Change password
    ├─ Notification preferences
    └─ Logout
```

**Admin Tab Navigation:**
- 📊 Dashboard
- 📦 Orders
- 🍕 Menu
- 👥 Users
- 📈 Analytics
- ⚙️ Settings

---

## 📦 Package.json Dependencies

### **Core Dependencies (25 packages)**

```json
{
  "dependencies": {
    // 🎯 Expo & React Native Core
    "expo": "~54.0.12",                         // Expo SDK framework
    "react": "19.1.0",                          // React library
    "react-native": "0.81.4",                   // React Native framework
    "expo-status-bar": "~3.0.8",                // Status bar component
    
    // 🧭 Navigation
    "@react-navigation/native": "^7.1.17",      // Navigation library
    "@react-navigation/native-stack": "^7.3.26", // Stack navigator
    "@react-navigation/bottom-tabs": "^7.4.7",  // Tab navigator
    "react-native-screens": "^4.16.0",          // Native screen optimization
    "react-native-safe-area-context": "^5.6.1", // Safe area handling
    "react-native-gesture-handler": "^2.28.0",  // Gesture handling
    
    // 🗄️ State Management
    "@reduxjs/toolkit": "^2.9.0",               // Redux state management
    "react-redux": "^9.2.0",                    // React bindings for Redux
    
    // 💾 Storage & Offline
    "@react-native-async-storage/async-storage": "^1.24.0", // Local storage
    
    // 🔔 Push Notifications
    "expo-notifications": "^0.32.12",           // Local & push notifications
    "@react-native-firebase/app": "^23.4.0",    // Firebase core
    "@react-native-firebase/messaging": "^23.4.0", // FCM push notifications
    "firebase": "^12.3.0",                      // Firebase SDK
    
    // 🔌 Real-time Communication
    "socket.io-client": "^4.8.1",               // Socket.IO client for real-time
    
    // 💳 Payments
    "react-native-razorpay": "^2.3.0",          // Razorpay payment gateway
    
    // 📸 Media & Permissions
    "expo-camera": "^17.0.8",                   // Camera access
    "expo-image-picker": "^17.0.8",             // Image picker
    "expo-media-library": "^18.2.0",            // Media library access
    "expo-clipboard": "^8.0.7",                 // Clipboard operations
    
    // 🎨 UI & Design
    "@expo/vector-icons": "^15.0.2",            // Icon library
    "expo-linear-gradient": "^15.0.7",          // Gradient components
    
    // 🛠️ Utilities
    "expo-device": "^8.0.9",                    // Device information
    "expo-crypto": "^15.0.7",                   // Cryptographic functions
    "expo-build-properties": "^1.0.9",          // Build configuration
    "expo-dev-client": "^6.0.13"                // Custom development client
  },
  
  "devDependencies": {
    "@types/react": "~19.1.0",                  // TypeScript types for React
    "typescript": "~5.9.2"                      // TypeScript compiler
  }
}
```

---

## 🔧 Services & Functionality Mapping

### **1. Authentication & User Management**
- **Service:** Custom REST API (Backend)
- **Dependencies:** `@react-native-async-storage/async-storage`, `@reduxjs/toolkit`
- **Functionality:**
  - User login with email/password
  - JWT token storage in AsyncStorage
  - Auto-login on app restart
  - Role-based authentication (customer/delivery/admin)
  - Logout and session management

---

### **2. State Management**
- **Service:** Redux Toolkit
- **Dependencies:** `@reduxjs/toolkit`, `react-redux`
- **Functionality:**
  - Centralized state management
  - Auth state (user, token, role)
  - Onboarding state (first launch tracking)
  - Cart state (items, total, quantity)
  - Order state (active orders, history)
  - Menu state (products, categories)
  - Notification state (unread count, messages)

---

### **3. Navigation System**
- **Service:** React Navigation v7
- **Dependencies:** `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **Functionality:**
  - Role-based navigation (3 different navigators)
  - Stack navigation for screen transitions
  - Bottom tab navigation for main sections
  - Deep linking support
  - Programmatic navigation

---

### **4. Real-Time Order Tracking**
- **Service:** Socket.IO
- **Dependencies:** `socket.io-client`
- **Backend Events:**
  - `order:new` - New order created
  - `order:status:update` - Order status changed
  - `order:cancelled` - Order cancelled
  - `delivery:status:update` - Delivery partner status changed
  - `delivery:location:update` - Real-time location updates
  - `payment:received` - Payment confirmation
  - `notification:new` - New notification
- **Functionality:**
  - Real-time order status updates
  - Live delivery partner location tracking
  - Instant notifications without polling
  - Connection state management
  - Automatic reconnection

---

### **5. Push Notifications**
- **Service:** Firebase Cloud Messaging (FCM)
- **Dependencies:** `@react-native-firebase/app`, `@react-native-firebase/messaging`, `expo-notifications`, `firebase`
- **Functionality:**
  - Background notifications
  - Foreground notification handling
  - Notification badges
  - Custom notification sounds
  - Action buttons in notifications
  - Deep linking from notifications
  - FCM token registration

---

### **6. Payment Processing**
- **Service:** Razorpay
- **Dependencies:** `react-native-razorpay`
- **Plugin:** `plugins/withRazorpay.js`
- **Functionality:**
  - UPI payments
  - Debit/Credit card payments
  - Net banking
  - Wallets (Paytm, PhonePe, Google Pay)
  - Cash on Delivery (COD)
  - Payment status verification
  - Refund handling

---

### **7. Image Upload & Media**
- **Service:** Expo Media APIs + Backend
- **Dependencies:** `expo-image-picker`, `expo-camera`, `expo-media-library`
- **Functionality:**
  - Take photos from camera
  - Pick images from gallery
  - Image compression before upload
  - Profile picture upload
  - Product image upload (admin)
  - Vehicle document upload (delivery)

---

### **8. Offline Support & Queue**
- **Service:** AsyncStorage + Custom Queue
- **Dependencies:** `@react-native-async-storage/async-storage`
- **Functionality (TO BE IMPLEMENTED):**
  - Queue failed API requests
  - Retry on network restore
  - Offline data caching
  - Optimistic UI updates
  - Sync on reconnection

---

### **9. Network Status Detection**
- **Service:** React Native NetInfo (TO BE ADDED)
- **Functionality (TO BE IMPLEMENTED):**
  - Detect online/offline status
  - Show connection status banner
  - Queue requests when offline
  - Auto-sync when back online

---

### **10. Error Handling & Logging**
- **Service:** Custom Error Boundary (TO BE IMPLEMENTED)
- **Functionality:**
  - Global error boundary
  - Toast notifications for errors
  - API error handling
  - Validation errors
  - Network errors

---

### **11. Analytics (Future)**
- **Service:** Firebase Analytics (TO BE ADDED)
- **Functionality:**
  - User behavior tracking
  - Screen view tracking
  - Event logging
  - Crash reporting

---

### **12. Map & Location Services (Future)**
- **Service:** Google Maps API (TO BE ADDED)
- **Dependencies:** `react-native-maps` (TO BE ADDED)
- **Functionality:**
  - Show delivery location on map
  - Turn-by-turn navigation for delivery partners
  - Address selection with map
  - Distance calculation

---

## ✅ What's Implemented

### **1. Project Structure ✅**
- Expo app with TypeScript
- Proper folder organization
- Redux store setup
- Navigation system configured

### **2. Authentication Flow ✅**
- Onboarding screen with carousel
- Login screen UI
- Auth navigator
- Redux auth slice (basic structure)

### **3. Navigation System ✅**
- Root navigator with role detection
- Customer tab navigator
- Delivery tab navigator
- Admin tab navigator
- Stack navigators for each role

### **4. State Management ✅**
- Redux Toolkit store
- Auth slice (token, user, role)
- Onboarding slice (first launch)

### **5. Dependencies Installed ✅**
- All core packages installed
- Firebase configured (Android & iOS)
- Razorpay plugin configured
- Socket.IO client ready

### **6. Native Configuration ✅**
- Android build.gradle configured
- iOS Podfile configured
- Firebase setup (google-services.json)
- App icons and splash screen

---

## ⏳ What Needs Implementation

### **🔴 HIGH PRIORITY (Core Functionality)**

#### **1. API Integration**
- ❌ Create `src/api/apiClient.ts` with Axios instance
- ❌ Add interceptors for JWT token
- ❌ Create `src/api/endpoints.ts` with all API routes
- ❌ Implement error handling for API calls
- ❌ Add request/response logging

#### **2. RTK Query Setup**
- ❌ Create `redux/slices/api/authApi.ts` (login, register, logout)
- ❌ Create `redux/slices/api/orderApi.ts` (create, list, update orders)
- ❌ Create `redux/slices/api/menuApi.ts` (get products, categories)
- ❌ Create `redux/slices/api/userApi.ts` (profile, addresses)
- ❌ Create `redux/slices/api/paymentApi.ts` (initiate, verify)

#### **3. Complete Redux Slices**
- ❌ `cartSlice.ts` (add, remove, update items, calculate total)
- ❌ `orderSlice.ts` (active orders, order history)
- ❌ `menuSlice.ts` (products, categories, filters)
- ❌ `userSlice.ts` (profile, addresses, preferences)
- ❌ `notificationSlice.ts` (notifications list, unread count)

#### **4. Socket.IO Integration**
- ❌ Create `src/services/socket.ts` with connection logic
- ❌ Create `src/hooks/useSocket.ts` hook
- ❌ Implement event listeners for:
  - `order:new`
  - `order:status:update`
  - `order:cancelled`
  - `delivery:status:update`
  - `delivery:location:update`
  - `payment:received`
  - `notification:new`
- ❌ Add connection state management
- ❌ Implement auto-reconnection logic

#### **5. Push Notifications**
- ❌ Create `src/services/notifications.ts` with FCM setup
- ❌ Create `src/hooks/useNotifications.ts` hook
- ❌ Request notification permissions
- ❌ Register FCM token with backend
- ❌ Handle foreground notifications
- ❌ Handle background notifications
- ❌ Implement notification tap handling
- ❌ Add notification badge counter

#### **6. Customer Screens (All Need Full Implementation)**
- ❌ HomeScreen.tsx - Featured products, categories
- ❌ MenuScreen.tsx - Product list with filters
- ❌ ProductDetailsScreen.tsx - Product info, add to cart
- ❌ CartScreen.tsx - Cart items, coupon, checkout
- ❌ OrdersScreen.tsx - Order history
- ❌ OrderDetailsScreen.tsx - Order info, status
- ❌ OrderTrackingScreen.tsx - Real-time tracking with Socket.IO
- ❌ ProfileScreen.tsx - User info, settings
- ❌ AddressManagementScreen.tsx - Add/edit addresses
- ❌ PaymentMethodsScreen.tsx - Payment options

#### **7. Delivery Partner Screens (All Need Full Implementation)**
- ❌ HomeScreen.tsx (Delivery) - Dashboard, earnings, availability toggle
- ❌ ActiveOrdersScreen.tsx - Current deliveries
- ❌ OrderDetailsScreen.tsx (Delivery) - Order info, customer contact
- ❌ NavigationScreen.tsx - GPS navigation (needs Google Maps)
- ❌ PaymentCollectionScreen.tsx - COD collection
- ❌ EarningsHistoryScreen.tsx - Earnings report
- ❌ VehicleInfoScreen.tsx - Vehicle details

#### **8. Admin Screens (All Need Full Implementation)**
- ❌ DashboardScreen.tsx - Stats, charts, recent orders
- ❌ AllOrdersScreen.tsx - Order management
- ❌ OrderDetailsScreen.tsx (Admin) - Order info, assign delivery
- ❌ ProductListScreen.tsx - Menu management
- ❌ AddProductScreen.tsx - Add new product
- ❌ EditProductScreen.tsx - Edit existing product
- ❌ CategoryManagementScreen.tsx - Manage categories
- ❌ CustomerListScreen.tsx - User management
- ❌ DeliveryListScreen.tsx - Delivery partner management
- ❌ ReportsScreen.tsx - Analytics and reports
- ❌ BusinessSettingsScreen.tsx - App settings

---

### **🟡 MEDIUM PRIORITY (Enhanced Functionality)**

#### **9. Offline Support**
- ❌ Create `src/api/offlineQueue.ts`
- ❌ Create `src/hooks/useOfflineQueue.ts`
- ❌ Create `src/hooks/useNetwork.ts`
- ❌ Implement request queueing
- ❌ Add sync on reconnection
- ❌ Show offline indicator banner

#### **10. Reusable UI Components**
- ❌ `Button.tsx` - Custom button with loading state
- ❌ `Input.tsx` - Custom input with validation
- ❌ `Loader.tsx` - Loading spinner component
- ❌ `ErrorBoundary.tsx` - Global error catcher
- ❌ `Toast.tsx` - Toast notification component
- ❌ `Modal.tsx` - Custom modal component
- ❌ `Card.tsx` - Card component
- ❌ `ProductCard.tsx` - Product card for menu
- ❌ `CartItem.tsx` - Cart item component
- ❌ `OrderCard.tsx` - Order history card

#### **11. Utility Functions**
- ❌ `src/utils/formatters.ts` - Date, currency, phone formatters
- ❌ `src/utils/validators.ts` - Email, phone, password validators
- ❌ `src/utils/storage.ts` - AsyncStorage helpers
- ❌ `src/utils/permissions.ts` - Permission request helpers

#### **12. Payment Integration**
- ❌ Create `src/services/payment.ts` with Razorpay integration
- ❌ Implement payment flow in CartScreen
- ❌ Handle payment success/failure
- ❌ Verify payment with backend
- ❌ Show payment receipt

---

### **🟢 LOW PRIORITY (Nice to Have)**

#### **13. Google Maps Integration** (For Delivery Partners)
- ❌ Add `react-native-maps` dependency
- ❌ Create MapView component
- ❌ Implement turn-by-turn navigation
- ❌ Show delivery route on map
- ❌ Real-time location updates

#### **14. Advanced Features**
- ❌ Multi-language support (i18n)
- ❌ Dark mode theme
- ❌ Biometric authentication
- ❌ Voice search
- ❌ QR code scanner
- ❌ In-app chat with support
- ❌ Social media sharing

#### **15. Testing & Quality**
- ❌ Unit tests for Redux slices
- ❌ Integration tests for API calls
- ❌ E2E tests with Detox
- ❌ Performance monitoring
- ❌ Crash reporting (Sentry)

#### **16. Documentation**
- ❌ Component documentation (Storybook)
- ❌ API documentation
- ❌ Setup guide for new developers
- ❌ Deployment guide (EAS Build)

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- Physical device or emulator

### **Step 1: Clone Repository**
```bash
cd /home/naitik2408/Contribution/pizza2/frontend
```

### **Step 2: Install Dependencies**
```bash
npm install
# or with legacy peer deps if errors
npm install --legacy-peer-deps
```

### **Step 3: Configure Environment Variables**
Create `.env` file in root:
```env
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_IP:5000/api
EXPO_PUBLIC_SOCKET_URL=http://YOUR_BACKEND_IP:5000
```

**Note:** Replace `YOUR_BACKEND_IP` with your actual backend server IP address.

### **Step 4: Start Development Server**
```bash
npm start
# or
expo start
```

### **Step 5: Run on Device/Emulator**

**Option A: Physical Device (Easiest)**
1. Install **Expo Go** app from Play Store (Android) or App Store (iOS)
2. Scan QR code from terminal
3. App will load on your device

**Option B: Android Emulator**
```bash
npm run android
# or
expo run:android
```

**Option C: iOS Simulator (macOS only)**
```bash
npm run ios
# or
expo run:ios
```

---

## 👤 Demo Accounts

### **Customer Account**
```
📧 Email: customer@test.com
🔑 Password: password123
```

### **Delivery Partner Account**
```
📧 Email: delivery@test.com
🔑 Password: password123
```

### **Admin Account**
```
📧 Email: admin@test.com
🔑 Password: password123
```

---

## 🎯 Next Steps (Priority Order)

### **Phase 1: Core API Integration (Week 1)**
1. ✅ Create API client with Axios
2. ✅ Setup RTK Query for all APIs
3. ✅ Complete all Redux slices
4. ✅ Implement authentication flow
5. ✅ Test API connections

### **Phase 2: Customer Features (Week 2)**
1. ✅ Implement all customer screens
2. ✅ Add product listing and details
3. ✅ Implement shopping cart
4. ✅ Add checkout flow
5. ✅ Integrate Razorpay payment

### **Phase 3: Real-Time Features (Week 3)**
1. ✅ Setup Socket.IO connection
2. ✅ Implement order tracking
3. ✅ Add push notifications
4. ✅ Real-time delivery location
5. ✅ Test real-time events

### **Phase 4: Delivery & Admin (Week 4)**
1. ✅ Implement delivery partner screens
2. ✅ Add order acceptance flow
3. ✅ Implement admin dashboard
4. ✅ Add menu management
5. ✅ Add user management

### **Phase 5: Polish & Testing (Week 5)**
1. ✅ Add offline support
2. ✅ Implement error handling
3. ✅ Add loading states
4. ✅ Test all flows
5. ✅ Fix bugs

---

## 📞 Support

For issues or questions:
- Check backend documentation in `/backend/README.md`
- Review Socket.IO events in `/backend/SOCKET_QUICK_REFERENCE.md`
- Check error codes in `/backend/ERROR_CODES.md`

---

**Last Updated:** October 8, 2025
**Version:** 1.0.0
**Status:** 🟡 In Development (30% Complete)
