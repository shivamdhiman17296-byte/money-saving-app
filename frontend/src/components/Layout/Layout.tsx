import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  BarChart3,
  CreditCard,
  PieChart,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  Repeat2,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-cyan-300' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions', color: 'text-green-300' },
    { path: '/recurring', icon: Repeat2, label: 'Recurring', color: 'text-blue-300' },
    { path: '/debt', icon: TrendingDown, label: 'Debts', color: 'text-red-300' },
    { path: '/payments', icon: Send, label: 'Payments', color: 'text-pink-300' },
    { path: '/budgets', icon: PieChart, label: 'Budgets', color: 'text-yellow-300' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-orange-300' },
    { path: '/alerts', icon: AlertCircle, label: 'Alerts', color: 'text-red-200' },
    { path: '/profile', icon: Settings, label: 'Profile', color: 'text-purple-300' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div
        className={`fixed md:static w-64 h-screen bg-gradient-to-b from-indigo-700 via-purple-700 to-indigo-900 text-white transition-all duration-300 z-40 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
          <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <div className="text-4xl animate-bounce">💰</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-cyan-300 bg-clip-text text-transparent">MoneyMaster</h1>
          </div>
        </div>

        <nav className="p-6 space-y-2">
          {navItems.map(({ path, icon: Icon, label, color }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                location.pathname === path
                  ? 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 border-l-4 border-pink-300 shadow-lg shadow-pink-500/20'
                  : 'hover:bg-white/10 hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 ${color} transition-transform duration-300 group-hover:scale-110`} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg p-4 border border-purple-400/30 hover:border-pink-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-purple-200">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-600 hover:to-pink-600 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl shadow-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/60 hover:scale-110 transition-all duration-300 active:scale-95"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-purple-500/20 px-4 sm:px-6 py-4 flex items-center justify-between shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent truncate">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-xs sm:text-sm text-purple-200 bg-purple-500/10 px-2 sm:px-3 py-1 rounded-full border border-purple-400/30 whitespace-nowrap">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900">
          <div className="p-4 sm:p-6 md:p-8 max-w-full">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Close sidebar when clicking outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
