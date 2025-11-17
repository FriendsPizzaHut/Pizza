# Razorpay Online Payment Integration

## ✅ Integration Complete

Razorpay online payment has been successfully integrated with **LIVE credentials**.

---

## 🔑 Credentials Configured

### Backend (.env)
```bash
RAZORPAY_KEY_ID=rzp_live_Rc35nKtIY6yf9J
RAZORPAY_KEY_SECRET=PpGUEpcZ2gbyDfSs1Qg7wX76
```

### Frontend (.env)
```bash
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_live_Rc35nKtIY6yf9J
```

⚠️ **Note**: These are LIVE credentials. Real money transactions will occur!

---

## 🏗️ Architecture

### Backend Components

1. **Razorpay Service** (`/backend/src/services/razorpayService.js`)
   - Create Razorpay orders
   - Verify payment signatures
   - Handle webhooks
   - Process refunds
   - Fetch payment/order details

2. **Razorpay Controller** (`/backend/src/controllers/razorpayController.js`)
   - Create order endpoint
   - Verify payment endpoint
   - Webhook handler
   - Payment status endpoint

3. **Razorpay Routes** (`/backend/src/routes/razorpayRoutes.js`)
   - `POST /api/v1/payments/razorpay/create-order` - Create payment order
   - `POST /api/v1/payments/razorpay/verify` - Verify payment
   - `POST /api/v1/payments/razorpay/webhook` - Webhook handler
   - `GET /api/v1/payments/razorpay/status/:orderId` - Get payment status

### Frontend Components

1. **Razorpay Service** (`/frontend/src/services/razorpayService.ts`)
   - Create Razorpay order
   - Open Razorpay checkout
   - Verify payment
   - Handle payment status

2. **Payment Integration**
   - Uses `react-native-razorpay` package
   - Native checkout experience
   - Automatic signature verification

---

## 💳 Payment Flow

### Step-by-Step Process

1. **User Places Order**
   ```
   User → Selects items → Adds to cart → Proceeds to checkout
   ```

2. **Create Razorpay Order (Backend)**
   ```
   Frontend → POST /api/v1/payments/razorpay/create-order
   Backend → Creates order in Razorpay → Returns order ID
   ```

3. **Open Payment Checkout (Frontend)**
   ```
   Frontend → Opens Razorpay native checkout
   User → Enters payment details (Card/UPI/Netbanking/Wallet)
   Razorpay → Processes payment
   ```

4. **Payment Success**
   ```
   Razorpay → Returns payment_id, order_id, signature
   Frontend → POST /api/v1/payments/razorpay/verify
   Backend → Verifies signature → Updates order status
   ```

5. **Order Confirmation**
   ```
   Backend → Updates order status to 'paid'
   Backend → Sends confirmation notification
   Frontend → Shows success message
   ```

---

## 🧪 Testing Guide

### Test the Integration

#### 1. Create a Test Order
```bash
# Using curl or Postman
POST http://localhost:5000/api/v1/payments/razorpay/create-order
Headers: {
  "Authorization": "Bearer YOUR_AUTH_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "orderId": "ORDER_ID_FROM_DATABASE",
  "amount": 500
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "razorpayOrderId": "order_xxxxxxxxxxxxx",
    "amount": 50000,
    "currency": "INR",
    "receipt": "ORDER_ID",
    "status": "created",
    "key": "rzp_live_Rc35nKtIY6yf9J"
  }
}
```

#### 2. Test Payment in App
1. Open the mobile app
2. Add items to cart
3. Proceed to checkout
4. Select "Pay Online" or "Razorpay"
5. Razorpay checkout will open
6. Complete payment using:
   - **Test Cards** (if in test mode):
     - Card: 4111 1111 1111 1111
     - CVV: Any 3 digits
     - Expiry: Any future date
   - **Live Cards** (if in live mode):
     - Use real payment methods
     - Real money will be deducted!

#### 3. Verify Payment Status
```bash
GET http://localhost:5000/api/v1/payments/razorpay/status/:orderId
Headers: {
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

---

## 🔐 Security Features

### Backend Security
✅ **Payment Signature Verification**: Every payment is verified using HMAC SHA256
✅ **Order Ownership Check**: Users can only pay for their own orders
✅ **Amount Validation**: Payment amount must match order total
✅ **Duplicate Payment Prevention**: Blocks multiple payments for same order
✅ **Webhook Signature Verification**: Validates webhook authenticity

### Frontend Security
✅ **Secure API Communication**: All requests use HTTPS in production
✅ **Token Authentication**: JWT tokens for API authorization
✅ **Payment Data Encryption**: Razorpay handles all sensitive data
✅ **No Card Storage**: Card details never stored in app/backend

---

## 📱 Supported Payment Methods

Razorpay supports multiple payment methods:

- 💳 **Credit Cards**: Visa, Mastercard, American Express, Diners Club, RuPay
- 💳 **Debit Cards**: All major banks
- 📱 **UPI**: Google Pay, PhonePe, Paytm, BHIM
- 🏦 **Net Banking**: 50+ banks
- 💰 **Wallets**: Paytm, PhonePe, Amazon Pay, Mobikwik, Freecharge
- 💵 **EMI**: Credit/Debit card EMI, Cardless EMI
- 📲 **Buy Now Pay Later**: LazyPay, Simpl, ZestMoney

---

## 🔔 Webhooks (Optional Enhancement)

Webhooks allow Razorpay to notify your backend about payment events in real-time.

### Setup Webhooks

1. **Go to Razorpay Dashboard**
   - https://dashboard.razorpay.com/app/webhooks

2. **Create Webhook**
   - URL: `https://your-backend-url.com/api/v1/payments/razorpay/webhook`
   - Events to track:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
     - `refund.created`

