# UPI Payment Gateway - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Money Saving App                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FRONTEND (React + TypeScript)              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  UPIPayments Component                         │     │   │
│  │  │  ├─ Payment Form                              │     │   │
│  │  │  ├─ Validation (UPI ID, Amount)              │     │   │
│  │  │  ├─ Confirmation Screen                      │     │   │
│  │  │  ├─ Loading State                            │     │   │
│  │  │  ├─ Success Screen                           │     │   │
│  │  │  └─ Transaction History Display              │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                        │                                 │   │
│  │                        ↓                                 │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  paymentStore (Zustand)                       │     │   │
│  │  │  ├─ payments: Payment[]                       │     │   │
│  │  │  ├─ isLoading: boolean                        │     │   │
│  │  │  ├─ error: string                             │     │   │
│  │  │  ├─ initiatePayment()                         │     │   │
│  │  │  ├─ verifyPayment()                           │     │   │
│  │  │  ├─ getPaymentDetails()                       │     │   │
│  │  │  ├─ refundPayment()                           │     │   │
│  │  │  └─ addPayment()                              │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                        │                                 │   │
│  │                        ↓                                 │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  Razorpay Checkout SDK                        │     │   │
│  │  │  (Dynamic script loading)                     │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │                        │                                 │   │
│  └────────────────────────┼─────────────────────────────────┘   │
│                           │ HTTP/HTTPS                          │
│                           ↓                                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                API Base URL: /api/v1/upi/
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
   ┌────────────┐  ┌────────────────┐  ┌─────────────┐
   │ Initiate   │  │ Verify         │  │ Get Payment │
   │ Payment    │  │ Payment        │  │ Details     │
   │            │  │                │  │             │
   │ POST       │  │ POST           │  │ GET         │
   └────────────┘  └────────────────┘  └─────────────┘

                           │
                           ↓

┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Payment Routes (/api/v1/upi/)              │   │
│  │                                                          │   │
│  │  1. POST /initiate-payment                              │   │
│  │     ├─ Validate input                                   │   │
│  │     ├─ Call PaymentService                              │   │
│  │     └─ Return Order ID                                  │   │
│  │                                                          │   │
│  │  2. POST /verify-payment                                │   │
│  │     ├─ Validate signature                               │   │
│  │     ├─ Call PaymentService                              │   │
│  │     └─ Return verification result                       │   │
│  │                                                          │   │
│  │  3. GET /payment/:paymentId                             │   │
│  │     ├─ Get payment details                              │   │
│  │     ├─ Call PaymentService                              │   │
│  │     └─ Return payment info                              │   │
│  │                                                          │   │
│  │  4. POST /refund                                        │   │
│  │     ├─ Validate refund request                          │   │
│  │     ├─ Call PaymentService                              │   │
│  │     └─ Return refund status                             │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        │                                         │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         PaymentService (Razorpay API Client)            │   │
│  │                                                          │   │
│  │  • Check credentials                                     │   │
│  │    ├─ If exist: Use Razorpay API                         │   │
│  │    └─ If not: Use Mock Mode                             │   │
│  │                                                          │   │
│  │  • initiatePayment()                                     │   │
│  │    ├─ Create Razorpay order                              │   │
│  │    ├─ Convert amount to paise                            │   │
│  │    └─ Return order details                               │   │
│  │                                                          │   │
│  │  • verifyPaymentSignature()                              │   │
│  │    ├─ Create HMAC SHA256 hash                            │   │
│  │    ├─ Compare with signature                             │   │
│  │    └─ Return verification result                         │   │
│  │                                                          │   │
│  │  • getPaymentDetails()                                   │   │
│  │    ├─ Fetch from Razorpay API                            │   │
│  │    └─ Return payment object                              │   │
│  │                                                          │   │
│  │  • refundPayment()                                       │   │
│  │    ├─ Create refund request                              │   │
│  │    └─ Return refund status                               │   │
│  │                                                          │   │
│  │  • createMockPaymentResponse()                           │   │
│  │    └─ Generate test response                             │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                        │                                         │
│                        ↓                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ↓                                     ↓
    ┌─────────────────┐          ┌──────────────────────┐
    │  Razorpay API   │          │   Mock Response      │
    │  (Production)   │          │   (Development)      │
    │                 │          │                      │
    │ • Create Order  │          │ Auto-generate on     │
    │ • Process Auth  │          │ missing credentials  │
    │ • Fetch Details │          │                      │
    │ • Process Refund│          │ Perfect for testing  │
    └─────────────────┘          └──────────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                           ↓
                    ┌────────────────┐
                    │ Response       │
                    │ (JSON)         │
                    └────────────────┘
                           │
                           ↓
                      Frontend
                           │
                           ↓
                    Update Transaction
                    History & UI
```

---

## Data Flow Diagram

```
                        START
                          │
                          ↓
                 ┌────────────────────┐
                 │  User Form Input   │
                 │                    │
                 │ • Recipient UPI    │
                 │ • Recipient Name   │
                 │ • Amount           │
                 │ • Description      │
                 └────────────────────┘
                          │
                          ↓
              ┌──────────────────────────┐
              │   Client-Side            │
              │   Validation             │
              │                          │
              │ • UPI format check       │
              │ • Amount range (1-100k)  │
              │ • Required fields        │
              └──────────────────────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
         Invalid                   Valid
              │                        │
              ↓                        ↓
        ┌─────────────┐      ┌──────────────────┐
        │ Show Error  │      │ Show Confirmation│
        │ Toast       │      │ Screen           │
        └─────────────┘      └──────────────────┘
              │                        │
              │                        ↓
              │              ┌──────────────────────┐
              │              │ User Confirms       │
              │              │ (Clicks Confirm)    │
              │              └──────────────────────┘
              │                        │
              │                        ↓
              │              ┌──────────────────────┐
              │              │ Backend: Initiate    │
              │              │ PaymentService       │
              │              │ .initiatePayment()   │
              │              └──────────────────────┘
              │                        │
              │              ┌─────────┴──────────┐
              │              │                    │
              │         Has Creds?         No Creds?
              │              │                    │
              │              ↓                    ↓
              │      ┌─────────────────┐  ┌──────────────┐
              │      │ Call Razorpay   │  │ Mock Response│
              │      │ API             │  │ Generated    │
              │      └─────────────────┘  └──────────────┘
              │              │                    │
              │              └─────────┬──────────┘
              │                        │
              │                        ↓
              │              ┌──────────────────────┐
              │              │ Frontend: Open       │
              │              │ Razorpay Checkout   │
              │              └──────────────────────┘
              │                        │
              │                        ↓
              │              ┌──────────────────────┐
              │              │ User Authenticates   │
              │              │ via Razorpay         │
              │              │ (UPI/Card/Netbanking)│
              │              └──────────────────────┘
              │                        │
              │              ┌─────────┴──────────┐
              │              │                    │
              │         Success              Cancel
              │              │                    │
              │              ↓                    ↓
              │      ┌──────────────────┐  ┌──────────────┐
              │      │ Razorpay         │  │ Show Error   │
              │      │ Callback         │  │ "Cancelled"  │
              │      │ (razorpay_*)     │  └──────────────┘
              │      └──────────────────┘          │
              │              │                     │
              │              ↓                     │
              │      ┌──────────────────┐          │
              │      │ Backend: Verify  │          │
              │      │ Signature        │          │
              │      │ HMAC SHA256      │          │
              │      └──────────────────┘          │
              │              │                     │
              │      ┌───────┴────────┐            │
              │      │                │            │
              │   Valid            Invalid         │
              │      │                │            │
              │      ↓                ↓            │
              │  ┌─────────┐  ┌──────────────┐   │
              │  │ Success │  │ Verification │   │
              │  │ Payment │  │ Failed       │   │
              │  └─────────┘  │ Show Error   │   │
              │      │        └──────────────┘   │
              │      │              │            │
              │      └──────────────┬─────────────┤
              │                     │            │
              │                     ↓            │
              │            ┌──────────────────┐  │
              │            │ Update Store:    │  │
              │            │ Add Payment      │  │
              │            │ Update History   │  │
              │            └──────────────────┘  │
              │                     │            │
              │                     ↓            │
              │            ┌──────────────────┐  │
              │            │ Show Result UI   │  │
              │            │ (Success/Failed) │  │
              │            └──────────────────┘  │
              │                     │            │
              └────────────┬────────┴────────────┘
                           │
                           ↓
                     ┌────────────────┐
                     │    END         │
                     │ Return to      │
                     │ Payment Form   │
                     └────────────────┘
