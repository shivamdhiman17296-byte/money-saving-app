import { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function Budgets() {
  const [budgets, setBudgets] = useState([
    { id: 1, name: 'Food & Dining', limit: 10000, spent: 7500, color: '#f59e0b' },
    { id: 2, name: 'Transportation', limit: 5000, spent: 3200, color: '#3b82f6' },
    { id: 3, name: 'Entertainment', limit: 3000, spent: 2800, color: '#ec4899' },
    { id: 4, name: 'Utilities', limit: 2000, spent: 1500, color: '#8b5cf6' },
    { id: 5, name: 'Shopping', limit: 7000, spent: 5200, color: '#06b6d4' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: '', limit: '' });

  const handleAddBudget = () => {
    if (newBudget.name && newBudget.limit) {
      setBudgets([...budgets, {
        id: Math.max(...budgets.map((b) => b.id)) + 1,
        name: newBudget.name,
        limit: parseInt(newBudget.limit),
        spent: 0,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      }]);
      setNewBudget({ name: '', limit: '' });
      setShowForm(false);
    }
  };

  const chartData = budgets.map((budget) => ({
    name: budget.name,
    value: budget.spent,
    color: budget.color,
  }));

  return (
    <div className="space-y-6">
      {/* Add Budget Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Budget Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 font-semibold group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>New Budget</span>
        </button>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300 animate-in fade-in scale-in">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Create New Budget</h3>
          <div className="space-y-4">
            <div className="group">
              <input
                type="text"
                placeholder="Budget name"
                value={newBudget.name}
                onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md"
              />
            </div>
            <div className="group">
              <input
                type="number"
                placeholder="Monthly limit (₹)"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                className="w-full px-5 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-cyan-50 hover:shadow-md"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddBudget}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-6">Spending Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ₹${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = budget.spent > budget.limit;

          return (
            <div key={budget.id} className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{budget.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ₹{budget.spent.toLocaleString('en-IN')} of ₹{budget.limit.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-indigo-600 hover:bg-indigo-100/50 hover:text-indigo-700 rounded-lg transition-all duration-300 hover:scale-110 group/btn">
                    <Edit2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => setBudgets(budgets.filter((b) => b.id !== budget.id))}
                    className="p-2.5 text-red-600 hover:bg-red-100/50 hover:text-red-700 rounded-lg transition-all duration-300 hover:scale-110 group/btn"
                  >
                    <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-3.5 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/40' : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/40'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-3 font-semibold ${isOverBudget ? 'text-red-600 bg-red-50/50 px-2 py-1 rounded-full' : 'text-green-600 bg-green-50/50 px-2 py-1 rounded-full'}`}>
                  {percentage.toFixed(0)}% Used
                </p>
              </div>

              {/* Alert */}
              {isOverBudget && (
                <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50/60 px-3 py-2 rounded-lg border border-red-200/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Over budget by ₹{(budget.spent - budget.limit).toLocaleString('en-IN')}</span>
                </div>
              )}

              {percentage >= 80 && percentage < 100 && (
                <div className="flex items-center space-x-2 text-orange-600 text-sm bg-orange-50/60 px-3 py-2 rounded-lg border border-orange-200/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Approaching limit</span>
                </div>
              )}

              {percentage < 80 && (
                <div className="text-green-600 text-sm font-semibold bg-green-50/60 px-3 py-2 rounded-lg border border-green-200/50">
                  ₹{(budget.limit - budget.spent).toLocaleString('en-IN')} remaining
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
