# Codebase Cleanup Plan

## 🎯 Objective
Remove all debugging console.logs and unnecessary temporary files added during development, while keeping essential production logging.

---

## 📊 Codebase Structure Analysis

### Backend Structure
```
backend/
├── src/
│   ├── controllers/      # API request handlers
│   ├── services/         # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation, error handling
│   └── utils/            # Helper functions
└── logs/                 # Log files
```

### Frontend Structure
```
frontend/
├── src/
│   ├── screens/          # UI screens (Admin, Customer, Delivery)
│   ├── components/       # Reusable UI components
│   ├── services/         # API calls
│   ├── utils/            # Helper functions
│   └── api/              # API client setup
└── redux/
    ├── slices/           # Redux state slices
    └── thunks/           # Async actions
```

---

## 📋 Proposed Cleanup Parts

### **PART 1: Backend Controllers** (User-facing API layer)
**Files to scan: 17 files**
1. activityController.js
2. addressController.js
3. authController.js
4. cartController.js
5. dashboardController.js
6. deliveryAgentController.js
7. deviceTokenController.js
8. notificationController.js
9. offerController.js
10. orderController.js
11. paymentController.js
12. productController.js
13. razorpayController.js
14. recommendationController.js
15. restaurantSettingsController.js
16. uploadController.js
17. userController.js ✅ (Partially cleaned)

**What to remove:**
- ✅ Debug console.logs (e.g., "🖼️ [UPDATE PROFILE IMAGE] Request received")
- ✅ Request/response logging
- ✅ Step-by-step execution logs

**What to keep:**
- ⚠️ Error logs (console.error in catch blocks) - KEEP for production debugging
- ⚠️ Critical operation logs - KEEP if essential

---

### **PART 2: Backend Services** (Business logic layer)
**Files to scan: 16+ files**
1. activityService.js
2. analyticsService.js
3. authService.js
4. cacheService.js
5. cartService.js
6. dashboardService.js
7. notificationService.js
8. offerService.js
9. orderService.js
10. paymentService.js
11. postOrderService.js
12. productService.js
13. razorpayService.js
14. restaurantSettingsService.js
15. userPreferenceService.js
16. userService.js ✅ (Partially cleaned)
17. + notifications/ subfolder files

**What to remove:**
- ✅ Debug console.logs
- ✅ Data transformation logs
- ✅ Step-by-step execution logs

**What to keep:**
- ⚠️ Error logs
- ⚠️ Critical business logic logs

---

### **PART 3: Backend Models & Routes** (Database & routing layer)
**Files to scan:**
- `backend/src/models/*.js` (User, Order, Product, etc.)
- `backend/src/routes/*.js` (userRoutes, authRoutes, etc.)
- `backend/src/middleware/*.js`

**What to remove:**
- ✅ Debug console.logs in middleware
- ✅ Route registration logs

**What to keep:**
- ⚠️ Schema validation logs (if any)
- ⚠️ Middleware error logs

---

### **PART 4: Frontend Services & API Layer**
**Files to scan:**
- `frontend/src/services/userService.ts` ✅ (Already cleaned)
- `frontend/src/services/authService.ts`
- `frontend/src/services/orderService.ts`
- `frontend/src/services/productService.ts`
- `frontend/src/api/apiClient.ts`
- Any other service files

**What to remove:**
- ✅ API request/response logs
- ✅ Data transformation logs
- ✅ Step-by-step execution logs

**What to keep:**
- ⚠️ Error logs (might be useful for user debugging)

---

### **PART 5: Frontend Redux (State management)**
**Files to scan:**
- `frontend/redux/slices/authSlice.ts`
- `frontend/redux/slices/orderSlice.ts`
- `frontend/redux/slices/cartSlice.ts`
- `frontend/redux/thunks/authThunks.ts`
- `frontend/redux/thunks/orderThunks.ts`
- Any other Redux files

**What to remove:**
- ✅ State change logs
- ✅ Action dispatch logs
- ✅ Thunk execution logs

**What to keep:**
- ⚠️ Redux DevTools will handle state debugging

---

### **PART 6: Frontend Screens - Admin Panel**
**Files to scan:**
- `frontend/src/screens/admin/main/ProfileScreen.tsx` ⚠️ (Has many debug logs)
- `frontend/src/screens/admin/main/DashboardScreen.tsx`
- `frontend/src/screens/admin/settings/AccountSettingsScreen.tsx` ⚠️ (Has debug logs)
- `frontend/src/screens/admin/orders/*`
- `frontend/src/screens/admin/products/*`
- `frontend/src/screens/admin/delivery/*`
- Any other admin screens

**What to remove:**
- ✅ Avatar upload debug logs ("=== AVATAR UPLOAD STARTED ===")
- ✅ Step-by-step execution logs
- ✅ useEffect debug logs
- ✅ State logging

