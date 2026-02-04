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
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Income</h3>
            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">₹{(totalIncome / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-400 mt-2">Last 6 months</p>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Expense</h3>
            <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">₹{(totalExpense / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-400 mt-2">Last 6 months</p>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Savings</h3>
            <div className="p-3 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-indigo-400">₹{(totalSavings / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-400 mt-2">Last 6 months</p>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Savings</h3>
            <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-cyan-400">₹{avgMonthlySavings}</p>
          <p className="text-xs text-slate-400 mt-2">Monthly avg</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expense vs Savings */}
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <BarChart className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Trends</h3>
              <p className="text-xs text-slate-400 mt-1">Income, Expense & Savings</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#e2e8f0'}} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
              <Bar dataKey="savings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Savings Trend */}
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <LineChart className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Savings Trend</h3>
              <p className="text-xs text-slate-400 mt-1">Monthly savings progression</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#e2e8f0'}} />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Spending by Category</h3>
              <p className="text-xs text-slate-400 mt-1">Expense breakdown</p>
            </div>
          </div>
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
              <Tooltip formatter={(value) => `₹${value}`} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#e2e8f0'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Category Details</h3>
              <p className="text-xs text-slate-400 mt-1">Spending by category</p>
            </div>
          </div>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-4 glass-effect rounded-lg hover-lift group border border-slate-700/50 cursor-pointer stagger-item" style={{animationDelay: `${index * 0.08}s`}}>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="font-semibold text-white group-hover:text-slate-200">{category.name}</span>
                </div>
                <span className="font-bold text-lg text-cyan-400 group-hover:text-cyan-300">₹{category.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift border border-cyan-500/20">
        <h3 className="text-lg font-bold text-white mb-2">💡 Financial Insights</h3>
        <p className="text-xs text-slate-400 mb-6">Recommendations to improve finances</p>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 glass-effect rounded-lg hover-lift border border-green-500/20 group">
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold whitespace-nowrap">1</div>
            <div>
              <p className="text-white"><span className="font-semibold">Stable Savings:</span> Average monthly savings remains steady at <span className="font-bold text-green-400">₹{avgMonthlySavings}</span>, showing consistent discipline.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 glass-effect rounded-lg hover-lift border border-amber-500/20 group">
            <div className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold whitespace-nowrap">2</div>
            <div>
              <p className="text-white"><span className="font-semibold">Optimize Dining:</span> Food & Dining is your largest expense at <span className="font-bold text-amber-400">₹15,000/month</span>. Consider meal planning to reduce costs.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 glass-effect rounded-lg hover-lift border border-green-500/20 group">
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold whitespace-nowrap">3</div>
            <div>
              <p className="text-white"><span className="font-semibold">Excellent Savings Rate:</span> Your rate is {((totalSavings / totalIncome) * 100).toFixed(1)}%, great for long-term wealth building.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 glass-effect rounded-lg hover-lift border border-indigo-500/20 group">
            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold whitespace-nowrap">4</div>
            <div>
              <p className="text-white"><span className="font-semibold">Keep Going Strong:</span> You've saved ₹{(totalSavings / 100000).toFixed(1)}L in 6 months. Maintain this trajectory!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