```

---

## Component Hierarchy

```
App
├── Router
│   └── UPIPayments Page
│       ├── usePaymentStore()
│       ├── useAuthStore()
│       │
│       └── Conditional Renders
│           │
│           ├─ Form State
│           │  ├── Card Component
│           │  ├── Input Fields
│           │  │  ├── UPI ID Input
│           │  │  ├── Name Input
│           │  │  ├── Amount Input (₹ symbol)
│           │  │  └── Description Textarea
│           │  ├── Submit Button
│           │  └── Error Display
│           │
│           ├─ Confirm State
│           │  ├── Summary Display
│           │  │  ├── Recipient info
│           │  │  ├── UPI ID
│           │  │  ├── Amount
│           │  │  └── Description
│           │  ├── Back Button
│           │  └── Confirm Button
│           │
│           ├─ Loading State
│           │  ├── Spinner Animation
│           │  └── Processing Message
│           │
│           ├─ Success State
│           │  ├── Checkmark Animation
│           │  ├── Success Message
│           │  └── Auto-redirect Timer
│           │
│           └─ Transaction History
│              └── Payment List
│                 ├── Recipient Name
│                 ├── UPI ID
│                 ├── Amount
│                 ├── Date
│                 └── Status Badge
```

---

## State Management Flow

```
                    UPIPayments Component
                            │
                            ↓
                  usePaymentStore()
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ↓               ↓               ↓
        State          Methods         External
        ──────         ───────         ────────
        payments   →  initiatePayment   Razorpay
        isLoading  →  verifyPayment     Backend
        error      →  getPaymentDetails API
        razorpayKey→  refundPayment
                   →  addPayment
                   →  clearError
                            │
                            ↓
                    Update Component
                            │
                    ┌───────┴────────┐
                    │                │
                    ↓                ↓
                Form Logic       UI Re-render
                    │                │
        ┌───────────┼────────────────┤
        │           │                │
        ↓           ↓                ↓
    Validate  Handle Events    Display Data
    Input     (click, change)   (payments[])
        │           │                │
        └───────────┴────────────────┘
                    │
                    ↓
            User Sees Updated UI
```

---

## Database/Storage Model

```
┌─────────────────────────────────────────┐
│     Payment Object (Frontend Store)     │
├─────────────────────────────────────────┤
│                                         │
│  {                                      │
│    id: string                           │
│    orderId?: string                     │
│    paymentId?: string                   │
│    amount: number                       │
│    recipientUPI: string                 │
│    recipientName: string                │
│    description: string                  │
│    status: 'initiated'                  │
│           | 'processing'                │
│           | 'success'                   │
│           | 'failed'                    │
│    timestamp: string (ISO 8601)         │
│  }                                      │
│                                         │
└─────────────────────────────────────────┘
           │                  │
           ↓                  ↓
    ┌────────────────┐  ┌───────────────┐
    │ Razorpay API   │  │ Local State   │
    │ (Persistent)   │  │ (Session)     │
    │                │  │               │
    │ • Order ID     │  │ • payments[]  │
    │ • Payment ID   │  │ • isLoading   │
    │ • Status       │  │ • error       │
    │ • Timestamp    │  │               │
    └────────────────┘  └───────────────┘
```

---

## Error Handling Flow

```
                    Error Occurs
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
        ↓                 ↓                  ↓
    Validation      API Error         Network Error
        │                 │                  │
        │                 │                  │
    Form Valid?    Success Status?   Connected?
        │                 │                  │
        ↓                 ↓                  ↓
    Set Error    Set Error Result   Set Connection
    Message      Message            Error
        │                 │                  │
        └─────────────────┼──────────────────┘
                          │
                          ↓
              ┌─────────────────────┐
              │ Sanitize Message    │
              │ (No sensitive data) │
              └─────────────────────┘
                          │
                          ↓
              ┌─────────────────────┐
              │ Update Store:       │
              │ error = message     │
              └─────────────────────┘
                          │
                          ↓
              ┌─────────────────────┐
              │ Display to User:    │
              │                     │
              │ • Toast notification│
              │ • Error message     │
              │ • Suggestion        │
              └─────────────────────┘
                          │
                          ↓
              ┌─────────────────────┐
              │ Clear Error (3s)    │
              │ User clicks Dismiss │
              │ Or tries again      │
              └─────────────────────┘
