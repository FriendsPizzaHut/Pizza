# 🎉 Razorpay Integration - Complete Implementation Guide

## 📋 **Overview**

Your pizza delivery app is now **fully integrated with Razorpay payment gateway**! 🚀

Both backend and frontend are ready. You just need to add your Razorpay credentials when you create your account.

---

## ✅ **What's Been Implemented**

### **Backend (Phase 1)** ✅
1. ✅ Razorpay SDK installed
2. ✅ Payment model updated with Razorpay fields
3. ✅ Razorpay service layer created
4. ✅ API endpoints implemented:
   - Create Razorpay order
   - Verify payment
   - Get payment status
   - Webhook handler
5. ✅ Routes integrated with authentication & rate limiting
6. ✅ Security measures in place

### **Frontend (Phase 2)** ✅
1. ✅ Razorpay service created (`razorpayService.ts`)
2. ✅ CheckoutScreen updated with payment flow
3. ✅ Payment success/failure handlers
4. ✅ Razorpay config verified
5. ✅ Environment variable setup

---

## 🔑 **Setup Instructions (When You Get Razorpay Account)**

### **Step 1: Create Razorpay Account**
1. Go to: https://dashboard.razorpay.com/signup
2. Sign up with your email (free for test mode)
3. Verify your email
4. No KYC required for test mode!

### **Step 2: Get API Keys**
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (if not already generated)
4. You'll get:
   - **Key Id** (starts with `rzp_test_`)
   - **Key Secret** (click to reveal)

### **Step 3: Configure Backend**
Open `backend/.env` and update:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET (optional)
```

**Restart backend:**
```bash
cd backend
npm run dev
```

### **Step 4: Configure Frontend**
Create `frontend/.env` file (or copy from `.env.example`):
```env
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
```

**Rebuild the app** (required for environment variables):
```bash
cd frontend
npx expo prebuild --clean
npx expo run:android
# or
npx expo run:ios
```

---

## 🎯 **How It Works**

### **Complete Payment Flow:**

```
1. CUSTOMER JOURNEY:
   └─> Customer adds items to cart
   └─> Goes to checkout
   └─> Selects delivery address
   └─> Selects payment method:
        ├─> Cash on Delivery (COD) ──> Order placed directly
        └─> Card/UPI/Wallet (Razorpay) ──> Continues to step 2

2. ORDER CREATION:
   └─> Order created in database
   └─> Order status: "pending"
   └─> Payment status: "pending"

3. RAZORPAY PAYMENT (Online payment only):
   └─> Backend creates Razorpay order
   └─> Frontend opens Razorpay checkout
   └─> Customer completes payment
   └─> Razorpay sends payment details

4. PAYMENT VERIFICATION:
   └─> Frontend sends payment details to backend
   └─> Backend verifies signature (HMAC SHA256)
   └─> If valid:
        ├─> Payment status: "completed"
        ├─> Order confirmed
        ├─> Admin receives notification
        └─> Customer sees success message
   └─> If invalid:
        └─> Payment status: "failed"

5. ORDER PROCESSING:
   └─> Admin sees order
   └─> Order prepared & delivered
   └─> Customer receives order
```

### **COD Flow (Unchanged):**
```
Customer selects COD
   └─> Order created directly
   └─> Payment status: "pending"
   └─> Order delivered
   └─> Delivery agent collects cash
   └─> Payment status: "completed"
```

---

## 🧪 **Testing Guide**

### **Prerequisites:**
- ✅ Backend running (`npm run dev`)
- ✅ Frontend running (`npm start` or on device via EAS build)
- ✅ Razorpay test keys configured
- ✅ User account created

### **Test Scenario 1: Cash on Delivery (COD)**
1. Login as customer
2. Add items to cart
3. Go to checkout
4. Select address
5. Select **"Cash on Delivery"**
6. Click "Place Order"
7. ✅ **Expected:** Order placed successfully, no Razorpay opens

### **Test Scenario 2: Card Payment**
1. Login as customer
2. Add items to cart
3. Go to checkout
4. Select address
5. Select **"Credit/Debit Card"**
6. Click "Place Order"
7. ✅ **Expected:** Razorpay checkout opens
8. Use test card:
   ```
   Card Number: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   Name: Test User
   ```
9. Complete payment
10. ✅ **Expected:** "Payment Successful! 🎉" alert
11. Check admin panel - order should be visible

### **Test Scenario 3: UPI Payment**
1. Follow steps 1-7 from Card Payment
2. In Razorpay checkout, select **UPI**
3. Use test UPI ID: `success@razorpay`
4. ✅ **Expected:** Payment succeeds immediately

### **Test Scenario 4: Payment Cancellation**
1. Follow steps 1-7 from Card Payment
2. Click "Back" or close Razorpay checkout
3. ✅ **Expected:** Alert shows "Payment Cancelled"
4. Order created but payment pending
5. Can retry payment from orders page (future feature)

### **Test Scenario 5: Payment Failure**
1. Follow steps 1-7 from Card Payment
2. Use test UPI ID: `failure@razorpay`
3. ✅ **Expected:** Payment fails
4. Alert shows "Payment Failed" with retry option

---

## 🔍 **Debugging Tips**

### **Backend Debugging:**

**Check if Razorpay is configured:**
```bash
# Look for this in backend console when server starts
grep "RAZORPAY" backend/.env
```

**Test create order endpoint:**
```bash
# Get JWT token first
TOKEN="your_jwt_token_here"
ORDER_ID="your_order_id_here"

