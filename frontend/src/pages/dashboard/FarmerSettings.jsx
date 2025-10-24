import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authAPI, userAPI } from '../../services/api';
import { Settings, Bell, Shield, CreditCard, MapPin, User, Save, Lock, DollarSign, Clock } from 'lucide-react';

const FarmerSettings = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('farm-info');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    marketingEmails: true
  });
  const [farmInfo, setFarmInfo] = useState({
    farmName: '',
    farmDescription: '',
    farmLocation: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    contactNumber: '',
    businessHours: {
      open: '09:00',
      close: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [paymentSettings, setPaymentSettings] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    payoutMethod: 'bank_transfer'
  });

  useEffect(() => {
    if (user) {
      // Load farm info
      setFarmInfo({
        farmName: user.farmName || '',
        farmDescription: user.farmDescription || '',
        farmLocation: user.farmLocation || {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          coordinates: { lat: '', lng: '' }
        },
        contactNumber: user.contactNumber || '',
        businessHours: user.businessHours || {
          open: '09:00',
          close: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      });

      // Load notification settings
      if (user.notificationSettings) {
        setSettings(user.notificationSettings);
      }

      // Load payment settings
      if (user.paymentSettings) {
        setPaymentSettings(user.paymentSettings);
      }
    }
  }, [user]);

  const handleFarmInfoChange = (field, value) => {
    if (field.startsWith('farmLocation.')) {
      const locationField = field.split('.')[1];
      setFarmInfo(prev => ({
        ...prev,
        farmLocation: {
          ...prev.farmLocation,
          [locationField]: value
        }
      }));
    } else if (field.startsWith('businessHours.')) {
      const hoursField = field.split('.')[1];
      setFarmInfo(prev => ({
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [hoursField]: value
        }
      }));
    } else {
      setFarmInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSettingChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveFarmInfo = async () => {
    if (!farmInfo.farmName.trim()) {
      showError('Farm name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfile(farmInfo);
      updateProfile(response.data.user);
      showSuccess('Farm information updated successfully!');
    } catch (error) {
      showError(error.message || 'Failed to update farm information');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      await userAPI.updateNotificationSettings(settings);
      showSuccess('Notification settings updated successfully!');
    } catch (error) {
      showError(error.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword) {
      showError('Current password is required');
      return;
    }

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

  const savePaymentSettings = async () => {
    if (paymentSettings.payoutMethod === 'bank_transfer') {
      if (!paymentSettings.bankName || !paymentSettings.accountNumber || !paymentSettings.routingNumber) {
        showError('Please fill all required bank details');
        return;
      }
    }

    setLoading(true);
    try {
      await userAPI.updatePaymentSettings(paymentSettings);
      showSuccess('Payment settings updated successfully!');
    } catch (error) {
      showError(error.message || 'Failed to update payment settings');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const toggleBusinessDay = (day) => {
    setFarmInfo(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        days: prev.businessHours.days.includes(day)
          ? prev.businessHours.days.filter(d => d !== day)
          : [...prev.businessHours.days, day]
      }
    }));
  };

  const navigationTabs = [
    { id: 'farm-info', label: 'Farm Info', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payments', label: 'Payments', icon: DollarSign }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Farm Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your farm profile and account settings
          </p>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 py-3 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Farm Information Section */}
      {activeSection === 'farm-info' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Farm Information</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Farm Name *</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={farmInfo.farmName}
                  onChange={(e) => handleFarmInfoChange('farmName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your farm name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={farmInfo.contactNumber}
                  onChange={(e) => handleFarmInfoChange('contactNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your contact number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Farm Address *</span>
                </div>
              </label>
              <input
                type="text"
                value={farmInfo.farmLocation.address}
                onChange={(e) => handleFarmInfoChange('farmLocation.address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your farm address"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={farmInfo.farmLocation.city}
                  onChange={(e) => handleFarmInfoChange('farmLocation.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={farmInfo.farmLocation.state}
                  onChange={(e) => handleFarmInfoChange('farmLocation.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="State"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={farmInfo.farmLocation.zipCode}
                  onChange={(e) => handleFarmInfoChange('farmLocation.zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ZIP Code"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farm Description
              </label>
              <textarea
                rows={4}
                value={farmInfo.farmDescription}
                onChange={(e) => handleFarmInfoChange('farmDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Describe your farm, practices, specialties, and what makes your products unique..."
              />
            </div>

            {/* Business Hours */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Business Hours</span>
                </div>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={farmInfo.businessHours.open}
                    onChange={(e) => handleFarmInfoChange('businessHours.open', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={farmInfo.businessHours.close}
                    onChange={(e) => handleFarmInfoChange('businessHours.close', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleBusinessDay(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      farmInfo.businessHours.days.includes(day.value)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-600'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={saveFarmInfo}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Farm Information'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Receive order updates and customer inquiries via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Get instant order alerts via SMS
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleSettingChange('smsNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Marketing Updates</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Receive tips and updates about farm-to-kitchen platform
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={() => handleSettingChange('marketingEmails')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={saveNotificationSettings}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Notification Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter current password"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={changePassword}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Lock className="h-4 w-4" />
                <span>{loading ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Section */}
      {activeSection === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payout Method
              </label>
              <select
                value={paymentSettings.payoutMethod}
                onChange={(e) => handlePaymentChange('payoutMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {paymentSettings.payoutMethod === 'bank_transfer' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.bankName}
                      onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.accountHolderName}
                      onChange={(e) => handlePaymentChange('accountHolderName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Account holder name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.accountNumber}
                      onChange={(e) => handlePaymentChange('accountNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Routing Number *
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.routingNumber}
                      onChange={(e) => handlePaymentChange('routingNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter routing number"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={savePaymentSettings}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Payment Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSettings;