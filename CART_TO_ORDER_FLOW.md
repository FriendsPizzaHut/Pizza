# 🛒 Cart to Order Complete Flow Documentation

## 📋 Overview

This document explains the complete flow from adding items to cart → checkout → order placement → order confirmation.

---

## 🔄 Complete User Flow

```
1. Browse Menu (MenuScreen)
   ↓
2. Click Pizza → Customize (PizzaDetailsScreen)
   ↓
3. Add to Cart (Redux + Backend)
   ↓
4. View Cart (CartScreen) ✅
   ↓
5. Click "Place Order" → Navigate to Checkout
   ↓
6. Fill Delivery Details (CheckoutScreen) 🚧
   ↓
7. Place Order → Create Order from Cart (Backend)
   ↓
8. Order Confirmation (OrderConfirmationScreen) ⏳
   ↓
9. Track Order / View Orders
```

---

## 🎯 Implementation Status

### ✅ COMPLETED:
1. **Cart Integration** - Items saved to backend
2. **MenuScreen** - Dynamic products from backend
3. **PizzaDetailsScreen** - Dynamic customization
4. **CartScreen** - Redux integrated with backend
5. **Backend Cart API** - Full CRUD operations
6. **Backend Order API** - Order creation from cart
7. **Cart Service** - Frontend API calls
8. **Order Service** - Frontend order creation

### 🚧 IN PROGRESS:
1. **CheckoutScreen** - Exists but needs integration with orderService
2. **Order Confirmation Screen** - Needs to be created

### ⏳ PENDING:
1. **Navigation Setup** - Add Checkout and OrderConfirmation to navigation
2. **Testing** - End-to-end flow testing
3. **Order Tracking** - View user's orders
4. **Order History** - List of past orders

---

## 📂 File Structure

```
frontend/
├── src/
│   ├── services/
│   │   ├── cartService.ts ✅
│   │   └── orderService.ts ✅
│   ├── screens/customer/menu/
│   │   ├── MenuScreen.tsx ✅
│   │   ├── PizzaDetailsScreen.tsx ✅
│   │   ├── CartScreen.tsx ✅
│   │   ├── CheckoutScreen.tsx 🚧 (needs integration)
│   │   └── OrderConfirmationScreen.tsx ⏳ (to be created)
│   └── redux/
│       ├── slices/
│       │   ├── cartSlice.ts ✅
│       │   └── productSlice.ts ✅
│       └── thunks/
│           ├── cartThunks.ts ✅
│           └── productThunks.ts ✅

backend/
├── src/
│   ├── models/
│   │   ├── Cart.js ✅
│   │   └── Order.js ✅
│   ├── controllers/
│   │   ├── cartController.js ✅
│   │   └── orderController.js ✅
│   ├── services/
│   │   ├── cartService.js ✅
│   │   └── orderService.js ✅
│   └── routes/
│       ├── cartRoutes.js ✅
│       └── orderRoutes.js ✅
```

---

## 🔌 API Endpoints

### Cart API (`/api/v1/cart`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/cart` | Get user's cart | ✅ |
| POST | `/cart/items` | Add item to cart | ✅ |
| PATCH | `/cart/items/:itemId` | Update item quantity | ✅ |
| DELETE | `/cart/items/:itemId` | Remove item from cart | ✅ |
| DELETE | `/cart` | Clear entire cart | ✅ |
| POST | `/cart/coupon` | Apply coupon | ✅ |
| DELETE | `/cart/coupon` | Remove coupon | ✅ |
| GET | `/cart/validate` | Validate cart | ✅ |

### Order API (`/api/v1/orders`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/orders/from-cart` | Create order from cart | ✅ NEW |
| GET | `/orders/user` | Get user's orders | ✅ |
| GET | `/orders/:id` | Get order by ID | ✅ |
| POST | `/orders` | Create order manually | ✅ |
| PATCH | `/orders/:id/status` | Update order status | ✅ |
| DELETE | `/orders/:id` | Cancel order | ✅ |

---

## 🎬 Step-by-Step Implementation

### Step 1: Add Item to Cart ✅

**Frontend (PizzaDetailsScreen.tsx):**
```typescript
await dispatch(addToCartThunk({
    productId: product._id,
    quantity,
    size: 'large',
    customToppings: [
        { name: 'Extra Cheese', category: 'cheese', price: 1.99 }
    ],
})).unwrap();
```

**Backend (cartController.js):**
```javascript
// POST /api/v1/cart/items
export const addItemToCart = async (req, res, next) => {
    const userId = req.user.id;
    const cart = await cartService.addItemToCart(userId, req.body);
    sendResponse(res, 200, 'Item added to cart', cart);
};
```

**Database (Cart.js):**
```javascript
// Cart item saved with:
{
    product: productId,
    productSnapshot: { name, imageUrl, basePrice, category },
    quantity: 1,
    size: 'large',
    customToppings: [{ name, category, price }],
    subtotal: 15.99
}
```

---

### Step 2: View Cart ✅

