import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Edit2, Save, X, Lock, Smartphone, Mail, User, TrendingUp, Target, PiggyBank } from 'lucide-react';

export default function Profile() {
  const { user, setUser, updateFinancialGoals } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    monthly_income: user?.monthly_income || '',
    monthly_budget: user?.monthly_budget || '',
    saving_goal: user?.saving_goal || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Update user profile
    const incomeValue = typeof formData.monthly_income === 'string' ? parseFloat(formData.monthly_income) : formData.monthly_income;
    const budgetValue = typeof formData.monthly_budget === 'string' ? parseFloat(formData.monthly_budget) : formData.monthly_budget;
    const goalValue = typeof formData.saving_goal === 'string' ? parseFloat(formData.saving_goal) : formData.saving_goal;
    
    const updatedUser = {
      id: user?.id || '',
      email: formData.email,
      phone_number: formData.phone_number,
      full_name: formData.full_name,
      monthly_income: incomeValue || undefined,
      monthly_budget: budgetValue || undefined,
      saving_goal: goalValue || undefined,
    };
    setUser(updatedUser);
    
    // Update financial goals
    if (incomeValue && budgetValue && goalValue) {
      updateFinancialGoals(incomeValue, budgetValue, goalValue);
    }
    setEditMode(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Profile Settings</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 font-semibold group w-fit ${
              editMode
                ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-600 hover:from-red-500/40 hover:to-pink-500/40 border border-red-200/50'
                : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 hover:from-indigo-500/40 hover:to-purple-500/40 border border-indigo-200/50'
            }`}
          >
            {editMode ? <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" /> : <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />}
            <span className="text-sm sm:text-base">{editMode ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 mb-10 pb-10 border-b border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-4xl sm:text-5xl shadow-lg shadow-purple-500/40 hover:shadow-xl hover:scale-105 transition-all duration-300 group flex-shrink-0 mx-auto sm:mx-0">
            👤
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{user?.full_name}</h3>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{user?.email}</p>
            {editMode && (
              <button className="mt-3 text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                Change Picture
              </button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
              </div>
              <span>Full Name</span>
            </label>
            {editMode ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm border-2 border-indigo-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-md"
              />
            ) : (
              <p className="px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg text-gray-800 font-medium border border-indigo-100/50">{formData.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              </div>
              <span>Email Address</span>
            </label>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md"
              />
            ) : (
              <p className="px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg text-gray-800 font-medium border border-purple-100/50">{formData.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-pink-100 rounded-lg flex-shrink-0">
                <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
              </div>
              <span>Phone Number</span>
            </label>
            {editMode ? (
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm border-2 border-pink-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all duration-300 bg-gradient-to-r from-pink-50 to-red-50 hover:shadow-md"
              />
            ) : (
              <p className="px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-pink-50/50 to-red-50/50 rounded-lg text-gray-800 font-medium border border-pink-100/50">{formData.phone_number}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Goals Section */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 border-2 border-cyan-200/50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl sm:text-2xl font-bold text-cyan-900 mb-8 flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-cyan-100 rounded-lg flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
          </div>
          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent text-sm sm:text-base">Financial Goals</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Monthly Income */}
          <div className="bg-white/80 rounded-lg p-4 sm:p-6 border-2 border-cyan-200/50 hover:border-cyan-300 transition-all duration-300">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-600" />
              </div>
              <span>Monthly Income (₹)</span>
            </label>
            {editMode ? (
              <input
                type="number"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleChange}
                placeholder="Enter your monthly income"
                className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 bg-cyan-50 hover:shadow-md"
              />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-cyan-700">
                {formData.monthly_income ? `₹${typeof formData.monthly_income === 'string' ? parseInt(formData.monthly_income).toLocaleString('en-IN') : formData.monthly_income.toLocaleString('en-IN')}` : 'Not Set'}
              </p>
            )}
          </div>

          {/* Monthly Budget */}
          <div className="bg-white/80 rounded-lg p-4 sm:p-6 border-2 border-green-200/50 hover:border-green-300 transition-all duration-300">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <PiggyBank className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <span>Monthly Budget (₹)</span>
            </label>
            {editMode ? (
              <input
                type="number"
                name="monthly_budget"
                value={formData.monthly_budget}
                onChange={handleChange}
                placeholder="Enter your monthly budget"
                className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all duration-300 bg-green-50 hover:shadow-md"
              />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-green-700">
                {formData.monthly_budget ? `₹${typeof formData.monthly_budget === 'string' ? parseInt(formData.monthly_budget).toLocaleString('en-IN') : formData.monthly_budget.toLocaleString('en-IN')}` : 'Not Set'}
              </p>
            )}
          </div>

          {/* Saving Goal */}
          <div className="bg-white/80 rounded-lg p-4 sm:p-6 border-2 border-purple-200/50 hover:border-purple-300 transition-all duration-300">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              </div>
              <span>Saving Goal (₹)</span>
            </label>
            {editMode ? (
              <input
                type="number"
                name="saving_goal"
                value={formData.saving_goal}
                onChange={handleChange}
                placeholder="Enter your saving goal"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-purple-50 hover:shadow-md"
              />
            ) : (
              <p className="text-2xl font-bold text-purple-700">
                {formData.saving_goal ? `₹${typeof formData.saving_goal === 'string' ? parseInt(formData.saving_goal).toLocaleString('en-IN') : formData.saving_goal.toLocaleString('en-IN')}` : 'Not Set'}
              </p>
            )}
          </div>
        </div>

        {editMode && (
          <button
            onClick={() => {
              handleSave();
            }}
            className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 font-semibold group hover:scale-105 active:scale-95"
          >
            <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Update Financial Goals</span>
          </button>
        )}
      </div>

      {/* Profile Card Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Personal Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-semibold group ${
              editMode
                ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-600 hover:from-red-500/40 hover:to-pink-500/40 border border-red-200/50'
                : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 hover:from-indigo-500/40 hover:to-purple-500/40 border border-indigo-200/50'
            }`}
          >
            {editMode ? <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> : <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
            <span>{editMode ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex items-center space-x-8 mb-10 pb-10 border-b border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
          <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-5xl shadow-lg shadow-purple-500/40 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            👤
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{user?.full_name}</h3>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            {editMode && (
              <button className="mt-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                Change Picture
              </button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <span>Full Name</span>
            </label>
            {editMode ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-300 bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-md"
              />
            ) : (
              <p className="px-5 py-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg text-gray-800 font-medium border border-indigo-100/50">{formData.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <span>Email Address</span>
            </label>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md"
              />
            ) : (
              <p className="px-5 py-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg text-gray-800 font-medium border border-purple-100/50">{formData.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Smartphone className="w-4 h-4 text-pink-600" />
              </div>
              <span>Phone Number</span>
            </label>
            {editMode ? (
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-5 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all duration-300 bg-gradient-to-r from-pink-50 to-red-50 hover:shadow-md"
              />
            ) : (
              <p className="px-5 py-3 bg-gradient-to-r from-pink-50/50 to-red-50/50 rounded-lg text-gray-800 font-medium border border-pink-100/50">{formData.phone_number}</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        {editMode && (
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 font-semibold group hover:scale-105 active:scale-95"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Security Settings</span>
        </h3>

        <div className="space-y-6">
          {/* Current Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              className="w-full px-5 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all duration-300 bg-gradient-to-r from-red-50 to-pink-50 hover:shadow-md"
            />
          </div>

          {/* New Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Update Password
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Preferences</h3>

        <div className="space-y-4">
          {[
            { label: 'Email Notifications', enabled: true },
            { label: 'SMS Alerts', enabled: true },
            { label: 'Budget Alerts', enabled: true },
            { label: 'Weekly Reports', enabled: false },
            { label: 'Marketing Emails', enabled: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <label className="font-medium text-gray-800">{pref.label}</label>
              <div className="relative">
                <input
                  type="checkbox"
                  defaultChecked={pref.enabled}
                  className="sr-only peer"
                  id={pref.label}
                />
                <label
                  htmlFor={pref.label}
                  className="relative inline-flex w-11 h-6 bg-gray-300 rounded-full cursor-pointer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-red-800 mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold">
            Download My Data
          </button>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
