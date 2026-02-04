import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Target, Zap, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSavingsStore } from '../../store/savingsStore';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  { id: 'emergency', name: 'Emergency Fund', icon: '🚨', color: 'text-red-400' },
  { id: 'travel', name: 'Travel Fund', icon: '✈️', color: 'text-blue-400' },
  { id: 'gadgets', name: 'Gadgets', icon: '📱', color: 'text-purple-400' },
  { id: 'education', name: 'Education', icon: '📚', color: 'text-green-400' },
  { id: 'home', name: 'Home', icon: '🏠', color: 'text-yellow-400' },
  { id: 'other', name: 'Other', icon: '💰', color: 'text-cyan-400' },
];

export default function Savings() {
  const { goals, addGoal, updateGoal, deleteGoal, addContribution, getTotalSavingsCurrent, getGoalProgress } = useSavingsStore();
  const { user } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    targetAmount: string;
    deadline: string;
    category: 'emergency' | 'travel' | 'gadgets' | 'education' | 'home' | 'other';
    color: string;
  }>({
    name: '',
    targetAmount: '',
    deadline: '',
    category: 'other',
    color: '#6366f1',
  });

  const [showContributions, setShowContributions] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const totalSavings = getTotalSavingsCurrent();
  const monthlyIncome = user?.monthly_income || 50000;
  const savingsRate = ((totalSavings / monthlyIncome) * 100).toFixed(1);

  const handleAddGoal = () => {
    if (formData.name && formData.targetAmount && formData.deadline) {
      if (editingId) {
        updateGoal(editingId, {
          name: formData.name,
          targetAmount: parseInt(formData.targetAmount),
          deadline: formData.deadline,
          category: formData.category,
        });
        setEditingId(null);
      } else {
        addGoal({
          name: formData.name,
          targetAmount: parseInt(formData.targetAmount),
          currentAmount: 0,
          deadline: formData.deadline,
          category: formData.category,
          color: formData.color,
          milestones: [],
        });
      }

      setFormData({
        name: '',
        targetAmount: '',
        deadline: '',
        category: 'other',
        color: '#6366f1',
      });
      setShowForm(false);
    }
  };

  const handleAddContribution = (goalId: string) => {
    if (contributionAmount && parseFloat(contributionAmount) > 0) {
      addContribution({
        goalId,
        amount: parseFloat(contributionAmount),
        date: new Date().toISOString(),
        source: 'manual',
      });
      setContributionAmount('');
      setShowContributions(null);
    }
  };

  const getSavingsChartData = () => {
    return [
      { name: 'Target', value: Math.round(goals.reduce((sum, g) => sum + g.targetAmount, 0) / 1000) },
      { name: 'Saved', value: Math.round(totalSavings / 1000) },
      { name: 'Remaining', value: Math.round((goals.reduce((sum, g) => sum + g.targetAmount, 0) - totalSavings) / 1000) },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Savings Goals</h2>
          <p className="text-gray-400 mt-1">Track and achieve your financial dreams</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              targetAmount: '',
              deadline: '',
              category: 'other',
              color: '#6366f1',
            });
          }}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 font-semibold group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Saved</h3>
            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">₹{(totalSavings / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400 mt-2">Across all goals</p>
        </div>

        {/* Total Target */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Target Amount</h3>
            <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-400">₹{(goals.reduce((sum, g) => sum + g.targetAmount, 0) / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-400 mt-2">{goals.length} active goals</p>
        </div>

        {/* Savings Rate */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Savings Rate</h3>
            <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400">{savingsRate}%</p>
          <p className="text-xs text-slate-400 mt-2">Of monthly income</p>
        </div>

        {/* Completion Rate */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Overall Progress</h3>
            <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
              <Award className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-pink-400">
            {goals.length > 0
              ? Math.round(
                  (goals.reduce((sum, g) => sum + getGoalProgress(g.id), 0) / goals.length)
                )
              : 0}
            %
          </p>
          <p className="text-xs text-slate-400 mt-2">Average completion</p>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="glass-effect rounded-xl p-6 border border-indigo-500/30 space-y-4">
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit Goal' : 'Create New Savings Goal'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Goal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Vacation"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Target Amount (₹)</label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="50000"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Target Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddGoal}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              {editingId ? 'Update Goal' : 'Create Goal'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      {goals.length > 0 && (
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Savings Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getSavingsChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const category = CATEGORIES.find((c) => c.id === goal.category);
          const progress = getGoalProgress(goal.id);
          const daysRemaining = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
          );

          return (
            <div key={goal.id} className="glass-effect rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category?.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                    <p className="text-sm text-gray-400">{category?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(goal.id);
                      setFormData({
                        name: goal.name,
                        targetAmount: goal.targetAmount.toString(),
                        deadline: goal.deadline,
                        category: goal.category,
                        color: goal.color,
                      });
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-gray-400 hover:text-yellow-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-indigo-400">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Saved</p>
                  <p className="text-lg font-bold text-green-400">₹{(goal.currentAmount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Target</p>
                  <p className="text-lg font-bold text-blue-400">₹{(goal.targetAmount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Days Left</p>
                  <p className="text-lg font-bold text-yellow-400">{Math.max(daysRemaining, 0)}d</p>
                </div>
              </div>

              {/* Add Contribution Button */}
              {showContributions === goal.id ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="Amount (₹)"
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    onClick={() => handleAddContribution(goal.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowContributions(null);
                      setContributionAmount('');
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowContributions(goal.id)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Funds
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && !showForm && (
        <div className="glass-effect rounded-xl p-12 text-center border border-slate-700/50">
          <Target className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Savings Goals Yet</h3>
          <p className="text-gray-400 mb-6">Start your savings journey by creating your first goal</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
