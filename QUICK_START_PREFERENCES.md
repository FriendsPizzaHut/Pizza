# 🚀 Quick Start Guide - User Preference & Recommendation System

## ✅ System Status

**Backend:** ✅ Complete and Ready  
**Frontend:** 📝 Integration Needed  
**Database:** ✅ Schema Updated  
**API:** ✅ 6 New Endpoints Live  

---

## 🎯 What This System Does

### Automatic Tracking:
- ✅ Tracks every order placed by customers
- ✅ Records product preferences and categories
- ✅ Analyzes ordering patterns (time, frequency, spending)
- ✅ Builds user profiles automatically

### Smart Recommendations:
- 🎁 **Personalized Feed** - Products you'll love based on history
- 🔄 **Order Again** - Quick reorder your favorites
- 📊 **Category Smart** - Best items in each category for you
- 🤝 **Bought Together** - Products others pair with this item
- 📈 **User Insights** - Your ordering statistics

---

## 🔥 How to Test RIGHT NOW

### 1. Start Your Backend
```bash
cd backend
npm run dev
```

### 2. Run the Test Script
```bash
cd backend
./test-recommendations.sh
```

**The script will ask for:**
1. Customer authentication token (login first)
2. A product ID (for "Frequently Bought Together")

### 3. Or Test Manually with cURL

#### Get Personalized Recommendations:
```bash
curl -X GET "http://localhost:5000/api/v1/recommendations/personalized?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get "Order Again" Items:
```bash
curl -X GET "http://localhost:5000/api/v1/recommendations/reorder?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get User Statistics:
```bash
curl -X GET "http://localhost:5000/api/v1/recommendations/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Category Recommendations:
```bash
curl -X GET "http://localhost:5000/api/v1/recommendations/category/pizza?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get "Frequently Bought Together":
```bash
curl -X GET "http://localhost:5000/api/v1/recommendations/frequently-bought/PRODUCT_ID?limit=3"
```

---

## 🔄 How It Works (Auto-Magic)

### Step 1: Customer Places Order
```
Customer → Add to Cart → Checkout → Place Order
```

### Step 2: Order Gets Delivered
```
Admin/Delivery → Marks Order as "delivered"
```

### Step 3: System Updates Automatically
```
✅ Total orders +1
✅ Total spent updated
✅ Average order value recalculated
✅ Most ordered items updated
✅ Favorite categories analyzed
✅ Order frequency determined
✅ Preferred time recorded
```

### Step 4: Recommendations Get Smarter
```
Next time customer opens app:
→ Sees personalized product feed
→ Gets "Order Again" suggestions
→ Receives category-specific picks
```

---

## 📱 Frontend Integration (Next Steps)

### 1. Home Screen - Personalized Feed

**File:** `frontend/src/screens/customer/main/HomeScreen.tsx`

```typescript
import apiClient from '../../../api/apiClient';

// Add state
const [personalizedItems, setPersonalizedItems] = useState([]);
const [reorderItems, setReorderItems] = useState([]);

// Fetch on load
useEffect(() => {
    const fetchRecommendations = async () => {
        try {
            // Personalized feed
            const personalized = await apiClient.get('/recommendations/personalized?limit=10');
            setPersonalizedItems(personalized.data.data);
            
            // Reorder suggestions
            const reorder = await apiClient.get('/recommendations/reorder?limit=5');
            setReorderItems(reorder.data.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };
    
    fetchRecommendations();
}, []);

// In JSX:
<View>
    {/* For You Section */}
    <Text style={styles.sectionTitle}>Recommended For You</Text>
    <FlatList
        horizontal
        data={personalizedItems}
        renderItem={({ item }) => (
            <ProductCard 
                product={item.product} 
                badge={item.reason}  // Shows "You order this often"
            />
        )}
    />
    
    {/* Order Again Section */}
    {reorderItems.length > 0 && (
        <>
            <Text style={styles.sectionTitle}>Order Again 🔄</Text>
            <FlatList
                horizontal
                data={reorderItems}
                renderItem={({ item }) => <ProductCard product={item} />}
            />
        </>
    )}
</View>
```

### 2. Product Details - "Frequently Bought Together"

**File:** `frontend/src/screens/customer/menu/PizzaDetailsScreen.tsx` or `ItemDetailsScreen.tsx`

```typescript
const [frequentlyBought, setFrequentlyBought] = useState([]);

useEffect(() => {
    const fetchSuggestions = async () => {
        try {
            const response = await apiClient.get(
                `/recommendations/frequently-bought/${productId}?limit=3`
            );
            setFrequentlyBought(response.data.data);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        }
    };
    
    if (productId) {
        fetchSuggestions();
    }
}, [productId]);

// In JSX (before bottom spacing):
{frequentlyBought.length > 0 && (
    <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Frequently Bought Together</Text>
        <Text style={styles.cardSubtitle}>
            Customers who ordered this also loved:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {frequentlyBought.map((product, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => navigation.navigate('ItemDetails', { itemId: product._id })}
                >
                    <Image source={{ uri: product.imageUrl }} style={styles.suggestionImage} />
                    <Text style={styles.suggestionName}>{product.name}</Text>
                    <Text style={styles.suggestionPrice}>₹{product.basePrice}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
)}
```

### 3. Profile Screen - User Statistics

**File:** `frontend/src/screens/customer/profile/ProfileScreen.tsx`