**Frontend (CartScreen.tsx):**
```typescript
// On mount: Fetch cart
useEffect(() => {
    dispatch(fetchCartThunk());
}, []);

// Display cart items
const cartItems = useSelector(selectCartItems);
const totals = useSelector(selectCartTotals);

// Render:
- Item list with quantities
- Subtotal, tax, delivery fee, discount
- Total amount
- "Place Order" button
```

**Backend (cartController.js):**
```javascript
// GET /api/v1/cart
export const getCart = async (req, res, next) => {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);
    sendResponse(res, 200, 'Cart retrieved', cart);
};
```

---

### Step 3: Navigate to Checkout ✅

**Frontend (CartScreen.tsx):**
```typescript
const proceedToCheckout = () => {
    if (cartItems.length === 0) {
        Alert.alert('Empty Cart', 'Please add items first');
        return;
    }
    navigation.navigate('Checkout', { cartTotal: totals.total });
};
```

---

### Step 4: Fill Checkout Details 🚧

**Frontend (CheckoutScreen.tsx):**

**Current State:** File exists with static UI but needs integration.

**Required Updates:**
```typescript
import { createOrderFromCart } from '../../../services/orderService';

const handlePlaceOrder = async () => {
    const orderData = {
        deliveryAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            pincode: '10001',
            instructions: 'Ring doorbell'
        },
        contactPhone: '1234567890',
        paymentMethod: 'cash', // or 'card', 'upi', 'wallet'
        orderInstructions: 'Extra napkins please'
    };

    try {
        const order = await createOrderFromCart(orderData);
        
        // Navigate to confirmation
        navigation.reset({
            index: 0,
            routes: [
                { name: 'Main' },
                { 
                    name: 'OrderConfirmation', 
                    params: { 
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        estimatedTime: order.estimatedDeliveryTime
                    }
                }
            ]
        });
    } catch (error) {
        Alert.alert('Error', error.message);
    }
};
```

---

### Step 5: Create Order from Cart ✅

**Frontend (orderService.ts):**
```typescript
export const createOrderFromCart = async (params: CreateOrderParams): Promise<Order> => {
    const response = await apiClient.post('/orders/from-cart', params);
    return response.data.data;
};
```

**Backend (orderController.js):**
```javascript
// POST /api/v1/orders/from-cart
export const createOrderFromCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderData = req.body;

        const order = await orderService.createOrderFromCart(userId, orderData);

        // Emit real-time notification
        emitNewOrder(order);

        sendResponse(res, 201, 'Order placed successfully', order);
    } catch (error) {
        next(error);
    }
};
```

**Backend (orderService.js):**
```javascript
export const createOrderFromCart = async (userId, orderData) => {
    // 1. Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    // 2. Create order using Order model's static method
    const order = await Order.createFromCart(cart, userId, orderData);

    // 3. Clear cart after successful order
    await cart.clearCart();

    // 4. Populate order details
    await order.populate('user items.product');

    return order;
};
```

**Backend (Order.js model):**
```javascript
orderSchema.statics.createFromCart = async function (cart, userId, additionalData) => {
    const orderNumber = await this.generateOrderNumber(); // e.g., "ORD-ABC123"

    const order = await this.create({
        orderNumber,
        user: userId,
        items: cart.items.map(item => ({
            product: item.product._id,
            productSnapshot: item.productSnapshot,
            quantity: item.quantity,
            size: item.size,
            selectedPrice: item.selectedPrice,
            customToppings: item.customToppings,
            subtotal: item.subtotal
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee,
        discount: cart.discount,
        totalAmount: cart.total,
        appliedCoupon: cart.appliedCoupon,
        deliveryAddress: additionalData.deliveryAddress,
        contactPhone: additionalData.contactPhone,
        paymentMethod: additionalData.paymentMethod,
        orderInstructions: additionalData.orderInstructions,
        estimatedDeliveryTime: 30, // minutes
        status: 'pending'
    });

    return order;
};
```

---

### Step 6: Order Confirmation ⏳

**Frontend (OrderConfirmationScreen.tsx):**

**TO BE CREATED:**
```typescript
export default function OrderConfirmationScreen() {
    const route = useRoute();
    const { orderId, orderNumber, estimatedTime, totalAmount } = route.params;

    return (
        <View style={styles.container}>
            {/* Success Icon */}
            <MaterialIcons name="check-circle" size={100} color="#0C7C59" />
            
            {/* Order Number */}
            <Text style={styles.title}>Order Placed Successfully!</Text>
            <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
            
            {/* Estimated Time */}
            <Text style={styles.estimatedTime}>
                Estimated Delivery: {estimatedTime} minutes
            </Text>
            
            {/* Total Amount */}
            <Text style={styles.total}>
                Total: ₹{(totalAmount * 83).toFixed(0)}
            </Text>
            
            {/* Actions */}
            <TouchableOpacity style={styles.trackButton}>
                <Text>Track Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.homeButton}>
                <Text>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}
```

---

## 🔥 Real-time Updates (Socket.IO)

**When order is created:**
```javascript
// Backend emits
emitNewOrder(order);

// Sends to:
- Admin dashboard (new order notification)
- Delivery agents (new order available)
- Customer (order confirmation)
```

