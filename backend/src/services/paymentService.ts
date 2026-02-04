import axios from 'axios';
import crypto from 'crypto';

interface PaymentInitiation {
  amount: number;
  recipientUPI: string;
  recipientName: string;
  description: string;
  userId: string;
  email: string;
  phone: string;
}

interface PaymentVerification {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentResponse {
  id: string;
  amount: number;
  status: string;
  shortUrl?: string;
  orderId?: string;
  [key: string]: any;
}

export class PaymentService {
  private razorpayKey: string;
  private razorpaySecret: string;
  private razorpayUrl = 'https://api.razorpay.com/v1';

  constructor() {
    this.razorpayKey = process.env.RAZORPAY_KEY || '';
    this.razorpaySecret = process.env.RAZORPAY_SECRET || '';

    if (!this.razorpayKey || !this.razorpaySecret) {
      console.warn('⚠️  Razorpay credentials not configured. UPI payments will use mock mode.');
    }
  }

  /**
   * Initiate a payment order
   */
  async initiatePayment(data: PaymentInitiation): Promise<PaymentResponse> {
    try {
      // In mock mode, return simulated response
      if (!this.razorpayKey || !this.razorpaySecret) {
        return this.createMockPaymentResponse(data);
      }

      const orderPayload = {
        amount: Math.round(data.amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: data.userId,
          recipientUPI: data.recipientUPI,
          recipientName: data.recipientName,
          description: data.description,
        },
      };

      const auth = Buffer.from(`${this.razorpayKey}:${this.razorpaySecret}`).toString('base64');

      const response = await axios.post(`${this.razorpayUrl}/orders`, orderPayload, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        id: response.data.id,
        amount: response.data.amount,
        status: response.data.status,
        orderId: response.data.id,
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(verification: PaymentVerification): boolean {
    try {
      if (!this.razorpaySecret) {
        return true; // In mock mode, always verify
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification;

      const hmac = crypto.createHmac('sha256', this.razorpaySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generated_signature = hmac.digest('hex');

      return generated_signature === razorpay_signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentResponse> {
    try {
      if (!this.razorpayKey || !this.razorpaySecret) {
        return this.createMockPaymentDetails(paymentId);
      }

      const auth = Buffer.from(`${this.razorpayKey}:${this.razorpaySecret}`).toString('base64');

      const response = await axios.get(`${this.razorpayUrl}/payments/${paymentId}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return {
        id: response.data.id,
        amount: response.data.amount,
        status: response.data.status,
        ...response.data,
      };
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponse> {
    try {
      if (!this.razorpayKey || !this.razorpaySecret) {
        return {
          id: `refund_${Date.now()}`,
          amount: amount || 0,
          status: 'refunded',
        };
      }

      const refundPayload: { payment_id: string; amount?: number; notes?: object } = {
        payment_id: paymentId,
      };

      if (amount) {
        refundPayload.amount = Math.round(amount * 100);
      }

      const auth = Buffer.from(`${this.razorpayKey}:${this.razorpaySecret}`).toString('base64');

      const response = await axios.post(`${this.razorpayUrl}/refunds`, refundPayload, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        id: response.data.id,
        amount: response.data.amount,
        status: response.data.status,
        ...response.data,
      };
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error('Failed to refund payment');
    }
  }

  /**
   * Create mock payment response (for testing without real Razorpay)
   */
  private createMockPaymentResponse(data: PaymentInitiation): PaymentResponse {
    const orderId = `order_${Date.now()}`;
    return {
      id: orderId,
      amount: data.amount * 100,
      status: 'created',
      orderId,
      shortUrl: `https://rzp.io/i/${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Create mock payment details
   */
  private createMockPaymentDetails(paymentId: string): PaymentResponse {
    return {
      id: paymentId,
      amount: 50000,
      status: 'captured',
      method: 'upi',
      contact: '9999999999',
      email: 'user@example.com',
      description: 'Test payment',
      created_at: Math.floor(Date.now() / 1000),
    };
  }
}

export default new PaymentService();
