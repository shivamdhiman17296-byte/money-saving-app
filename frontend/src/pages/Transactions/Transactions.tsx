import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const allTransactions = [
  { id: 1, type: 'debit', description: 'Grocery Shopping', amount: 2500, date: '2026-01-27', category: 'Food', status: 'completed', icon: '🛒' },
  { id: 2, type: 'credit', description: 'Salary Credited', amount: 50000, date: '2026-01-25', category: 'Income', status: 'completed', icon: '💼' },
  { id: 3, type: 'debit', description: 'Electricity Bill', amount: 1200, date: '2026-01-24', category: 'Utilities', status: 'completed', icon: '⚡' },
  { id: 4, type: 'debit', description: 'Coffee at Cafe', amount: 350, date: '2026-01-23', category: 'Food', status: 'completed', icon: '☕' },
  { id: 5, type: 'debit', description: 'Gas Station', amount: 1800, date: '2026-01-22', category: 'Transport', status: 'completed', icon: '⛽' },
  { id: 6, type: 'debit', description: 'Movie Tickets', amount: 600, date: '2026-01-21', category: 'Entertainment', status: 'completed', icon: '🎬' },
  { id: 7, type: 'credit', description: 'Freelance Project', amount: 15000, date: '2026-01-20', category: 'Income', status: 'completed', icon: '💻' },
  { id: 8, type: 'debit', description: 'Restaurant', amount: 3200, date: '2026-01-19', category: 'Food', status: 'completed', icon: '🍽️' },
];

const categoryColors: Record<string, string> = {
  'Food': 'bg-yellow-500/20 text-yellow-300',
  'Income': 'bg-green-500/20 text-green-400',
  'Utilities': 'bg-blue-500/20 text-blue-300',
  'Transport': 'bg-purple-500/20 text-purple-300',
  'Entertainment': 'bg-pink-500/20 text-pink-300',
};

export default function Transactions() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<typeof allTransactions[0] | null>(null);

  const categories = ['all', ...new Set(allTransactions.map((t) => t.category))];

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || 
        (filterType === 'income' && transaction.type === 'credit') ||
        (filterType === 'expense' && transaction.type === 'debit');
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [searchQuery, filterType, filterCategory]);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const userMonthlyIncome = user?.monthly_income || 50000;
  const displayIncome = Math.max(totalIncome, userMonthlyIncome);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-2">Total Income</p>
              <p className="text-3xl font-bold text-green-400">+₹{displayIncome.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2">{filteredTransactions.filter((t) => t.type === 'credit').length} transactions</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-2">Total Expense</p>
              <p className="text-3xl font-bold text-red-400">-₹{totalExpense.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2">{filteredTransactions.filter((t) => t.type === 'debit').length} transactions</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-2">Net Balance</p>
              <p className="text-3xl font-bold text-indigo-400">₹{(displayIncome - totalExpense).toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2">{filteredTransactions.length} total transactions</p>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="scroll-reveal card-3d glass-effect rounded-xl p-6 hover-lift">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 hover:border-slate-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 hover:border-slate-500"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 hover:border-slate-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300 font-semibold group">
                <Filter className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span>Filter</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300 font-semibold group">
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="scroll-reveal card-3d glass-effect rounded-xl overflow-hidden hover-lift">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-300 stagger-item" style={{animationDelay: `${index * 0.05}s`}}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{transaction.icon}</span>
                        <p className="font-semibold text-white">{transaction.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${categoryColors[transaction.category]}`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm font-medium">{transaction.date}</td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold border border-green-500/30">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-all duration-300 hover:scale-110 font-semibold"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-xl shadow-2xl max-w-md w-full p-8 card-3d hover-lift">
            <div className="text-center mb-6">
              <p className="text-5xl mb-4 animate-bounce">{selectedTransaction.icon}</p>
              <h3 className="text-2xl font-bold text-white">{selectedTransaction.description}</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-slate-700/50">
                <span className="text-slate-400">Amount:</span>
                <span className={`font-bold text-lg ${selectedTransaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedTransaction.type === 'credit' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-700/50">
                <span className="text-slate-400">Date:</span>
                <span className="font-medium text-white">{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-700/50">
                <span className="text-slate-400">Category:</span>
                <span className="font-medium text-white">{selectedTransaction.category}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400">Status:</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold border border-green-500/30">
                  Completed
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
