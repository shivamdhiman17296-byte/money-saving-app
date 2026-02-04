import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'demo@example.com',
    password: 'password123',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      // Redirect to setup if income not set
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err) {
      setLocalError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Card with Animation */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden scale-in hover:shadow-3xl transition-all duration-500">
          {/* Header with Vibrant Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-10 text-white relative overflow-hidden animate-fade-in">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-pattern"></div>
            </div>
            
            <div className="relative flex items-center justify-center space-x-3 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl animate-bounce">💰</div>
            </div>
            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-pink-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              MoneySaver Pro
            </h1>
            <p className="text-center text-purple-100 mt-3 font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>Your Personal Finance Assistant</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message with Animation */}
            {(error || localError) && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium fade-in animate-fade-in">
                {error || localError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <label className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-indigo-500 group-focus-within:text-pink-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-pink-500 focus:shadow-lg focus:shadow-pink-200 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-purple-50 focus:from-white focus:to-white"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <label className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-purple-500 group-focus-within:text-pink-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-purple-200 rounded-xl focus:border-pink-500 focus:shadow-lg focus:shadow-pink-200 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 focus:from-white focus:to-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-purple-400 hover:text-pink-500 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <input
                type="checkbox"
                id="remember"
                className="w-5 h-5 text-indigo-600 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-pink-500 cursor-pointer accent-gradient-to-r accent-indigo-600"
              />
              <label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors">
                Remember me
              </label>
            </div>

            {/* Submit Button with Vibrant Color */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:shadow-pink-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.7s' }}
            >
              <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>

            {/* Forgot Password */}
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <a href="#" className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-80 transition-opacity">
                Forgot password?
              </a>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t-2 border-gradient-to-r from-indigo-200 to-pink-200 px-8 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <p className="text-center text-sm text-gray-700">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-80 transition-opacity">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Card */}
        <div className="mt-8 bg-white/90 backdrop-blur-xl border-2 border-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-3">✨ Demo Credentials:</p>
          <div className="space-y-2 text-gray-700 font-medium">
            <p className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>demo@example.com</span>
            </p>
            <p className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>password123</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-0 { animation-delay: 0s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
