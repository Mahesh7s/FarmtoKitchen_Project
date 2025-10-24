import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Mail, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link - no token found');
        return;
      }

      try {
        // Use your API endpoint - make sure the URL is correct
        const response = await fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          showSuccess('Email verified successfully! You can now login.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
          showError(data.message || 'Email verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Network error. Please try again.');
        showError('Network error. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, showError, showSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="card p-8">
          {status === 'verifying' && (
            <>
              <Loader className="h-16 w-16 text-primary-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 text-primary-600 hover:text-primary-500 font-medium"
              >
                Go to Login Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="block w-full btn-primary"
                >
                  Create New Account
                </Link>
                <Link
                  to="/login"
                  className="block w-full btn-secondary"
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full btn-outline"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;