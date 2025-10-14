# Delivery Agent Login Logic - Updated

## Overview
Updated the login system to properly handle delivery agent approval status. Delivery agents must be **approved by admin** before they can log in to the app.

---

## Login Flow for Delivery Agents

### 1. **Registration** (`authService.registerUser`)
When a delivery agent registers:
```javascript
// Defaults set during registration
isApproved: false      // Not approved yet
isRejected: false      // Not rejected
rejectionReason: null  // No reason
isActive: false        // Account inactive (needs approval)
```
**Result:** Registration succeeds but no login tokens are generated. User sees message: _"Registration successful! Your account is pending admin approval."_

---

### 2. **Login Attempt** (`authService.loginUser`)

#### Step 1: Find User & Verify Password
```javascript
const user = await User.findOne({ email }).select('+password');
const isPasswordValid = await user.comparePassword(password);
```

#### Step 2: Check Approval Status (Delivery Agents Only)

**Three Possible States:**

##### 🔴 **State 1: REJECTED**
```javascript
if (user.isRejected === true) {
    // Block login, show rejection reason
    throw Error: "Your delivery partner application has been rejected. 
                  Reason: {rejectionReason}"
    HTTP Status: 403
    Error Code: 'ACCOUNT_REJECTED'
}
```

##### 🟡 **State 2: PENDING APPROVAL**
```javascript
if (user.isApproved === false && user.isRejected === false) {
    // Block login, waiting for admin
    throw Error: "Your delivery partner account is pending admin approval. 
                  Please wait for verification."
    HTTP Status: 403
    Error Code: 'APPROVAL_PENDING'
}
```

##### 🟢 **State 3: APPROVED**
```javascript
if (user.isApproved === true) {
    // Check if account is active
    if (!user.isActive) {
        throw Error: "Your account has been deactivated. Please contact admin."
        HTTP Status: 403
        Error Code: 'ACCOUNT_INACTIVE'
    }
    // ✅ Allow login - generate tokens
}
```

---

## Admin Approval Workflow

### Approve Agent
```javascript
// Admin approves from DeliveryAgentApprovalsScreen
PATCH /api/v1/users/{agentId}
{
    isApproved: true,
    isRejected: false,
    rejectionReason: null,
    isActive: true      // ⚠️ Important: Activate account
}

// Agent can now login ✅
```

### Reject Agent
```javascript
// Admin rejects from DeliveryAgentApprovalsScreen
PATCH /api/v1/users/{agentId}
{
    isApproved: false,
    isRejected: true,
    rejectionReason: "Invalid driving license",
    isActive: false     // ⚠️ Important: Deactivate account
}

// Agent login blocked with reason ❌
```

---

## Database Schema (DeliveryBoy Discriminator)

```javascript
deliveryBoySchema = {
    isApproved: {
        type: Boolean,
        default: false  // Must be approved by admin
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: false  // Activated after approval
    }
}
```

---

## Error Codes for Frontend

| Error Code | HTTP Status | Meaning | User Action |
|------------|-------------|---------|-------------|
| `APPROVAL_PENDING` | 403 | Account waiting for admin approval | Wait for admin to approve |
| `ACCOUNT_REJECTED` | 403 | Application rejected by admin | Contact admin or re-register |
| `ACCOUNT_INACTIVE` | 403 | Approved but deactivated | Contact admin |
| `401` | 401 | Invalid credentials | Check email/password |

---

## Frontend Handling

### Login Screen (DeliveryBoyLoginScreen.tsx)
```typescript
try {
    const response = await axiosInstance.post('/auth/login', { email, password });
    // Success - store tokens and navigate
} catch (error) {
    if (error.response?.status === 403) {
        const errorCode = error.response?.data?.code;
        
        switch (errorCode) {
            case 'APPROVAL_PENDING':
                Alert.alert('Pending Approval', 
                    'Your account is waiting for admin approval. You will be notified once approved.');
                break;
                
            case 'ACCOUNT_REJECTED':
                Alert.alert('Application Rejected', 
                    error.response?.data?.message || 'Your application was rejected.');
                break;
                
            case 'ACCOUNT_INACTIVE':
                Alert.alert('Account Inactive', 
                    'Your account has been deactivated. Please contact support.');
                break;
        }
    }
}
```

---

## Debugging Logs

### Backend Console Output
```bash
🔐 [LOGIN] Attempting login for: rishi@gmail.com
👤 [LOGIN] User found: {
    id: 68eead4b0056caa45842d9f7,
    role: 'delivery',
    isActive: false,
    isApproved: false,
    isRejected: false
}
🚴 [LOGIN] Delivery agent - checking approval status
⏳ [LOGIN] Account pending approval
# Login blocked with 403 error
```

---

## Testing Checklist

### Scenario 1: New Registration
- [ ] Delivery agent registers
- [ ] No tokens generated
- [ ] Message shows "Pending approval"
- [ ] Login attempt fails with `APPROVAL_PENDING`

### Scenario 2: Admin Approves
- [ ] Admin opens DeliveryAgentApprovalsScreen
- [ ] Admin views agent details
- [ ] Admin clicks "Approve Agent"
- [ ] `isApproved` changes to `true` in database
- [ ] Agent can now login successfully ✅

### Scenario 3: Admin Rejects
- [ ] Admin clicks "Reject Application"
- [ ] Enters rejection reason
- [ ] `isRejected` changes to `true` in database
- [ ] Agent login fails with rejection message

### Scenario 4: Approved Agent Deactivated
- [ ] Admin manually sets `isActive: false`
- [ ] Agent login fails with `ACCOUNT_INACTIVE`

---

## Files Modified

1. **backend/src/services/authService.js**
   - Updated `registerUser` - Explicitly set approval fields for delivery agents
   - Updated `loginUser` - Added approval status checks
   - Added comprehensive logging

2. **backend/src/services/userService.js**
   - Fixed update logic to use discriminator models
   - Added `DeliveryBoy` model usage for delivery agent updates

3. **backend/src/models/User.js**
   - Already had approval fields in schema (no changes needed)

---

## Important Notes

⚠️ **For Existing Delivery Agents:**
If you have delivery agents registered before this update, you need to:
1. Manually set `isApproved: false` in MongoDB
2. Or run a migration script to add these fields

⚠️ **isActive vs isApproved:**
- `isApproved`: Admin decision to approve delivery agent (permanent approval)
- `isActive`: Account activation status (automatically set during approval/rejection)
- **When approving:** Both `isApproved` and `isActive` are set to `true`
- **When rejecting:** Both `isApproved` and `isActive` are set to `false`
- **Both must be true** for login to succeed

---

## Summary

✅ **Before:** Delivery agents could login immediately after registration  
✅ **After:** Delivery agents must be approved by admin before login  
✅ **Security:** Three-state system (pending/approved/rejected) with reasons  
✅ **UX:** Clear error messages guide users on next steps  

---

**Last Updated:** October 15, 2025  
**Author:** AI Assistant  
**Status:** ✅ Implementation Complete
