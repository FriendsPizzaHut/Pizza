# Delivery Agent Approval System

## Overview
Added a complete approval system for delivery agents, allowing admins to approve or disapprove delivery agents before they can accept orders.

---

## Features Implemented

### ✅ New Menu Option in Profile Screen
- Added "Delivery Agent Approvals" option in Profile Management section
- Purple themed icon with delivery-dining icon
- Shows between "User Management" and "Manage Offers"

### ✅ Delivery Agent Approvals Screen
A complete screen for managing delivery agent approvals with:

#### 1. **Smart Header**
- Back button to return to profile
- Centered title: "Delivery Agent Approvals"
- Live counts: "X pending • Y approved"

#### 2. **Two Sections**
**Pending Approvals:**
- Shows agents awaiting approval
- Orange "pending" icon
- Count badge with number of pending agents
- Prominent approve button

**Approved Agents:**
- Shows already approved agents
- Green "verified" icon
- Count badge with number of approved agents
- Disapprove button to revoke access

#### 3. **Agent Cards**
Each card displays:
- **Profile Image** - Auto-generated with agent name if no image
- **Name** - With verified badge for approved agents
- **Email** - For identification
- **Phone Number** - Contact info
- **Vehicle Info** - Type and number (if available)
- **Action Button** - Approve or Disapprove

#### 4. **Smart Features**
- ✅ Pull-to-refresh functionality
- ✅ Loading states with spinner
- ✅ Empty states when no agents
- ✅ Confirmation dialogs before approval/disapproval
- ✅ Processing indicators on buttons
- ✅ Auto-refresh after status change
- ✅ Error handling with user-friendly alerts

---

## User Flow

### Admin Journey:

1. **Navigate to Approvals**
   ```
   Profile → Delivery Agent Approvals
   ```

2. **View Pending Agents**
   - See list of agents awaiting approval
   - Review their details (name, email, phone, vehicle)

3. **Approve an Agent**
   ```
   Tap "Approve" → Confirmation Dialog → API Call → Success Message → Refresh
   ```
   - Agent moves from "Pending" to "Approved" section
   - Agent can now accept orders

4. **Disapprove an Agent** (if needed)
   ```
   Tap "Disapprove" → Warning Dialog → API Call → Success Message → Refresh
   ```
   - Agent moves from "Approved" to "Pending" section
   - Agent cannot accept orders anymore

---

## Technical Implementation

### Frontend Changes

#### 1. **ProfileScreen.tsx**
Added new option in `profileOptions` array:

```typescript
{
    title: 'Delivery Agent Approvals',
    icon: 'delivery-dining',
    iconType: 'MaterialIcons' as const,
    color: '#9C27B0',              // Purple theme
    bgColor: '#F3E5F5',            // Light purple background
    action: () => navigation.navigate('DeliveryAgentApprovals'),
}
```

**Position:** Between "User Management" and "Manage Offers"

#### 2. **DeliveryAgentApprovalsScreen.tsx** (New File)
Location: `frontend/src/screens/admin/management/DeliveryAgentApprovalsScreen.tsx`

**Key Components:**

**State Management:**
```typescript
const [agents, setAgents] = useState<DeliveryAgent[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [processingId, setProcessingId] = useState<string | null>(null);
```

**Data Fetching:**
```typescript
const fetchDeliveryAgents = async () => {
    const response = await axiosInstance.get('/users?role=delivery');
    if (response.data.success) {
        const allAgents = response.data.data.users || response.data.data;
        setAgents(allAgents);
    }
};
```

**Approval/Disapproval:**
```typescript
const updateApprovalStatus = async (agentId: string, isApproved: boolean) => {
    await axiosInstance.patch(`/users/${agentId}`, {
        isApproved: isApproved,
    });
    fetchDeliveryAgents(); // Refresh list
};
```

**Smart Filtering:**
```typescript
const pendingAgents = agents.filter(agent => !agent.isApproved);
const approvedAgents = agents.filter(agent => agent.isApproved);
```

#### 3. **AdminNavigator.tsx**
Added import and route:

```typescript
// Import
import DeliveryAgentApprovalsScreen from '../screens/admin/management/DeliveryAgentApprovalsScreen';

// Route
<Stack.Screen name="DeliveryAgentApprovals" component={DeliveryAgentApprovalsScreen} />
```

#### 4. **navigation.ts**
Added type definition:

```typescript
export type AdminStackParamList = {
    // ... other routes
    DeliveryAgentApprovals: undefined;
    // ... other routes
};
```

---

## API Integration

### Endpoints Used

#### 1. **Fetch All Delivery Agents**
```http
GET /api/v1/users?role=delivery
```

