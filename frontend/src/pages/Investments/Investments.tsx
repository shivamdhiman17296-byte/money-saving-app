import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Percent, BarChart3, PieChart } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useInvestmentStore } from '../../store/investmentStore';

const INVESTMENT_TYPES = [
  { id: 'mutual_fund', name: 'Mutual Fund', icon: '📊' },
  { id: 'fixed_deposit', name: 'Fixed Deposit', icon: '🏦' },
  { id: 'sip', name: 'SIP', icon: '📈' },
  { id: 'stock', name: 'Stock', icon: '📉' },
  { id: 'gold', name: 'Gold', icon: '🪙' },
  { id: 'bond', name: 'Bond', icon: '📜' },
  { id: 'other', name: 'Other', icon: '💼' },
];

const COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

export default function Investments() {
  const { investments, addInvestment, updateInvestment, deleteInvestment, getPortfolioSummary, getRiskScore, suggestRebalance } = useInvestmentStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: 'mutual_fund' | 'fixed_deposit' | 'sip' | 'stock' | 'gold' | 'bond' | 'other';
    amount: string;
    currentValue: string;
    provider: string;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    purchaseDate: string;
    maturityDate: string;
    interestRate: string;
  }>({
    name: '',
    type: 'mutual_fund',
    amount: '',
    currentValue: '',
    provider: '',
    riskLevel: 'moderate',
    purchaseDate: '',
    maturityDate: '',
    interestRate: '',
  });

  const portfolio = getPortfolioSummary();
  const riskScore = getRiskScore();
  const rebalanceSuggestions = suggestRebalance();

  const handleAddInvestment = () => {
    if (formData.name && formData.amount && formData.currentValue) {
      if (editingId) {
        updateInvestment(editingId, {
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount),
          currentValue: parseFloat(formData.currentValue),
          provider: formData.provider,
          riskLevel: formData.riskLevel,
          purchaseDate: formData.purchaseDate,
          maturityDate: formData.maturityDate || undefined,
          interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        });
        setEditingId(null);
      } else {
        addInvestment({
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount),
          currentValue: parseFloat(formData.currentValue),
          provider: formData.provider,
          riskLevel: formData.riskLevel,
          purchaseDate: formData.purchaseDate,
          maturityDate: formData.maturityDate || undefined,
          interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        });
      }

      setFormData({
        name: '',
        type: 'mutual_fund',
        amount: '',
        currentValue: '',
        provider: '',
        riskLevel: 'moderate',
        purchaseDate: '',
        maturityDate: '',
        interestRate: '',
      });
      setShowForm(false);
    }
  };

  const getAllocationChartData = () => {
    return Object.entries(portfolio.allocationByType)
      .filter(([_, value]) => value > 0)
      .map(([type, value]) => ({
        name: INVESTMENT_TYPES.find((t) => t.id === type)?.name || type,
        value: parseFloat(value.toFixed(1)),
      }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Investment Portfolio</h2>
          <p className="text-gray-400 mt-1">Track and optimize your investments</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              type: 'mutual_fund',
              amount: '',
              currentValue: '',
              provider: '',
              riskLevel: 'moderate',
              purchaseDate: '',
              maturityDate: '',
              interestRate: '',
            });
          }}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 font-semibold group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Invested</h3>
            <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-400">₹{(portfolio.totalInvested / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-400 mt-2">{investments.length} investments</p>
        </div>

        {/* Current Value */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Value</h3>
            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">₹{(portfolio.totalCurrentValue / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-400 mt-2">Today's value</p>
        </div>

        {/* Gain/Loss */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gain/Loss</h3>
            <div className={`p-3 rounded-lg group-hover:opacity-80 transition-opacity ${portfolio.totalGainLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Percent className={`w-5 h-5 ${portfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.totalGainLoss >= 0 ? '+' : ''}₹{(portfolio.totalGainLoss / 100000).toFixed(2)}L
          </p>
          <p className={`text-xs mt-2 ${portfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.gainLossPercentage >= 0 ? '+' : ''}{portfolio.gainLossPercentage.toFixed(2)}%
          </p>
        </div>

        {/* Risk Score */}
        <div className="glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Risk Score</h3>
            <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400">{riskScore}/100</p>
          <p className="text-xs text-slate-400 mt-2">
            {portfolio.averageRiskLevel.charAt(0).toUpperCase() + portfolio.averageRiskLevel.slice(1)}
          </p>
        </div>
      </div>

      {/* Add Investment Form */}
      {showForm && (
        <div className="glass-effect rounded-xl p-6 border border-indigo-500/30 space-y-4">
          <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit Investment' : 'Add New Investment'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Investment Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Axis Direct"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {INVESTMENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Invested Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100000"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Current Value (₹)</label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                placeholder="115000"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Provider/Broker</label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="ICICI Bank"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="conservative">🟢 Conservative</option>
                <option value="moderate">🟡 Moderate</option>
                <option value="aggressive">🔴 Aggressive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Maturity Date (Optional)</label>
              <input
                type="date"
                value={formData.maturityDate}
                onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddInvestment}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              {editingId ? 'Update Investment' : 'Add Investment'}
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

      {/* Allocation Pie Chart */}
      {investments.length > 0 && getAllocationChartData().length > 0 && (
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={getAllocationChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getAllocationChartData().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rebalancing Suggestions */}
      {rebalanceSuggestions.length > 0 && (
        <div className="glass-effect rounded-xl p-6 border border-amber-500/30 bg-amber-500/10">
          <h3 className="text-xl font-semibold text-amber-300 mb-4">⚠️ Rebalancing Suggestions</h3>
          <div className="space-y-3">
            {rebalanceSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-white font-medium">
                  {INVESTMENT_TYPES.find((t) => t.id === suggestion.type)?.name}
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    Current: {suggestion.currentAllocation.toFixed(1)}% → Target: {suggestion.recommendedAllocation}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {investments.map((investment) => {
          const type = INVESTMENT_TYPES.find((t) => t.id === investment.type);
          const roi = ((investment.currentValue - investment.amount) / investment.amount) * 100;

          return (
            <div key={investment.id} className="glass-effect rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{type?.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{investment.name}</h3>
                    <p className="text-sm text-gray-400">{type?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(investment.id);
                      setFormData({
                        name: investment.name,
                        type: investment.type,
                        amount: investment.amount.toString(),
                        currentValue: investment.currentValue.toString(),
                        provider: investment.provider,
                        riskLevel: investment.riskLevel,
                        purchaseDate: investment.purchaseDate,
                        maturityDate: investment.maturityDate || '',
                        interestRate: investment.interestRate?.toString() || '',
                      });
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-gray-400 hover:text-yellow-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteInvestment(investment.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Invested</p>
                  <p className="text-sm font-bold text-blue-400">₹{(investment.amount / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Current Value</p>
                  <p className="text-sm font-bold text-green-400">₹{(investment.currentValue / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">ROI</p>
                  <p className={`text-sm font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                  <p className="text-sm font-bold text-purple-400">{investment.riskLevel.charAt(0).toUpperCase() + investment.riskLevel.slice(1)}</p>
                </div>
              </div>

              {/* Gain/Loss Bar */}
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Gain/Loss</span>
                  <span className={`text-sm font-semibold ${investment.currentValue >= investment.amount ? 'text-green-400' : 'text-red-400'}`}>
                    {investment.currentValue >= investment.amount ? '+' : ''}₹{((investment.currentValue - investment.amount) / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${investment.currentValue >= investment.amount ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((investment.currentValue / investment.amount) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {investments.length === 0 && !showForm && (
        <div className="glass-effect rounded-xl p-12 text-center border border-slate-700/50">
          <BarChart3 className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Investments Yet</h3>
          <p className="text-gray-400 mb-6">Start tracking your investments to monitor growth and returns</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30"
          >
            <Plus className="w-5 h-5" />
            Add Your First Investment
          </button>
        </div>
      )}
    </div>
  );
}
