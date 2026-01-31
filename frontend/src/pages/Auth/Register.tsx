import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await register(formData.email, formData.phone, formData.password, formData.full_name);
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-0 { animation-delay: 0s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .scale-in { animation: scaleIn 0.6s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md scale-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-40 h-40 bg-white rounded-full blur-2xl"></div>
            </div>
            <div className="relative flex items-center justify-center space-x-3 mb-4">
              <div className="text-5xl animate-bounce">💰</div>
            </div>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-200 to-cyan-200 bg-clip-text text-transparent">MoneyMaster</h1>
            <p className="text-center text-purple-100 mt-3 font-medium">Create Your Account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {(error || localError) && (
              <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-300/50 text-red-700 px-4 py-3 rounded-lg text-sm backdrop-blur-sm animate-pulse">
                {error || localError}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 group-focus-within:text-pink-500 transition-colors duration-300" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 focus:from-purple-100 focus:to-pink-100 shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400 group-focus-within:text-cyan-500 transition-colors duration-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-cyan-50 focus:from-indigo-100 focus:to-cyan-100 shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-green-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all duration-300 bg-gradient-to-r from-green-50 to-emerald-50 focus:from-green-100 focus:to-emerald-100 shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 group-focus-within:text-red-500 transition-colors duration-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all duration-300 bg-gradient-to-r from-orange-50 to-red-50 focus:from-orange-100 focus:to-red-100 shadow-sm hover:shadow-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-orange-600 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 group-focus-within:text-red-500 transition-colors duration-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all duration-300 bg-gradient-to-r from-orange-50 to-red-50 focus:from-orange-100 focus:to-red-100 shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-3 rounded-lg border border-purple-200/50">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 text-pink-600 rounded cursor-pointer focus:ring-2 focus:ring-pink-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer flex-1">
                I agree to the{' '}
                <a href="#" className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity">
                  Terms and Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 active:scale-95 border border-white/20"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-purple-200/20 px-8 py-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