**Response:**
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "_id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "email": "john.delivery@pizza.com",
                "phone": "+91 9876543210",
                "role": "delivery",
                "isApproved": false,
                "profileImage": "https://...",
                "vehicleInfo": {
                    "type": "bike",
                    "number": "KA-01-AB-1234"
                },
                "createdAt": "2025-10-15T10:30:00Z"
            }
        ]
    }
}
```

#### 2. **Update Approval Status**
```http
PATCH /api/v1/users/:userId
```

**Request Body:**
```json
{
    "isApproved": true  // or false
}
```

**Response:**
```json
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "user": { /* updated user object */ }
    }
}
```

---

## User Interface

### Visual Design

#### Header Section:
```
┌──────────────────────────────────────┐
│  ←  Delivery Agent Approvals      │
│     2 pending • 5 approved           │
└──────────────────────────────────────┘
```

#### Pending Section:
```
┌──────────────────────────────────────┐
│  ⏳ Pending Approvals             2  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │  👤  John Doe                  │  │
│  │      📧 john@pizza.com         │  │
│  │      📞 +91 9876543210         │  │
│  │  ─────────────────────────────│  │
│  │  🏍️ Bike • KA-01-AB-1234      │  │
│  │  ─────────────────────────────│  │
│  │  [    ✓ Approve Agent    ]    │  │ ← Green button
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

#### Approved Section:
```
┌──────────────────────────────────────┐
│  ✓ Approved Agents                5  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │  👤  Jane Smith            ✓   │  │ ← Verified badge
│  │      📧 jane@pizza.com         │  │
│  │      📞 +91 9876543211         │  │
│  │  ─────────────────────────────│  │
│  │  🏍️ Scooter • KA-02-CD-5678   │  │
│  │  ─────────────────────────────│  │
│  │  [    ✗ Disapprove Agent  ]   │  │ ← Red button
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

#### Empty State:
```
┌──────────────────────────────────────┐
│                                      │
│              👥                      │
│         (large icon)                 │
│                                      │
│      No Delivery Agents              │
│                                      │
│  No delivery agents have             │
│  registered yet.                     │
│                                      │
└──────────────────────────────────────┘
```

---

## Color Scheme

### Section Colors:
- **Pending:** Orange theme (#FF9800)
- **Approved:** Green theme (#4CAF50)
- **Menu Icon:** Purple theme (#9C27B0)

### Button Colors:
- **Approve Button:** #4CAF50 (Green)
- **Disapprove Button:** #F44336 (Red)

### Status Indicators:
- **Verified Badge:** Green circle with checkmark
- **Count Badges:** Orange/Green with white text

---

## Confirmation Dialogs

### Approve Confirmation:
```
┌────────────────────────────────┐
│  Approve Delivery Agent        │
├────────────────────────────────┤
│  Are you sure you want to      │
│  approve John Doe? They will   │
│  be able to accept delivery    │
│  orders.                       │
├────────────────────────────────┤
│  [  Cancel  ]  [  Approve  ]   │
└────────────────────────────────┘
```

### Disapprove Confirmation:
```
┌────────────────────────────────┐
│  Disapprove Delivery Agent     │
├────────────────────────────────┤
│  Are you sure you want to      │
│  disapprove John Doe? They     │
│  will not be able to accept    │
│  orders.                       │
├────────────────────────────────┤
│  [  Cancel  ]  [  Disapprove  ]│ ← Red destructive
└────────────────────────────────┘
```

---

## Backend Requirements

### Database Schema
The User model should have:

```javascript
const userSchema = new Schema({
    // ... other fields
    role: {
        type: String,
        enum: ['user', 'admin', 'delivery'],
        default: 'user'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    vehicleInfo: {
        type: {
            type: String,
            enum: ['bike', 'scooter', 'bicycle', 'car']
        },
        number: String
    },
    // ... other fields
});
```

### API Endpoint Requirements

#### 1. **GET /api/v1/users**
Query Parameters:
- `role=delivery` - Filter by role

**Business Logic:**
```javascript
// GET /api/v1/users?role=delivery
const getUsers = async (req, res) => {
    const { role } = req.query;
    const query = {};
    
    if (role) {
        query.role = role;
    }
    
    const users = await User.find(query)
        .select('name email phone isApproved vehicleInfo profileImage createdAt status')
        .sort({ createdAt: -1 });
    
    res.json({
        success: true,
        data: { users }
    });
};
```

#### 2. **PATCH /api/v1/users/:id**
Request Body:
- `isApproved: boolean`

**Business Logic:**
```javascript
// PATCH /api/v1/users/:id
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    // Admin authorization check
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Only admins can update approval status'
        });
    }
    
    const user = await User.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
    );
    
    res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
    });
};
```

### Middleware Protection
```javascript
// Only admin can access these endpoints
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id', protect, adminOnly, updateUser);
```

---

## Security Considerations

### Frontend:
✅ Only accessible from admin profile
✅ Confirmation dialogs prevent accidental changes
✅ Processing states prevent double submissions
✅ Error handling for failed API calls

### Backend (Required):
✅ Admin-only routes with middleware
✅ Validate user role before allowing changes
✅ Only allow `isApproved` field update (no privilege escalation)
✅ Log all approval/disapproval actions
✅ Rate limiting on approval endpoints

---

## Testing Checklist

### Visual Testing:
- [ ] Menu option appears in Profile screen
- [ ] Purple icon displays correctly
- [ ] Screen navigation works
- [ ] Header shows correct counts
- [ ] Agent cards render properly
- [ ] Profile images load (or show fallback)
- [ ] Vehicle info displays correctly
- [ ] Buttons have correct colors

### Functional Testing:
- [ ] Fetch agents on screen load
- [ ] Filter pending vs approved correctly
- [ ] Pull-to-refresh works
- [ ] Approve button works
- [ ] Disapprove button works
- [ ] Confirmation dialogs appear
- [ ] Cancel in dialog does nothing
- [ ] Confirm in dialog triggers API
- [ ] Success message appears
- [ ] List refreshes after action
- [ ] Loading states show correctly
- [ ] Empty state displays when no agents

### API Testing:
- [ ] GET /users?role=delivery returns agents
- [ ] PATCH /users/:id updates isApproved
- [ ] Non-admin users are rejected
- [ ] Invalid user IDs return 404
- [ ] Network errors show friendly message

### Edge Cases:
- [ ] No delivery agents registered
- [ ] All agents are approved
- [ ] All agents are pending
- [ ] Agent without vehicle info
- [ ] Agent without profile image
- [ ] Slow network (loading states)
- [ ] API errors (error messages)
- [ ] Rapid button clicking (processing state)

---

## Future Enhancements

### Phase 2 Features:

#### 1. **Detailed Agent Profile View**
```typescript
<TouchableOpacity onPress={() => viewAgentDetails(agent)}>
    // Shows full history, ratings, documents, etc.
