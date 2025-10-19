# 🚀 Razorpay Quick Reference Card

## ⚡ When You're Ready (20 Minutes Total)

### 1️⃣ Create Razorpay Account (5 min)
```
→ https://dashboard.razorpay.com/signup
→ Sign up with email
→ Verify email
→ Done! (No KYC for test mode)
```

### 2️⃣ Get API Keys (2 min)
```
→ Login to Dashboard
→ Settings → API Keys
→ Generate Test Key
→ Copy Key Id and Key Secret
```

### 3️⃣ Configure Backend (1 min)
```bash
# Edit backend/.env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# Restart
cd backend && npm run dev
```

### 4️⃣ Configure Frontend (2 min)
```bash
# Create frontend/.env
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY

# Rebuild app
cd frontend
npx expo prebuild --clean
npx expo run:android
```

### 5️⃣ Test (10 min)
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25

OR

UPI: success@razorpay
```

---

## 📱 Quick Test Scenarios

### ✅ Test COD (Works Now)
```
Login → Add to Cart → Checkout → Select COD → Place Order
✓ Order created immediately
```

### ✅ Test Online Payment (After Adding Keys)
```
Login → Add to Cart → Checkout → Select Card → Place Order
✓ Razorpay opens
✓ Enter test card
✓ Payment success
✓ Order confirmed
```

---

## 🔧 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check `.env` has correct keys |
| Razorpay doesn't open | Rebuild frontend app |
| "Invalid signature" | Check `RAZORPAY_KEY_SECRET` |
| Payment fails | Use test cards from docs |

---

## 📂 Files to Update

```
backend/.env           → Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
frontend/.env          → Add EXPO_PUBLIC_RAZORPAY_KEY_ID
```

---

## 📞 Quick Links

- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Full Guide:** `RAZORPAY_COMPLETE_GUIDE.md`
- **Quick Start:** `RAZORPAY_QUICK_START.md`

---

## ✅ Status

- Backend: ✅ 100% Ready
- Frontend: ✅ 100% Ready
- Docs: ✅ Complete
- **Your Action:** Add Razorpay credentials ⏳

---

**That's it! Everything else is done! 🎉**
