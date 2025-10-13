# Delivery Addresses Screen - Dynamic Implementation ✅

## Summary
Converted DeliveryAddressesScreen from static to dynamic with full CRUD (Create, Read, Update, Delete) functionality for managing user delivery addresses.

---

## Backend API (Already Exists)

The backend already has complete address management APIs:

### Endpoints:
1. **Get User Addresses**: `GET /api/v1/users/:id`
   - Returns user profile including address array

2. **Add Address**: `POST /api/v1/users/:id/address`
   - Body: `{ label, street, city, state, pincode, landmark, isDefault }`
   - Auto-sets first address as default

3. **Update Address**: `PUT /api/v1/users/:id/address/:addressId`
   - Body: `{ label, street, city, state, pincode, landmark, isDefault }`

4. **Delete Address**: `DELETE /api/v1/users/:id/address/:addressId`
   - Cannot delete if only one address exists
   - If default is deleted, first remaining becomes default

5. **Set Default**: `PATCH /api/v1/users/:id/address/:addressId/default`
   - Unsets all other defaults automatically

### Address Schema (from User model):
```javascript
address: [
    {
        label: String (default: 'Home'),
        street: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String,
        isDefault: Boolean (default: false),
    }
]
```

---

## Frontend Implementation

### 1. User Service (`/frontend/src/services/userService.ts`)

**NEW FILE** - Complete service for address management

**Type Definitions:**
```typescript
export interface Address {
    _id: string;
    label: string;              // 'Home', 'Work', 'Other'
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

export interface AddAddressParams {
    label?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault?: boolean;
}

export interface UpdateAddressParams {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    isDefault?: boolean;
}
```

**API Functions:**
- `getUserAddresses(userId)` - Fetches all addresses
- `addAddress(userId, addressData)` - Creates new address
- `updateAddress(userId, addressId, addressData)` - Updates existing address
- `deleteAddress(userId, addressId)` - Deletes address
- `setDefaultAddress(userId, addressId)` - Sets address as default

---

### 2. Add Address Modal (`/frontend/src/components/modals/AddAddressModal.tsx`)

**NEW FILE** - Modal for adding/editing addresses

**Features:**
- ✅ **Add or Edit Mode** - Reusable for both operations
- ✅ **Label Selection** - Quick select: Home, Work, Other
- ✅ **Form Fields**:
  - Street Address (multiline, required)
  - Landmark (optional)
  - City (required)
  - State (required)
  - Pincode (6 digits, required)
- ✅ **Set as Default** - Checkbox option
- ✅ **Validation**:
  - Required field validation
  - Pincode format validation (6 digits)
  - Real-time error display
- ✅ **Loading State** - Shows spinner while saving
- ✅ **Pre-fill** - Automatically fills form when editing

**Props:**
```typescript
interface AddAddressModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (addressData: any) => Promise<void>;
    editingAddress?: Address | null;  // Null for add, Address for edit
}
```

**UI Components:**
- Label selector buttons with icons
- Text inputs with error states
- Checkbox for default address
- Save button with loading indicator
- Bottom sheet style modal

---

### 3. Delivery Addresses Screen (`/frontend/src/screens/customer/profile/DeliveryAddressesScreen.tsx`)

**UPDATED** - Converted from static to dynamic

**State Management:**
```typescript
const [addresses, setAddresses] = useState<Address[]>([]);
const [loading, setLoading] = useState(true);
const [modalVisible, setModalVisible] = useState(false);
const [editingAddress, setEditingAddress] = useState<Address | null>(null);
```

**Key Functions:**

1. **fetchAddresses()**:
   - Fetches all addresses from API
   - Called on component mount
   - Shows loading state

2. **handleAddAddress(addressData)**:
   - Creates new address
   - Refreshes address list
   - Closes modal on success

3. **handleUpdateAddress(addressData)**:
   - Updates existing address
   - Refreshes address list
   - Closes modal and clears editing state

4. **handleDeleteAddress(address)**:
   - Shows confirmation alert
   - Cannot delete default/only address
   - Refreshes list after deletion

5. **handleSetDefault(address)**:
   - Tapping address card sets it as default
   - Already default addresses don't trigger action
   - Updates list after setting