curl -X POST http://localhost:5000/api/v1/payments/razorpay/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "amount": 599
  }'
```

**Expected Success Response:**
```json
{
    "status": "success",
    "message": "Razorpay order created successfully",
    "data": {
        "razorpayOrderId": "order_xxxxx",
        "amount": 59900,
        "currency": "INR",
        "key": "rzp_test_xxxxx"
    }
}
```

**Check logs:**
```bash
tail -f backend/logs/combined-*.log | grep -i razorpay
```

### **Frontend Debugging:**

**Check if Razorpay key is loaded:**
```javascript
// In CheckoutScreen.tsx or razorpayService.ts
console.log('Razorpay Key:', Constants.expoConfig?.extra?.razorpayKeyId);
```

**Check payment flow logs:**
```bash
# In terminal running expo
# Look for:
# 💳 Creating Razorpay order
# ✅ Razorpay order created
# 🔓 Opening Razorpay checkout
# ✅ Payment successful
# 🔐 Verifying payment
```

**Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Payment gateway not configured" | Backend keys missing | Add keys to `backend/.env` |
| Razorpay doesn't open | Frontend key missing | Add key to `frontend/.env` and rebuild |
| "Invalid signature" | Wrong secret key | Double-check `RAZORPAY_KEY_SECRET` |
| "Order not found" | Wrong order ID | Ensure order created before payment |
| App crashes on payment | Old build without react-native-razorpay | Rebuild app with EAS |

---

## 📱 **Test Cards & UPIs**

### **Test Credit/Debit Cards:**
```
Success Card:
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Mastercard:
Card Number: 5555 5555 5555 4444
CVV: Any 3 digits
Expiry: Any future date

American Express:
Card Number: 3782 822463 10005
CVV: Any 4 digits
Expiry: Any future date
```

### **Test UPI IDs:**
```
Always Success: success@razorpay
Always Failure: failure@razorpay
```

### **Test Netbanking:**
- Select any bank
- Use credentials: `test` / `test`

### **Test Wallets:**
- All test wallets work in test mode
- Select any wallet and complete payment

---

## 🔒 **Security Features**

### **Built-in Security:**
1. ✅ **Signature Verification:** All payments verified using HMAC SHA256
2. ✅ **User Authorization:** Can't verify other users' payments
3. ✅ **Amount Validation:** Backend checks amount matches order
4. ✅ **Rate Limiting:** Prevents abuse of payment endpoints
5. ✅ **Environment Variables:** API keys never hardcoded
6. ✅ **HTTPS Required:** Production webhooks require HTTPS

### **What You Should NEVER Do:**
- ❌ Commit `.env` files to git
- ❌ Share API secrets publicly
- ❌ Use production keys in development
- ❌ Trust frontend payment status without backend verification
- ❌ Skip signature verification

---

## 📊 **Database Schema**

### **Payment Model:**
```javascript
{
    // Existing fields
    order: ObjectId,
    user: ObjectId,
    amount: Number,
    paymentMethod: 'card' | 'upi' | 'cod' | 'cash' | 'wallet',
    paymentStatus: 'pending' | 'completed' | 'failed',
    transactionId: String,
    
    // NEW RAZORPAY FIELDS
    razorpayOrderId: String,      // Razorpay order ID
    razorpayPaymentId: String,    // Razorpay payment ID
    razorpaySignature: String,    // Payment signature
    paymentGateway: 'razorpay' | 'cash' | 'manual',
    paymentMetadata: {            // Detailed payment info
        method: String,           // card, netbanking, upi, wallet
        bank: String,            // Bank name
        wallet: String,          // Wallet name
        vpa: String,             // UPI ID
        email: String,           // Customer email
        contact: String          // Customer phone
    },
    refundStatus: 'none' | 'pending' | 'processed' | 'failed',
    refundId: String,
    refundAmount: Number
}
```

**No migration needed!** New fields are optional.

---

## 🚀 **Deployment Checklist**

### **Before Going Live:**

1. **Get Live API Keys:**
   - Complete KYC on Razorpay Dashboard
   - Activate your account
   - Generate live keys (start with `rzp_live_`)

2. **Update Environment Variables:**
   ```bash
   # Backend .env
   RAZORPAY_KEY_ID=rzp_live_XXXXX
   RAZORPAY_KEY_SECRET=LIVE_SECRET_HERE
   
   # Frontend .env
   EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXX
   ```

3. **Setup Webhooks:**
   - Go to Razorpay Dashboard → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/v1/payments/razorpay/webhook`
   - Select events: `payment.captured`, `payment.failed`, `refund.processed`
   - Copy webhook secret
   - Add to `backend/.env`: `RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx`

