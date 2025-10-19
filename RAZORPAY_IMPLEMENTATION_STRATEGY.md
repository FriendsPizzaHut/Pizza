# 💳 Razorpay Payment Integration Strategy

## 📋 Table of Contents
1. [Current Setup Analysis](#current-setup-analysis)
2. [Implementation Strategy](#implementation-strategy)
3. [Phase-by-Phase Plan](#phase-by-phase-plan)
4. [Database Schema Updates](#database-schema-updates)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Testing Strategy](#testing-strategy)

---

## 🔍 Current Setup Analysis

### ✅ **Already Implemented:**

#### **Frontend:**
- ✅ `react-native-razorpay` package installed (v2.3.0)
- ✅ Razorpay plugin configured in `app.config.js`
- ✅ Razorpay Android plugin setup in `plugins/withRazorpay.js`
- ✅ Payment method selection UI in `CheckoutScreen.tsx`
- ✅ EAS Build configuration (no rebuild needed)

#### **Backend:**
- ✅ Payment model exists (`Payment.js`) with fields:
  - `order`, `user`, `amount`, `paymentMethod`
  - `paymentStatus` (pending, completed, failed)
  - `transactionId` (unique, sparse)
  - `collectionMethod` (for COD tracking)
- ✅ Payment controller and service layer
- ✅ Payment validators with razorpay field support
- ✅ Middleware validation schemas with razorpay fields

#### **Current Payment Flow:**
```
Customer selects payment method → Order placed with paymentMethod
↓
If COD: Order status → awaiting_payment → Delivery agent collects → delivered
If Online: Currently just saved as 'card'/'upi'/'wallet' without actual payment
```

### ⚠️ **Missing Implementation:**

1. **Backend:**
   - Razorpay SDK not installed (`razorpay` npm package)
   - No Razorpay service layer for order creation
   - No payment verification logic
   - No webhook handlers for payment events
   - No Razorpay credentials configuration

2. **Frontend:**
   - No Razorpay checkout integration
   - No payment success/failure handling
   - No payment verification flow

3. **Database:**
   - Missing Razorpay-specific fields in Payment model
   - No order-payment linking for online payments

---

## 🎯 Implementation Strategy

### **Payment Flow Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER CHECKOUT SCREEN                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
         ┌──────────────────────────────────────┐
         │   Selects Payment Method             │
         │   • Cash on Delivery (COD)           │
         │   • Card/UPI/Wallet (Razorpay)       │
         └────────────┬─────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    COD  │                         │  ONLINE PAYMENT
         ▼                         ▼
┌─────────────────┐    ┌──────────────────────┐
│ Order Created   │    │ 1. Create Order      │
│ paymentStatus:  │    │    (with pending     │
│ 'pending'       │    │     payment)         │
│                 │    │                      │
│ Delivery →      │    │ 2. Create Razorpay   │
│ Collect Payment │    │    Order             │
└─────────────────┘    │    (Backend)         │
                       │                      │
                       │ 3. Open Razorpay     │
                       │    Checkout          │
                       │    (Frontend)        │
                       │                      │
                       │ 4. Customer Pays     │
                       │                      │
                       │ 5. Verify Payment    │
                       │    (Backend)         │
                       │                      │
                       │ 6. Update Order      │
                       │    paymentStatus:    │
                       │    'completed'       │
                       └──────────────────────┘
```

### **Key Decisions:**

1. **Payment Timing:** Create order BEFORE payment (industry standard)
   - Allows order tracking even if payment fails
   - Enables payment retry functionality
   - Better for inventory management

2. **Razorpay Order Creation:** Backend creates Razorpay orders
   - More secure (API key not exposed)
   - Better control and validation
   - Enables webhooks for async updates

3. **Payment Verification:** Always verify on backend
   - Prevents payment tampering
   - Signature verification ensures authenticity
   - Updates database only after verification

4. **COD Flow:** Unchanged (already working)
   - Keeps existing delivery agent payment collection
   - Payment record created after cash collection

---

## 📝 Phase-by-Phase Plan

### **Phase 1: Backend Setup** (30 mins)

#### **Step 1.1: Install Razorpay SDK**
```bash
cd backend
npm install razorpay
```

#### **Step 1.2: Environment Configuration**
Add to `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

#### **Step 1.3: Update Payment Model**
Add Razorpay-specific fields to `Payment.js`:
```javascript
razorpayOrderId: {
    type: String,
    sparse: true,
    trim: true,
},
razorpayPaymentId: {
    type: String,
    sparse: true,
    trim: true,
},
razorpaySignature: {
    type: String,
    trim: true,
},
paymentGateway: {
    type: String,
    enum: ['razorpay', 'cash', 'manual'],
    default: 'cash',
},
```

#### **Step 1.4: Create Razorpay Service**
File: `backend/src/services/razorpayService.js`

**Functions:**
- `createRazorpayOrder(orderData)` - Creates Razorpay order
- `verifyPaymentSignature(paymentData)` - Verifies payment signature
- `fetchPaymentDetails(paymentId)` - Fetches payment from Razorpay
- `initiateRefund(paymentId, amount)` - Refund functionality

#### **Step 1.5: Create Payment Processing Controller**
File: `backend/src/controllers/razorpayController.js`

**Endpoints:**
- `POST /api/v1/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/v1/payments/razorpay/verify` - Verify payment
- `POST /api/v1/payments/razorpay/webhook` - Handle webhooks

#### **Step 1.6: Add Routes**
File: `backend/src/routes/razorpayRoutes.js`

---

### **Phase 2: Order Creation Flow Update** (20 mins)

#### **Step 2.1: Modify Order Service**
Update `backend/src/services/orderService.js`:
- Add `createOrderWithPendingPayment()` function
- Set `paymentStatus: 'pending'` for online payments
- Set `paymentStatus: 'pending'` for COD (changes to 'completed' after delivery)

#### **Step 2.2: Update Order Controller**
Modify `createOrderFromCart()`:
- Check payment method
- If online (card/upi/wallet): Keep paymentStatus as 'pending'
- Return order with `requiresPayment: true` flag

---

### **Phase 3: Frontend Integration** (45 mins)

#### **Step 3.1: Create Razorpay Service**
File: `frontend/src/services/razorpayService.ts`

**Functions:**
- `openRazorpayCheckout(orderDetails, razorpayOrder)` - Opens Razorpay UI
- `verifyPayment(paymentDetails)` - Sends verification to backend
- `handlePaymentSuccess(response)` - Success callback
- `handlePaymentFailure(response)` - Failure callback

#### **Step 3.2: Update Checkout Screen**
File: `frontend/src/screens/customer/menu/CheckoutScreen.tsx`

**Changes:**
1. Modify `placeOrder()` function:
   ```typescript
   const placeOrder = async () => {
       // Create order first
       const order = await dispatch(placeOrderFromCartThunk(orderData)).unwrap();
       
       // Check if online payment
       if (order.requiresPayment) {
           // Create Razorpay order
           const rzpOrder = await createRazorpayOrder(order._id);
           
           // Open Razorpay checkout
           await openRazorpayCheckout(order, rzpOrder);
       } else {
           // COD - Show success message
           showOrderSuccessMessage(order);
       }
   };
   ```

2. Add payment success/failure screens or modals

#### **Step 3.3: Add Environment Variables**
Add to `frontend/app.config.js` (already configured):
```javascript
razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxx'
```

---

### **Phase 4: Payment Verification** (30 mins)

#### **Step 4.1: Backend Verification Logic**
File: `backend/src/services/razorpayService.js`

```javascript
import crypto from 'crypto';

export const verifyPaymentSignature = (paymentData) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    
    return generatedSignature === razorpay_signature;
};
```

#### **Step 4.2: Update Order After Verification**
- Change `paymentStatus` from 'pending' to 'completed'
- Save payment record with Razorpay IDs
- Emit Socket.IO event to admin
- Send push notification to admin

---

### **Phase 5: Webhook Integration** (Optional - 30 mins)

#### **Purpose:**
Handle async payment updates (for UPI intent, netbanking delays)

#### **Implementation:**
File: `backend/src/controllers/razorpayController.js`

```javascript
export const handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const isValid = verifyWebhookSignature(req.body, signature, secret);
    
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    
    switch (event) {
        case 'payment.captured':
            await handlePaymentCaptured(req.body.payload);
            break;
        case 'payment.failed':
            await handlePaymentFailed(req.body.payload);
            break;
        case 'refund.processed':
            await handleRefundProcessed(req.body.payload);
            break;
    }
    
    res.status(200).json({ received: true });
};
```

---

## 🗄️ Database Schema Updates

### **Payment Model Updates:**

```javascript
// File: backend/src/models/Payment.js

const paymentSchema = new mongoose.Schema({
    // Existing fields...
    order: { type: ObjectId, ref: 'Order', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'upi', 'cod', 'cash', 'wallet'] },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'] },
    transactionId: { type: String, sparse: true },
    
    // NEW RAZORPAY FIELDS
    razorpayOrderId: {
        type: String,
        sparse: true,
        trim: true,
        index: true, // For quick lookups
    },
    razorpayPaymentId: {
        type: String,
        sparse: true,
        trim: true,
        index: true,
    },
    razorpaySignature: {
        type: String,
        trim: true,
    },
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'cash', 'manual'],
        default: 'cash',
    },
    // Payment metadata (optional)
    paymentMetadata: {
        method: String,        // card, netbanking, upi, wallet
        bank: String,          // HDFC, SBI, etc.
        wallet: String,        // paytm, phonepe, etc.
        vpa: String,           // UPI ID (if UPI payment)
        card_id: String,       // Razorpay card ID
        acquirer_data: Object, // Bank reference number
    },
    // Refund tracking (optional)
    refundStatus: {
        type: String,
        enum: ['none', 'pending', 'processed', 'failed'],
        default: 'none',
    },
    refundId: {
        type: String,
        sparse: true,
    },
    refundAmount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Add indexes
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ paymentGateway: 1 });
```

### **Order Model Updates (Optional):**

No changes needed to Order model - existing fields are sufficient:
- `paymentStatus` (already exists)
- `paymentMethod` (already exists)

---

## 🛠️ API Endpoints

### **New Razorpay Endpoints:**

#### **1. Create Razorpay Order**
```
POST /api/v1/payments/razorpay/create-order
```
**Request:**
```json
{
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 599
}
```
**Response:**
```json
{
    "success": true,
    "data": {
        "razorpayOrderId": "order_MxXXXXXXXXXXXX",
        "amount": 59900,
        "currency": "INR",
        "key": "rzp_test_xxxxxxxxx"
    }
}
```

#### **2. Verify Payment**
```
POST /api/v1/payments/razorpay/verify
```
**Request:**
```json
{
    "orderId": "507f1f77bcf86cd799439011",
    "razorpay_order_id": "order_MxXXXXXXXXXXXX",
    "razorpay_payment_id": "pay_MxXXXXXXXXXXXX",
    "razorpay_signature": "abc123def456..."
}
```
**Response:**
```json
{
    "success": true,
    "message": "Payment verified successfully",
    "data": {
        "order": { /* order object */ },
        "payment": { /* payment object */ }
    }
}
```

#### **3. Webhook Handler**
```
POST /api/v1/payments/razorpay/webhook
```
**Headers:**
```
x-razorpay-signature: signature_here
```

#### **4. Get Payment Status**
```
GET /api/v1/payments/razorpay/status/:orderId
```
**Response:**
```json
{
    "success": true,
    "data": {
        "paymentStatus": "completed",
        "razorpayPaymentId": "pay_MxXXXXXXXXXXXX",
        "amount": 599,
        "method": "upi"
    }
}
```

---

## 💻 Frontend Integration

### **Razorpay Checkout Integration:**

#### **File: `frontend/src/services/razorpayService.ts`**

```typescript
import RazorpayCheckout from 'react-native-razorpay';
import apiClient from '../api/apiClient';
import Constants from 'expo-constants';

interface RazorpayOrder {
    razorpayOrderId: string;
    amount: number;
    currency: string;
    key: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    user: {
        name: string;
        email?: string;
        phone: string;
    };
}

export const createRazorpayOrder = async (orderId: string, amount: number) => {
    try {
        const response = await apiClient.post('/payments/razorpay/create-order', {
            orderId,
            amount,
        });
        
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
};

export const openRazorpayCheckout = async (
    order: Order,
    razorpayOrder: RazorpayOrder
): Promise<any> => {
    const options = {
        description: `Order #${order.orderNumber}`,
        image: 'https://your-logo-url.com/logo.png',
        currency: razorpayOrder.currency,
        key: razorpayOrder.key,
        amount: razorpayOrder.amount, // Amount in paise
        name: 'Friends Pizza Hut',
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
            name: order.user.name,
            email: order.user.email || '',
            contact: order.user.phone,
        },
        theme: {
            color: '#E23744', // Your app theme color
        },
        retry: {
            enabled: true,
            max_count: 3,
        },
        timeout: 300, // 5 minutes
    };

    return new Promise((resolve, reject) => {
        RazorpayCheckout.open(options)
            .then((data: any) => {
                resolve(data);
            })
            .catch((error: any) => {
                reject(error);
            });
    });
};

export const verifyPayment = async (paymentData: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) => {
    try {
        const response = await apiClient.post('/payments/razorpay/verify', paymentData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
};

export const getPaymentStatus = async (orderId: string) => {
    try {
        const response = await apiClient.get(`/payments/razorpay/status/${orderId}`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
};
```

#### **Updated Checkout Screen Logic:**

```typescript
// In CheckoutScreen.tsx

import { createRazorpayOrder, openRazorpayCheckout, verifyPayment } from '../../../services/razorpayService';

const placeOrder = async () => {
    if (isPlacingOrder) return;

    // Validation...
    
    setIsPlacingOrder(true);

    try {
        const selectedPay = paymentMethods.find(p => p.id === selectedPayment);
        const isOnlinePayment = selectedPay?.type !== 'cash';

        // Step 1: Create order in database
        const order = await dispatch(placeOrderFromCartThunk(orderData)).unwrap();
        
        // Step 2: Handle payment based on method
        if (isOnlinePayment) {
            // Online payment flow
            try {
                // Create Razorpay order
                const rzpOrder = await createRazorpayOrder(
                    order._id,
                    order.totalAmount
                );
                
                // Open Razorpay checkout
                const paymentResponse = await openRazorpayCheckout(order, rzpOrder);
                
                // Verify payment on backend
                await verifyPayment({
                    orderId: order._id,
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                });
                
                // Payment successful!
                showPaymentSuccessAlert(order);
                
            } catch (paymentError: any) {
                // Payment failed or cancelled
                console.error('Payment error:', paymentError);
                
                Alert.alert(
                    'Payment Failed',
                    'Your order is created but payment failed. You can retry payment from order details.',
                    [
                        {
                            text: 'Retry Payment',
                            onPress: () => {
                                // Navigate to order details with retry option
                                navigation.navigate('Orders');
                            }
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        }
                    ]
                );
            }
        } else {
            // COD flow (existing)
            showOrderSuccessAlert(order);
        }
        
    } catch (error: any) {
        // Order creation failed
        console.error('Order creation error:', error);
        Alert.alert('Error', error?.message || 'Failed to place order');
    } finally {
        setIsPlacingOrder(false);
    }
};

const showPaymentSuccessAlert = (order: any) => {
    Alert.alert(
        'Payment Successful! 🎉',
        `Your payment has been received.\n\nOrder #${order.orderNumber}\nEstimated delivery: ${order.estimatedDeliveryTime} mins`,
        [
            {
                text: 'Track Order',
                onPress: () => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
                    });
                }
            }
        ]
    );
};

const showOrderSuccessAlert = (order: any) => {
    Alert.alert(
        'Order Placed! 🎉',
        `Your order #${order.orderNumber} has been successfully placed.\n\nEstimated delivery: ${order.estimatedDeliveryTime} mins`,
        [
            {
                text: 'Track Order',
                onPress: () => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
                    });
                }
            }
        ]
    );
};
```

---

## 🧪 Testing Strategy

### **Phase 1: Backend Testing**

#### **Test 1: Create Razorpay Order**
```bash
curl -X POST http://localhost:5000/api/v1/payments/razorpay/create-order \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "amount": 599
  }'
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "razorpayOrderId": "order_xxxxx",
        "amount": 59900,
        "currency": "INR"
    }
}
```

#### **Test 2: Payment Verification**
```bash
curl -X POST http://localhost:5000/api/v1/payments/razorpay/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "razorpay_signature": "signature_here"
  }'
