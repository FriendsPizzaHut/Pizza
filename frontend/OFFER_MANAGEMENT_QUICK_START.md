# Offer Management System - Quick Start Guide

## 🚀 Quick Access
**Profile Tab** → **Manage Offers** → View/Edit/Add/Delete Offers

---

## 📱 Screen Overview

### 1. OfferManagementScreen
**Main screen showing all your offers**

```
┌─────────────────────────────────────┐
│  ←  Manage Offers              [+]  │  Header
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  5   │  │  3   │  │  2   │      │  Stats Cards
│  │Total │  │Active│  │Inactive│    │
│  └──────┘  └──────┘  └──────┘      │
├─────────────────────────────────────┤
│  [All] [Active] [Inactive]          │  Filters
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 🎨 Gradient Preview          │   │
│  │ [50% OFF]                   │   │
│  │ Mega Pizza Sale             │   │  Offer Card
│  │ Description...              │   │
│  │ CODE: PIZZA50           🍕  │   │
│  │ ─────────────────────────   │   │
│  │ ● Active  [📝] [⏸️] [🗑️]   │   │  Actions
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ... more offers ...          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────[+]┘  Floating Button
```

### 2. AddOfferScreen (Create/Edit)
**Form to create new offer or edit existing**

```
┌─────────────────────────────────────┐
│  ←  Add New Offer / Edit Offer      │  Header
├─────────────────────────────────────┤
│  Preview                            │
│  ┌─────────────────────────────┐   │
│  │ 🎨 Live Preview Updates      │   │  Live Preview
│  │ [YOUR BADGE]                │   │  (changes as
│  │ Your Offer Title            │   │   you type)
│  │ Your description...         │   │
│  │ CODE: YOURCODE          🍕  │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Offer Details                      │
│  ┌─────────────────────────────┐   │
│  │ Badge Text *                │   │
│  │ [Enter badge text...]       │   │  Form Fields
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Offer Title *               │   │
│  │ [Enter title...]            │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Description *               │   │
│  │ [Enter description...]      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Offer Code *                │   │
│  │ [PIZZA50]                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Theme Color *                      │
│  ○ Orange  ○ Blue  ○ Green          │  Color Themes
│  ○ Purple  ○ Red                    │
│                                     │
│  [✓ Create Offer / 💾 Update]      │  Save Button
│  [Cancel]                           │  Cancel Button
└─────────────────────────────────────┘
```

---

## 🎯 Common Actions

### View All Offers
```
Profile → Manage Offers
```
- See stats at top
- Use filters: All, Active, Inactive
- Scroll through offer cards

### Create New Offer
```
Manage Offers → [+] Button → Fill Form → Create Offer
```
1. Tap floating **+** or header **+**
2. Enter all required fields (*)
3. Watch preview update live
4. Select color theme
5. Tap **Create Offer**

### Edit Existing Offer
```
Manage Offers → [📝 Edit] → Modify → Update Offer
```
1. Find offer in list
2. Tap blue **Edit** button
3. Modify any field
4. Preview shows changes
5. Tap **Update Offer**

### Activate/Deactivate Offer
```
Manage Offers → [⏸️/▶️ Toggle]
```
- **Active** offers show to customers
- **Inactive** offers are hidden
- One tap to toggle
- Stats update instantly

### Delete Offer
```
Manage Offers → [🗑️ Delete] → Confirm
```
1. Tap red **Delete** button
2. Confirm in alert
3. Offer removed
4. Can't be undone!

---

## 🎨 Theme Colors

### Available Gradients
```
🟠 Orange:  #FF9800 → #FF5722  (Warm, energetic)
🔵 Blue:    #03A9F4 → #1976D2  (Professional, trustworthy)
🟢 Green:   #8BC34A → #388E3C  (Fresh, success)
🟣 Purple:  #BA68C8 → #7B1FA2  (Premium, creative)
🔴 Red:     #FF5252 → #D32F2F  (Urgent, exciting)
```

Use colors that match your offer type:
- **Discounts** → Orange/Red
- **New Customer** → Green
- **Premium** → Purple
- **General** → Blue

---

## 📋 Form Field Guide