6. **openAddModal()** / **openEditModal(address)**:
   - Opens modal in add or edit mode
   - Pre-fills data for editing

**UI States:**

1. **Loading State**:
```tsx
<View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#cb202d" />
    <Text style={styles.loadingText}>Loading addresses...</Text>
</View>
```

2. **Empty State**:
```tsx
<View style={styles.emptyState}>
    <MaterialIcons name="location-off" size={64} color="#E0E0E0" />
    <Text style={styles.emptyTitle}>No Addresses Saved</Text>
    <Text style={styles.emptyText}>
        Add your delivery address to get started with orders
    </Text>
</View>
```

3. **Address Cards**:
- **Icon**: Home/Work/Location based on label
- **Label**: With DEFAULT badge if applicable
- **Address Lines**:
  - Street + landmark
  - City, State - Pincode
- **Actions**:
  - Edit button (always visible)
  - Delete button (hidden for default addresses)
- **Tap to Set Default**: Tapping card sets as default

**Features:**
- ✅ **Add New Address** - Button at top
- ✅ **Edit Address** - Edit icon on each card
- ✅ **Delete Address** - Delete icon (except default)
- ✅ **Set Default** - Tap card to set as default
- ✅ **Loading State** - Spinner during fetch
- ✅ **Empty State** - When no addresses exist
- ✅ **Error Handling** - Alerts for errors
- ✅ **Confirmation** - Alert before deleting

---

## User Flow

### Adding Address:
1. User taps "Add New Address" button
2. Modal opens with empty form
3. User selects label (Home/Work/Other)
4. User fills street, landmark, city, state, pincode
5. Optionally checks "Set as default"
6. Taps "Save Address"
7. Address is added to backend
8. List refreshes automatically
9. Modal closes

### Editing Address:
1. User taps edit icon on address card
2. Modal opens with pre-filled data
3. User modifies any fields
4. Taps "Update Address"
5. Address is updated in backend
6. List refreshes automatically
7. Modal closes

### Deleting Address:
1. User taps delete icon (not available on default)
2. Confirmation alert appears
3. User confirms deletion
4. Address is removed from backend
5. If it was default, first address becomes default
6. List refreshes automatically

### Setting Default:
1. User taps on any non-default address card
2. Address is set as default in backend
3. Previous default is unmarked
4. List refreshes automatically
5. DEFAULT badge moves to new address

---

## Data Flow

### Initial Load:
```
Component Mount
    ↓
fetchAddresses()
    ↓
GET /api/v1/users/:userId
    ↓
Extract address array
    ↓
setAddresses(data)
    ↓
Display addresses
```

### Add Address:
```
User fills form
    ↓
handleAddAddress(data)
    ↓
POST /api/v1/users/:userId/address
    ↓
fetchAddresses() (refresh)
    ↓
Modal closes
```

### Update Address:
```
User edits form
    ↓
handleUpdateAddress(data)
    ↓
PUT /api/v1/users/:userId/address/:addressId
    ↓
fetchAddresses() (refresh)
    ↓
Modal closes
```

### Delete Address:
```
User confirms deletion
    ↓
handleDeleteAddress(address)
    ↓
DELETE /api/v1/users/:userId/address/:addressId
    ↓
fetchAddresses() (refresh)
```

### Set Default:
```
User taps address card
    ↓
handleSetDefault(address)
    ↓
PATCH /api/v1/users/:userId/address/:addressId/default
    ↓
fetchAddresses() (refresh)
```

---

## Example Data

### Backend Response (User with addresses):
```json
{
  "success": true,
  "data": {
    "_id": "68ea6c37837ce9fc3d5e2d7b",
    "name": "John Doe",
    "email": "john@example.com",
    "address": [
      {
        "_id": "68ebfd2920b87e8fa599c921",
        "label": "Home",
        "street": "Fragrance apartment, Block A",
        "city": "Jalandhar",
        "state": "Punjab",
        "pincode": "400001",
        "landmark": "Near City Mall",
        "isDefault": true
      },
      {
        "_id": "68ebfd2920b87e8fa599c922",
        "label": "Work",
        "street": "Tech Park, Building 5",
        "city": "Jalandhar",
        "state": "Punjab",
        "pincode": "400002",
        "isDefault": false
      }
    ]
  }
}
```

