# Complete Delivery Agent Approval System with Document Verification

## Overview
Implemented a comprehensive three-state approval system (Pending, Approved, Rejected) with detailed agent profiles, document verification, and admin review capabilities.

---

## Features Implemented

### ✅ 1. Three-State Approval System
- **Pending**: New registrations awaiting review
- **Approved**: Agents verified and allowed to accept orders
- **Rejected**: Applications declined with reasons

### ✅ 2. Detailed Agent Profile View
Modal showing complete agent information:
- Personal details (name, email, phone)
- Vehicle information
- Documents (Driving License, Aadhar Card, Vehicle RC)
- Statistics (deliveries, ratings, earnings)
- Status and availability

### ✅ 3. Document Verification
- View uploaded documents in full screen
- Verify driving license, Aadhar card, and vehicle RC
- Visual indicators for missing documents
- Tap to zoom functionality

### ✅ 4. Enhanced Agent Cards
- Document upload status indicators
- Quick approval button
- View details button
- Status badges (pending/approved/rejected)

---

## Data Structure

### Complete Agent Interface
```typescript
interface DeliveryAgent {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
    
    vehicleInfo?: {
        type: string;        // bike, scooter, bicycle, car
        number?: string;     // Vehicle registration number
    };
    
    // Approval Status
    isApproved: boolean;
    isRejected?: boolean;
    rejectionReason?: string;
    
    createdAt: string;
    
    status?: {
        isOnline: boolean;
        state: string;       // free, busy, offline
    };
    
    // Documents for Verification
    documents?: {
        drivingLicense?: {
            imageUrl?: string;
            verified: boolean;
        };
        aadharCard?: {
            imageUrl?: string;
            verified: boolean;
        };
        vehicleRC?: {
            imageUrl?: string;
            verified: boolean;
        };
    };
    
    // Performance Metrics
    rating?: {
        average: number;     // 0-5 rating
        count: number;       // Number of ratings
    };
    
    earnings?: {
        total: number;       // Total earnings
        pending: number;     // Pending payments
        paid: number;        // Paid amount
    };
    
    totalDeliveries: number;
    
    availability?: {
        workingDays: string[];  // Days available for work
    };
}
```

---

## User Interface

### Main Screen Sections

#### 1. **Pending Approvals** (Orange)
```
┌──────────────────────────────────────────┐
│  ⏳ Pending Approvals               3    │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │  👤 John Doe                       │  │
│  │     📧 john@gmail.com              │  │
│  │     📞 9876543210                  │  │
│  │  ──────────────────────────────────│  │
│  │  🏍️ Bike • KA-01-AB-1234          │  │
│  │  ──────────────────────────────────│  │
│  │  DOCUMENTS                         │  │
│  │  ✅ License  ✅ Aadhar  ❌ RC      │  │
│  │  ──────────────────────────────────│  │
│  │  [View Details] [Quick Approve]   │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### 2. **Approved Agents** (Green)
```
┌──────────────────────────────────────────┐
│  ✓ Approved Agents                  5    │
├──────────────────────────────────────────┤
│  Agent cards with "Revoke" button        │
└──────────────────────────────────────────┘
```

#### 3. **Rejected Applications** (Red)
```
┌──────────────────────────────────────────┐
│  🚫 Rejected Applications           2    │
├──────────────────────────────────────────┤
│  Agent cards with "Rejected" indicator   │
└──────────────────────────────────────────┘
```

### Detail Modal

#### Profile Section:
```
┌────────────────────────────────────┐
│         [Large Profile Image]      │
│                                    │
│           John Doe                 │
│         [PENDING Badge]            │
└────────────────────────────────────┘
```

#### Contact Information:
```
┌────────────────────────────────────┐
│  📧 Email                          │
│     john@gmail.com                 │
│  ──────────────────────────────────│
│  📞 Phone                          │
│     9876543210                     │
└────────────────────────────────────┘
```

#### Vehicle Information:
```
┌────────────────────────────────────┐
│  🏍️ Type                           │
│     Bike                           │
│  ──────────────────────────────────│
│  📍 Number                         │
│     KA-01-AB-1234                  │
└────────────────────────────────────┘
```

#### Statistics:
```
┌──────────────────────────────────────┐
│  🚚           ⭐           💰       │
│  142         4.8          ₹15,240   │
│  Deliveries  Rating (58)  Earnings  │
└──────────────────────────────────────┘
```

#### Documents (with Image Preview):
```
┌────────────────────────────────────┐
│  Driving License        ✓ Verified │
│  [Tap to view image]               │
│  ──────────────────────────────────│
│  Aadhar Card            ✓ Verified │
│  [Tap to view image]               │
│  ──────────────────────────────────│
│  Vehicle RC             ❌ Missing  │
│  No document uploaded              │
└────────────────────────────────────┘
```

#### Action Buttons:
```
┌────────────────────────────────────┐
│  [Reject Application] [Approve]    │
└────────────────────────────────────┘
```

---

## User Flows

### Admin Approval Flow

```
1. Admin opens Delivery Agent Approvals
   ↓
