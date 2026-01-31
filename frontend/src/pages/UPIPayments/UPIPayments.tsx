import { useState } from 'react';
import { Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function UPIPayments() {
  const [paymentStep, setPaymentStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState({
    recipientUPI: '',
    recipientName: '',
    amount: '',
    description: '',
  });
  const [pendingPayments] = useState([
    { id: 1, name: 'John Doe', upi: 'john@upi', amount: 500, date: '2026-01-28', status: 'pending' },
    { id: 2, name: 'Jane Smith', upi: 'jane@upi', amount: 1500, date: '2026-01-29', status: 'pending' },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep('confirm');
  };

  const handleConfirm = () => {
    setPaymentStep('success');
    setTimeout(() => {
      setPaymentStep('form');
      setFormData({ recipientUPI: '', recipientName: '', amount: '', description: '' });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Payment Form */}
      {paymentStep === 'form' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">Send Money via UPI</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient UPI ID</label>
                <input
                  type="text"
                  name="recipientUPI"
                  value={formData.recipientUPI}
                  onChange={handleChange}
                  placeholder="user@bank"
                  className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Name</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-5 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-cyan-50 hover:shadow-md"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="1000"
                className="w-full px-5 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all duration-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Payment for..."
                rows={3}
                className="w-full px-5 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-md resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group border border-white/20"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Continue</span>
            </button>
          </form>
        </div>
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

      {/* Pending Payments */}
      {paymentStep === 'form' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Pending Payments</h3>
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-102 border border-yellow-200/50 group cursor-pointer">
                <div>
                  <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{payment.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{payment.upi}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-gray-800">₹{payment.amount}</p>
                  <div className="flex items-center space-x-1 text-yellow-600 text-sm font-medium mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPI Mandates */}
      {paymentStep === 'form' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Active Mandates</h3>
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200/50 rounded-xl p-8 text-center hover:border-cyan-300 transition-all duration-300">
            <AlertCircle className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <p className="text-cyan-900 font-semibold text-lg">No active mandates</p>
            <p className="text-sm text-cyan-700 mt-3">Set up recurring payments for regular expenses</p>
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 active:scale-95">
              Create Mandate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
