import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingDown, Calendar } from 'lucide-react';
import { useFinancialStore, Debt } from '../../store/financialStore';
import { Card, Badge } from '../../components/UI';

export default function DebtTracker() {
  const { debts, addDebt, updateDebt, deleteDebt, getTotalDebt, calculateDebtPayoffDate } = useFinancialStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    currentBalance: '',
    interestRate: '',
    emiAmount: '',
    totalEMIs: '',
    completedEMIs: '0',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'loan' as const,
    creditor: '',
    notes: '',
  });

  const debtTypeIcons: Record<string, string> = {
    loan: '🏦',
    creditcard: '💳',
    emi: '📅',
  };

  const debtTypeColors: Record<string, string> = {
    loan: 'from-blue-500 to-cyan-500',
    creditcard: 'from-red-500 to-pink-500',
    emi: 'from-purple-500 to-indigo-500',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const debt: Debt = {
      id: editingId || `debt_${Date.now()}`,
      name: formData.name,
      principal: parseFloat(formData.principal),
      currentBalance: parseFloat(formData.currentBalance),
      interestRate: parseFloat(formData.interestRate),
      emiAmount: formData.emiAmount ? parseFloat(formData.emiAmount) : undefined,
      totalEMIs: formData.totalEMIs ? parseInt(formData.totalEMIs) : undefined,
      completedEMIs: parseInt(formData.completedEMIs),
      dueDate: formData.dueDate,
      type: formData.type as any,
      creditor: formData.creditor || undefined,
      notes: formData.notes || undefined,
    };

    if (editingId) {
      updateDebt(editingId, debt);
      setEditingId(null);
    } else {
      addDebt(debt);
    }

    setFormData({
      name: '',
      principal: '',
      currentBalance: '',
      interestRate: '',
      emiAmount: '',
      totalEMIs: '',
      completedEMIs: '0',
      dueDate: new Date().toISOString().split('T')[0],
      type: 'loan',
      creditor: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleEdit = (debt: Debt) => {
    setFormData({
      name: debt.name,
      principal: debt.principal.toString(),
      currentBalance: debt.currentBalance.toString(),
      interestRate: debt.interestRate.toString(),
      emiAmount: debt.emiAmount?.toString() || '',
      totalEMIs: debt.totalEMIs?.toString() || '',
      completedEMIs: (debt.completedEMIs || 0).toString(),
      dueDate: debt.dueDate,
      type: debt.type as any,
      creditor: debt.creditor || '',
      notes: debt.notes || '',
    });
    setEditingId(debt.id);
    setShowForm(true);
  };

  const totalDebt = getTotalDebt();
  const avgInterestRate = debts.length > 0 
    ? (debts.reduce((sum, d) => sum + d.interestRate, 0) / debts.length).toFixed(2)
    : '0';

  const monthlyDebtPayment = debts.reduce((sum, d) => sum + (d.emiAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Debt Tracker
          </h1>
          <p className="text-gray-600 mt-2">Track loans, credit cards, and EMIs with interest calculations</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Debt</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card variant="glass" className="border-error/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Total Debt</p>
              <p className="text-2xl sm:text-3xl font-bold text-error">₹{totalDebt.toLocaleString('en-IN')}</p>
            </div>
            <Badge variant="error">{debts.length}</Badge>
          </div>
        </Card>

        <Card variant="glass" className="border-warning/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Avg Interest</p>
              <p className="text-2xl sm:text-3xl font-bold text-warning">{avgInterestRate}%</p>
            </div>
            <Badge variant="warning">Rate</Badge>
          </div>
        </Card>

        <Card variant="glass" className="border-primary/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Monthly Payment</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">₹{monthlyDebtPayment.toLocaleString('en-IN')}</p>
            </div>
            <Badge variant="primary">EMI</Badge>
          </div>
        </Card>

        <Card variant="glass" className="border-info/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-info">{debts.length > 0 ? ((debts.reduce((sum, d) => sum + (d.completedEMIs || 0), 0) / debts.reduce((sum, d) => sum + (d.totalEMIs || 1), 0)) * 100).toFixed(0) : '0'}%</p>
            </div>
            <Badge variant="info">Done</Badge>
          </div>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Debt' : 'Add New Debt'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debt Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Home Loan"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                  >
                    <option value="loan">Loan</option>
                    <option value="creditcard">Credit Card</option>
                    <option value="emi">EMI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Principal (₹)</label>
                  <input
                    type="number"
                    value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance (₹)</label>
                  <input
                    type="number"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">EMI Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.emiAmount}
                    onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total EMIs</label>
                  <input
                    type="number"
                    value={formData.totalEMIs}
                    onChange={(e) => setFormData({ ...formData, totalEMIs: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completed EMIs</label>
                  <input
                    type="number"
                    value={formData.completedEMIs}
                    onChange={(e) => setFormData({ ...formData, completedEMIs: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 text-gray-900 border-2 border-gray-200 rounded-lg focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update' : 'Add'} Debt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
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

      {/* Debts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Debts</h2>

        {debts.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No debts recorded</p>
            <p className="text-gray-500 text-sm">Start by adding your first debt to track</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {debts.map((debt) => {
              const payoffDate = calculateDebtPayoffDate(debt.id);
              const percentPaid = debt.totalEMIs ? (debt.completedEMIs || 0) / debt.totalEMIs : 0;

              return (
                <div
                  key={debt.id}
                  className={`bg-gradient-to-br ${debtTypeColors[debt.type]} rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{debtTypeIcons[debt.type]}</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg truncate">{debt.name}</h3>
                        {debt.creditor && <p className="text-white/80 text-xs sm:text-sm truncate">{debt.creditor}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Current Balance</span>
                      <span className="font-bold text-lg">₹{debt.currentBalance.toLocaleString('en-IN')}</span>
                    </div>

                    {debt.emiAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">EMI Amount</span>
                        <span className="font-bold">₹{debt.emiAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Interest Rate</span>
                      <span className="font-bold">{debt.interestRate}% p.a.</span>
                    </div>

                    {debt.totalEMIs && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Progress</span>
                        <span className="font-bold">{((percentPaid) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>

                  {debt.totalEMIs && (
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-white/60" style={{ width: `${Math.min(percentPaid * 100, 100)}%` }}></div>
                    </div>
                  )}

                  {payoffDate && (
                    <div className="flex items-center space-x-2 text-sm text-white/80 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Payoff: {payoffDate.toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(debt)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