```

### **Phase 2: Frontend Testing**

#### **Test Scenarios:**

1. **COD Order (Existing Flow):**
   - Select Cash on Delivery
   - Place order
   - Verify order created with `paymentStatus: 'pending'`
   - Verify no Razorpay checkout opens

2. **Card Payment:**
   - Select Credit/Debit Card
   - Place order
   - Verify Razorpay checkout opens
   - Complete test payment
   - Verify payment success alert
   - Verify order `paymentStatus: 'completed'`

3. **UPI Payment:**
   - Select UPI Payment
   - Place order
   - Razorpay opens
   - Pay via test UPI
   - Verify success

4. **Payment Cancellation:**
   - Select online payment
   - Place order
   - Cancel Razorpay checkout
   - Verify order exists with `paymentStatus: 'pending'`
   - Verify can retry payment

5. **Payment Failure:**
   - Use test card that fails
   - Verify failure handling
   - Verify order status remains pending

### **Phase 3: Integration Testing**

#### **End-to-End Flow:**
```
1. Customer adds items to cart
2. Goes to checkout
3. Selects card payment
4. Places order
5. Razorpay opens
6. Completes payment
7. Backend verifies payment
8. Order status updated
9. Admin receives notification
10. Customer sees success message
```

### **Phase 4: Webhook Testing**

Use Razorpay webhook simulator:
1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://your-domain.com/api/v1/payments/razorpay/webhook`
3. Test events:
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`

---

## 🔐 Security Considerations

### **1. API Key Protection:**
- ✅ Never commit keys to repository
- ✅ Use environment variables
- ✅ Different keys for test/production
- ✅ Key exposed in frontend is public key (safe)

### **2. Payment Verification:**
- ✅ Always verify on backend
- ✅ Use signature verification
- ✅ Never trust frontend payment status alone

### **3. Webhook Security:**
- ✅ Verify webhook signature
- ✅ Use separate webhook secret
- ✅ Implement IP whitelisting (optional)

### **4. Amount Validation:**
- ✅ Verify amount on backend matches order
- ✅ Prevent amount tampering

---

## 📊 Payment Flow Comparison

### **COD Flow (Existing):**
```
Order Created → paymentStatus: pending
    ↓
