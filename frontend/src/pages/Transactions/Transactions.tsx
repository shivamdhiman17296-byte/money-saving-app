import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
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
  'Food': 'bg-yellow-100 text-yellow-800',
  'Income': 'bg-green-100 text-green-800',
  'Utilities': 'bg-blue-100 text-blue-800',
  'Transport': 'bg-purple-100 text-purple-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
};

export default function Transactions() {  const { user } = useAuthStore();  const [searchQuery, setSearchQuery] = useState('');
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
  // Display whichever is higher - actual or target
  const displayIncome = Math.max(totalIncome, userMonthlyIncome);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-300/50 rounded-xl p-6 hover:border-green-400/70 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
          <p className="text-sm text-green-700 font-semibold mb-2 group-hover:text-green-600 transition-colors">Total Income</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">+₹{displayIncome.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-600 mt-3 bg-green-500/10 px-2 py-1 rounded-full inline-block">{filteredTransactions.filter((t) => t.type === 'credit').length} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 via-pink-500/10 to-red-500/10 border border-red-300/50 rounded-xl p-6 hover:border-red-400/70 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
          <p className="text-sm text-red-700 font-semibold mb-2 group-hover:text-red-600 transition-colors">Total Expense</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">-₹{totalExpense.toLocaleString('en-IN')}</p>
          <p className="text-xs text-red-600 mt-3 bg-red-500/10 px-2 py-1 rounded-full inline-block">{filteredTransactions.filter((t) => t.type === 'debit').length} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-blue-300/50 rounded-xl p-6 hover:border-blue-400/70 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
          <p className="text-sm text-blue-700 font-semibold mb-2 group-hover:text-blue-600 transition-colors">Net</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">₹{(totalIncome - totalExpense).toLocaleString('en-IN')}</p>
          <p className="text-xs text-blue-600 mt-3 bg-blue-500/10 px-2 py-1 rounded-full inline-block">{filteredTransactions.length} total transactions</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400 group-focus-within:text-pink-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-pink-50 focus:from-indigo-100 focus:to-pink-100 shadow-sm hover:shadow-md"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full border-2 border-purple-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md font-medium"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border-2 border-green-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all duration-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/70 to-indigo-500/70 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 font-semibold group">
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Filter</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/40 hover:scale-105 transition-all duration-300 font-semibold group">
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white border-b border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gradient-to-b from-slate-50 to-slate-100">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-pink-50/50 transition-all duration-300 hover:shadow-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{transaction.icon}</span>
                        <p className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{transaction.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${categoryColors[transaction.category]} hover:shadow-md`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm font-medium">{transaction.date}</td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${transaction.type === 'credit' ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 rounded-lg px-3 py-1' : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-600 rounded-lg px-3 py-1'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 rounded-full text-xs font-semibold border border-green-300/50">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100/50 hover:text-indigo-700 rounded-lg transition-all duration-300 hover:scale-110 font-semibold"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <p className="text-4xl mb-4">{selectedTransaction.icon}</p>
              <h3 className="text-2xl font-bold text-gray-800">{selectedTransaction.description}</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Amount:</span>
                <span className={`font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedTransaction.type === 'credit' ? '+' : '-'}₹{selectedTransaction.amount}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{selectedTransaction.date}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{selectedTransaction.category}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  {selectedTransaction.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
