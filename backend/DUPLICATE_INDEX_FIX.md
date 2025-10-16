# Duplicate Schema Index Fixes

## Issue
Backend was showing Mongoose warnings about duplicate schema indexes:
- `Warning: Duplicate schema index on {"email":1} found` (User model)
- `Warning: Duplicate schema index on {"status":1} found` (Order model)
- `Warning: Duplicate schema index on {"orderNumber":1} found` (Order model)
- `Warning: Duplicate schema index on {"user":1} found` (Cart model)

## Root Cause
Indexes were being defined twice:
1. **Inline** in the schema definition: `index: true` or `unique: true`
2. **Explicitly** after schema creation: `schema.index({ field: 1 })`

Mongoose's `unique: true` automatically creates an index, so adding `index: true` or an explicit index causes duplication.

## Fixes Applied

### 1. User Model (`src/models/User.js`)
**Before:**
```javascript
email: {
    type: String,
    unique: true, // Creates index
    // ...
},

// Later:
userSchema.index({ email: 1 }); // Duplicate!
```

**After:**
```javascript
email: {
    type: String,
    unique: true, // Creates index automatically
    // ...
},

// Removed duplicate:
// Note: email already has unique index from schema definition
```

### 2. Order Model (`src/models/Order.js`)
**Before:**
```javascript
orderNumber: {
    type: String,
    unique: true, // Creates index
    index: true,  // Duplicate!
},

user: {
    type: mongoose.Schema.Types.ObjectId,
    index: true, // Creates index
},

status: {
    type: String,
    index: true, // Creates index
},

// Later:
orderSchema.index({ orderNumber: 1 }); // Duplicate!
orderSchema.index({ status: 1 }); // Duplicate (but kept this one)
```

**After:**
```javascript
orderNumber: {
    type: String,
    unique: true, // Keeps unique index only
},

user: {
    type: mongoose.Schema.Types.ObjectId,
    // Index via compound index
},

status: {
    type: String,
    // Index created explicitly below
},

// Explicit indexes:
orderSchema.index({ user: 1, createdAt: -1 }); // Compound index
orderSchema.index({ status: 1 }); // Single field index
// orderNumber: removed duplicate
```

### 3. Cart Model (`src/models/Cart.js`)
**Before:**
```javascript
user: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true, // Creates index
    index: true,  // Duplicate!
},

// Later:
cartSchema.index({ user: 1 }); // Duplicate!
```

**After:**
```javascript
user: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true, // Keeps unique index only
},

// Removed duplicate:
// Note: user already has unique index from schema definition
```

## Best Practices

### ✅ DO:
- Use `unique: true` for unique constraints (automatically creates index)
- Use explicit `schema.index()` for compound indexes
- Use explicit `schema.index()` for indexes with options (sparse, text, etc.)
- Add comments explaining why indexes are removed

### ❌ DON'T:
- Add both `unique: true` AND `index: true` on the same field
- Add both inline `index: true` AND explicit `schema.index()`
- Create duplicate indexes (wastes memory and slows writes)

## Index Strategy Summary

| Field Type | Recommended Approach | Example |
|------------|---------------------|---------|
| Unique fields | `unique: true` only | `email: { type: String, unique: true }` |
| Single field index | `schema.index()` | `schema.index({ status: 1 })` |
| Compound index | `schema.index()` | `schema.index({ user: 1, createdAt: -1 })` |
| Text index | `schema.index()` | `schema.index({ description: 'text' })` |
| TTL index | inline | `expiresAt: { type: Date, index: { expires: 0 } }` |

## Verification

After fixes, server starts with no warnings:
```
✅ MongoDB Connected: localhost
✅ Server is running in development mode
```

All indexes still work correctly, just without duplication.

## Files Modified
- `/backend/src/models/User.js` - Removed duplicate email index
- `/backend/src/models/Order.js` - Removed duplicate indexes on orderNumber, status, user
- `/backend/src/models/Cart.js` - Removed duplicate user index

**Status:** ✅ All warnings resolved
