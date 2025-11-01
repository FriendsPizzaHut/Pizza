# User Management - Quick Reference Guide

## 🚀 Quick Start

### Access User Management Screen
```
Admin Login → Dashboard → More Tab → User Management
```

---

## 📱 Features at a Glance

### **Search**
- Type in search box (name, email, or phone)
- Results appear after 500ms delay
- Clear button (X) to reset

### **Filter**
- **All**: Shows all users with total count
- **Customers**: Only customer accounts
- **Delivery Boys**: Only delivery agents
- **Admins**: Only admin accounts

### **User Card Info**
- Avatar
- Name & role badge
- Member since date
- Email & phone
- Stats (if available):
  - Customers: Total Orders, Total Spent
  - Delivery: Total Deliveries
  - Admins: No stats

### **User Details Modal**
- Opens when tapping user card
- Shows detailed information:
  - Profile info
  - Contact details
  - Account info
  - Favorite items (customers only)
  - Order history (customers only)
- Delete user button

### **Pagination**
- Loads 20 users at a time
- Scroll to bottom to load more
- "Loading more..." indicator appears

### **Pull to Refresh**
- Pull down list to refresh data
- Native refresh indicator

---

## 🔧 API Endpoints

### Get All Users
```http
GET /api/users?page=1&limit=20&search=john&role=customer
Authorization: Bearer <admin_token>
```

### Get User Details
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

### Delete User
```http
DELETE /api/users/:userId
Authorization: Bearer <admin_token>
```

---

## 📊 Redux State Structure

```typescript
{
  users: UserListItem[],           // List of users
  selectedUser: UserDetails | null, // Currently selected user
  isLoading: boolean,               // Initial loading
  isRefreshing: boolean,            // Pull-to-refresh loading
  isLoadingDetails: boolean,        // Modal loading
  error: string | null,             // Error message
  searchQuery: string,              // Current search text
  filterRole: 'all' | 'customer' | 'delivery' | 'admin',
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  hasMore: boolean                  // More users available?
}
```

---

## 🎯 Key Functions

### Fetch Users
```typescript
dispatch(fetchUsers({ refresh: true }))
```

### Search Users
```typescript
dispatch(setSearchQuery('john'))
// Automatically triggers fetchUsers after 500ms
```

### Filter Users
```typescript
dispatch(setFilterRole('customer'))
// Automatically triggers fetchUsers
```

### View User Details
```typescript
dispatch(fetchUserDetails(userId))
```

### Delete User
```typescript
dispatch(deleteUserById(userId))
```

### Load More
```typescript
dispatch(incrementPage())
dispatch(loadMoreUsers())
```

---

## 🐛 Troubleshooting

### Search not working?
- Wait 500ms after typing
- Check network connection
- Verify backend is running

### Users not loading?
- Check Redux state for errors
- Verify API endpoint is correct
- Check authentication token

### Modal not opening?
- Check if `fetchUserDetails` is called
- Verify user ID is valid
- Check for console errors

### Delete not working?
- Admin authentication required
- Check backend delete endpoint
- Verify user exists

---

## 💡 Tips & Tricks

### Performance
- Use search instead of scrolling through all users
- Filter by role to reduce results
- Clear search when done to reset

### Best Practices
- Always confirm before deleting
- Use pull-to-refresh for latest data
- Check error banners for issues

### Data Visibility
- Customers: Show orders and spending
- Delivery: Show delivery count
- Admins: Basic info only
- If data not available, section won't show

---

## 📝 Common Scenarios

### Scenario 1: Find a specific customer
```
1. Go to User Management
2. Type customer name in search
3. Wait 500ms
4. Tap customer card
5. View details in modal
```

### Scenario 2: View all delivery boys
```
1. Go to User Management
2. Tap "Delivery Boys" filter chip
3. Scroll through list
4. Tap any delivery boy to view details
```

### Scenario 3: Delete inactive user
```
1. Search for user
2. Tap user card
3. Tap "Delete User" button
4. Confirm deletion
5. User removed from list
```

### Scenario 4: Refresh user list
```
1. Pull down the list
2. Wait for refresh indicator
3. List reloads with latest data
```

---

## 🔍 Data Fields Reference

### UserListItem (List View)
```typescript
{
  _id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'delivery' | 'admin'
  profileImage: string
  createdAt: string
  isActive: boolean
  isApproved?: boolean
  isRejected?: boolean
  
  // Customer specific
  totalOrders?: number
  totalSpent?: number
  lastOrderDate?: string
  
  // Delivery specific
  totalDeliveries?: number
  vehicleInfo?: { type, number }
  status?: { isOnline, lastOnline }
}
```

### UserDetails (Modal View)
```typescript
{
  ...UserListItem,
  
  // Additional fields
  addresses?: Address[]
  favoriteItems?: string[]
  orderHistory?: Order[]
  activeDeliveries?: number
}
```

---

## ⚡ Optimization Tips

### For Developers

**Backend:**
- Add indexes on: name, email, phone, role
- Use .lean() for better performance
- Limit query results to 20
- Use selective field projection

**Frontend:**
- Use debounced search (500ms)
- Implement useMemo for expensive operations
- Use useCallback for event handlers
- FlatList for better scroll performance
- Lazy load details on demand

**Network:**
- Reduce payload size
- Cache frequently accessed data
- Batch requests when possible
- Use pagination

---

## 📚 Related Documentation

- Main Implementation Guide: `USER_MANAGEMENT_IMPLEMENTATION.md`
- Backend API Reference: `backend/API_REFERENCE.md`
- Redux Slice: `frontend/redux/slices/userManagementSlice.ts`
- Redux Thunks: `frontend/redux/thunks/userManagementThunks.ts`
- Component: `frontend/src/screens/admin/users/UserManagementScreen.tsx`

---

**Last Updated**: October 26, 2025