3. **Get Webhook Secret**
   - Copy the webhook secret
   - Add to backend `.env`:
     ```bash
     RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
     ```

### Webhook Benefits
- ✅ Real-time payment updates
- ✅ Handle failed payments
- ✅ Automatic refund notifications
- ✅ Better reliability (no polling needed)

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Payment gateway not configured"
**Solution**: Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in backend `.env`

#### 2. "Payment signature verification failed"
**Solution**: 
- Ensure `RAZORPAY_KEY_SECRET` is correct
- Check if payment response is being sent properly from frontend

#### 3. "Razorpay checkout not opening"
**Solution**:
- Verify `EXPO_PUBLIC_RAZORPAY_KEY_ID` in frontend `.env`
- Check if `react-native-razorpay` is properly installed
- Run `npx expo prebuild` to rebuild native modules

#### 4. "Payment successful but order not updated"
**Solution**:
- Check backend logs for verification errors
- Ensure `/verify` endpoint is being called after payment
- Verify database connection

#### 5. Android build issues
**Solution**:
```bash
cd /home/naitik2408/Contribution/pizza2/frontend
npx expo prebuild --clean
cd android && ./gradlew clean
cd .. && npx expo run:android
```

---

## 📊 Payment Tracking

### Database Models

**Payment Model** (`/backend/src/models/Payment.js`)
```javascript
{
  order: ObjectId,
  user: ObjectId,
  amount: Number,
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded',
  paymentMethod: 'razorpay' | 'cash' | 'manual',
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionId: String,
  paymentDetails: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Query Payments
```javascript
// Get all Razorpay payments
const payments = await Payment.find({ 
  paymentMethod: 'razorpay',
  paymentStatus: 'completed'
});

// Get payment by order ID
const payment = await Payment.findOne({ order: orderId });

// Get user's payment history
const userPayments = await Payment.find({ user: userId })
  .populate('order')
  .sort({ createdAt: -1 });
```

---

## 🚀 Production Checklist

Before going live with real payments:

- [x] **Switch to Live Keys**: Done! Using `rzp_live_*` keys
- [x] **Backend Configuration**: Live keys added to backend `.env`
- [x] **Frontend Configuration**: Live key added to frontend `.env`
- [ ] **KYC Verification**: Ensure Razorpay account is KYC verified
- [ ] **Test in Production**: Test with small amounts first
- [ ] **Enable Webhooks**: Set up webhooks for reliability
- [ ] **SSL Certificate**: Ensure backend has valid HTTPS certificate
- [ ] **Error Monitoring**: Set up error tracking (Sentry, LogRocket)
- [ ] **Payment Limits**: Configure daily/transaction limits in Razorpay dashboard
- [ ] **Refund Policy**: Define and implement refund workflows
- [ ] **Customer Support**: Prepare team to handle payment issues

---

## 💰 Transaction Fees

Razorpay charges transaction fees:
- **Domestic Cards**: 2% per transaction
- **International Cards**: 3% per transaction
- **UPI**: 0% (for first ₹2000, then 0.3-0.5%)
- **Net Banking**: 0% for first ₹2000, then 2%
- **Wallets**: 2% per transaction

*Note: Fees may vary. Check your Razorpay pricing plan.*

---

## 📞 Support & Resources

### Razorpay Resources
- **Dashboard**: https://dashboard.razorpay.com
- **Documentation**: https://razorpay.com/docs
- **Support**: support@razorpay.com
- **Status Page**: https://status.razorpay.com

### Integration Documentation
- **Razorpay Node.js SDK**: https://github.com/razorpay/razorpay-node
- **React Native Package**: https://www.npmjs.com/package/react-native-razorpay
- **Payment Gateway API**: https://razorpay.com/docs/api/payments

---

## ✨ Additional Features (Future Enhancements)

### Recommended Enhancements

1. **Payment Links**
   - Generate payment links for orders
   - Share via WhatsApp/Email/SMS

2. **Recurring Payments**
   - Subscription-based orders
   - Auto-pay for regular customers

3. **Split Payments**
   - Multiple payment methods for one order
   - Partial payments

4. **Smart Routing**
   - Optimize payment success rates
   - Route to best payment gateway

5. **Payment Analytics**
   - Success rate tracking
   - Popular payment methods
   - Revenue analytics dashboard

---

## 🎉 Summary

✅ **Razorpay is now integrated with LIVE credentials**
✅ **Backend configured and ready**
✅ **Frontend configured and ready**
✅ **All endpoints tested and working**
✅ **Payment flow documented**
✅ **Security measures in place**

**You can now accept real online payments!** 💳

---

## 🔄 Quick Start Commands

### Backend
```bash
cd /home/naitik2408/Contribution/pizza2/backend
npm start  # Server should show Razorpay configured ✓
```

### Frontend
```bash
cd /home/naitik2408/Contribution/pizza2/frontend
npx expo start
```

### Test Payment Flow
1. Launch app
2. Add items to cart (₹100+)
3. Proceed to checkout
4. Select online payment
5. Complete payment
6. Verify order status updated

---

**Need Help?** Check the troubleshooting section or contact your development team.
