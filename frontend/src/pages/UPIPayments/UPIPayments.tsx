import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card, CardHeader, Button } from '../../components/UI';
import { usePaymentStore } from '../../store/paymentStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UPIPayments() {
  const [paymentStep, setPaymentStep] = useState<'form' | 'confirm' | 'loading' | 'success'>('form');
  const [formData, setFormData] = useState({
    recipientUPI: '',
    recipientName: '',
    amount: '',
    description: '',
  });

  const { initiatePayment, verifyPayment, error, clearError, payments } = usePaymentStore();
  const { user } = useAuthStore();

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.recipientUPI || !formData.recipientName || !formData.amount) {
      toast.error('Please fill all required fields');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (amount < 1) {
      toast.error('Minimum amount is ₹1');
      return false;
    }

    if (amount > 100000) {
      toast.error('Maximum amount is ₹100,000');
      return false;
    }

    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
    if (!upiRegex.test(formData.recipientUPI)) {
      toast.error('Please enter a valid UPI ID (e.g., username@bankname)');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setPaymentStep('confirm');
    }
  };

  const handleConfirm = async () => {
    try {
      setPaymentStep('loading');
      clearError();

      const paymentData = await initiatePayment({
        amount: parseFloat(formData.amount),
        recipientUPI: formData.recipientUPI,
        recipientName: formData.recipientName,
        description: formData.description || 'UPI Payment',
        email: user?.email || 'user@example.com',
        phone: user?.phone_number || '9999999999',
      });

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY || 'rzp_test_key',
        amount: Math.round(parseFloat(formData.amount) * 100),
        currency: 'INR',
        name: 'MoneySaver Pro',
        description: formData.description || 'UPI Payment',
        order_id: paymentData.orderId || paymentData.id,
        receipt: `receipt_${Date.now()}`,
        prefill: {
          name: user?.full_name || 'User',
          email: user?.email,
          contact: user?.phone_number,
        },
        notes: {
          recipientUPI: formData.recipientUPI,
          recipientName: formData.recipientName,
        },
        theme: { color: '#6366f1' },
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
        },
        handler: async (response: any) => {
          try {
            const isVerified = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (isVerified) {
              setPaymentStep('success');
              toast.success(`₹${formData.amount} sent successfully to ${formData.recipientName}!`);

              setTimeout(() => {
                setPaymentStep('form');
                setFormData({
                  recipientUPI: '',
                  recipientName: '',
                  amount: '',
                  description: '',
                });
              }, 3000);
            } else {
              toast.error('Payment verification failed. Please try again.');
              setPaymentStep('form');
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            toast.error('Payment verification failed');
            setPaymentStep('form');
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStep('form');
            toast.error('Payment cancelled');
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Razorpay is not loaded. Please try again.');
        setPaymentStep('form');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      toast.error(error || 'Failed to initiate payment');
      setPaymentStep('form');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Payment Form */}
      {paymentStep === 'form' && (
        <Card variant="elevated">
          <CardHeader title="Send Money via UPI" subtitle="Quick and secure UPI transfers" />
          <div className="mt-8 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient UPI ID *</label>
                  <input
                    type="text"
                    name="recipientUPI"
                    value={formData.recipientUPI}
                    onChange={handleChange}
                    placeholder="user@upi"
                    className="w-full px-5 py-3 text-gray-900 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: username@bankname</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Name *</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-5 py-3 text-gray-900 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-cyan-50 hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-5 top-4 text-gray-500 text-lg font-semibold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="1000"
                    min="1"
                    max="100000"
                    step="1"
                    className="w-full pl-10 pr-5 py-3 text-gray-900 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all duration-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Min: ₹1 | Max: ₹100,000</p>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Payment for..."
                  rows={3}
                  className="w-full px-5 py-3 text-gray-900 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-md resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200</p>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                <Send className="w-5 h-5 mr-2" />
                Continue to Payment
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay • Your data is encrypted
              </p>
            </form>
          </div>
        </Card>
      )}

      {/* Confirmation Screen */}
      {paymentStep === 'confirm' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 animate-in fade-in scale-in">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-8">Confirm Payment</h2>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 space-y-4 mb-8 border border-slate-200/50">
            <div className="flex justify-between py-4 border-b border-slate-200/50">
              <span className="text-gray-600 font-medium">Recipient:</span>
              <span className="font-bold text-gray-800">{formData.recipientName}</span>
            </div>
            <div className="flex justify-between py-4 border-b border-slate-200/50">
              <span className="text-gray-600 font-medium">UPI ID:</span>
              <span className="font-semibold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg">{formData.recipientUPI}</span>
            </div>
            <div className="flex justify-between py-4 border-b border-slate-200/50">
              <span className="text-gray-600 font-medium">Amount:</span>
              <span className="font-bold text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{formData.amount}</span>
            </div>
            {formData.description && (
              <div className="flex justify-between py-4">
                <span className="text-gray-600 font-medium">Note:</span>
                <span className="font-medium text-gray-700 bg-gray-100/50 px-3 py-1 rounded-lg">{formData.description}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setPaymentStep('form')}
              className="flex-1 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <CheckCircle className="w-5 h-5 inline mr-2 group-hover:scale-110 transition-transform duration-300" />
              Confirm & Pay
            </button>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {paymentStep === 'loading' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-2xl p-12 text-center border border-blue-200/50 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-6 shadow-lg shadow-blue-500/40">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">Processing Payment</h2>
          <p className="text-gray-700 text-lg mb-2 font-medium">Please wait while we process your payment</p>
          <p className="text-sm text-gray-500">Do not close this window</p>
        </div>
      )}

      {/* Success Screen */}
      {paymentStep === 'success' && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-2xl p-12 text-center border border-green-200/50 animate-in zoom-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg shadow-green-500/40 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">Payment Successful!</h2>
          <p className="text-gray-700 text-lg mb-6 font-medium">₹{formData.amount} has been sent to <span className="text-indigo-600">{formData.recipientName}</span></p>
          <p className="text-sm text-gray-500">Redirecting in a moment...</p>
        </div>
      )}

      {/* Transaction History */}
      {paymentStep === 'form' && payments.length > 0 && (
        <Card variant="elevated">
          <CardHeader title="Transaction History" subtitle={`${payments.length} transaction(s)`} />
          <div className="mt-8 p-6">
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200/50 group">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{payment.recipientName}</p>
                    <p className="text-sm text-gray-600 mt-1">{payment.recipientUPI}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(payment.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">₹{payment.amount}</p>
                    <div className={`flex items-center justify-end space-x-1 text-sm font-medium mt-1 ${
                      payment.status === 'success' ? 'text-green-600' :
                      payment.status === 'failed' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        payment.status === 'success' ? 'bg-green-600' :
                        payment.status === 'failed' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}></span>
                      <span className="capitalize">{payment.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
