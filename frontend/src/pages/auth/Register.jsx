import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Phone, Leaf, CheckCircle, XCircle } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'consumer';
  const { register: registerUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: defaultRole
    }
  });

  const role = watch('role');
  const password = watch('password');

  // Password validation rules
  const passwordRequirements = [
    { id: 'length', label: 'At least 6 characters long', test: (pwd) => pwd && pwd.length >= 6 },
    { id: 'uppercase', label: 'One uppercase letter', test: (pwd) => pwd && /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'One lowercase letter', test: (pwd) => pwd && /[a-z]/.test(pwd) },
    { id: 'number', label: 'One number', test: (pwd) => pwd && /\d/.test(pwd) }
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    
    // Prepare the data for registration based on role
    const registrationData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      ...(data.role === 'farmer' && {
        farmName: data.farmName,
        contactNumber: data.contactNumber,
        farmLocation: data.farmLocation?.address ? {
          address: data.farmLocation.address
        } : undefined
      })
    };

    // Remove undefined fields
    Object.keys(registrationData).forEach(key => {
      if (registrationData[key] === undefined) {
        delete registrationData[key];
      }
    });

    const result = await registerUser(registrationData);
    
    if (result.success) {
      showSuccess('Registration successful! Please login to continue.');
      navigate('/login');
    } else {
      showError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <span className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-green-400">
              FarmToKitchen
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Or{' '}
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-10">
          <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-4">
                I want to join as:
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                {['consumer', 'farmer'].map((roleOption) => (
                  <label
                    key={roleOption}
                    className={`relative flex cursor-pointer rounded-xl border-2 p-4 focus:outline-none transition-all duration-200 ${
                      role === roleOption
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-2 ring-primary-500/20 dark:ring-primary-400/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('role', { required: 'Please select a role' })}
                      value={roleOption}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 border-2 ${
                          role === roleOption 
                            ? 'bg-primary-500 border-primary-500 dark:bg-primary-400 dark:border-primary-400' 
                            : 'bg-white dark:bg-gray-600 border-gray-400 dark:border-gray-500'
                        }`} />
                        <div className="text-sm sm:text-base">
                          <div className="font-semibold text-gray-900 dark:text-white capitalize">
                            {roleOption}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                            {roleOption === 'consumer' ? 'Buy fresh produce' : 'Sell your products'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    {...register('name', { 
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Create a password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => 
                        value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Password Requirements:
                </h4>
                <ul className="space-y-2">
                  {passwordRequirements.map((req) => {
                    const isMet = req.test(password);
                    return (
                      <li key={req.id} className="flex items-center text-sm">
                        {isMet ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <span className={isMet ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                          {req.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}

            {/* Farmer-specific fields */}
            {role === 'farmer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-6 border-t pt-6 border-gray-200 dark:border-gray-600"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Farm Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Farm Name *
                    </label>
                    <input
                      {...register('farmName', { 
                        required: role === 'farmer' ? 'Farm name is required' : false,
                        minLength: {
                          value: 2,
                          message: 'Farm name must be at least 2 characters'
                        }
                      })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your farm name"
                      disabled={loading}
                    />
                    {errors.farmName && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.farmName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                      <input
                        {...register('contactNumber', {
                          pattern: {
                            value: /^[+]?[\d\s-()]{10,}$/,
                            message: 'Please enter a valid phone number'
                          }
                        })}
                        type="tel"
                        className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your phone number"
                        disabled={loading}
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.contactNumber.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="farmLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Farm Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-400" />
                    <textarea
                      {...register('farmLocation.address', {
                        maxLength: {
                          value: 200,
                          message: 'Address must be less than 200 characters'
                        }
                      })}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                      rows={3}
                      placeholder="Full farm address"
                      disabled={loading}
                    />
                  </div>
                  {errors.farmLocation?.address && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.farmLocation.address.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 dark:from-primary-500 dark:to-green-500 dark:hover:from-primary-600 dark:hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;