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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Budget Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 font-semibold group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Budget</span>
        </button>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-6">Create New Budget</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Budget name"
              value={newBudget.name}
              onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 hover:border-slate-500"
            />
            <input
              type="number"
              placeholder="Monthly limit (₹)"
              value={newBudget.limit}
              onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 hover:border-slate-500"
            />
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddBudget} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30">Create</button>
              <button onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
        <h3 className="text-lg font-bold text-white mb-2">Spending Distribution</h3>
        <p className="text-xs text-slate-400 mb-6">Current budget allocation</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ₹${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#e2e8f0'}} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = budget.spent > budget.limit;

          return (
            <div key={budget.id} className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift border border-slate-700/50 group stagger-item" style={{animationDelay: `${index * 0.08}s`}}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">{budget.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    ₹{budget.spent.toLocaleString('en-IN')} / ₹{budget.limit.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-all duration-300 hover:scale-110">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setBudgets(budgets.filter((b) => b.id !== budget.id))}
                    className="p-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/40' : 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/40'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-3 font-semibold px-2 py-1 rounded-full ${isOverBudget ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'}`}>
                  {percentage.toFixed(0)}% Used
                </p>
              </div>

              {/* Alert */}
              {isOverBudget && (
                <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Over budget by ₹{(budget.spent - budget.limit).toLocaleString('en-IN')}</span>
                </div>
              )}

              {percentage >= 80 && percentage < 100 && (
                <div className="flex items-center space-x-2 text-amber-400 text-sm bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Approaching limit</span>
                </div>
              )}

              {percentage < 80 && (
                <div className="text-green-400 text-sm font-semibold bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30">
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
