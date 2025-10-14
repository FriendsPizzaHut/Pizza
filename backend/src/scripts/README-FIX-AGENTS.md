# Fix Delivery Agents Status - Migration Script

## Problem
Existing delivery agents in the database may have `isApproved: true` but `isActive: false`, preventing them from logging in.

## Solution
Run this migration script to automatically fix the status of all delivery agents based on their approval state.

---

## How to Run

### Option 1: Using Node (Recommended)
```bash
cd backend
node src/scripts/fix-delivery-agents-status.js
```

### Option 2: Add to package.json scripts
Add this to your `backend/package.json`:
```json
{
  "scripts": {
    "migrate:fix-agents": "node src/scripts/fix-delivery-agents-status.js"
  }
}
```

Then run:
```bash
npm run migrate:fix-agents
```

---

## What It Does

The script will:
1. Connect to your MongoDB database
2. Find all users with `role: 'delivery'`
3. For each delivery agent:
   - **If approved** (`isApproved: true` AND `isRejected: false`):
     - ✅ Set `isActive: true`
   - **If rejected** (`isRejected: true`):
     - ❌ Set `isActive: false`
   - **If pending** (neither approved nor rejected):
     - ⏳ Set `isActive: false`
4. Print summary of changes

---

## Example Output

```bash
🔧 Starting migration: Fix Delivery Agents Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Connected to MongoDB

📊 Found 2 delivery agents

👤 Processing: Rishi (rishi@gmail.com)
   Current Status:
   - isApproved: true
   - isRejected: false
   - isActive: false
   ✅ UPDATED: isActive set to true

👤 Processing: Vickey (vickey@gmail.com)
   Current Status:
   - isApproved: true
   - isRejected: false
   - isActive: false
   ✅ UPDATED: isActive set to true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration Complete!
   - Total agents: 2
   - Updated: 2
   - Skipped: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👋 Database connection closed
```

---

## After Running

1. ✅ All approved delivery agents will have `isActive: true`
2. ✅ They can now login successfully
3. ✅ No need to manually update each agent in database

---

## Manual Fix (Alternative)

If you prefer to fix manually in MongoDB:

```javascript
// For approved agents
db.users.updateMany(
  { role: 'delivery', isApproved: true, isRejected: false },
  { $set: { isActive: true } }
)

// For rejected/pending agents
db.users.updateMany(
  { role: 'delivery', $or: [{ isRejected: true }, { isApproved: false }] },
  { $set: { isActive: false } }
)
```

---

## Safety

⚠️ This script is **safe to run multiple times**. It will only update records that need fixing and skip those already correct.

✅ **Idempotent:** Running it twice won't cause any issues.

---

**Created:** October 15, 2025  
**Status:** Ready to use
