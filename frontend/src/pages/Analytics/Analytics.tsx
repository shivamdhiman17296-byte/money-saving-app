import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Base mock data structure - values will be scaled based on user's income
const getMonthlyData = (userIncome: number) => [
  { month: 'Jan', income: userIncome, expense: Math.round(userIncome * 0.5), savings: Math.round(userIncome * 0.5) },
  { month: 'Feb', income: userIncome * 1.04, expense: Math.round(userIncome * 0.54), savings: Math.round(userIncome * 0.5) },
  { month: 'Mar', income: userIncome * 1.02, expense: Math.round(userIncome * 0.51), savings: Math.round(userIncome * 0.51) },
  { month: 'Apr', income: userIncome * 1.1, expense: Math.round(userIncome * 0.64), savings: Math.round(userIncome * 0.46) },
  { month: 'May', income: userIncome * 1.06, expense: Math.round(userIncome * 0.6), savings: Math.round(userIncome * 0.46) },
  { month: 'Jun', income: userIncome * 1.16, expense: Math.round(userIncome * 0.7), savings: Math.round(userIncome * 0.46) },
];

const categoryData = [
  { name: 'Food & Dining', value: 15000 },
  { name: 'Transportation', value: 8000 },
  { name: 'Entertainment', value: 5000 },
  { name: 'Utilities', value: 4000 },
  { name: 'Shopping', value: 12000 },
  { name: 'Other', value: 6000 },
];

const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];

export default function Analytics() {
  const { user } = useAuthStore();
  const userMonthlyIncome = user?.monthly_income || 50000;
  const monthlyData = getMonthlyData(userMonthlyIncome);
  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = monthlyData.reduce((sum, item) => sum + item.expense, 0);
  const totalSavings = monthlyData.reduce((sum, item) => sum + item.savings, 0);
  const avgMonthlySavings = (totalSavings / monthlyData.length).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl p-7 text-white shadow-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-green-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">Total Income</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <TrendingUp className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{(totalIncome / 100000).toFixed(1)}L</p>
          <p className="text-xs text-green-100 mt-2 font-medium">Last 6 months</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 via-pink-500 to-red-600 rounded-xl p-7 text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-red-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">Total Expense</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <Zap className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{(totalExpense / 100000).toFixed(1)}L</p>
          <p className="text-xs text-red-100 mt-2 font-medium">Last 6 months</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-xl p-7 text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-blue-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">Total Savings</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <Target className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{(totalSavings / 100000).toFixed(1)}L</p>
          <p className="text-xs text-blue-100 mt-2 font-medium">Last 6 months</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-xl p-7 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-purple-400/30 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold opacity-90">Avg Monthly Savings</h3>
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <TrendingUp className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{avgMonthlySavings}</p>
          <p className="text-xs text-purple-100 mt-2 font-medium">Average</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expense vs Savings */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-6">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
              <Bar dataKey="savings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Savings Trend */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Savings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-6">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent mb-6">Category Details</h3>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300 hover:scale-102 group border border-slate-200/50 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg ring-2 ring-offset-2 group-hover:scale-125 transition-transform duration-300"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      outlineColor: COLORS[index % COLORS.length] + '40'
                    }}
                  />
                  <span className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{category.name}</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">₹{category.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200/50 rounded-xl p-8 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
        <h3 className="text-2xl font-bold text-cyan-900 mb-6 flex items-center">
          <span className="text-3xl mr-3">💡</span>
          Financial Insights
        </h3>
        <div className="space-y-4 text-cyan-800">
          <p className="flex items-start space-x-3 bg-white/50 px-4 py-3 rounded-lg border border-cyan-200/30 hover:bg-white/70 transition-colors">
            <span className="text-lg">•</span>
            <span>Your average monthly savings has remained stable at <span className="font-bold text-cyan-900">₹{avgMonthlySavings}</span>, showing consistent financial discipline.</span>
          </p>
          <p className="flex items-start space-x-3 bg-white/50 px-4 py-3 rounded-lg border border-cyan-200/30 hover:bg-white/70 transition-colors">
            <span className="text-lg">•</span>
            <span>Food & Dining is your largest expense category at <span className="font-bold text-cyan-900">₹15,000/month</span>. Consider reviewing dining options to optimize spending.</span>
          </p>
          <p>• Your savings rate is {((totalSavings / totalIncome) * 100).toFixed(1)}%, which is excellent for long-term wealth building.</p>
          <p>• You've saved ₹{(totalSavings / 100000).toFixed(1)}L in the last 6 months. Keep up the great work!</p>
        </div>
      </div>
    </div>
  );
}
