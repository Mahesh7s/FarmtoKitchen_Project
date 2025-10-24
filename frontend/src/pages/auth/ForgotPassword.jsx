import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Leaf, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showError, showSuccess } = useToast();
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const email = watch('email');

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const result = await authAPI.forgotPassword(data.email);
      
      if (result.data) {
        showSuccess('If an account with that email exists, password reset instructions have been sent.');
        setEmailSent(true);
      }
    } catch (error) {
      showError('Failed to send reset instructions. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      showError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      const result = await authAPI.forgotPassword(email);
      if (result.data) {
        showSuccess('Reset instructions sent again!');
      }
    } catch (error) {
      showError('Failed to resend instructions');
    }
    setLoading(false);
  };

  const handleResetForm = () => {
    setEmailSent(false);
    reset();
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-green-400">
                FarmToKitchen
              </span>
            </Link>
          </div>

          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If an account with this email exists, we've sent password reset instructions to:<br />
              <span className="font-medium text-primary-600 dark:text-primary-400">{email}</span>
            </p>

            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 dark:from-primary-500 dark:to-green-500 dark:hover:from-primary-600 dark:hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Instructions'
                )}
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={handleResend}
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  try again
                </button>
              </p>
            </div>

            {/* Try different email */}
            <div className="mt-4">
              <button
                onClick={handleResetForm}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Try a different email address
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-green-400">
              FarmToKitchen
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enter your email and we'll send you reset instructions
          </p>
        </div>

        {/* Forgot Password Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
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
                      value: /^\S+@\S+$/i,
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 dark:from-primary-500 dark:to-green-500 dark:hover:from-primary-600 dark:hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending Instructions...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;