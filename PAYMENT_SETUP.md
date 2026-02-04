# UPI Payment Gateway Integration Setup Guide

## Overview
This Money Saving App integrates with **Razorpay** for seamless UPI, card, and netbanking payments. The integration supports both production and test environments.

## Features
✅ UPI Payment Support (Primary)
✅ Card Payments (Optional)
✅ Net Banking (Optional)
✅ HMAC SHA256 Signature Verification
✅ Automatic Mock Mode (when no credentials provided)
✅ Transaction History
✅ Refund Support
✅ Error Handling & Validation

## Prerequisites
- Razorpay account (https://razorpay.com)
- Node.js backend running (default: http://localhost:3000)
- React frontend (default: http://localhost:3001 or Vite dev server)

## Step 1: Get Razorpay Credentials

### For Testing (Sandbox):
1. Sign up at https://razorpay.com
2. Go to **Account & Settings** → **API Keys**
3. Copy your:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

### For Production:
1. Verify your merchant account
2. Switch to **Production** mode in API Keys section
3. Copy production credentials

## Step 2: Configure Backend Environment

Create `.env` file in the `backend/` directory:

```env
# .env (Backend)
NODE_ENV=development
PORT=3000

# Razorpay Payment Gateway
RAZORPAY_KEY=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_SECRET=YOUR_SECRET_KEY_HERE

# ... other environment variables
```

Replace `YOUR_KEY_ID_HERE` and `YOUR_SECRET_KEY_HERE` with actual Razorpay credentials.

## Step 3: Configure Frontend Environment

Create `.env` file in the `frontend/` directory:

```env
# .env (Frontend)
VITE_API_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY=rzp_test_YOUR_KEY_ID_HERE
```

Replace `YOUR_KEY_ID_HERE` with your Razorpay Key ID.

## Step 4: Backend Service Overview

### Payment Routes (`/api/v1/upi/`)

#### 1. Initiate Payment
```
POST /api/v1/upi/initiate-payment
```
**Request:**
```json
{
  "amount": 1000,
  "description": "Payment for services",
  "receipt": "receipt_123",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "9999999999"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_1234567890",
  "amount": 1000,
  "currency": "INR"
}
```

#### 2. Verify Payment
```
POST /api/v1/upi/verify-payment
```
**Request:**
```json
{
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_order_id": "order_1234567890",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "paymentId": "pay_1234567890"
}
```

#### 3. Get Payment Details
```
GET /api/v1/upi/payment/:paymentId
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_1234567890",
    "amount": 1000,
    "status": "captured",
    "method": "upi"
  }
}
```

#### 4. Process Refund
```
POST /api/v1/upi/refund
```
**Request:**
```json
{
  "paymentId": "pay_1234567890",
  "amount": 500
}
```

## Step 5: Frontend Components

### UPI Payments Page (`/src/pages/UPIPayments/UPIPayments.tsx`)

**Features:**
- Form validation (UPI ID, amount limits)
- Amount range: ₹1 - ₹100,000
- UPI ID format validation
- Razorpay Checkout integration
- Payment confirmation screen
- Transaction history display
- Error handling with toast notifications

**Payment States:**
1. **Form** - Enter payment details
2. **Confirm** - Review payment before sending
3. **Loading** - Payment processing
4. **Success** - Payment completed

### Payment Store (`/src/store/paymentStore.ts`)

Zustand store managing payment operations:

```typescript
// Initialize payment
initiatePayment(data) - Creates Razorpay order

// Verify payment
verifyPayment(data) - Verifies Razorpay signature

// Get payment details
getPaymentDetails(paymentId) - Fetches payment status

// Process refund
refundPayment(paymentId, amount) - Initiates refund

// Add to history
addPayment(payment) - Stores payment in history
```

## Step 6: Testing Payment Flow

### Test with Sandbox Credentials

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to UPI Payments page
4. Enter test data:
   - **Recipient UPI:** any valid format (e.g., `test@upi`)
   - **Recipient Name:** Any name
   - **Amount:** ₹1 - ₹100,000
   - **Description:** Optional

5. Click "Continue to Payment"
6. Review details and confirm
7. Complete Razorpay checkout (use test cards if needed)

### Mock Mode (No Credentials)

If `RAZORPAY_KEY` or `RAZORPAY_SECRET` are not set:
- Backend automatically uses mock mode
- Payments are simulated successfully
- Perfect for testing without real API calls

## Step 7: Test Razorpay Cards

### For UPI Payments:
Use any UPI ID format in the form (e.g., `success@razorpay`)

### For Card Testing (if enabled):
- **Test Card:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits

## Step 8: Production Deployment

### Backend:
1. Update `.env` with production credentials
2. Set `NODE_ENV=production`
3. Deploy to production server

### Frontend:
1. Update `.env` with production API URL and production Razorpay key
2. Run `npm run build`
3. Deploy build to CDN/hosting

### Security Checklist:
- ✅ Never commit `.env` files to Git
- ✅ Use `.gitignore` for sensitive files
- ✅ Enable CORS only for your domain
- ✅ Use HTTPS in production
- ✅ Store secrets in environment variables
- ✅ Verify signatures on backend (already implemented)

## Troubleshooting

### Issue: "Razorpay is not loaded"
**Solution:** Check browser console for script load errors. Ensure internet connection.

### Issue: Payment fails with signature error
**Solution:** Verify `RAZORPAY_SECRET` is correct in backend `.env`

### Issue: Amount validation error
**Solution:** Amount must be between ₹1 and ₹100,000

### Issue: Invalid UPI ID format
**Solution:** UPI ID format: `username@bankname` (e.g., `user@upi`)

### Issue: CORS errors
**Solution:** Check `CORS_ORIGIN` in backend `.env` includes your frontend URL

## Files Modified/Created

### New Files:
- `backend/src/services/paymentService.ts` - Payment processing service
- `backend/src/routes/paymentRoutes.ts` - Payment API endpoints
- `frontend/src/store/paymentStore.ts` - Payment state management
- `frontend/.env.example` - Frontend environment template

### Modified Files:
- `backend/src/index.ts` - Added payment routes
- `backend/.env.example` - Added Razorpay credentials
- `frontend/src/pages/UPIPayments/UPIPayments.tsx` - Razorpay integration

## API Documentation

For detailed Razorpay API documentation:
- https://razorpay.com/docs/api/
- https://razorpay.com/docs/payment-gateway/
- https://razorpay.com/docs/payments/payments-dashboard/

## Support

For issues related to:
- **Razorpay:** Contact support@razorpay.com
- **Application:** Check logs and console errors
- **Integration:** Review implementation in `backend/src/services/paymentService.ts`

## Next Steps

1. ✅ Payment integration is complete
2. 📱 Consider adding payment request feature
3. 🔄 Add recurring payments (mandates)
4. 📊 Add payment analytics
5. 🔐 Implement advanced fraud detection

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready
