import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  BarChart3,
  CreditCard,
  PieChart,
  Send,
  LogOut,
  Menu,
  X,
  Repeat2,
  TrendingDown,
  Home,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Create ripple element
  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '20px';
  ripple.style.height = '20px';
  ripple.style.background = 'rgba(99, 102, 241, 0.6)';
  ripple.style.borderRadius = '50%';
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.pointerEvents = 'none';
  ripple.style.animation = 'rippleClick 0.6s ease-out';
  ripple.style.zIndex = '10';

  // Add position relative to parent if needed
  const parent = button.parentElement;
  if (parent && getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);

  // Remove ripple after animation
  setTimeout(() => ripple.remove(), 600);
};

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
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/recurring', icon: Repeat2, label: 'Recurring' },
    { path: '/debt', icon: TrendingDown, label: 'Debts' },
    { path: '/savings', icon: Target, label: 'Savings' },
    { path: '/investments', icon: TrendingUp, label: 'Investments' },
    { path: '/payments', icon: Send, label: 'Payments' },
    { path: '/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Sidebar */}
      <div
        className={`fixed md:static w-72 h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 z-40 border-r border-slate-700/50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-lg text-white shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300 group-hover:scale-110">
              💰
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight">MoneyMaster</h1>
              <p className="text-xs text-slate-400">Smart Finance</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={(e) => {
                  handleNavClick(e);
                  setSidebarOpen(false);
                }}
                className={`nav-item-3d flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-indigo-600/20 text-white border-l-2 border-indigo-500 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-cyan-600/10 -z-10" />
                )}
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1 h-1 bg-indigo-400 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700/50 space-y-3">
          <div className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300 hover:border-indigo-500/50 border border-slate-700/50">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 rounded-lg font-medium transition-all duration-300 border border-red-600/30 hover:border-red-500/50 group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-6 left-6 z-50 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="hidden sm:block text-sm text-slate-400">
            {new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="p-6 md:p-8 max-w-full">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
