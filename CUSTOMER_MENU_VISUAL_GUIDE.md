# 🎨 Customer Menu Screen - Visual Guide

## 📱 Screen Layout

```
┌─────────────────────────────────────┐
│  📍 Home - New York      [🛒 0]     │ ← Header
│  [🔍 Search for pizzas...]          │ ← Search Bar
├─────────────────────────────────────┤
│ [All] [Pizza] [Sides] [Beverages]   │ ← Categories (Horizontal Scroll)
├─────────────────────────────────────┤
│                                     │
│  Your Favorites                     │ ← Favorites Section
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │   (Static, future: from orders)
│  │ 🍕│ │ 🍕│ │ 🍕│ │ 🍕│          │
│  │ M │ │ P │ │ V │ │ B │          │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
├─────────────────────────────────────┤
│  Our Delicious Menu                 │ ← Menu Section Header
│  250 items ready to order           │   (Dynamic count from backend)
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [🌱] [BESTSELLER]     20% │   │ ← Product Card
│  │                         OFF │   │
│  │        [Pizza Image]        │   │   - Image from backend
│  │                             │   │   - Badges (Veg, Bestseller, Discount)
│  │            [ADD]            │   │   - ADD button
│  ├─────────────────────────────┤   │
│  │ Margherita Classic          │   │   - Name
│  │ ★ 4.5 (156) • 20-24 min    │   │   - Rating, Reviews, Time
│  │ Fresh mozzarella, tomato... │   │   - Description
│  │ $15.00  $18.00             │   │   - Price, Original Price
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [🔴]                  15% │   │ ← Another Product Card
│  │                         OFF │   │   (Non-Veg)
│  │        [Pizza Image]        │   │
│  │            [ADD]            │   │
│  ├─────────────────────────────┤   │
│  │ Pepperoni Deluxe            │   │
│  │ ★ 4.7 (342) • 18-22 min    │   │
│  │ Premium pepperoni, mozza... │   │
│  │ $14.99  $17.99             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────┐      │ ← Load More Indicator
│  │  ⏳ Loading more items... │      │   (Shows when scrolling)
│  └──────────────────────────┘      │
│                                     │
│  🎉 You've seen all items!          │ ← End of List
│                                     │
└─────────────────────────────────────┘
         ┌───────────────────┐
         │ 3  View Cart  $48 │         ← Floating Cart Button
         └───────────────────┘         (Appears when items in cart)
```

---

## 🎯 Component States

### 1. Loading State (Initial)
```
┌─────────────────────────────────────┐
│                                     │
│              ⏳                      │
│    Loading delicious menu...        │
│                                     │
└─────────────────────────────────────┘
```

### 2. Error State
```
┌─────────────────────────────────────┐
│                                     │
│              ⚠️                      │
│   Failed to fetch products          │
│        [Retry Button]               │
│                                     │
└─────────────────────────────────────┘
```

### 3. Empty State (Search)
```
┌─────────────────────────────────────┐
│                                     │
│              🍕                      │
│         No items found              │
│  Try adjusting your search          │
│                                     │
└─────────────────────────────────────┘
```

### 4. Success State (Products Loaded)
```
┌─────────────────────────────────────┐
│  Our Delicious Menu                 │
│  250 items ready to order           │
│                                     │
│  [Product Card 1]                   │
│  [Product Card 2]                   │
│  [Product Card 3]                   │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 🔄 User Interactions

### 1. Search Flow
```
User types "pizza"
     ↓
Local state updates (immediate)
     ↓
Wait 500ms (debounce)
     ↓
Redux action dispatched
     ↓
API call to backend
     ↓
Backend searches all products
     ↓
Returns filtered results
     ↓
Redux state updated
     ↓
UI re-renders with results
```

### 2. Category Filter Flow
```
User taps "Pizza"
     ↓
Redux category state updated
     ↓
Reset to page 1
     ↓
API call with category filter
     ↓
Backend filters by category
     ↓
Returns pizza products
     ↓
Redux state updated
     ↓
UI shows only pizzas
```

### 3. Infinite Scroll Flow
```
User scrolls down
     ↓