### Display Format:
```
┌─────────────────────────────────────────┐
│  🏠  Home  [DEFAULT]                    │
│     Fragrance apartment, Block A,       │
│     Near City Mall                      │
│     Jalandhar, Punjab - 400001          │
│                               [Edit] ✏️  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🏢  Work                                │
│     Tech Park, Building 5               │
│     Jalandhar, Punjab - 400002          │
│                      [Edit] ✏️ [Del] 🗑️ │
└─────────────────────────────────────────┘
```

---

## Validation Rules

### Add/Edit Form:
- **Street**: Required, min 3 characters
- **City**: Required, min 2 characters
- **State**: Required, min 2 characters
- **Pincode**: Required, exactly 6 digits
- **Landmark**: Optional
- **Label**: Auto-set to 'Home' if not selected
- **isDefault**: Optional, auto-true for first address

### Business Rules:
- ✅ First address automatically becomes default
- ✅ Cannot delete the only remaining address
- ✅ Cannot delete default address (must set another as default first)
- ✅ Setting address as default unsets all others
- ✅ User can only manage their own addresses

---

## Error Handling

### Frontend Errors:
- **No User ID**: Silently returns (shouldn't happen if authenticated)
- **API Errors**: Shows Alert with error message
- **Validation Errors**: Shows inline error messages
- **Network Errors**: Shows "Failed to load addresses" alert

### Backend Errors:
- **403**: User trying to manage someone else's addresses
- **404**: User or address not found
- **400**: Validation errors (missing required fields)

---

## Files Created/Modified

### Created:
1. `/frontend/src/services/userService.ts` - Address API service
2. `/frontend/src/components/modals/AddAddressModal.tsx` - Add/Edit modal

### Modified:
1. `/frontend/src/screens/customer/profile/DeliveryAddressesScreen.tsx`
   - Added imports (useState, useEffect, useCallback, Alert, ActivityIndicator)
   - Added Redux integration for userId
   - Added state management
   - Added CRUD functions
   - Updated JSX with dynamic data
   - Added loading and empty states
   - Added modal integration
   - Added new styles

---

## Testing Checklist

### Add Address:
- [ ] Tap "Add New Address" button
- [ ] Modal opens with empty form
- [ ] Select label (Home/Work/Other)
- [ ] Fill all required fields
- [ ] Test validation (empty fields, invalid pincode)
- [ ] Check "Set as default" checkbox
- [ ] Save address
- [ ] Verify address appears in list
- [ ] Verify DEFAULT badge shows if checked

### Edit Address:
- [ ] Tap edit icon on address
- [ ] Modal opens with pre-filled data
- [ ] Modify fields
- [ ] Save changes
- [ ] Verify updated data shows in list

### Delete Address:
- [ ] Try to delete default address (should not show delete button)
- [ ] Tap delete on non-default address
- [ ] Confirm deletion in alert
- [ ] Verify address removed from list

### Set Default:
- [ ] Tap on non-default address card
- [ ] Verify DEFAULT badge moves to tapped address
- [ ] Verify previous default loses badge

### Loading States:
- [ ] Initial load shows spinner
- [ ] Empty state shows when no addresses
- [ ] Save button shows loading indicator

### Error Handling:
- [ ] Test with no network (should show error alert)
- [ ] Test validation errors (inline messages)
- [ ] Test API errors (alert messages)

---

## Integration Points

### Redux:
- Uses `useSelector` to get `userId` from auth state
- Path: `state.auth.userId`

### Navigation:
- Uses `useNavigation` for back button
- Currently standalone, can integrate with checkout flow

### API Client:
- Uses `apiClient` from `/frontend/src/api/apiClient`
- Automatically includes auth headers

---

## Future Enhancements

1. **Location Picker**: Add map integration for selecting address
2. **Address Type Icons**: More icon options
3. **Address Validation**: Verify pincode/city combinations
4. **Recent Addresses**: Quick select from recent orders
5. **Copy Address**: Duplicate existing address to modify
6. **Address Search**: Search in saved addresses list
7. **Favorite Addresses**: Star frequently used addresses

---

**Status**: ✅ Complete and Ready for Testing

**Date**: January 2025
