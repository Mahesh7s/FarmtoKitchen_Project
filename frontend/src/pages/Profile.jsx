import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { authAPI, uploadAPI } from '../services/api';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  Edit,
  Camera,
  Upload,
  X,
  Shield,
  Award,
  Truck
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
      ...(user?.role === 'farmer' && {
        farmName: user?.farmName || '',
        farmLocation: user?.farmLocation?.address || '',
        farmDescription: user?.farmDescription || '',
        farmType: user?.farmType?.join(', ') || '',
        certifications: user?.certifications?.join(', ') || '',
        businessLicense: user?.businessLicense || ''
      }),
      ...(user?.role === 'consumer' && {
        deliveryAddress: user?.deliveryAddress?.address || '',
        preferences: {
          organic: user?.preferences?.organic || false,
          local: user?.preferences?.local || false,
          seasonal: user?.preferences?.seasonal || false
        }
      })
    }
  });

  // Enhanced input field classes for dark mode and responsive design
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

  const cardClasses = `
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-xl sm:rounded-2xl 
    shadow-sm hover:shadow-md 
    transition-all duration-200
  `;

  const buttonClasses = `
    px-4 py-2.5 sm:px-6 sm:py-3 
    font-semibold rounded-lg 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    text-sm sm:text-base
  `;

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        ...(user.role === 'farmer' && {
          farmName: user.farmName || '',
          farmLocation: user.farmLocation?.address || '',
          farmDescription: user.farmDescription || '',
          farmType: user.farmType?.join(', ') || '',
          certifications: user.certifications?.join(', ') || '',
          businessLicense: user.businessLicense || ''
        }),
        ...(user.role === 'consumer' && {
          deliveryAddress: user.deliveryAddress?.address || '',
          preferences: {
            organic: user.preferences?.organic || false,
            local: user.preferences?.local || false,
            seasonal: user.preferences?.seasonal || false
          }
        })
      });
    }
  }, [user, reset]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      // Upload to server
      const response = await uploadAPI.image(file);
      const imageUrl = response.data.url;

      // Update profile with new avatar
      await authAPI.updateProfile({ avatar: imageUrl });
      updateProfile({ avatar: imageUrl });
      showSuccess('Profile picture updated successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      showError('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProfileImage = async () => {
    try {
      await authAPI.updateProfile({ avatar: '' });
      updateProfile({ avatar: '' });
      setPreviewImage(null);
      showSuccess('Profile picture removed');
    } catch (error) {
      showError('Failed to remove profile picture');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format data based on user role
      const formattedData = {
        name: data.name,
        email: data.email,
        contactNumber: data.contactNumber
      };

      if (user?.role === 'farmer') {
        formattedData.farmName = data.farmName;
        formattedData.farmDescription = data.farmDescription;
        formattedData.farmLocation = {
          address: data.farmLocation,
          city: user.farmLocation?.city || '',
          state: user.farmLocation?.state || '',
          zipCode: user.farmLocation?.zipCode || ''
        };
        formattedData.farmType = data.farmType?.split(',').map(item => item.trim()).filter(Boolean) || [];
        formattedData.certifications = data.certifications?.split(',').map(item => item.trim()).filter(Boolean) || [];
        formattedData.businessLicense = data.businessLicense;
      }

      if (user?.role === 'consumer') {
        formattedData.deliveryAddress = {
          address: data.deliveryAddress,
          city: user.deliveryAddress?.city || '',
          state: user.deliveryAddress?.state || '',
          zipCode: user.deliveryAddress?.zipCode || '',
          isDefault: true
        };
        formattedData.preferences = data.preferences;
      }

      const response = await authAPI.updateProfile(formattedData);
      updateProfile(response.data);
      setEditMode(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      showError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setEditMode(false);
    setPreviewImage(null);
  };

  const currentImage = previewImage || user?.avatar;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto px-4">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${cardClasses} p-4 sm:p-6 text-center`}>
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center mx-auto overflow-hidden ${
                  currentImage ? 'bg-white dark:bg-gray-700' : 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30'
                }`}>
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary-600 dark:text-primary-400" />
                  )}
                </div>
                
                {editMode && (
                  <div className="absolute -bottom-1 -right-1 flex space-x-1">
                    <label className={`bg-primary-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-primary-700 cursor-pointer transition-colors ${
                      uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </label>
                    {currentImage && (
                      <button
                        onClick={removeProfileImage}
                        className="bg-red-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {user?.name}
              </h2>
              <p className="text-primary-600 dark:text-primary-400 font-medium capitalize mb-2 text-sm sm:text-base">
                {user?.role}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>

              {/* Farmer-specific info */}
              {user?.role === 'farmer' && user?.farmName && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="font-semibold text-green-800 dark:text-green-200 text-sm sm:text-base line-clamp-1">
                      {user.farmName}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-300 line-clamp-2">
                    {user.farmLocation?.city}, {user.farmLocation?.state}
                  </p>
                </div>
              )}

              {/* Consumer-specific info */}
              {user?.role === 'consumer' && user?.loyaltyPoints > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
                      {user.loyaltyPoints} Points
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-300">
                    Loyalty Points Earned
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-3">
            <div className={`${cardClasses} p-4 sm:p-6`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span>Personal Information</span>
                </h3>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center justify-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/20 px-4 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className={`${buttonClasses} bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500 w-full sm:w-auto`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading || !isDirty}
                      className={`${buttonClasses} bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 w-full sm:w-auto flex items-center justify-center space-x-2`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        {...register('name', { required: 'Name is required' })}
                        disabled={!editMode}
                        className={`${inputFieldClasses} pl-10`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        disabled={!editMode}
                        className={`${inputFieldClasses} pl-10`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      {...register('contactNumber', {
                        pattern: {
                          value: /^[+]?[\d\s-()]+$/,
                          message: 'Invalid phone number'
                        }
                      })}
                      disabled={!editMode}
                      className={`${inputFieldClasses} pl-10`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
                  )}
                </div>

                {/* Farmer-specific fields */}
                {user?.role === 'farmer' && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span>Farm Information</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Farm Name *
                          </label>
                          <input
                            {...register('farmName', { required: 'Farm name is required' })}
                            disabled={!editMode}
                            className={inputFieldClasses}
                            placeholder="Your farm name"
                          />
                          {errors.farmName && (
                            <p className="text-red-500 text-sm mt-1">{errors.farmName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Business License
                          </label>
                          <input
                            {...register('businessLicense')}
                            disabled={!editMode}
                            className={inputFieldClasses}
                            placeholder="License number"
                          />
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Farm Address *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <textarea
                            {...register('farmLocation', { required: 'Farm address is required' })}
                            disabled={!editMode}
                            rows={3}
                            className={`${inputFieldClasses} pl-10 resize-none`}
                            placeholder="Full farm address"
                          />
                        </div>
                        {errors.farmLocation && (
                          <p className="text-red-500 text-sm mt-1">{errors.farmLocation.message}</p>
                        )}
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Farm Description
                        </label>
                        <textarea
                          {...register('farmDescription')}
                          disabled={!editMode}
                          rows={4}
                          className={`${inputFieldClasses} resize-none`}
                          placeholder="Tell customers about your farm and practices..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Farm Types
                          </label>
                          <input
                            {...register('farmType')}
                            disabled={!editMode}
                            className={inputFieldClasses}
                            placeholder="e.g., vegetables, fruits, dairy"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Separate multiple types with commas
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Certifications
                          </label>
                          <input
                            {...register('certifications')}
                            disabled={!editMode}
                            className={inputFieldClasses}
                            placeholder="e.g., organic, sustainable"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Separate multiple certifications with commas
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Consumer-specific fields */}
                {user?.role === 'consumer' && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>Delivery & Preferences</span>
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Delivery Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <textarea
                            {...register('deliveryAddress')}
                            disabled={!editMode}
                            rows={3}
                            className={`${inputFieldClasses} pl-10 resize-none`}
                            placeholder="Your default delivery address..."
                          />
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Shopping Preferences
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                              type="checkbox"
                              {...register('preferences.organic')}
                              disabled={!editMode}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Organic</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                              type="checkbox"
                              {...register('preferences.local')}
                              disabled={!editMode}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Local</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <input
                              type="checkbox"
                              {...register('preferences.seasonal')}
                              disabled={!editMode}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Seasonal</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;