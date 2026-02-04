# UPI Payment Integration - Quick Reference

## 🚀 Quick Start

### 1. Get Razorpay API Keys
- Visit: https://razorpay.com/dashboard/app/keys
- Copy: Key ID and Secret

### 2. Configure Backend (.env)
```env
RAZORPAY_KEY=rzp_test_xxxxx
RAZORPAY_SECRET=xxxxx
```

### 3. Configure Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY=rzp_test_xxxxx
```

### 4. Start Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 5. Test Payment
- Navigate to "Send Money via UPI"
- Enter test details
- Complete payment flow

---

## 📁 Architecture

```
Money Saving App
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── paymentService.ts      (Razorpay API calls)
│   │   ├── routes/
│   │   │   └── paymentRoutes.ts       (4 endpoints)
│   │   └── index.ts                   (Payment routes mounted)
│   └── .env                            (Credentials)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── UPIPayments/
│   │   │       └── UPIPayments.tsx    (Payment UI)
│   │   └── store/
│   │       └── paymentStore.ts        (State management)
│   └── .env                            (API config)
│
└── PAYMENT_SETUP.md                    (Full guide)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/upi/initiate-payment` | Start payment |
| POST | `/api/v1/upi/verify-payment` | Verify signature |
| GET | `/api/v1/upi/payment/:paymentId` | Get details |
| POST | `/api/v1/upi/refund` | Process refund |

---

## 💡 Key Features

✅ **UPI Payments** - Primary payment method  
✅ **Signature Verification** - HMAC SHA256  
✅ **Mock Mode** - Works without credentials  
✅ **Error Handling** - Comprehensive validation  
✅ **Transaction History** - Track all payments  
✅ **Form Validation** - UPI ID & amount checks  

---

## ⚙️ Payment Flow

```
User Form
    ↓
Validation
    ↓
Backend: Initiate Payment
    ↓
Razorpay Checkout Opens
    ↓
User Completes Payment
    ↓
Razorpay Callback
    ↓
Backend: Verify Signature
    ↓
Success/Failure
    ↓
Update Transaction History
```

---

## 🧪 Test Credentials

**Mode:** Sandbox (Test)  
**Key ID:** `rzp_test_xxxxx` (from dashboard)  
**Secret:** `xxxxx` (from dashboard)  
**UPI Test:** Any format (e.g., `test@upi`)  
**Amount Range:** ₹1 - ₹100,000  

---

## 📊 Payment States

| State | Description |
|-------|-------------|
| `form` | User enters payment details |
| `confirm` | Review details before sending |
| `loading` | Processing payment |
| `success` | Payment completed |

---

## 🔐 Security

- ✅ HMAC signature verification
- ✅ Environment variables for secrets
- ✅ Server-side verification
- ✅ CORS protection
- ✅ Input validation
- ✅ Error message sanitization

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Razorpay not loading | Check internet, script URL |
| Signature error | Verify RAZORPAY_SECRET |
| Amount error | Use ₹1 - ₹100,000 |
| UPI format error | Use format: `username@bankname` |
| CORS error | Check backend CORS config |

---

## 📚 Documentation

- **Full Guide:** [PAYMENT_SETUP.md](./PAYMENT_SETUP.md)
- **Razorpay Docs:** https://razorpay.com/docs/
- **API Reference:** [Payment Routes](./backend/src/routes/paymentRoutes.ts)
- **Service Code:** [Payment Service](./backend/src/services/paymentService.ts)

---

## ✨ Next Features

- 🔄 Recurring Payments (UPI Mandates)
- 📱 Payment Requests
- 📊 Payment Analytics
- 🔔 Payment Notifications
- 📧 Receipt Emails
- 💳 Saved Cards

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2024
