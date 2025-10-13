# 🚀 EditMenuItemScreen - Quick Reference

## 📍 Navigation
```typescript
// From MenuManagementScreen
navigation.navigate('EditMenuItem', { itemId: item._id })
```

## 🔑 Key Props & State

### Route Params
```typescript
const { itemId } = route.params as { itemId: string };
```

### Redux State
```typescript
const { selectedProduct, isLoading, isUpdating, error } = useSelector(
    (state: RootState) => state.product
);
```

### Local State
```typescript
itemData: {
    name: string
    description: string
    category: 'pizza' | 'sides' | 'beverages' | 'desserts'
    priceSmall: string  // Pizza only
    priceMedium: string // Pizza only
    priceLarge: string  // Pizza only
    price: string       // Other items
    imageUrl: string
    isVegetarian: boolean
    isAvailable: boolean
}

selectedImage: string | null
isUploadingImage: boolean
toppings: Array<{ name: string; category: string }>
```

## 🔄 Main Functions

### Load Product
```typescript
useEffect(() => {
    dispatch(fetchProductByIdThunk(itemId));
    return () => dispatch(clearMessages());
}, [itemId]);
```

### Save Changes
```typescript
const handleSaveChanges = async () => {
    // 1. Validate form
    if (!validateForm()) return;
    
    // 2. Upload new image (if changed)
    if (selectedImage && isLocalFileUri(selectedImage)) {
        cloudinaryImageUrl = await uploadImage(selectedImage, 'product');
    }
    
    // 3. Prepare data
    const updateData = {
        name, description, category, pricing,
        imageUrl, isVegetarian, isAvailable, toppings
    };
    
    // 4. Update backend
    await dispatch(updateProductThunk(itemId, updateData));
    
    // 5. Refresh list & navigate back
    await dispatch(refreshProductsThunk({ limit: 10 }));
    navigation.goBack();
};
```

### Delete Product
```typescript
const handleDeleteItem = () => {
    Alert.alert('Delete Item', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
                await dispatch(deleteProductThunk(itemId));
                await dispatch(refreshProductsThunk({ limit: 10 }));
                navigation.goBack();
            }
        }
    ]);
};
```

## 📋 Validation Rules

```typescript
✅ Name: Required, non-empty
✅ Description: Required, non-empty
✅ Category: Required
✅ Pricing:
   - Pizza: At least one size price > 0
   - Other: Single price > 0
```

## 🎨 UI Sections

```
┌─────────────────────────────────┐
│ Header (Back, Title, Delete)    │
├─────────────────────────────────┤
│ Basic Information                │
│  • Name                          │
│  • Description                   │
├─────────────────────────────────┤
│ Category Selection               │
│  [Pizza] [Sides] [Bev] [Des]   │
├─────────────────────────────────┤
│ Pricing                          │
│  If pizza: Small, Med, Large     │
│  If other: Single price          │
├─────────────────────────────────┤
│ Toppings (Pizza only)            │
│  • Current toppings list         │
│  • [+ Add Topping] button        │
├─────────────────────────────────┤
│ Image Upload                     │
│  • Current image preview         │
│  • Change/Remove buttons         │
├─────────────────────────────────┤
│ Item Options                     │
│  • Vegetarian toggle             │
│  • Available toggle              │
├─────────────────────────────────┤
│ Customer Preview Card            │
│  • Shows final appearance        │
├─────────────────────────────────┤
│ Floating Save Button             │
└─────────────────────────────────┘
```

## 🔧 Common Tasks

### Change Category
```typescript
// Auto-switches pricing inputs
setItemData({ ...itemData, category: 'pizza' });
// Shows: Small, Medium, Large inputs

setItemData({ ...itemData, category: 'sides' });
// Shows: Single price input
```

### Add Topping
```typescript
// 1. Click "+ Add Topping"
// 2. Select category (Vegetables, Meat, etc.)
// 3. Select topping
// 4. Automatically added to list
```