**What to keep:**
- ⚠️ User-facing error handling (Alert.alert)

---

### **PART 7: Frontend Screens - Customer Panel**
**Files to scan:**
- `frontend/src/screens/customer/main/ProfileScreen.tsx`
- `frontend/src/screens/customer/main/HomeScreen.tsx`
- `frontend/src/screens/customer/profile/AccountSettingsScreen.tsx` ⚠️ (Has debug logs)
- `frontend/src/screens/customer/cart/*`
- `frontend/src/screens/customer/orders/*`
- Any other customer screens

**What to remove:**
- ✅ Avatar upload debug logs
- ✅ Step-by-step execution logs
- ✅ useEffect debug logs

---

### **PART 8: Frontend Screens - Delivery Panel**
**Files to scan:**
- `frontend/src/screens/delivery/main/ProfileScreen.tsx`
- `frontend/src/screens/delivery/main/DashboardScreen.tsx`
- `frontend/src/screens/delivery/orders/*`
- Any other delivery screens

**What to remove:**
- ✅ Debug console.logs
- ✅ Step-by-step execution logs

---

### **PART 9: Frontend Components & Utils**
**Files to scan:**
- `frontend/src/components/**/*.tsx`
- `frontend/src/utils/imageUpload.ts`
- `frontend/src/utils/avatarUtils.ts`
- `frontend/src/utils/*.ts`

**What to remove:**
- ✅ Debug console.logs
- ✅ Utility function logs

**What to keep:**
- ⚠️ Image upload progress logs (user-facing)

---

### **PART 10: Documentation & Temporary Files**
**Files to review & potentially delete:**
- `AVATAR_PERSISTENCE_FIX.md` - Keep or archive?
- `AVATAR_DEBUG_GUIDE.md` - Keep or archive?
- `AVATAR_BACKEND_INTEGRATION_COMPLETE.md` - Keep or archive?
- `CLEANUP_PLAN.md` (this file) - Delete after cleanup?
- `backend/test-*.sh` - Keep for development or delete?
- `backend/test-socket-client.js` - Keep for testing or delete?
- Any `PROMPT_*_COMPLETE.md` files - Archive or delete?

---

## 🎨 Summary of Parts

| Part | Area | Files Count (Est.) | Priority |
|------|------|-------------------|----------|
| 1 | Backend Controllers | ~5-10 files | 🔴 High |
| 2 | Backend Services | ~5-10 files | 🔴 High |
| 3 | Backend Models & Routes | ~10-15 files | 🟡 Medium |
| 4 | Frontend Services | ~5-8 files | 🔴 High |
| 5 | Frontend Redux | ~10-15 files | 🟡 Medium |
| 6 | Frontend Admin Screens | ~15-20 files | 🔴 High |
| 7 | Frontend Customer Screens | ~15-20 files | 🔴 High |
| 8 | Frontend Delivery Screens | ~10-15 files | 🟡 Medium |
| 9 | Frontend Components & Utils | ~20-30 files | 🟢 Low |
| 10 | Documentation & Temp Files | ~10-15 files | 🟢 Low |

---

## 🤔 Questions for Discussion

### 1. **Logging Strategy**
- Should we keep ANY console.logs in production?
- Should error logs (console.error) be kept?
- Should we use a logger library instead? (e.g., winston for backend, react-native-logs for frontend)

### 2. **Documentation Files**
- Keep avatar-related documentation? (AVATAR_*.md)
- Keep PROMPT_*_COMPLETE.md files for reference?
- Archive or delete?

### 3. **Test Files**
- Keep backend test scripts? (test-*.sh, test-socket-client.js)
- Are they needed for development/testing?

### 4. **Cleanup Order**
- Do you want to go in this order (1→10)?
- Or prioritize high-impact areas first?
- Or go backend-first (1,2,3) then frontend (4,5,6,7,8,9)?

---

## ✅ Cleanup Rules

### What to ALWAYS Remove:
1. Debug logs with decorators (🖼️, ✅, 📤, etc.)
2. "=== SECTION ===" style logs
3. Step-by-step execution logs
4. State/data logging for debugging
5. useEffect debug logs
6. Request/response body logging

### What to KEEP:
1. User-facing alerts (Alert.alert)
2. Error boundaries
3. Production error tracking
4. Critical operation logs (if genuinely needed)

### What to DECIDE:
1. Error logs (console.error) - Keep or remove?
2. Warning logs (console.warn) - Keep or remove?
3. Test/development files - Keep or archive?

---

## 🚀 Next Steps

1. **Review this plan** - Are the parts organized correctly?
2. **Answer questions** - Decide on logging strategy, docs, test files
3. **Approve order** - Confirm which order to proceed
4. **Start Part 1** - I'll scan all files in Part 1, list them, and we'll clean together

---

**Ready to discuss! Which part should we start with?**
