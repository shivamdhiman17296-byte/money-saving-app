import { create } from 'zustand';
import axios from 'axios';

export interface Payment {
  id: string;
  orderId?: string;
  amount: number;
  recipientUPI: string;
  recipientName: string;
  description: string;
  status: 'initiated' | 'processing' | 'success' | 'failed';
  timestamp: string;
  paymentId?: string;
}

interface PaymentStore {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  razorpayKey: string;

  // Payment methods
  initiatePayment: (data: {
    amount: number;
    recipientUPI: string;
    recipientName: string;
    description: string;
    email: string;
    phone: string;
  }) => Promise<any>;

  verifyPayment: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => Promise<boolean>;

  getPaymentDetails: (paymentId: string) => Promise<any>;
  refundPayment: (paymentId: string, amount?: number) => Promise<any>;
  addPayment: (payment: Payment) => void;
  clearError: () => void;
  setRazorpayKey: (key: string) => void;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,
  razorpayKey: (import.meta as any).env.VITE_RAZORPAY_KEY || 'rzp_test_key',

  setRazorpayKey: (key: string) => {
    set({ razorpayKey: key });
  },

  initiatePayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/upi/initiate-payment`, {
        amount: data.amount,
        recipientUPI: data.recipientUPI,
        recipientName: data.recipientName,
        description: data.description,
        email: data.email,
        phone: data.phone,
      });

      const payment: Payment = {
        id: response.data.data.id || response.data.data.orderId,
        orderId: response.data.data.orderId || response.data.data.id,
        amount: data.amount,
        recipientUPI: data.recipientUPI,
        recipientName: data.recipientName,
        description: data.description,
        status: 'initiated',
        timestamp: new Date().toISOString(),
      };

      get().addPayment(payment);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to initiate payment';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/upi/verify-payment`, data);

      if (response.data.success) {
        // Update payment status
        set((state) => ({
          payments: state.payments.map((p) =>
            p.orderId === data.razorpay_order_id
              ? { ...p, status: 'success', paymentId: data.razorpay_payment_id }
              : p
          ),
          isLoading: false,
        }));
        return true;
      }

      set({ error: 'Payment verification failed', isLoading: false });
      return false;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Payment verification failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  getPaymentDetails: async (paymentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/upi/payment/${paymentId}`);
      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to fetch payment details';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  refundPayment: async (paymentId: string, amount?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/upi/refund`, {
        paymentId,
        amount,
      });

      // Update payment status
      set((state) => ({
        payments: state.payments.map((p) =>
          p.paymentId === paymentId ? { ...p, status: 'failed' } : p
        ),
        isLoading: false,
      }));

      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Refund failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  addPayment: (payment: Payment) => {
    set((state) => ({
      payments: [...state.payments, payment],
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
