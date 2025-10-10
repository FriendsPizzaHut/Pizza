# Delivery Boy Registration - Testing Guide

## 🐛 Issue Found

When you registered as a delivery boy, the backend **was not saving** the `vehicleInfo` and `documents` fields. 

### What Was Missing in Database:
```json
{
  "vehicleInfo": null,  // ❌ Missing completely
  "documents": {
    "drivingLicense": {
      "verified": false  // ❌ imageUrl missing
    },
    "aadharCard": {
      "verified": false  // ❌ imageUrl missing
    },
    "vehicleRC": {
      "verified": false  // ❌ imageUrl missing
    }
  }
}
```

## ✅ Fixes Applied

### 1. Backend Auth Service (`backend/src/services/authService.js`)
**Problem:** The `registerUser` function wasn't extracting `vehicleInfo` and `documents` from request body.

**Fix:** Updated to extract and conditionally add these fields:
```javascript
export const registerUser = async (userData) => {
    const { name, email, phone, password, role, address, vehicleInfo, documents } = userData;
    
    const userDataToCreate = {
        name, email, phone, password,
        role: role || 'customer',
        address: address || [],
    };

    // Add delivery-specific fields if role is delivery
    if (role === 'delivery') {
        if (vehicleInfo) {
            userDataToCreate.vehicleInfo = vehicleInfo;
        }
        if (documents) {
            userDataToCreate.documents = documents;
        }
    }

    const user = await User.create(userDataToCreate);
    // ...
};
```

### 2. Validator (`backend/src/utils/validators/authValidator.js`)
**Added validation rules for:**
- `vehicleInfo` object and its fields (`type`, `number`, `model`)
- `documents` object and nested fields (`drivingLicense`, `aadharCard`, `vehicleRC`)
- All fields marked as optional

### 3. User Model Public Profile (`backend/src/models/User.js`)
**Updated `getPublicProfile()` method to include:**
```javascript
if (this.role === 'delivery') {
    baseProfile.status = this.status;
    baseProfile.vehicleInfo = this.vehicleInfo;      // ✅ Added
    baseProfile.documents = this.documents;          // ✅ Added
    baseProfile.totalDeliveries = this.totalDeliveries;
    baseProfile.rating = this.rating;
    baseProfile.availability = this.availability;    // ✅ Added
}
```

## 🧪 Testing Steps

### Step 1: Restart Backend
```bash
# In backend terminal
# Press Ctrl+C to stop
npm start
```

### Step 2: Delete Old Test User
Before testing, delete the incomplete delivery boy account from MongoDB:

**Option A: Using MongoDB Compass/Studio**
- Connect to your MongoDB
- Find database → users collection
- Delete document with email: "vickey@gmail.com"

**Option B: Using MongoDB Shell**
```bash
mongosh
use your_database_name
db.users.deleteOne({ email: "vickey@gmail.com" })
```

### Step 3: Register New Delivery Boy

1. **Open the app** and navigate to signup
2. **Click** "Want to become a delivery partner? Register here"
3. **Fill in the form:**
   ```
   Name: Test Delivery Boy
   Email: testdelivery@gmail.com
   Phone: 9876543210
   Password: Password123
   Confirm Password: Password123
   
   Vehicle Type: Bike (select)
   Vehicle Number: MH01AB1234 (optional - can skip)
   Vehicle Model: Honda Activa (optional)
   
   Driving License: [Upload image] ✅ Required
   Aadhar Card: [Upload image] ✅ Required
   Vehicle RC: [Upload image] ⚪ Optional
   ```

4. **Submit** the form

### Step 4: Verify in Database

Check MongoDB for the new user. It should now have:

```json
{
  "_id": "...",
  "name": "Test Delivery Boy",
  "email": "testdelivery@gmail.com",
  "phone": "9876543210",
  "role": "delivery",
  "isActive": false,
  
  "vehicleInfo": {                           // ✅ Should be present
    "type": "bike",
    "number": "MH01AB1234",                  // If you entered it
    "model": "Honda Activa"                  // If you entered it
  },
  
  "documents": {
    "drivingLicense": {
      "imageUrl": "file:///path/to/image",   // ✅ Should have image URL
      "verified": false
    },
    "aadharCard": {
      "imageUrl": "file:///path/to/image",   // ✅ Should have image URL
      "verified": false
    },
    "vehicleRC": {
      "imageUrl": "file:///path/to/image",   // ✅ If you uploaded
      "verified": false
    }
  },
  
  "status": {
    "isOnline": false,
    "state": "offline"
  },
  "totalDeliveries": 0,
  "rating": {
    "average": 0,
    "count": 0
  },
  "earnings": {
    "total": 0,
    "pending": 0,
    "paid": 0
  },
  "assignedOrders": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

## ✅ Expected Results

After the fix, all fields should be saved:

| Field | Previous | Now |
|-------|----------|-----|
| `vehicleInfo` | ❌ null | ✅ { type, number?, model? } |
| `documents.drivingLicense.imageUrl` | ❌ missing | ✅ "file://..." |
| `documents.aadharCard.imageUrl` | ❌ missing | ✅ "file://..." |
| `documents.vehicleRC.imageUrl` | ⚪ missing | ✅ "file://..." (if uploaded) |

## 📱 Frontend Response

After successful registration, the API response will now include:

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Test Delivery Boy",
      "email": "testdelivery@gmail.com",
      "phone": "9876543210",
      "role": "delivery",
      "isActive": false,
      "vehicleInfo": {              // ✅ Now included
        "type": "bike",
        "number": "MH01AB1234",
        "model": "Honda Activa"
      },
      "documents": {                // ✅ Now included
        "drivingLicense": {
          "imageUrl": "file://...",
          "verified": false
        },
        "aadharCard": {
          "imageUrl": "file://...",
          "verified": false
        }
      },
      "status": { ... },
      "rating": { ... },
      "availability": { ... }
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## 🚨 Troubleshooting

### If fields are still missing:

1. **Check backend logs** for any validation errors:
   ```bash
   # Look for errors in terminal running backend
   ```

2. **Check request payload** in frontend console:
   ```typescript
   // In DeliveryBoySignup.tsx, before dispatch
   console.log('Signup Data:', JSON.stringify(signupData, null, 2));
   ```

3. **Verify backend received data**:
   ```javascript
   // In authService.js registerUser function
   console.log('Received userData:', JSON.stringify(userData, null, 2));
   ```

4. **Check validation errors**:
   - Look for 400 Bad Request responses
   - Check if validation middleware is rejecting fields

## 🎯 Key Changes Summary

1. ✅ Backend now accepts `vehicleInfo` and `documents` fields
2. ✅ Validation rules added for delivery boy fields
3. ✅ Public profile includes all delivery boy data
4. ✅ Database will save complete delivery boy information

## 📝 Notes

- Image URLs are stored as local file URIs (e.g., `file:///path/to/image.jpg`)
- In production, you'll need to implement actual file upload to cloud storage
- Admin verification system is not yet implemented (all documents start as `verified: false`)
- Vehicle number is optional - delivery boys can add it later

## ⚠️ Important

**Before testing again:**
1. ✅ Restart backend server
2. ✅ Delete old test user from database
3. ✅ Use fresh email for new test
4. ✅ Upload images (required for DL and Aadhar)

The system is now ready for complete end-to-end testing! 🚀