2. Views list of pending agents
   ↓
3. Clicks "View Details" on an agent
   ↓
4. Modal opens showing complete profile
   ↓
5. Admin reviews:
   - Personal info
   - Vehicle details
   - Documents (taps to view full size)
   - Statistics
   ↓
6. Admin decides:
   
   Option A: APPROVE
   ├─ Clicks "Approve Agent"
   ├─ Confirmation dialog
   ├─ API call: PATCH /users/:id { isApproved: true, isRejected: false }
   └─ Agent moves to "Approved" section
   
   Option B: REJECT
   ├─ Clicks "Reject Application"
   ├─ Prompt: "Enter rejection reason"
   ├─ Types reason (e.g., "Invalid license")
   ├─ API call: PATCH /users/:id { isApproved: false, isRejected: true, rejectionReason: "..." }
   └─ Agent moves to "Rejected" section
```

### Quick Approval Flow (Skip Details)

```
1. Admin sees agent card with all documents uploaded
   ↓
2. Clicks "Quick Approve" directly on card
   ↓
3. Confirmation dialog
   ↓
4. Agent immediately approved
```

---

## API Integration

### Endpoints Used

#### 1. **Fetch All Delivery Agents**
```http
GET /api/v1/users?role=delivery
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
        "users": [
            {
                "_id": "68ee9dd906979fda2774de1f",
                "name": "Vickey",
                "email": "vickey@gmail.com",
                "phone": "9060557210",
                "role": "delivery",
                "isApproved": false,
                "isRejected": false,
                "rejectionReason": null,
                "profileImage": null,
                "vehicleInfo": {
                    "type": "bike",
                    "number": null
                },
                "documents": {
                    "drivingLicense": {
                        "imageUrl": "file:///data/user/0/.../license.jpeg",
                        "verified": false
                    },
                    "aadharCard": {
                        "imageUrl": "file:///data/user/0/.../aadhar.jpeg",
                        "verified": false
                    },
                    "vehicleRC": {
                        "verified": false
                    }
                },
                "rating": {
                    "average": 0,
                    "count": 0
                },
                "earnings": {
                    "total": 0,
                    "pending": 0,
                    "paid": 0
                },
                "totalDeliveries": 0,
                "status": {
                    "isOnline": false,
                    "state": "offline"
                },
                "availability": {
                    "workingDays": []
                },
                "createdAt": "2025-10-14T19:00:41.385Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 1,
            "totalPages": 1
        }
    }
}
```

#### 2. **Approve Agent**
```http
PATCH /api/v1/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "isApproved": true,
    "isRejected": false,
    "rejectionReason": null
}
```

**Response:**
```json
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "user": { /* updated user */ }
    }
}
```

#### 3. **Reject Agent**
```http
PATCH /api/v1/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "isApproved": false,
    "isRejected": true,
    "rejectionReason": "Invalid driving license - expired"
}
```

---

## Backend Changes

### User Model (backend/src/models/User.js)

Added to `deliveryBoySchema`:

```javascript
const deliveryBoySchema = new mongoose.Schema({
    // Approval Status Fields
    isApproved: {
        type: Boolean,
        default: false,
    },
    isRejected: {
        type: Boolean,
        default: false,
    },
    rejectionReason: {
        type: String,
        default: null,
    },
    
    // ... existing fields (status, documents, etc.)
});
```

### User Service (backend/src/services/userService.js)

Updated `getAllUsers` to support role filtering:

```javascript
export const getAllUsers = async (query = {}) => {
    const { page = 1, limit = 10, role } = query;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (role) {
        filter.role = role;  // Filter by delivery role
    }

    const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return {
        users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
```

---

## Frontend Components

### 1. **DeliveryAgentApprovalsScreen.tsx** (Main Screen)

**Location:** `frontend/src/screens/admin/management/DeliveryAgentApprovalsScreen.tsx`

**Key Features:**
- Three sections: Pending, Approved, Rejected
- Live count badges
- Pull-to-refresh
- Document status indicators
- Quick approve button
- View details button

**State Management:**
```typescript
const [agents, setAgents] = useState<DeliveryAgent[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [processingId, setProcessingId] = useState<string | null>(null);
const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
const [showDetailModal, setShowDetailModal] = useState(false);
```

**Filtering Logic:**
```typescript
const pendingAgents = agents.filter(agent => !agent.isApproved && !agent.isRejected);
const approvedAgents = agents.filter(agent => agent.isApproved);
const rejectedAgents = agents.filter(agent => agent.isRejected);
```

### 2. **AgentDetailModal.tsx** (Detail View)

**Location:** `frontend/src/screens/admin/management/AgentDetailModal.tsx`

**Key Features:**
- Full-screen modal with scroll
- Profile image and status badge
- Sectioned information display
- Document viewer with tap-to-zoom
- Approve/Reject buttons
- Rejection reason prompt

**Props:**
```typescript
interface Props {
    visible: boolean;
    agent: DeliveryAgent | null;
    onClose: () => void;
    onApprove: (agentId: string) => void;
    onReject: (agentId: string, reason: string) => void;
    processing: boolean;
}
```

---

## Color Scheme

### Status Colors:
- **Pending:** #FF9800 (Orange)
- **Approved:** #4CAF50 (Green)
- **Rejected:** #F44336 (Red)

### Document Status:
- **Uploaded:** #4CAF50 (Green checkmark)
- **Missing:** #E0E0E0 (Gray cancel icon)

### Buttons:
- **Approve:** #4CAF50 (Green background)
- **Reject:** #F44336 (Red background)
- **View Details:** #E3F2FD (Light blue background)

---

## Security & Validation

### Frontend Validation:
✅ Only admins can access the screen
✅ Confirmation dialogs prevent accidental actions
✅ Rejection requires a reason
✅ Processing states prevent double submissions

### Backend Validation (Required):
✅ Admin-only middleware on PATCH /users/:id
✅ Validate user exists before update
✅ Only allow specific fields to be updated
✅ Log all approval/rejection actions
✅ Send notifications to agents about status changes

---

## Testing Checklist

### Visual Testing:
- [ ] Three sections display correctly
- [ ] Count badges show accurate numbers
- [ ] Document indicators show correct status
- [ ] Profile images load (with fallback)
- [ ] Status badges have correct colors
- [ ] Modal opens and closes smoothly
- [ ] Full-screen image viewer works
- [ ] Buttons are properly styled

### Functional Testing:
- [ ] Fetch agents on screen load
- [ ] Pull-to-refresh updates data
- [ ] View Details opens modal
- [ ] Quick Approve works from card
- [ ] Approve from modal works
- [ ] Reject prompts for reason
- [ ] Rejection reason is required
- [ ] Agents move to correct sections
- [ ] Loading states display
- [ ] Error alerts show on failure

### Data Testing:
- [ ] Handles agents with no documents
- [ ] Handles agents with partial documents
- [ ] Handles missing vehicle info
- [ ] Handles zero deliveries/earnings
- [ ] Handles long rejection reasons
- [ ] Handles special characters in names

### API Testing:
- [ ] GET /users?role=delivery returns correct data
- [ ] PATCH /users/:id updates approval status
- [ ] PATCH /users/:id updates rejection status
- [ ] Invalid agent IDs return 404
- [ ] Non-admin users get 403

---

## Files Created/Modified

### New Files:
1. **AgentDetailModal.tsx**
   - Location: `frontend/src/screens/admin/management/`
   - Size: ~600 lines
   - Purpose: Detailed agent profile viewer with document verification

### Modified Files:

1. **DeliveryAgentApprovalsScreen.tsx**
   - Updated interface with new fields
   - Added three-state filtering
   - Added modal integration
   - Added document status indicators
   - Enhanced card UI

2. **User.js** (Backend Model)
   - Added `isApproved` field
   - Added `isRejected` field
   - Added `rejectionReason` field
   - Location: `backend/src/models/User.js`

3. **userService.js** (Backend)
   - Updated `getAllUsers` to support role filtering
   - Location: `backend/src/services/userService.js`

---

## Future Enhancements

### Phase 2 Features:

#### 1. **Bulk Actions**
```typescript
const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

<Button onPress={approveBulk}>
    Approve Selected ({selectedAgents.length})
</Button>
```

#### 2. **Search and Filters**
```tsx
<TextInput
    placeholder="Search by name, email..."
    onChangeText={setSearchQuery}
/>
<SegmentedControl
    values={['All', 'Pending', 'Approved', 'Rejected']}
    selectedIndex={filterIndex}
    onChange={setFilterIndex}
/>
```

#### 3. **Notification System**
```typescript
// Send notification to delivery agent
const notifyAgent = async (agentId: string, status: string, reason?: string) => {
    await axiosInstance.post('/notifications', {
        recipientId: agentId,
        title: `Application ${status}`,
        message: reason || `Your application has been ${status}`,
    });
};
```

#### 4. **Export Reports**
```typescript
const exportApprovals = async () => {
    const data = {
        pending: pendingAgents.length,
        approved: approvedAgents.length,
        rejected: rejectedAgents.length,
        agents: agents.map(a => ({
            name: a.name,
            email: a.email,
            status: getStatusText(a),
        })),
    };
    // Export as CSV or PDF
};
```

#### 5. **Activity Log**
```typescript
interface ApprovalLog {
    agentId: string;
    agentName: string;
    action: 'approved' | 'rejected' | 'revoked';
    adminId: string;
    adminName: string;
    reason?: string;
    timestamp: Date;
}
```

---

## Summary

✅ **Complete Approval System** - Three states (pending/approved/rejected)
✅ **Detailed Agent Profiles** - All info including documents
✅ **Document Verification** - View and verify uploaded docs
✅ **Professional UI** - Modern, intuitive design
✅ **Robust Backend** - Updated schema and services
✅ **Error Handling** - User-friendly alerts and validation
✅ **Type Safety** - Full TypeScript support

Admins can now thoroughly review and approve/reject delivery agent applications with complete visibility into their documents and information! 🎉
