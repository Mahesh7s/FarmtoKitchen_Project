import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authAPI } from '../../services/api';
import { Bell, Shield, Moon, Sun, Save, Lock, Trash2 } from 'lucide-react';

const Settings = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    marketingEmails: true,
    twoFactorAuth: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Enhanced CSS classes for consistent styling
  const cardClasses = `
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-xl sm:rounded-2xl 
    shadow-sm hover:shadow-md 
    transition-all duration-200
  `;

  const inputFieldClasses = `
    w-full px-3 py-2.5 sm:py-3 border rounded-lg 
    bg-white dark:bg-gray-800 
    border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-all duration-200
    text-sm sm:text-base
    disabled:bg-gray-50 disabled:dark:bg-gray-900 disabled:text-gray-500 disabled:dark:text-gray-400
    disabled:cursor-not-allowed
  `;

  const buttonClasses = `
    px-4 py-2.5 sm:px-6 sm:py-3 
    font-semibold rounded-lg 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    text-sm sm:text-base
  `;

  // Load saved settings from localStorage or API
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('userSettings', JSON.stringify(settings));
      showSuccess('Settings updated successfully!');
    } catch (error) {
      showError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete all your data, including orders and preferences. Please type "DELETE" to confirm.')) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess('Account deleted successfully');
      logout();
    } catch (error) {
      showError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Moon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left px-2">
            <h1 className="text-1xl sm:text-3xl lg:text-1xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl">
              Manage your account preferences and security settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className={`${cardClasses} p-3 sm:p-4`}>
                <nav className="space-y-1 sm:space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className={`${cardClasses} p-4 sm:p-6`}>
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h2>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Email Notifications
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Receive order updates and promotions via email
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <ToggleSwitch
                          checked={settings.emailNotifications}
                          onChange={() => handleSettingChange('emailNotifications')}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Push Notifications
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Get real-time updates on your orders
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <ToggleSwitch
                          checked={settings.pushNotifications}
                          onChange={() => handleSettingChange('pushNotifications')}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          SMS Notifications
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Receive text messages for important updates
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <ToggleSwitch
                          checked={settings.smsNotifications}
                          onChange={() => handleSettingChange('smsNotifications')}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Marketing Emails
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Receive emails about new products and promotions
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <ToggleSwitch
                          checked={settings.marketingEmails}
                          onChange={() => handleSettingChange('marketingEmails')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button for Notification Settings */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className={`${buttonClasses} bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 flex items-center justify-center space-x-2 w-full sm:w-auto`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Change Password Card */}
                  <div className={`${cardClasses} p-4 sm:p-6`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                      <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Change Password
                      </h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className={inputFieldClasses}
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className={inputFieldClasses}
                          placeholder="Enter new password"
                          required
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className={inputFieldClasses}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`${buttonClasses} bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 w-full`}
                      >
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </form>
                  </div>

                  {/* Two-Factor Authentication Card */}
                  <div className={`${cardClasses} p-4 sm:p-6`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Enable 2FA
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <ToggleSwitch
                          checked={settings.twoFactorAuth}
                          onChange={() => handleSettingChange('twoFactorAuth')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone Card */}
                  <div className={`${cardClasses} p-4 sm:p-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                      <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                      <h2 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">
                        Danger Zone
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className={`${buttonClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 w-full sm:w-auto`}
                      >
                        {loading ? 'Deleting Account...' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className={`${cardClasses} p-4 sm:p-6`}>
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                    )}
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Appearance
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Dark Mode
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <div className="sm:ml-4">
                        <ToggleSwitch
                          checked={theme === 'dark'}
                          onChange={toggleTheme}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base mb-3">
                        Theme Selection
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <ThemeOption
                          name="Light"
                          active={theme === 'light'}
                          onClick={() => {
                            if (theme !== 'light') toggleTheme();
                          }}
                        />
                        <ThemeOption
                          name="Dark"
                          active={theme === 'dark'}
                          onClick={() => {
                            if (theme !== 'dark') toggleTheme();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Toggle Switch Component with dark mode support
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
  </label>
);

// Enhanced Theme Option Component with responsive design
const ThemeOption = ({ name, active, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all duration-200 ${
      active
        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
    }`}
  >
    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto mb-2 ${
      name === 'Light' 
        ? 'bg-gray-200 border border-gray-300' 
        : 'bg-gray-800 border border-gray-700'
    }`}></div>
    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
      {name}
    </span>
  </button>
);

export default Settings;