</TouchableOpacity>
```

#### 2. **Batch Approval**
```typescript
const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

<Button onPress={approveMultiple}>
    Approve Selected ({selectedAgents.length})
</Button>
```

#### 3. **Document Verification**
```typescript
interface DeliveryAgent {
    // ... existing fields
    documents: {
        drivingLicense: {
            url: string;
            verified: boolean;
        };
        vehicleRC: {
            url: string;
            verified: boolean;
        };
    };
}
```

#### 4. **Approval Reasons**
```typescript
const disapproveWithReason = async (agentId: string, reason: string) => {
    await axiosInstance.patch(`/users/${agentId}`, {
        isApproved: false,
        disapprovalReason: reason
    });
};
```

#### 5. **Search and Filters**
```tsx
<TextInput
    placeholder="Search by name or email..."
    onChangeText={setSearchQuery}
/>

<Picker selectedValue={filter} onValueChange={setFilter}>
    <Picker.Item label="All" value="all" />
    <Picker.Item label="Pending" value="pending" />
    <Picker.Item label="Approved" value="approved" />
</Picker>
```

#### 6. **Approval History**
```typescript
interface ApprovalLog {
    agentId: string;
    action: 'approved' | 'disapproved';
    timestamp: Date;
    adminId: string;
    reason?: string;
}
```

---

## Files Created/Modified

### New Files:
1. **DeliveryAgentApprovalsScreen.tsx**
   - Location: `frontend/src/screens/admin/management/`
   - Size: ~500 lines
   - Purpose: Main approval management screen

### Modified Files:
1. **ProfileScreen.tsx**
   - Added: "Delivery Agent Approvals" menu option
   - Location: Line ~52

2. **AdminNavigator.tsx**
   - Added: Import statement
   - Added: Stack screen route
   - Lines: 28, 123

3. **navigation.ts**
   - Added: `DeliveryAgentApprovals: undefined`
   - Location: AdminStackParamList type

---

## Summary

The Delivery Agent Approval System is now complete with:

✅ **Professional UI** - Modern card-based design with clear sections
✅ **Smart Filtering** - Automatic pending/approved separation
✅ **User-Friendly** - Confirmation dialogs and clear actions
✅ **Robust** - Loading states, error handling, refresh capability
✅ **Accessible** - Easy navigation from Profile screen
✅ **Secure** - Admin-only access with confirmation steps

Admins can now easily manage delivery agent approvals with a clean, intuitive interface! 🎯
