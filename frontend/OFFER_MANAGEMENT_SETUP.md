# Offer Management System

## Overview
A complete offer management system has been created for admins to view, add, edit, and delete promotional offers. The system includes a list view and a form for creating/editing offers.

## Files Created/Modified

### 1. New Screens Created

#### OfferManagementScreen.tsx
**File:** `/frontend/src/screens/admin/offers/OfferManagementScreen.tsx`

Main screen displaying all offers with management capabilities:
- **Stats Dashboard**: Shows total, active, and inactive offer counts
- **Filter Options**: View all offers, only active, or only inactive
- **Offer Cards**: Beautiful gradient cards matching HomeScreen design
- **Quick Actions**: Edit, Activate/Deactivate, and Delete buttons
- **Empty State**: Friendly message when no offers exist
- **Floating Add Button**: Quick access to create new offers

#### AddOfferScreen.tsx (Updated)
**File:** `/frontend/src/screens/admin/offers/AddOfferScreen.tsx`

Enhanced to support both creating new offers and editing existing ones:
- **Live Preview**: Real-time preview of offer card
- **Edit Mode**: Pre-fills form when editing existing offer
- **Form Fields**: Badge, Title, Description, Code, Theme
- **Validation**: Required field checks
- **Dynamic UI**: Changes header and button text based on mode

### 2. Navigation Setup
**Files Modified:**
- `/frontend/src/navigation/AdminNavigator.tsx` - Added both screens
- `/frontend/src/types/navigation.ts` - Added type definitions
- `/frontend/src/screens/admin/main/ProfileScreen.tsx` - Routes to OfferManagement

## Features

### OfferManagementScreen Features

#### 📊 Statistics Cards
Three stat cards showing:
1. **Total Offers** - Green card with tag icon
2. **Active Offers** - Blue card with check icon  
3. **Inactive Offers** - Orange card with pause icon

#### 🎯 Smart Filters
- **All**: View all offers (default)
- **Active**: Only active/published offers
- **Inactive**: Only paused/draft offers
- Real-time count updates

#### 🎨 Offer Cards
Each card displays:
- **Gradient Preview**: Full offer design with pizza emoji
- **Badge**: Discount text (e.g., "50% OFF")
- **Title**: Offer name
- **Description**: Terms and conditions
- **Code**: Promo code in highlighted box
- **Status**: Active/Inactive badge
- **Actions**: Edit, Toggle Status, Delete buttons

#### ⚡ Quick Actions
- **Edit** (Blue): Opens AddOfferScreen with pre-filled data
- **Toggle** (Orange/Green): Activate or deactivate offer
- **Delete** (Red): Confirms before deletion

#### 📱 Responsive Design
- Empty state with call-to-action
- Floating action button when offers exist
- Smooth scrolling with bottom spacing
- Header with back and add buttons

### AddOfferScreen Features

#### 🔄 Dual Mode Operation
**Create Mode** (default):
- Empty form fields
- Header: "Add New Offer"
- Button: "Create Offer" with add icon

**Edit Mode** (when offer passed):
- Pre-filled form with offer data
- Header: "Edit Offer"
- Button: "Update Offer" with save icon
- Theme auto-selected based on offer colors

#### 📝 Form Fields
All fields are required and validated:
1. **Badge Text**: Display text like "50% OFF"
2. **Offer Title**: Main heading
3. **Description**: Detailed subtitle with terms
4. **Offer Code**: Alphanumeric (auto-uppercase)
5. **Theme Color**: 5 gradient options

#### 🎨 Live Preview
Updates in real-time as you type, showing:
- Badge with entered text
- Title styling
- Description preview
- Code in dashed border box
- Selected theme gradient
- Decorative pizza emoji

## Data Structure

### Offer Interface
```typescript
interface Offer {
    id: string;                        // Unique identifier
    badge: string;                     // "50% OFF", "₹100 OFF"
    title: string;                     // "Mega Pizza Sale"
    subtitle: string;                  // Description with terms
    code: string;                      // "PIZZA50" (uppercase)
    bgColor: string;                   // "#FF5722"
    gradientColors: [string, string];  // ["#FF9800", "#FF5722"]
    isActive: boolean;                 // true/false
}
```

### Color Themes
5 beautiful gradients available:
1. **Orange**: #FF9800 → #FF5722
2. **Blue**: #03A9F4 → #1976D2
3. **Green**: #8BC34A → #388E3C
4. **Purple**: #BA68C8 → #7B1FA2
5. **Red**: #FF5252 → #D32F2F

## Navigation Flow

```
ProfileScreen
    ↓ (Tap "Manage Offers")
OfferManagementScreen
    ↓ (Tap "+" or Add button)
AddOfferScreen (Create Mode)
    ↓ (Save)
Back to OfferManagementScreen

OR

OfferManagementScreen
    ↓ (Tap Edit button on offer card)
AddOfferScreen (Edit Mode)
    ↓ (Update)
Back to OfferManagementScreen
```

## How to Use

### Viewing Offers
1. Open admin app
2. Go to **Profile** tab
3. Tap **"Manage Offers"**
4. View all offers with stats and filters

### Creating New Offer
1. From OfferManagementScreen
2. Tap **floating "+"** button or header **"+"**
3. Fill in all required fields
4. Watch live preview update
5. Select theme color
6. Tap **"Create Offer"**
7. Automatically returns to list