### Badge Text *
**What customers see first**
```
Examples:
✓ "50% OFF"
✓ "₹100 OFF"
✓ "BUY 1 GET 1"
✓ "30% DISCOUNT"
✗ "Great Deal" (not specific enough)
```

### Offer Title *
**Catchy name for the offer**
```
Examples:
✓ "Mega Pizza Sale"
✓ "Weekend Bonanza"
✓ "First Order Treat"
✓ "Combo Special"
✗ "Discount" (too generic)
```

### Description *
**Full details and terms**
```
Examples:
✓ "Get 50% off on all large pizzas Min order: ₹299"
✓ "Save ₹100 on combo meals Min order: ₹499"
✓ "New customers get ₹150 off Min order: ₹399"

Include:
- What's discounted
- Minimum order value
- Any restrictions
```

### Offer Code *
**Customer redemption code**
```
Rules:
✓ UPPERCASE only (auto-converted)
✓ Alphanumeric (letters + numbers)
✓ 4-15 characters recommended
✓ Easy to remember

Examples:
✓ PIZZA50
✓ COMBO100
✓ FIRST150
✓ WEEKEND30
✗ pizza50 (will be converted)
✗ SUPER-DEAL (no special chars)
```

---

## 🔢 Stats Explained

### Total Offers
- **All offers** in the system
- Active + Inactive count

### Active Offers
- **Currently visible** to customers
- Can be redeemed
- Green indicator

### Inactive Offers
- **Hidden** from customers
- Can't be redeemed
- Orange indicator
- Draft or paused offers

---

## 💡 Tips & Best Practices

### Creating Offers
1. **Be Specific**: Clear badge text (e.g., "50% OFF" not "Discount")
2. **Set Terms**: Always mention minimum order value
3. **Short Codes**: Keep codes 5-10 characters
4. **Test Preview**: Check how it looks before saving
5. **Choose Wisely**: Select appropriate theme color

### Managing Offers
1. **Deactivate** instead of delete if unsure
2. Use **filters** to quickly find offers
3. **Edit anytime** without deletion
4. Keep **3-5 active** offers at once (not too many)
5. Monitor which offers are most used

### Naming Conventions
```
Good Offer Codes:
- SAVE50      (clear purpose)
- NEWBIE100   (audience specific)
- WEEKEND20   (time-based)
- COMBO15     (category-based)

Avoid:
- OFFER123    (meaningless)
- X5Y2Z1      (hard to remember)
- DISCOUNT    (too generic)
```

---

## ⚠️ Important Notes

### Data Persistence
⚠️ **Mock data only** - offers reset on app restart
- Implement API integration for production
- Add AsyncStorage for offline persistence

### Form Validation
✓ All fields are required
✓ Code auto-converts to uppercase
✓ Empty fields show validation alerts

### Status Changes
- Toggle is instant (no confirmation)
- Delete requires confirmation
- Can't recover deleted offers

### Navigation
- Create/Edit auto-returns to list
- Back button cancels changes
- No unsaved changes warning (yet)

---

## 🐛 Troubleshooting

### "No offers found"
→ All offers deleted or wrong filter selected
→ Solution: Create new offer or change filter to "All"

### Preview not updating
→ Fields empty or invalid
→ Solution: Type something in fields to see preview

### Can't save offer
→ Required field missing
→ Solution: Fill all fields marked with *

### Edit button not working
→ TypeScript/Navigation issue
→ Solution: Restart app or TS server

---

## 🚀 Quick Reference

| Action | Navigation | Button |
|--------|-----------|--------|
| View offers | Profile → Manage Offers | - |
| Create new | Manage Offers → + | Floating or Header + |
| Edit offer | Offer card → 📝 | Blue Edit button |
| Toggle status | Offer card → ⏸️/▶️ | Orange/Green button |
| Delete offer | Offer card → 🗑️ | Red Delete button |
| Filter active | Tap "Active" chip | Blue chip |
| Filter inactive | Tap "Inactive" chip | Orange chip |

---

## 📞 Need Help?

- Check **OFFER_MANAGEMENT_SETUP.md** for detailed documentation
- Review mock data for examples
- Test all features with sample offers
- Report issues or suggestions

---

**Version**: 1.0  
**Last Updated**: Based on implementation  
**Status**: ✅ Fully Functional (Mock Data)
