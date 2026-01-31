import { useAuthStore } from '../../store/authStore';
import { useFinancialStore } from '../../store/financialStore';
import { TrendingUp, Wallet, Send, AlertCircle, ArrowDownLeft, Repeat2, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Generate mock chart data based on user's income
const getChartData = (userIncome: number) => [
  { month: 'Jan', spending: Math.round(userIncome * 0.5625), income: Math.round(userIncome * 0.16) },
  { month: 'Feb', spending: Math.round(userIncome * 0.65), income: Math.round(userIncome * 0.17) },
  { month: 'Mar', spending: Math.round(userIncome * 0.6), income: Math.round(userIncome * 0.18) },
  { month: 'Apr', spending: Math.round(userIncome * 0.7625), income: Math.round(userIncome * 0.184) },
  { month: 'May', spending: Math.round(userIncome * 0.7375), income: Math.round(userIncome * 0.176) },
  { month: 'Jun', spending: Math.round(userIncome * 0.9), income: Math.round(userIncome * 0.2) },
];

const mockCategoryData = [
  { name: 'Food', value: 30, color: '#f97316' },
  { name: 'Transport', value: 20, color: '#3b82f6' },
  { name: 'Utilities', value: 20, color: '#10b981' },
  { name: 'Entertainment', value: 15, color: '#8b5cf6' },
  { name: 'Others', value: 15, color: '#ec4899' },
];

const mockTransactions = [
  { id: 1, type: 'debit', description: 'Grocery Shopping', amount: 2500, date: '2026-01-27', icon: '🛒' },
  { id: 2, type: 'credit', description: 'Salary Credited', amount: 50000, date: '2026-01-25', icon: '💼' },
  { id: 3, type: 'debit', description: 'Electricity Bill', amount: 1200, date: '2026-01-24', icon: '⚡' },
  { id: 4, type: 'debit', description: 'Coffee at Cafe', amount: 350, date: '2026-01-23', icon: '☕' },
  { id: 5, type: 'debit', description: 'Gas Station', amount: 1800, date: '2026-01-22', icon: '⛽' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { recurringTransactions, debts } = useFinancialStore();

  // Use user's income data if available, otherwise use defaults
  const monthlyIncome = user?.monthly_income || 50000;
  const monthlyBudget = user?.monthly_budget || 25000;
  const savingGoal = user?.saving_goal || 15000;
  const monthlySpending = 12500;
  
  // Generate chart data based on user's income
  const mockChartData = getChartData(monthlyIncome);
  
  const savingsRate = (((monthlyIncome - monthlySpending) / monthlyIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Income Setup Alert */}
      {!user?.monthly_income && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 shadow-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 text-lg">Set Your Financial Goals</h3>
                <p className="text-amber-800 mt-1">Go to Profile → Financial Goals to set your income, budget, and savings target for accurate tracking.</p>
              </div>
            </div>
            <a href="/profile" className="flex-shrink-0 px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
              Set Now
            </a>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Monthly Income Card */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-green-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Monthly Income</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">₹{monthlyIncome.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-100 mt-2">Monthly earning</p>
        </div>

        {/* Monthly Budget Card */}
        <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-blue-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Budget Limit</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">₹{monthlyBudget.toLocaleString('en-IN')}</p>
          <p className="text-xs text-blue-100 mt-2">Your budget target</p>
        </div>

        {/* Monthly Spending Card */}
        <div className="bg-gradient-to-br from-red-500 via-pink-500 to-red-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-pink-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Monthly Spending</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">₹{monthlySpending.toLocaleString('en-IN')}</p>
          <p className={`text-xs mt-2 ${monthlySpending > monthlyBudget ? 'text-red-100 font-bold' : 'text-red-100'}`}>
            {monthlySpending > monthlyBudget ? `⚠️ Over budget by ₹${(monthlySpending - monthlyBudget).toLocaleString('en-IN')}` : 'Within budget'}
          </p>
        </div>

        {/* Saving Goal Card */}
        <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-purple-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Saving Goal</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <Send className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">₹{savingGoal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-purple-100 mt-2">{savingsRate}% saved this month</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white/80 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-6">Budget Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Income vs Spending */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200/50">
            <p className="text-sm font-semibold text-gray-700 mb-4">Income vs Spending</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income</span>
                <span className="font-bold text-green-600">₹{monthlyIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{width: '100%'}}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Spending</span>
                <span className={`font-bold ${monthlySpending > monthlyBudget ? 'text-red-600' : 'text-orange-600'}`}>₹{monthlySpending.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-pink-500" style={{width: `${Math.min((monthlySpending / monthlyIncome) * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>

          {/* Budget vs Actual */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200/50">
            <p className="text-sm font-semibold text-gray-700 mb-4">Budget Utilization</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Budget</span>
                <span className="font-bold text-blue-600">₹{monthlyBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500" style={{width: '100%'}}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Used</span>
                <span className={`font-bold ${monthlySpending > monthlyBudget ? 'text-red-600' : 'text-green-600'}`}>{((monthlySpending / monthlyBudget) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-500" style={{width: `${Math.min((monthlySpending / monthlyBudget) * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>

          {/* Savings Progress */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200/50">
            <p className="text-sm font-semibold text-gray-700 mb-4">Savings Progress</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Goal</span>
                <span className="font-bold text-purple-600">₹{savingGoal.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500" style={{width: '100%'}}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saved</span>
                <span className="font-bold text-green-600">₹{Math.max(monthlyIncome - monthlySpending, 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{width: `${Math.min(((monthlyIncome - monthlySpending) / savingGoal) * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-6">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Line type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Spending Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Income vs Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="spending" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {mockCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recurring Transactions Quick View */}
        <Link
          to="/recurring"
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-300/50 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-900">Recurring</h3>
            <Repeat2 className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{recurringTransactions.filter(t => t.isActive).length}</p>
          <p className="text-sm text-blue-700 mt-2">Active recurring payments</p>
        </Link>

        {/* Debts Quick View */}
        <Link
          to="/debt"
          className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-2 border-red-300/50 rounded-xl p-6 hover:border-red-400 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-red-900">Total Debt</h3>
            <TrendingDown className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-red-600">₹{debts.reduce((sum, d) => sum + d.currentBalance, 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-red-700 mt-2">{debts.length} debts being tracked</p>
        </Link>

        {/* Monthly Obligations */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-2 border-orange-300/50 rounded-xl p-6 hover:border-orange-400 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-orange-900">Monthly Obligations</h3>
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            ₹{(
              recurringTransactions
                .filter(t => t.isActive && t.frequency === 'monthly')
                .reduce((sum, t) => sum + t.amount, 0) +
              debts.reduce((sum, d) => sum + (d.emiAmount || 0), 0)
            ).toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-orange-700 mt-2">Recurring + EMI payments</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <a href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </a>
        </div>

        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{transaction.icon}</div>
                <div>
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className={`text-lg font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
          <Send className="w-5 h-5" />
          <span>Send Money</span>
        </button>
        <button className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Add Money</span>
        </button>
        <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>View Analytics</span>
        </button>
      </div>
    </div>
  );
}