```

---

## Security Flow

```
                    Payment Request
                          │
                          ↓
              ┌─────────────────────────┐
              │ 1. Input Validation     │
              │    • UPI format         │
              │    • Amount range       │
              │    • Required fields    │
              └─────────────────────────┘
                          │
                          ↓
              ┌─────────────────────────┐
              │ 2. Frontend Sanitization│
              │    • Remove XSS         │
              │    • Trim whitespace    │
              │    • Validate types     │
              └─────────────────────────┘
                          │
                          ↓
              ┌─────────────────────────┐
              │ 3. Send to Backend      │
              │    • HTTPS encrypted    │
              │    • Include auth token │
              └─────────────────────────┘
                          │
                          ↓
              ┌─────────────────────────┐
              │ 4. Backend Validation   │
              │    • Verify auth        │
              │    • Validate input     │
              │    • Sanitize data      │
              └─────────────────────────┘
                          │
                          ↓
              ┌─────────────────────────┐
              │ 5. Create Order         │
              │    • Amount to paise    │
              │    • Generate receipt   │
              └─────────────────────────┘
                          │
                          ↓
              ┌─────────────────────────┐
              │ 6. Razorpay Callback    │
              │    • Return signature   │
              │    • Return payment ID  │
              │    • Return order ID    │
              └─────────────────────────┘
                          │
                          ↓
              ┌─────────────────────────┐
              │ 7. Signature Verify     │
              │                         │
              │ HMAC-SHA256(            │
              │   payload,              │
              │   secret                │
              │ ) === signature?        │
              └─────────────────────────┘
                  │                 │
              YES │                 │ NO
                  ↓                 ↓
          ┌────────────────┐  ┌──────────────┐
          │ Payment Success│  │ Payment Failed
          │ Update store   │  │ Return error
          │ Show success   │  │ Log incident
          └────────────────┘  └──────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Production                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Frontend (React Build)                  │   │
│  │         Hosted on:                              │   │
│  │         • Vercel, Netlify, or CDN               │   │
│  │         • Environment: production               │   │
│  │         • RAZORPAY_KEY from .env               │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                 │
│                   HTTPS API                             │
│                        │                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Backend (Node.js/Express)               │   │
│  │         Hosted on:                              │   │
│  │         • AWS, Heroku, DigitalOcean             │   │
│  │         • Environment: production               │   │
│  │         • RAZORPAY_KEY from .env               │   │
│  │         • RAZORPAY_SECRET from .env            │   │
│  │         • SSL/TLS enabled                       │   │
│  │         • CORS configured                       │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                 │
│                   HTTPS API                             │
│                        │                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Razorpay API (Production)               │   │
│  │         • Real payments processed               │   │
│  │         • Live credentials                      │   │
│  │         • Production merchant account           │   │
│  │         • Full security enabled                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Files Summary

```
┌─────────────────────────────────────────────────────────┐
│              FILES & DIRECTORY STRUCTURE                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  backend/                                              │
│  ├── src/                                              │
│  │   ├── services/                                     │
│  │   │   └── paymentService.ts          [211 lines]   │
│  │   ├── routes/                                       │
│  │   │   └── paymentRoutes.ts           [145 lines]   │
│  │   └── index.ts                       [Modified]    │
│  └── .env                               [Config]      │
│                                                         │
│  frontend/                                             │
│  ├── src/                                              │
│  │   ├── pages/                                        │
│  │   │   └── UPIPayments/                              │
│  │   │       └── UPIPayments.tsx        [Rewritten]   │
│  │   └── store/                                        │
│  │       └── paymentStore.ts            [165 lines]   │
│  └── .env                               [New file]    │
│                                                         │
│  Documentation/                                        │
│  ├── PAYMENT_SETUP.md                   [250+ lines]  │
│  ├── UPI_PAYMENT_QUICK_REFERENCE.md     [200+ lines]  │
│  ├── UPI_PAYMENT_INTEGRATION_COMPLETE.md [400+ lines] │
│  ├── PAYMENT_DOCS_INDEX.md              [200+ lines]  │
│  └── FINAL_DELIVERY_SUMMARY.md          [400+ lines]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Complete Architecture Ready for Production!** ✅
