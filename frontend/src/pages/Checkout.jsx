import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ordersAPI, paymentsAPI } from '../services/api';
import PaymentStatus from '../components/Payment/PaymentStatus';
import PaymentReceipt from '../components/Payment/PaymentReceipt';
import SecurityFeatures from '../components/Payment/SecurityFeatures';
import {
  CreditCard,
  Truck,
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle,
  Smartphone,
  Wallet,
  AlertCircle,
  Loader,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, getCartCount } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [simulationStep, setSimulationStep] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      email: user?.email || '',
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      address: user?.deliveryAddress?.address || '',
      city: user?.deliveryAddress?.city || '',
      state: user?.deliveryAddress?.state || '',
      zipCode: user?.deliveryAddress?.zipCode || '',
      phone: user?.phone || '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      upiId: '',
      deliveryInstructions: '',
      consumerNotes: ''
    }
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentsAPI.getMethods();
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback methods if API fails
      setPaymentMethods([
        {
          id: 'card',
          name: 'Credit/Debit Card',
          description: 'Pay securely with your card',
          icons: ['visa', 'mastercard'],
          supported: true
        },
        {
          id: 'upi',
          name: 'UPI Payment',
          description: 'Google Pay, PhonePe, Paytm',
          icons: ['upi'],
          supported: true
        },
        {
          id: 'wallet',
          name: 'Digital Wallet',
          description: 'PhonePe, Google Pay, Amazon Pay',
          icons: ['wallet'],
          supported: true
        },
        {
          id: 'cash',
          name: 'Cash on Delivery',
          description: 'Pay when you receive your order',
          icons: ['cash'],
          supported: true
        }
      ]);
    }
  };

  const simulatePayment = async (orderId, method, details = {}) => {
    setSimulationStep('processing');
    
    try {
      const response = await paymentsAPI.simulate({
        orderId,
        paymentMethod: method,
        paymentDetails: details
      });

      if (response.data.success) {
        setSimulationStep('success');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { 
          success: true, 
          order: response.data.order,
          transactionId: response.data.transactionId 
        };
      } else {
        setSimulationStep('failed');
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      setSimulationStep('failed');
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: false, error: error.message };
    } finally {
      setSimulationStep(null);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  };

  const onSubmit = async (data) => {
    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Calculate total amount
      const subtotal = getCartTotal();
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      // Generate order number on frontend as fallback
      const orderNumber = generateOrderNumber();

      // Step 1: Create order
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        deliveryAddress: {
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        paymentMethod: paymentMethod,
        deliveryInstructions: data.deliveryInstructions,
        consumerNotes: data.consumerNotes,
        orderNumber: orderNumber
      };

      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      const orderResponse = await ordersAPI.create(orderData);
      const order = orderResponse.data.order;

      console.log('✅ Order created successfully:', order);

      let paymentResult = { success: true, transactionId: `TXN${Date.now()}`, method: paymentMethod, status: 'paid' };

      // Step 2: Process payment simulation for non-cash methods
      if (paymentMethod !== 'cash') {
        paymentResult = await simulatePayment(order._id, paymentMethod, {
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
          nameOnCard: data.nameOnCard,
          upiId: data.upiId
        });

        if (!paymentResult.success) {
          showError(`Payment failed: ${paymentResult.error}`);
          return;
        }
      }

      // Step 3: Set confirmation data and clear cart
      setOrderConfirmed(order);
      setPaymentResult(paymentResult);
      clearCart();
      showSuccess('Order placed successfully!');

    } catch (error) {
      console.error('❌ Checkout error details:', error);
      console.error('🔍 Error response data:', error.response?.data);
      
      // Enhanced error handling
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        console.error('📋 Validation errors:', validationErrors);
        
        // Show the first validation error to user
        if (validationErrors.length > 0) {
          showError(`Validation error: ${validationErrors[0].message}`);
        } else {
          showError(error.response.data.message || 'Failed to place order. Please try again.');
        }
      } else if (error.message) {
        showError(error.message);
      } else {
        showError('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'upi': return <Smartphone className="h-5 w-5" />;
      case 'wallet': return <Wallet className="h-5 w-5" />;
      case 'cash': return <Truck className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodDescription = (method) => {
    switch (method) {
      case 'card': return 'Pay securely with your card';
      case 'upi': return 'Google Pay, PhonePe, Paytm';
      case 'wallet': return 'PhonePe, Google Pay, Amazon Pay';
      case 'cash': return 'Pay when you receive your order';
      default: return '';
    }
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Enhanced input field classes for better dark mode and responsive design
  const inputFieldClasses = `
    w-full px-3 py-2.5 sm:py-3 border rounded-lg 
    bg-white dark:bg-gray-800 
    border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-all duration-200
    text-sm sm:text-base
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const cardClasses = `
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-xl sm:rounded-2xl 
    shadow-sm hover:shadow-md 
    transition-all duration-200
  `;

  // Order Confirmation View
  if (orderConfirmed && paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-green-200 dark:border-green-800"
          >
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Order Confirmed!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Order #: {orderConfirmed.orderNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PaymentStatus 
                status="paid" 
                paymentStatus="paid" 
                order={orderConfirmed} 
              />
              <PaymentReceipt 
                order={orderConfirmed} 
                payment={paymentResult} 
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  if (user?.role === 'consumer') {
                    navigate('/consumer/orders');
                  } else if (user?.role === 'farmer') {
                    navigate('/farmer/orders');
                  } else {
                    navigate('/consumer/orders');
                  }
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                View My Orders
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Items in Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your cart is empty. Add some products to proceed with checkout.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      {/* Payment Simulation Modal */}
      <AnimatePresence>
        {simulationStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 max-w-md w-full mx-auto text-center"
            >
              {simulationStep === 'processing' && (
                <>
                  <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Processing Payment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Please wait while we process your {paymentMethod.toUpperCase()} payment...
                  </p>
                </>
              )}
              
              {simulationStep === 'success' && (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your payment has been processed successfully.
                  </p>
                </>
              )}
              
              {simulationStep === 'failed' && (
                <>
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Please try again or use a different payment method.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate('/consumer/cart')}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-4 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base font-medium">Back to Cart</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 px-2">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base px-2">
            Complete your order with secure payment
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${cardClasses} p-4 sm:p-6`}
              >
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Delivery Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className={inputFieldClasses}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className={inputFieldClasses}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className={`${inputFieldClasses} pl-10`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register('phone')}
                        type="tel"
                        className={`${inputFieldClasses} pl-10`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('address', { required: 'Address is required' })}
                      type="text"
                      className={`${inputFieldClasses} pl-10`}
                      placeholder="Enter your street address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      type="text"
                      className={inputFieldClasses}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      type="text"
                      className={inputFieldClasses}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      type="text"
                      className={inputFieldClasses}
                      placeholder="ZIP Code"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    {...register('deliveryInstructions')}
                    rows="2"
                    className={`${inputFieldClasses} resize-none`}
                    placeholder="Gate code, building instructions, etc..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    {...register('consumerNotes')}
                    rows="2"
                    className={`${inputFieldClasses} resize-none`}
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`${cardClasses} p-4 sm:p-6`}
              >
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            paymentMethod === method.id 
                              ? 'bg-primary-100 dark:bg-primary-900/40' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {getPaymentMethodIcon(method.id)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              {method.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {getPaymentMethodDescription(method.id)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              paymentMethod === method.id
                                ? 'bg-primary-600 border-primary-600 dark:bg-primary-400 dark:border-primary-400'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Payment Method Specific Fields */}
                      {paymentMethod === method.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 sm:mt-4 space-y-3 overflow-hidden"
                        >
                          {method.id === 'card' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Card Number *
                                </label>
                                <input
                                  {...register('cardNumber', {
                                    required: 'Card number is required',
                                    pattern: {
                                      value: /^[0-9]{16}$/,
                                      message: 'Invalid card number (16 digits required)'
                                    }
                                  })}
                                  type="text"
                                  placeholder="1234 5678 9012 3456"
                                  className={inputFieldClasses}
                                  maxLength={16}
                                />
                                {errors.cardNumber && (
                                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardNumber.message}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expiry Date *
                                  </label>
                                  <input
                                    {...register('expiryDate', {
                                      required: 'Expiry date is required',
                                      pattern: {
                                        value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                        message: 'Invalid expiry date (MM/YY)'
                                      }
                                    })}
                                    type="text"
                                    placeholder="MM/YY"
                                    className={inputFieldClasses}
                                  />
                                  {errors.expiryDate && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiryDate.message}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    CVV *
                                  </label>
                                  <input
                                    {...register('cvv', {
                                      required: 'CVV is required',
                                      pattern: {
                                        value: /^[0-9]{3,4}$/,
                                        message: 'Invalid CVV'
                                      }
                                    })}
                                    type="text"
                                    placeholder="123"
                                    className={inputFieldClasses}
                                    maxLength={4}
                                  />
                                  {errors.cvv && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cvv.message}</p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Name on Card *
                                </label>
                                <input
                                  {...register('nameOnCard', { required: 'Name on card is required' })}
                                  type="text"
                                  className={inputFieldClasses}
                                  placeholder="Enter name as on card"
                                />
                                {errors.nameOnCard && (
                                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nameOnCard.message}</p>
                                )}
                              </div>
                            </>
                          )}

                          {method.id === 'upi' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                UPI ID *
                              </label>
                              <input
                                {...register('upiId', {
                                  required: 'UPI ID is required',
                                  pattern: {
                                    value: /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/,
                                    message: 'Invalid UPI ID format'
                                  }
                                })}
                                type="text"
                                placeholder="yourname@upi"
                                className={inputFieldClasses}
                              />
                              {errors.upiId && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.upiId.message}</p>
                              )}
                            </div>
                          )}

                          {method.id === 'cash' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="font-medium text-sm sm:text-base">Cash on Delivery</span>
                              </div>
                              <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm mt-1">
                                You'll pay the delivery agent when you receive your order. 
                                Please keep exact change ready.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Security Features */}
                <div className="mt-6">
                  <SecurityFeatures />
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`${cardClasses} p-4 sm:p-6 sticky top-4`}
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-4 max-h-48 sm:max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <img
                        src={item.images?.[0]?.url || '/api/placeholder/60/60'}
                        alt={item.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-xs">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4 sm:mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300 text-sm">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <span>Estimated delivery: 2-3 business days</span>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <Lock className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Secure SSL Encryption • Your data is protected</span>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>
                        {paymentMethod === 'cash' ? 'Place Order (COD)' : `Pay $${total.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default Checkout;