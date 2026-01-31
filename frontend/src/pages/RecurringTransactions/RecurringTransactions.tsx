import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Bell, CheckCircle } from 'lucide-react';
import { useFinancialStore, RecurringTransaction } from '../../store/financialStore';

export default function RecurringTransactions() {
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } = useFinancialStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'subscription' as const,
    frequency: 'monthly' as const,
    type: 'expense' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notifyBefore: '3',
  });

  const categoryIcons: Record<string, string> = {
    salary: '💼',
    rent: '🏠',
    utilities: '⚡',
    subscription: '📱',
    insurance: '🛡️',
    other: '📌',
  };

  const categoryColors: Record<string, string> = {
    salary: 'from-green-500 to-emerald-500',
    rent: 'from-orange-500 to-red-500',
    utilities: 'from-yellow-500 to-orange-500',
    subscription: 'from-blue-500 to-purple-500',
    insurance: 'from-purple-500 to-pink-500',
    other: 'from-gray-500 to-slate-500',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: RecurringTransaction = {
      id: editingId || `recurring_${Date.now()}`,
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category as any,
      frequency: formData.frequency as any,
      type: formData.type as any,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      isActive: true,
      nextDueDate: formData.startDate,
      notifyBefore: parseInt(formData.notifyBefore),
    };

    if (editingId) {
      updateRecurringTransaction(editingId, transaction);
      setEditingId(null);
    } else {
      addRecurringTransaction(transaction);
    }

    setFormData({
      title: '',
      amount: '',
      category: 'subscription',
      frequency: 'monthly',
      type: 'expense',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notifyBefore: '3',
    });
    setShowForm(false);
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      category: transaction.category as any,
      frequency: transaction.frequency as any,
      type: transaction.type as any,
      startDate: transaction.startDate,
      endDate: transaction.endDate || '',
      notifyBefore: (transaction.notifyBefore || 3).toString(),
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: 'Every Day',
      weekly: 'Every Week',
      biweekly: 'Every 2 Weeks',
      monthly: 'Every Month',
      quarterly: 'Every Quarter',
      yearly: 'Every Year',
    };
    return labels[freq] || freq;
  };

  const monthlyTotal = recurringTransactions
    .filter((t) => t.isActive)
    .reduce((sum, t) => {
      const multiplier = t.frequency === 'monthly' ? 1 : t.frequency === 'weekly' ? 4.33 : t.frequency === 'yearly' ? 1 / 12 : 1;
      return sum + (t.type === 'expense' ? t.amount * multiplier : -t.amount * multiplier);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Recurring Transactions
          </h1>
          <p className="text-gray-600 mt-2">Manage your bills, subscriptions, and regular payments</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Recurring</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-300/50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-400 transition-all duration-300">
          <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-2">Total Recurring</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{recurringTransactions.length}</p>
          <p className="text-xs text-blue-600 mt-2">Active transactions</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-300/50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-red-400 transition-all duration-300">
          <p className="text-xs sm:text-sm text-red-700 font-semibold mb-2">Monthly Expenses</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">
            ₹{Math.abs(Math.min(monthlyTotal, 0)).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-red-600 mt-2">Recurring costs</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-300/50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-green-400 transition-all duration-300">
          <p className="text-xs sm:text-sm text-green-700 font-semibold mb-2">Monthly Income</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            ₹{Math.max(monthlyTotal, 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-green-600 mt-2">Recurring income</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-300/50 rounded-xl p-6 hover:border-purple-400 transition-all duration-300">
          <p className="text-sm text-purple-700 font-semibold mb-2">Categories</p>
          <p className="text-3xl font-bold text-purple-600">6</p>
          <p className="text-xs text-purple-600 mt-2">Available types</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Recurring Transaction' : 'Add New Recurring Transaction'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Netflix Subscription"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="salary">Salary</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="subscription">Subscription</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update' : 'Add'} Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      amount: '',
                      category: 'subscription',
                      frequency: 'monthly',
                      type: 'expense',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      notifyBefore: '3',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Transactions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Recurring Transactions</h2>
        
        {recurringTransactions.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No recurring transactions yet</p>
            <p className="text-gray-500 text-sm">Start by adding your first recurring payment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recurringTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`bg-gradient-to-br ${categoryColors[transaction.category]} rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-2xl sm:text-3xl">{categoryIcons[transaction.category]}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-lg truncate">{transaction.title}</h3>
                      <p className="text-white/80 text-xs sm:text-sm">{getFrequencyLabel(transaction.frequency)}</p>
                    </div>
                  </div>
                  <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${transaction.isActive ? 'text-green-300' : 'text-gray-300'}`} />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl sm:text-3xl font-bold truncate">
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/80 mb-4">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Next due: {new Date(transaction.nextDueDate).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteRecurringTransaction(transaction.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