Check distance to bottom
     ↓
If < 100px and hasMore = true
     ↓
Show loading indicator
     ↓
API call for page + 1
     ↓
Backend returns next 20 items
     ↓
Append to existing products
     ↓
UI updates with more items
     ↓
User continues scrolling
```

### 4. Pull-to-Refresh Flow
```
User pulls down
     ↓
RefreshControl activated
     ↓
Show refresh indicator
     ↓
API call for page 1
     ↓
Backend returns first 20 items
     ↓
Replace existing products
     ↓
Hide refresh indicator
     ↓
UI shows refreshed list
```

---

## 🎨 Product Card Anatomy

```
┌───────────────────────────────────┐
│  TOP SECTION (Image Area)         │
│  ┌─────────────────────────────┐  │
│  │ [🌱] = Veg Indicator        │  │ ← Top Left Badges
│  │ [BESTSELLER] = Rating ≥ 4.5 │  │
│  │                             │  │
│  │      Product Image          │  │ ← Main Image (200px height)
│  │    (from backend URL)       │  │
│  │                             │  │
│  │                   [20% OFF] │  │ ← Top Right Discount Badge
│  │                             │  │
│  │                      [ADD]  │  │ ← Bottom Right Add Button
│  └─────────────────────────────┘  │
│                                   │
│  CONTENT SECTION                  │
│  ┌─────────────────────────────┐  │
│  │ Margherita Classic          │  │ ← Product Name
│  ├─────────────────────────────┤  │
│  │ ★ 4.5 (156) • 20-24 min    │  │ ← Rating | Reviews | Prep Time
│  ├─────────────────────────────┤  │
│  │ Fresh mozzarella, tomato    │  │ ← Description (2 lines max)
│  │ sauce, basil leaves...      │  │
│  ├─────────────────────────────┤  │
│  │ $15.00  $18.00             │  │ ← Current Price | Original Price
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