4. **Build Production Apps:**
   ```bash
   # Frontend
   cd frontend
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```

5. **Test Live Payments:**
   - Test with real card (small amount like ₹10)
   - Verify payment appears in Razorpay Dashboard
   - Check order updates in admin panel

---

## 📞 **Support & Resources**

### **Razorpay Documentation:**
- Main Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Webhooks: https://razorpay.com/docs/webhooks/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

### **Your Implementation Files:**
**Backend:**
- `backend/src/services/razorpayService.js`
- `backend/src/controllers/razorpayController.js`
- `backend/src/routes/razorpayRoutes.js`
- `backend/src/models/Payment.js`

**Frontend:**
- `frontend/src/services/razorpayService.ts`
- `frontend/src/screens/customer/menu/CheckoutScreen.tsx`

**Documentation:**
- `RAZORPAY_IMPLEMENTATION_STRATEGY.md` - Complete strategy
- `RAZORPAY_PHASE_1_COMPLETE.md` - Backend documentation
- `RAZORPAY_QUICK_START.md` - Quick setup guide
- `RAZORPAY_COMPLETE_GUIDE.md` - This file

---

## 🎯 **Next Steps**

### **Immediate (When You Get Razorpay Account):**
1. ✅ Create Razorpay test account
2. ✅ Get test API keys
3. ✅ Update `backend/.env`
4. ✅ Create `frontend/.env`
5. ✅ Restart backend
6. ✅ Rebuild frontend app
7. ✅ Test payment flow

### **Future Enhancements (Optional):**
- 🔜 Retry failed payments from order details
- 🔜 Payment history screen
- 🔜 Refund functionality (admin)
- 🔜 Multiple payment methods saved
- 🔜 Auto-retry failed payments
- 🔜 Payment analytics dashboard

---

## ✅ **Current Status**

### **Backend:** 100% Complete ✅
- All endpoints implemented
- Security measures in place
- Webhook handler ready
- Just needs Razorpay credentials

### **Frontend:** 100% Complete ✅
- Razorpay service created
- CheckoutScreen integrated
- Payment flow implemented
- Just needs Razorpay key ID

### **Testing:** Ready for Testing ⏳
- Waiting for Razorpay test account
- All test scenarios documented
- Debug tools in place

---

## 💡 **Important Notes**

### **Test Mode vs Production:**
- **Test Mode:** Free, no KYC, instant setup
- **Production Mode:** Requires KYC, business verification
- **Never** mix test and live keys
- Always test thoroughly before going live

### **Payment Flow:**
- Order created FIRST (even if payment fails)
- Payment status tracked separately
- Can retry failed payments later
- COD flow completely unchanged

### **Costs:**
- Razorpay charges 2% + GST per transaction
- No setup fees, no monthly fees
- Only pay when you receive payments
- Test mode is completely free

---

## 🎉 **You're All Set!**

Your app is **100% ready for Razorpay integration**! 

Just add your credentials when you create your Razorpay account, and you're good to go! 🚀

**Need help?** Refer to the troubleshooting section or Razorpay documentation above.

**Questions?** Check the implementation files - they're well-commented and easy to understand.

---

**Happy Coding! 🍕💳**
