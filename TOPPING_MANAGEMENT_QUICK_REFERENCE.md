# 🍕 Topping Management - Quick Reference

## Backend Model Structure

```javascript
// RestaurantSettings.availableToppings
[{
    name: String,           // e.g., "Mozzarella"
    category: String,       // 'vegetables' | 'meat' | 'cheese' | 'sauce'
    isActive: Boolean       // true = shown to customers, false = hidden
}]
```

## Frontend Component Functions

### CRUD Operations
```typescript
handleAddTopping()           // Add new topping
handleEditTopping(index)     // Open edit modal
handleUpdateTopping()        // Save edited topping
handleToggleTopping(index)   // Toggle active/inactive
handleDeleteTopping(index)   // Delete with confirmation
```

### Helper Functions
```typescript
getCategoryIcon(category)    // Returns emoji: 🥬 🍖 🧀 🍅
getCategoryColor(category)   // Returns color: green, red, orange, purple
groupedToppings              // Returns toppings grouped by category
```

## API Integration

### Fetch Toppings
```typescript
const settings = await getRestaurantSettings();
const toppings = settings.availableToppings; // Topping[]
```

### Save Toppings
```typescript
await updateRestaurantSettings({
    ...otherSettings,
    availableToppings: toppings
});
```

## Testing Commands

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm start
```

### Test API
```bash
# Get settings
curl http://localhost:5000/api/restaurant-settings

# Update settings
curl -X PUT http://localhost:5000/api/restaurant-settings \
  -H "Content-Type: application/json" \
  -d '{"availableToppings": [...]}'
```

## Default Toppings (23 items)

### Vegetables (8)
- Onion, Tomato, Capsicum, Mushroom, Corn, Jalapeno, Olives, Bell Pepper

### Meat (5)
- Chicken, Chicken Sausage, Pepperoni, Chicken Tikka, BBQ Chicken

### Cheese (4)
- Mozzarella, Cheddar, Parmesan, Paneer

### Sauce (4)
- Tomato Sauce, White Sauce, BBQ Sauce, Peri Peri Sauce

## Category Icons & Colors

| Category   | Icon | Color Code |
|------------|------|------------|
| Vegetables | 🥬   | #4CAF50    |
| Meat       | 🍖   | #F44336    |
| Cheese     | 🧀   | #FF9800    |
| Sauce      | 🍅   | #9C27B0    |

## Common Tasks

### Add a new topping programmatically
```typescript
const newTopping: Topping = {
    name: "Pineapple",
    category: "vegetables",
    isActive: true
};
setToppings([...toppings, newTopping]);
```

### Filter only active toppings
```typescript
const activeToppings = toppings.filter(t => t.isActive);
```

### Get toppings by category
```typescript
const vegetables = toppings.filter(t => t.category === 'vegetables');
```

### Count toppings by category
```typescript
const grouped = toppings.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
}, {} as Record<string, number>);
```

## File Locations

**Backend:**
- Model: `backend/src/models/RestaurantSettings.js`

**Frontend:**
- Types: `frontend/src/services/restaurantSettingsService.ts`
- UI: `frontend/src/screens/admin/settings/RestaurantSettingsScreen.tsx`

## Troubleshooting

### Toppings not showing?
1. Check if backend is running
2. Check if settings document exists in MongoDB
3. Check console for API errors
4. Verify `availableToppings` field is in response

### Can't save toppings?
1. Check network tab for API call
2. Verify authentication token
3. Check backend logs for validation errors
4. Ensure data format matches schema

### Modal not opening?
1. Check state: `isAddToppingModalVisible` or `editingTopping`
2. Verify Modal import from react-native
3. Check for JavaScript errors in console

## Next Steps
- Integrate toppings into Add/Edit Pizza screens
- Add topping pricing (optional)
- Add topping images (optional)
- Track topping usage analytics
