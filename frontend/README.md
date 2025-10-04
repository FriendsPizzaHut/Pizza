# Friends Pizza Hut - React Native App

A comprehensive pizza ordering app with role-based navigation supporting customers, delivery partners, and restaurant administrators.

## 🚀 Features

### Multi-User System
- **Customers**: Browse menu, place orders, track deliveries
- **Delivery Partners**: View assigned orders, manage deliveries, track earnings
- **Restaurant Admins**: Manage orders, menu, analytics, and staff

### App Flow
1. **First Launch**: Interactive onboarding carousel (3 slides)
2. **Authentication**: Role-based login with demo credentials
3. **Navigation**: Automatic redirection to appropriate dashboard
4. **Persistence**: User state and preferences saved locally

## 🔐 Demo Credentials

### Customer Account
- **Email**: `customer@demo.com`
- **Password**: `customer123`
- **Features**: Menu browsing, order history, profile management

### Delivery Partner Account  
- **Email**: `delivery@demo.com`
- **Password**: `delivery123`
- **Features**: Order assignments, delivery tracking, earnings dashboard

### Admin Account
- **Email**: `admin@demo.com`
- **Password**: `admin123`
- **Features**: Order management, analytics, menu updates, staff management

## 🏗️ Architecture

### Navigation Structure
```
App Root (_layout.tsx)
├── Onboarding (first launch only)
├── Authentication
│   └── Login Screen
├── Customer Panel (Tabs)
│   ├── Home
│   ├── Menu
│   ├── Orders
│   └── Profile
├── Delivery Panel
│   ├── Dashboard
│   ├── Assigned Orders
│   └── Profile
└── Admin Panel
    ├── Dashboard
    ├── Order Management
    ├── Menu Management
    └── Analytics
```

### State Management
- **Redux Toolkit**: Centralized state management
- **AsyncStorage**: Persistent data storage
- **Role-based routing**: Automatic navigation based on user role

### Key Components
- `OnboardingCarousel`: First-time user experience
- `Login`: Authentication with demo credentials
- `RoleBasedNavigation`: Automatic routing logic
- `PersistentState`: AsyncStorage integration

## 🛠️ Technologies Used

- **React Native** (0.81.4)
- **Expo** (54.0.12)
- **Expo Router** (6.0.10) - File-based navigation
- **Redux Toolkit** - State management
- **React Redux** - React bindings for Redux  
- **AsyncStorage** - Local data persistence
- **TypeScript** - Type safety
- **Expo Vector Icons** - Icon library

## 📱 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   - Scan QR code with Expo Go app
   - Or press 'a' for Android, 'i' for iOS

## 🔄 User Journey Testing

### First Time User
1. **Onboarding**: See 3-slide carousel explaining app features
2. **Login**: Use any demo credentials above
3. **Dashboard**: Automatically redirected to role-specific interface

### Returning User
1. **Auto-login**: Stored credentials restore user session
2. **Direct Access**: Skip onboarding, go straight to dashboard

## 🎨 UI/UX Features

### Onboarding Carousel
- 3 beautiful slides with emoji icons
- Swipe navigation with pagination dots
- Skip option available
- Get Started call-to-action

### Login Interface
- Clean, modern design
- Demo account quick-fill buttons
- Role-specific theming
- Loading states and error handling

### Role-Specific Dashboards
- **Customer**: Orange theme, order-focused UI
- **Delivery**: Green theme, task-oriented interface  
- **Admin**: Blue theme, analytics and management tools

## 📂 Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with Redux Provider
│   ├── onboarding.tsx     # First launch experience
│   ├── (auth)/            # Authentication pages
│   ├── (tabs)/            # Customer interface
│   ├── admin/             # Admin dashboard
│   └── delivery/          # Delivery partner interface
├── redux/                 # State management
│   ├── store.ts          # Redux store configuration
│   └── slices/           # Redux slices
├── src/
│   └── components/       # Reusable UI components
└── assets/               # Static assets
```

## 🚀 Production Readiness

The app includes production-ready features:
- **TypeScript**: Full type safety
- **Error Boundaries**: Graceful error handling
- **Performance Optimized**: Efficient Redux state management
- **Scalable Architecture**: Modular component structure
- **Cross-Platform**: Works on iOS and Android

## 🔧 Development Notes

- Uses `--legacy-peer-deps` for React Native compatibility
- Supports both file-based and programmatic navigation
- Implements proper loading states and error handling
- Follows React Native best practices and patterns

## 📈 Future Enhancements

- Real backend API integration
- Push notifications
- Real-time order tracking
- Payment gateway integration
- Advanced analytics dashboard
- Multi-language support