Order Confirmed → status: confirmed
    ↓
Order Ready → status: ready
    ↓
Out for Delivery → status: out_for_delivery
    ↓
Delivered → status: awaiting_payment
    ↓
Cash Collected → paymentStatus: completed, status: delivered
```

### **Online Payment Flow (New):**
```
Order Created → paymentStatus: pending
    ↓
Razorpay Checkout Opens
    ↓
Payment Completed → paymentStatus: completed
    ↓
Order Confirmed → status: confirmed
    ↓
Order Ready → status: ready
    ↓
Out for Delivery → status: out_for_delivery
    ↓
Delivered → status: delivered
```

---

## 📦 Implementation Checklist

### **Backend:**
- [ ] Install `razorpay` npm package
- [ ] Add environment variables
- [ ] Update Payment model
- [ ] Create razorpayService.js
- [ ] Create razorpayController.js
- [ ] Add razorpay routes
- [ ] Update order service for pending payments
- [ ] Add payment verification logic
- [ ] Implement webhook handler
- [ ] Test all endpoints

### **Frontend:**
- [ ] Create razorpayService.ts
- [ ] Update CheckoutScreen payment logic
- [ ] Add payment success/failure handling
- [ ] Add retry payment functionality
- [ ] Test Razorpay checkout UI
- [ ] Handle payment cancellation
- [ ] Test with different payment methods

### **Database:**
- [ ] Update Payment model schema
- [ ] Add migration script (if needed)
- [ ] Test with existing data

### **Testing:**
- [ ] Test COD flow (ensure not broken)
- [ ] Test card payment
- [ ] Test UPI payment
- [ ] Test wallet payment
- [ ] Test payment cancellation
- [ ] Test payment failure
- [ ] Test webhook events
- [ ] Test payment retry

### **Documentation:**
- [ ] Update API documentation
- [ ] Add Razorpay setup guide
- [ ] Document environment variables
- [ ] Add troubleshooting guide

---

## 🚀 Next Steps

1. **Review this strategy document**
2. **Confirm environment setup** (Razorpay account, test keys)
3. **Start with Phase 1** (Backend Setup)
4. **Test each phase** before moving to next
5. **Deploy webhook endpoint** (requires public URL)

---

## 📝 Notes

### **Razorpay Test Credentials:**
- Test Mode API Keys: Available in Razorpay Dashboard
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Test UPI: `success@razorpay` (always succeeds)
- Test UPI: `failure@razorpay` (always fails)

### **Important:**
- Always use test mode keys during development
- Never use production keys in test environment
- Production requires KYC and business verification
- Webhook requires HTTPS endpoint

---

## 📞 Support Resources

- **Razorpay Docs:** https://razorpay.com/docs/
- **React Native Integration:** https://razorpay.com/docs/payments/payment-gateway/react-native/
- **Webhook Guide:** https://razorpay.com/docs/webhooks/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/

---

**Ready to start implementation? Let's begin with Phase 1! 🎯**