### Remove Topping
```typescript
// Click X button on topping item
handleRemoveTopping(index);
```

### Upload Image
```typescript
// 1. Click "Change Image" or upload area
// 2. Select from gallery
// 3. Image uploaded to Cloudinary
// 4. URL saved in backend
```

## ⚠️ Error Handling

```typescript
// Loading state
if (isLoading && !selectedProduct) {
    return <LoadingView />;
}

// Not found
if (!isLoading && !selectedProduct) {
    return <ErrorView />;
}

// Upload error
catch (uploadError) {
    Alert.alert('Image Upload Failed', error.message);
}

// Save error
catch (saveError) {
    Alert.alert('Error', error.message);
}
```

## 🎯 Redux Actions Reference

```typescript
// Load product
dispatch(fetchProductByIdThunk(itemId))

// Update product
dispatch(updateProductThunk(itemId, updates))

// Delete product
dispatch(deleteProductThunk(itemId))

// Refresh list
dispatch(refreshProductsThunk({ limit: 10 }))

// Clear messages
dispatch(clearMessages())
```

## 📊 Data Flow

```
MenuManagementScreen
    ↓ (itemId)
EditMenuItemScreen
    ↓
fetchProductByIdThunk(itemId)
    ↓
selectedProduct populated
    ↓
Form fields filled
    ↓
User edits
    ↓
handleSaveChanges()
    ↓
updateProductThunk(itemId, updates)
    ↓
refreshProductsThunk()
    ↓
← navigation.goBack()
    ↓
MenuManagementScreen (updated list)
```

## 🧪 Quick Test

```typescript
// 1. From menu list, click Edit on any item
// 2. Verify all fields populated
// 3. Change name to "Test Pizza"
// 4. Change price
// 5. Upload new image
// 6. Add/remove toppings (if pizza)
// 7. Toggle vegetarian
// 8. Click Save
// 9. Verify success message
// 10. Verify changes in menu list
```

## 🎨 Style Classes Reference

```typescript
// Main containers
styles.container
styles.content
styles.form
styles.section

// Inputs
styles.input
styles.textArea
styles.inputWithIcon
styles.inputWithPadding

// Buttons
styles.saveButton
styles.saveButtonDisabled
styles.deleteButton
styles.addToppingButton

// Image
styles.imagePreviewContainer
styles.imagePreview
styles.removeImageButton
styles.changeImageButtonOverlay

// Toppings
styles.toppingItem
styles.toppingInfo
styles.removeToppingButton

// Modal
styles.modalOverlay
styles.modalContainer
styles.modalHeader
styles.categoryCard
styles.toppingChip
```

## 💡 Pro Tips

1. **Image Upload**: Only uploads new image if changed (saves bandwidth)
2. **Validation**: Validates before upload (saves API calls)
3. **Loading States**: Shows spinner during save/upload
4. **List Refresh**: Auto-refreshes menu list after save
5. **Error Recovery**: Offers to continue without image on upload failure
6. **Category Switch**: Toppings section only shows for pizzas
7. **Price Display**: Preview shows first available price for pizzas

## 🔗 Related Files

```
frontend/src/screens/admin/menu/EditMenuItemScreen.tsx
frontend/src/screens/admin/main/MenuManagementScreen.tsx
frontend/redux/thunks/productThunks.ts
frontend/redux/slices/productSlice.ts
frontend/src/services/productService.ts
frontend/src/utils/imageUpload.ts
```

## ✅ Completion Checklist

- [x] Load product by ID
- [x] Populate form fields
- [x] Multi-size pricing for pizza
- [x] Single price for others
- [x] Image upload/change/remove
- [x] Toppings management
- [x] Form validation
- [x] Save to backend
- [x] Delete functionality
- [x] Real-time preview
- [x] Loading states
- [x] Error handling
- [x] List refresh
- [x] Navigation

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-01-12
**Version:** 1.0.0
