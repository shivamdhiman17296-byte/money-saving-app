import { useAuthStore } from '../../store/authStore';
import { useFinancialStore } from '../../store/financialStore';
import { TrendingUp, Wallet, Send, AlertCircle, ArrowDownLeft, Repeat2, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const getChartData = (userIncome: number) => [
  { month: 'Jan', spending: Math.round(userIncome * 0.5625), income: Math.round(userIncome * 0.16) },
  { month: 'Feb', spending: Math.round(userIncome * 0.65), income: Math.round(userIncome * 0.17) },
  { month: 'Mar', spending: Math.round(userIncome * 0.6), income: Math.round(userIncome * 0.18) },
  { month: 'Apr', spending: Math.round(userIncome * 0.7625), income: Math.round(userIncome * 0.184) },
  { month: 'May', spending: Math.round(userIncome * 0.7375), income: Math.round(userIncome * 0.176) },
  { month: 'Jun', spending: Math.round(userIncome * 0.9), income: Math.round(userIncome * 0.2) },
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

  const monthlyIncome = user?.monthly_income || 50000;
  const monthlyBudget = user?.monthly_budget || 25000;
  const savingGoal = user?.saving_goal || 15000;
  const monthlySpending = 12500;
  
  const mockChartData = getChartData(monthlyIncome);
  const savingsRate = (((monthlyIncome - monthlySpending) / monthlyIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Alert */}
      {!user?.monthly_income && (
        <div className="bg-amber-900 border border-amber-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-300 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-100">Set Your Financial Goals</p>
              <p className="text-sm text-amber-200 mt-1">Go to Profile to set income, budget & savings target</p>
            </div>
          </div>
          <Link to="/profile">
            <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition whitespace-nowrap">Set Now</button>
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Monthly Income</p>
            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all duration-300">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">₹{monthlyIncome.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">+12% from last month</p>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Budget Limit</p>
            <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all duration-300">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">₹{monthlyBudget.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">Total allocation</p>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Monthly Spending</p>
            <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-all duration-300">
              <ArrowDownLeft className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">₹{monthlySpending.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">{((monthlySpending / monthlyIncome) * 100).toFixed(1)}% of income</p>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Saving Goal</p>
            <div className="p-3 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-all duration-300">
              <Send className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">₹{savingGoal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">Target this month</p>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="scroll-reveal-left card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Budget Usage</p>
            <span className={`text-lg font-bold ${monthlySpending > monthlyBudget ? 'text-red-400' : 'text-green-400'}`}>
              {((monthlySpending / monthlyBudget) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur">
            <div 
              className={`h-full rounded-full ${monthlySpending > monthlyBudget ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-green-500 to-green-400'}`}
              style={{width: `${Math.min((monthlySpending / monthlyBudget) * 100, 100)}%`}}
            ></div>
          </div>
        </div>

        <div className="scroll-reveal-scale card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Savings Rate</p>
            <span className="text-lg font-bold text-cyan-400">{savingsRate}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
              style={{width: `${Math.min(parseFloat(savingsRate), 100)}%`}}
            ></div>
          </div>
        </div>

        <div className="scroll-reveal-right card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Remaining Budget</p>
            <span className={`text-lg font-bold ${monthlyBudget - monthlySpending > 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{Math.abs(monthlyBudget - monthlySpending).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{monthlyBudget - monthlySpending > 0 ? '✓ Safe' : '⚠ Over budget'}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="scroll-reveal-left card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Spending Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="scroll-reveal-right card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Income vs Spending</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="spending" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/recurring"
          className="scroll-reveal stagger-item card-3d glass-effect rounded-xl p-6 hover-lift transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-lg">Recurring</h3>
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all">
              <Repeat2 className="w-5 h-5 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{recurringTransactions.filter(t => t.isActive).length}</p>
          <p className="text-xs text-slate-400 mt-2">Active payments</p>
        </Link>

        <Link
          to="/debt"
          className="scroll-reveal stagger-item card-3d glass-effect rounded-xl p-6 hover-lift transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-lg">Total Debt</h3>
            <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-all">
              <TrendingDown className="w-5 h-5 text-red-400 group-hover:scale-125 transition-transform" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">₹{debts.reduce((sum, d) => sum + d.currentBalance, 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">{debts.length} debts</p>
        </Link>

        <div className="scroll-reveal stagger-item card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-lg">Obligations</h3>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            ₹{(
              recurringTransactions
                .filter(t => t.isActive && t.frequency === 'monthly')
                .reduce((sum, t) => sum + t.amount, 0) +
              debts.reduce((sum, d) => sum + (d.emiAmount || 0), 0)
            ).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-2">This month</p>
        </div>
      </div>

      {/* Recent Transactions */}
      {/* Recent Transactions */}
      <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          </div>
          <Link to="/transactions" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium smooth-underline">
            View All →
          </Link>
        </div>

        <div className="space-y-3">
          {mockTransactions.map((transaction, index) => (
            <div key={transaction.id} className={`stagger-item flex items-center justify-between p-4 glass-effect rounded-lg hover-lift group ${index < mockTransactions.length ? 'scroll-reveal' : ''}`} style={{animationDelay: `${0.05 + index * 0.1}s`}}>
              <div className="flex items-center space-x-4">
                <div className="text-3xl group-hover:scale-125 transition-transform duration-300">{transaction.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{transaction.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{transaction.date}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