```typescript
const [stats, setStats] = useState(null);

useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/recommendations/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };
    
    fetchStats();
}, []);

// In JSX:
{stats && (
    <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Order Insights</Text>
        
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
        </View>
        
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>₹{stats.totalSpent?.toFixed(0)}</Text>
        </View>
        
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Order</Text>
            <Text style={styles.statValue}>₹{stats.averageOrderValue?.toFixed(0)}</Text>
        </View>
        
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statBadge}>
                {stats.orderFrequency?.toUpperCase()} CUSTOMER
            </Text>
        </View>
        
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>Preferred Time</Text>
            <Text style={styles.statValue}>
                {stats.preferredOrderTime?.charAt(0).toUpperCase() + 
                 stats.preferredOrderTime?.slice(1)}
            </Text>
        </View>
    </View>
)}
```

### 4. Menu Screen - Category Recommendations

**File:** `frontend/src/screens/customer/main/MenuScreen.tsx`

```typescript
// When user selects a category, fetch personalized items from that category

const handleCategoryChange = async (category: string) => {
    dispatch(setCategory(category));
    
    // Fetch category-specific recommendations
    try {
        const response = await apiClient.get(
            `/recommendations/category/${category}?limit=10`
        );
        // Optionally show these first in the list
        setCategoryRecommendations(response.data.data);
    } catch (error) {
        console.error('Failed to fetch category recommendations:', error);
    }
};
```

---

## 🧪 Testing Flow

### Prerequisites:
1. ✅ Backend running
2. ✅ MongoDB connected
3. ✅ At least 1 customer account created
4. ✅ At least 5 products in database

### Test Scenario:
```bash
# 1. Login as customer
POST /api/v1/auth/login
{
    "email": "customer@example.com",
    "password": "password123"
}

# 2. Place multiple orders (3-5 orders)
POST /api/v1/orders
# Add different products each time

# 3. Mark orders as delivered (as admin)
PATCH /api/v1/orders/:orderId/status
{
    "status": "delivered"
}

# 4. Check if preferences updated
GET /api/v1/recommendations/stats
# Should show totalOrders, totalSpent, favoriteCategories, etc.

# 5. Get personalized recommendations
GET /api/v1/recommendations/personalized
# Should return products based on order history

# 6. Get reorder suggestions
GET /api/v1/recommendations/reorder
# Should show previously ordered items

# 7. Test "Frequently Bought Together"
GET /api/v1/recommendations/frequently-bought/:productId
# Should show items ordered with this product
```

---

## 📊 Expected Behavior

### After 1 Order:
- ✅ User stats show 1 order
- ✅ orderFrequency = "occasional"
- ✅ Recommendations show popular items + user's order

### After 5 Orders:
- ✅ User stats show 5 orders
- ✅ orderFrequency = "regular"
- ✅ Favorite categories identified
- ✅ Most ordered items tracked
- ✅ Recommendations highly personalized

### After 20+ Orders:
- ✅ orderFrequency = "frequent"
- ✅ Strong preference patterns
- ✅ Highly accurate recommendations
- ✅ Smart product pairings

---

## 🔧 Troubleshooting

### Issue: Recommendations return empty array
**Solution:**
1. Check if user has any delivered orders
2. Verify `orderingBehavior` field exists in user document
3. Manually trigger preference update:
```bash
POST /api/v1/recommendations/update-preferences/:orderId
```

### Issue: Stats show null
**Solution:**
1. User hasn't placed any orders yet
2. Orders haven't been marked as "delivered"
3. Check MongoDB for `orderingBehavior` field

### Issue: Performance slow
**Solution:**
1. Check database indexes are created:
```javascript
db.products.getIndexes()
db.users.getIndexes()
```
2. Limit queries with smaller `limit` parameter
3. Consider adding Redis caching (future enhancement)

---

## 📈 Performance Tips

### 1. Use Pagination:
```typescript
// Load recommendations in batches
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
    const response = await apiClient.get(
        `/recommendations/personalized?limit=10&offset=${page * 10}`
    );
    // Append to existing list
};
```

### 2. Cache Results:
```typescript
// Cache for 5 minutes
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'personalized_recommendations';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedRecommendations = async () => {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }
    return null;
};
```

### 3. Lazy Load:
```typescript
// Only fetch when user scrolls to section
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView({ triggerOnce: true });

useEffect(() => {
    if (inView) {
        fetchRecommendations();
    }
}, [inView]);
```

---

## 🎉 Summary

### What You Have Now:
✅ **Auto-tracking** - Every order updates user preferences  
✅ **Smart recommendations** - 6 different types  
✅ **Performance optimized** - 11 database indexes  
✅ **6 API endpoints** - Ready to use  
✅ **Test script** - Easy testing  
✅ **Full documentation** - Implementation guide  

### Next Steps:
1. ✅ Backend is READY (just run `npm run dev`)
2. 📱 Add frontend components (copy code above)
3. 🧪 Test with real orders
4. 🚀 Deploy to production

### Quick Win:
Add just the **"Order Again"** section to HomeScreen:
- Easy to implement (10 minutes)
- Immediate user value
- Shows system working
- Increases repeat orders

---

**Need Help?**
- Check `USER_PREFERENCE_SYSTEM_IMPLEMENTATION.md` for full details
- Run `./test-recommendations.sh` to verify backend
- All API responses are documented

**The system is LIVE and READY! 🚀**