### Badge Colors:
- **Veg Indicator**: Green circle (#0F8A65)
- **Non-Veg Indicator**: Red circle (#D32F2F)
- **Bestseller**: Yellow background (#FFB800)
- **Discount**: Orange background (Colors.warning)

### Price Display:
- **Current Price**: Bold, dark text
- **Original Price**: Gray, strikethrough (if discount > 0)

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│  MenuScreen  │
└──────┬───────┘
       │
       ├─ useState ──────────────┐ (localSearchQuery)
       │                         │
       ├─ useSelector ───────────┤ (Redux Store)
       │   ├─ products           │
       │   ├─ total              │
       │   ├─ isLoading          │
       │   ├─ error              │
       │   ├─ selectedCategory   │
       │   └─ searchQuery        │
       │                         │
       ├─ useDispatch ───────────┤ (Redux Actions)
       │   ├─ fetchProductsThunk │
       │   ├─ loadMoreProductsThunk
       │   ├─ refreshProductsThunk
       │   ├─ setSearchQuery     │
       │   └─ setCategory        │
       │                         │
       └─ useFocusEffect ────────┘ (Initial Load)
                 ↓
         ┌───────────────┐
         │ Redux Thunks  │
         └───────┬───────┘
                 ↓
         ┌───────────────┐
         │ API Service   │
         └───────┬───────┘
                 ↓
         ┌───────────────┐
         │   Backend     │
         └───────┬───────┘
                 ↓
         ┌───────────────┐
         │   MongoDB     │
         └───────────────┘
```

---

## 🧩 Component Hierarchy

```
MenuScreen
├── Header
│   ├── LocationContainer
│   │   ├── "Deliver to"
│   │   └── "📍 Home - New York"
│   └── CartButton
│       └── Badge (0)
│
├── SearchBar
│   ├── SearchIcon 🔍
│   └── TextInput
│
├── Categories (Horizontal ScrollView)
│   ├── CategoryChip: All
│   ├── CategoryChip: Pizza
│   ├── CategoryChip: Sides
│   ├── CategoryChip: Beverages
│   └── CategoryChip: Desserts
│
└── Main ScrollView (with RefreshControl)
    ├── FavoritesSection
    │   ├── SectionHeader ("Your Favorites")
    │   └── Horizontal ScrollView
    │       ├── FavoriteCard 1
    │       ├── FavoriteCard 2
    │       ├── FavoriteCard 3
    │       └── FavoriteCard 4
    │
    ├── MenuSection
    │   ├── SectionTitle ("Our Delicious Menu")
    │   ├── SectionSubtitle ("250 items ready to order")
    │   │
    │   ├── [IF isLoading]
    │   │   └── LoadingContainer
    │   │       ├── ActivityIndicator
    │   │       └── "Loading delicious menu..."
    │   │
    │   ├── [IF error]
    │   │   └── ErrorContainer
    │   │       ├── "⚠️ Error message"
    │   │       └── RetryButton
    │   │
    │   ├── [IF empty]
    │   │   └── EmptyContainer
    │   │       ├── "🍕"
    │   │       ├── "No items found"
    │   │       └── Helpful message
    │   │
    │   └── [IF success]
    │       ├── ProductCard 1
    │       │   ├── ImageSection
    │       │   │   ├── Image
    │       │   │   ├── VegIndicator
    │       │   │   ├── BestsellerBadge (conditional)
    │       │   │   ├── DiscountBadge (conditional)
    │       │   │   └── AddButton
    │       │   └── ContentSection
    │       │       ├── ItemName
    │       │       ├── RatingContainer
    │       │       ├── Description
    │       │       └── PriceContainer
    │       │
    │       ├── ProductCard 2
    │       ├── ProductCard 3
    │       └── ...
    │
    ├── [IF isLoadingMore]
    │   └── LoadMoreContainer
    │       ├── ActivityIndicator
    │       └── "Loading more items..."
    │
    └── [IF !hasMore]
        └── EndOfListContainer
            └── "🎉 You've seen all items!"
│
└── FloatingCartButton (Overlay)
    └── CartContent
        ├── Badge (3)
        ├── "View Cart"
        └── "$47.97"
```

---

## 🎬 Animation States

### 1. Initial Load
```
Frame 1: Empty screen
Frame 2: Show spinner
Frame 3: Fade in products
```

### 2. Category Switch
```
Frame 1: Current products visible
Frame 2: Brief opacity fade
Frame 3: New products appear
```

### 3. Pull-to-Refresh
```
Frame 1: User pulls down
Frame 2: Refresh indicator appears
Frame 3: Spinner rotates
Frame 4: List bounces back
Frame 5: Products update
```

### 4. Infinite Scroll
```
Frame 1: User scrolls to bottom
Frame 2: "Loading more..." appears
Frame 3: New items fade in from bottom
Frame 4: Seamless continuation
```

---

## 📏 Layout Measurements

```
Header Height: ~150px (with search bar)
Category Bar: ~50px
Product Card: ~360px
  - Image Section: 200px
  - Content Section: 160px
Floating Cart: 60px (bottom overlay)
```

---

## 🎨 Color Palette

| Element | Color | Variable |
|---------|-------|----------|
| Background | #FFFFFF | Colors.background |
| Primary | #cb202d | Colors.primary |
| Text Primary | #2d2d2d | Colors.text.primary |
| Text Secondary | #666666 | Colors.text.secondary |
| Text Tertiary | #999999 | Colors.text.tertiary |
| Success | #0F8A65 | Colors.success |
| Error | #D32F2F | Colors.error |
| Warning | #FFB800 | Colors.warning |
| Border | #E0E0E0 | Colors.border.light |
| Surface | #FFFFFF | Colors.surface |

---

## 💡 Design Highlights

✨ **Card Design**: Elevation shadow, rounded corners, clean layout  
✨ **Badges**: Positioned over image, high contrast  
✨ **Typography**: Semibold for titles, regular for descriptions  
✨ **Spacing**: Consistent padding (Spacing.xl, Spacing.lg)  
✨ **Icons**: Feather icons for UI, Emojis for visual interest  
✨ **Feedback**: Loading spinners, success messages, error states  

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Design Complete