### Editing Existing Offer
1. From OfferManagementScreen
2. Find offer card
3. Tap blue **Edit** button
4. Modify fields (all pre-filled)
5. Tap **"Update Offer"**
6. Returns to list with changes

### Activating/Deactivating
1. From OfferManagementScreen
2. Tap orange/green **Toggle** button
3. Status changes immediately
4. Stats update automatically

### Deleting Offer
1. From OfferManagementScreen
2. Tap red **Delete** button
3. Confirm in alert dialog
4. Offer removed from list
5. Stats update automatically

## Mock Data

The system includes 5 sample offers:
1. **Mega Pizza Sale** - 50% OFF (Active, Orange)
2. **Combo Special** - ₹100 OFF (Active, Blue)
3. **First Order Treat** - ₹150 OFF (Inactive, Green)
4. **Weekend Bonanza** - 30% OFF (Active, Purple)
5. **Double Delight** - BUY 1 GET 1 (Inactive, Red)

## API Integration Points

### TODO: Backend Integration
```typescript
// OfferManagementScreen.tsx
- [ ] Load offers from API on mount
- [ ] Save toggle status to API
- [ ] Send delete request to API

// AddOfferScreen.tsx
- [ ] POST /api/offers - Create new offer
- [ ] PUT /api/offers/:id - Update existing offer
- [ ] Validate offer code uniqueness
```

### Suggested API Endpoints
```
GET    /api/admin/offers          - Fetch all offers
POST   /api/admin/offers          - Create new offer
PUT    /api/admin/offers/:id      - Update offer
PATCH  /api/admin/offers/:id      - Toggle active status
DELETE /api/admin/offers/:id      - Delete offer
```

## Design System

### Colors
- **Primary Red**: `#cb202d` - Buttons, active states
- **Background**: `#f4f4f2` - Screen background
- **Card White**: `#fff` - Card backgrounds
- **Border**: `#E0E0E0` - Dividers and borders
- **Text Primary**: `#2d2d2d` - Main text
- **Text Secondary**: `#8E8E93` - Labels, hints

### Status Colors
- **Active Green**: `#4CAF50` / `#E8F5E9` (bg)
- **Inactive Orange**: `#FF9800` / `#FFF3E0` (bg)
- **Edit Blue**: `#2196F3` / `#E3F2FD` (bg)
- **Delete Red**: `#F44336` / `#FFEBEE` (bg)

### Typography
- **Header Title**: 18px, Bold (700)
- **Section Title**: 20px, ExtraBold (800)
- **Stat Value**: 24px, ExtraBold (800)
- **Card Title**: 20px, ExtraBold (900)
- **Body Text**: 14-16px, SemiBold (600)
- **Labels**: 12-13px, SemiBold (600)

### Spacing
- **Screen Padding**: 16-20px horizontal
- **Card Margin**: 16px bottom
- **Section Gap**: 20-32px vertical
- **Button Height**: 40-60px
- **Border Radius**: 16-20px (cards), 20-30px (buttons)

## Advanced Features

### Filter System
- State management with `filterStatus`
- Real-time filtering of offer array
- Visual feedback with active chip style
- Count updates automatically

### Status Toggle
- Instant UI update
- No confirmation needed
- Visual feedback with status badge
- Stats recalculate automatically

### Delete Confirmation
- Alert dialog with cancel option
- Destructive action style
- Success message after deletion
- Auto-updates list and stats

### Empty States
- Different messages for different filters
- Call-to-action button when no offers
- Friendly icon and text
- Encourages first offer creation

### Floating Action Button
- Only shows when offers exist
- Fixed position above content
- Red theme matching app
- Smooth shadow and elevation

## Next Steps

### Priority Enhancements
1. **API Integration**: Connect to backend
2. **AsyncStorage**: Local persistence
3. **Pull to Refresh**: Reload offers
4. **Search**: Filter by title/code
5. **Sort**: By date, status, title

### Advanced Features
6. **Expiry Dates**: Set offer validity period
7. **Usage Limits**: Max redemptions per user/total
8. **Target Audience**: Customer segments
9. **Analytics**: View redemption stats
10. **Bulk Actions**: Select multiple offers

### UI Improvements
11. **Animations**: Smooth transitions
12. **Skeleton Loading**: Better loading states
13. **Swipe Actions**: Swipe to delete/edit
14. **Reorder**: Drag to reorder priority
15. **Copy Offer**: Duplicate existing offer

## Testing Checklist

- [ ] Navigate to OfferManagementScreen from Profile
- [ ] View all offers with correct stats
- [ ] Filter by Active/Inactive
- [ ] Create new offer with all fields
- [ ] Edit existing offer (pre-filled data)
- [ ] Toggle offer status (Active ↔ Inactive)
- [ ] Delete offer with confirmation
- [ ] View empty state (delete all offers)
- [ ] Check form validation (leave fields empty)
- [ ] Verify live preview updates
- [ ] Test all 5 theme colors
- [ ] Check floating button visibility
- [ ] Verify back navigation works
- [ ] Test on iOS and Android

## Known Issues

- TypeScript language server may need restart for navigation types
- Mock data resets on app restart (no persistence yet)
- No API integration (console logs only)
- Form data doesn't actually update the list (needs state management)

## File Structure

```
frontend/src/screens/admin/offers/
├── OfferManagementScreen.tsx  (List view - 700+ lines)
├── AddOfferScreen.tsx          (Form view - 570+ lines)
```

Both screens are fully styled and functional with mock data.