**Event Structure:**
```javascript
{
    event: 'new-order',
    data: {
        orderId: '...',
        orderNumber: 'ORD-ABC123',
        customer: { name, phone },
        items: [...],
        total: 25.99,
        deliveryAddress: {...}
    }
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   MenuScreen   │
│   (Browse)     │
└───────┬────────┘
        │
        ↓ Click Pizza
┌─────────────────┐
│ PizzaDetailsScreen│
│  (Customize)      │
└───────┬───────────┘
        │
        ↓ Add to Cart (dispatch addToCartThunk)
┌─────────────────┐
│    Redux Store   │
│   (cartSlice)    │
└───────┬───────────┘
        │
        ↓ API Call
┌─────────────────┐
│  Backend API     │
│  POST /cart/items│
└───────┬───────────┘
        │
        ↓ Save to DB
┌─────────────────┐
│   MongoDB        │
│   Cart Collection│
└───────┬───────────┘
        │
        ↓ User clicks "Place Order"
┌─────────────────┐
│   CartScreen     │
│  (View Cart)     │
└───────┬───────────┘
        │
        ↓ Navigate to Checkout
┌─────────────────┐
│ CheckoutScreen   │
│ (Enter Details)  │
└───────┬───────────┘
        │
        ↓ Place Order (createOrderFromCart)
┌─────────────────┐
│  Backend API     │
│  POST /orders/   │
│    from-cart     │
└───────┬───────────┘
        │
        ↓ Create Order + Clear Cart
┌─────────────────┐
│   MongoDB        │
│ Order Collection │
│ Cart = []        │
└───────┬───────────┘
        │
        ↓ Navigate to Confirmation
┌─────────────────┐
│OrderConfirmation │
│  (Success!)      │
└──────────────────┘
```

---

## 🧪 Testing Steps

### Manual Testing:

1. **Add to Cart:**
   ```
   ✅ Add pizza with size and toppings
   ✅ Verify cart count updates
   ✅ Check backend cart in MongoDB
   ```

2. **View Cart:**
   ```
   ✅ See all items with correct prices
   ✅ Update quantities
   ✅ Apply coupon code
   ✅ Verify totals calculation
   ```

3. **Checkout:**
   ```
   ✅ Fill delivery address
   ✅ Enter phone number
   ✅ Select payment method
   ✅ Add order instructions
   ```

4. **Place Order:**
   ```
   ✅ Order created in database
   ✅ Cart cleared automatically
   ✅ Order number generated
   ✅ Socket.IO notification sent
   ```

5. **Confirmation:**
   ```
   ✅ Show order number
   ✅ Display estimated time
   ✅ Show total amount
   ✅ Provide track order button
   ```

---

## 🐛 Common Issues & Solutions

### Issue 1: Cart Not Saving
**Problem:** Items added but not appearing in cart

**Solution:**
```javascript
// Check authentication token
console.log('Token:', await AsyncStorage.getItem('@auth_token'));

// Verify userId in backend
console.log('User ID:', req.user.id);
```

### Issue 2: Order Creation Fails
**Problem:** "Cart is empty" error

**Solution:**
```javascript
// Verify cart has items
const cart = await Cart.findOne({ user: userId });
console.log('Cart items:', cart.items.length);

// Check cart not expired
console.log('Cart expires:', cart.expiresAt);
```

### Issue 3: Navigation Not Working
**Problem:** Screen not navigating after order

**Solution:**
```typescript
// Use reset navigation to clear stack
navigation.reset({
    index: 0,
    routes: [
        { name: 'Main' },
        { name: 'OrderConfirmation', params: {...} }
    ]
});
```

---

## 📝 Next Steps

### Immediate (Priority 1):
1. ✅ Fix CartScreen to navigate to Checkout with total
2. 🚧 Update CheckoutScreen to integrate with orderService
3. ⏳ Create OrderConfirmationScreen
4. ⏳ Add Checkout and OrderConfirmation to navigation config
5. ⏳ Test complete flow end-to-end

### Short Term (Priority 2):
1. Create OrderHistoryScreen to view past orders
2. Create OrderDetailsScreen to view single order
3. Add order tracking functionality
4. Implement order cancellation
5. Add order rating/review

### Long Term (Priority 3):
1. Add multiple delivery addresses
2. Save payment methods
3. Implement real payment gateway
4. Add order notifications
5. Create admin order management panel

---

## 🎯 Success Criteria

- [ ] User can add items to cart ✅
- [ ] Cart persists across app restarts ✅
- [ ] User can update cart quantities ✅
- [ ] User can apply coupon codes ✅
- [ ] User can proceed to checkout ✅
- [ ] User can enter delivery details 🚧
- [ ] Order is created from cart ✅
- [ ] Cart is cleared after order ✅
- [ ] User sees order confirmation ⏳
- [ ] Real-time notifications sent ✅
- [ ] Order saved in database ✅
- [ ] Order tracking available ⏳

---

## 📞 Support

For issues or questions:
1. Check backend logs: `npm run dev` in backend folder
2. Check frontend console: React Native debugger
3. Verify MongoDB data: Use MongoDB Compass
4. Test API directly: Use Postman/Thunder Client

---

*Last Updated: October 12, 2025*
