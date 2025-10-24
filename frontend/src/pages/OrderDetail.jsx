import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Loader
} from 'lucide-react';

// Helper function to normalize order data
const normalizeOrderData = (order) => {
  if (!order) return null;
  
  const normalized = { ...order };
  
  // Handle deliveryAddress -> shippingAddress conversion
  if (order.deliveryAddress && !order.shippingAddress) {
    normalized.shippingAddress = {
      addressLine1: order.deliveryAddress.address,
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      zipCode: order.deliveryAddress.zipCode,
      country: order.deliveryAddress.country || 'US'
    };
    
    // Add name from consumer if available
    if (order.consumer && order.consumer.name) {
      const nameParts = order.consumer.name.split(' ');
      normalized.shippingAddress.firstName = nameParts[0];
      normalized.shippingAddress.lastName = nameParts.slice(1).join(' ');
    }
    
    // Add phone from consumer if available
    if (order.consumer && order.consumer.phone) {
      normalized.shippingAddress.phone = order.consumer.phone;
    }
  }
  
  // Ensure items array is properly formatted
  if (normalized.items && Array.isArray(normalized.items)) {
    normalized.items = normalized.items.map(item => ({
      ...item,
      product: item.product || {},
      farmer: item.farmer || {}
    }));
  }
  
  // Ensure status and paymentStatus have fallbacks
  normalized.status = normalized.status || 'pending';
  normalized.paymentStatus = normalized.paymentStatus || 'pending';
  
  // Fix payment status for cash on delivery
  if (normalized.paymentMethod === 'cash' && normalized.status !== 'pending' && normalized.status !== 'cancelled') {
    normalized.paymentStatus = 'paid';
  }
  
  return normalized;
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching order details for ID:', id);
      
      const response = await ordersAPI.getById(id);
      console.log('📦 Raw order data from API:', response.data);
      
      const normalizedOrder = normalizeOrderData(response.data);
      console.log('🔄 Normalized order data:', normalizedOrder);
      
      setOrder(normalizedOrder);
    } catch (err) {
      console.error('❌ Error fetching order details:', err);
      setError(err.message || 'Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
      case 'shipped': return <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />;
      case 'processing': return <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />;
      case 'confirmed': return <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />;
      default: return <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', description: 'Order has been received' },
      { status: 'confirmed', label: 'Payment Verified', description: 'Payment confirmed and order accepted' },
      { status: 'processing', label: 'Processing', description: 'Preparing your order for shipment' },
      { status: 'shipped', label: 'Shipped', description: 'Order is on its way to you' },
      { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' }
    ];

    const currentIndex = steps.findIndex(step => step.status === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
      available: index <= currentIndex + 1
    }));
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      console.log(`🔄 Updating order status to: ${newStatus}`);
      
      await ordersAPI.updateStatus(order._id, newStatus);
      
      // Show success message
      console.log('✅ Status updated successfully');
      
      // Refresh order details
      await fetchOrderDetails();
      
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      setError(err.message || 'Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        setUpdating(true);
        await ordersAPI.cancel(order._id, 'Cancelled by user');
        await fetchOrderDetails(); // Refresh order details
      } catch (err) {
        console.error('Error cancelling order:', err);
        setError('Failed to cancel order.');
      } finally {
        setUpdating(false);
      }
    }
  };

  const getNextAvailableStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'processing', 
      'processing': 'shipped',
      'shipped': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  // Determine payment status display
  const getPaymentStatus = (order) => {
    if (order.paymentMethod === 'cash' && order.status !== 'pending' && order.status !== 'cancelled') {
      return 'paid';
    }
    return order.paymentStatus || 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Order</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
            <button 
              onClick={fetchOrderDetails}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Not Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
            <Link 
              to={user?.role === 'consumer' ? '/consumer/orders' : '/farmer/orders'}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 text-center"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);
  const nextStatus = getNextAvailableStatus(order.status);
  const paymentStatus = getPaymentStatus(order);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Simplified without breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 w-fit group"
              disabled={updating}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm sm:text-base">Back to Orders</span>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Order #{order.orderNumber}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm sm:text-base">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <span className="hidden sm:block">•</span>
                <span className="text-sm sm:text-base">
                  {order.items?.length || 0} items • ${order.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {getStatusIcon(order.status)}
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Order Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Order Status
              </h2>
              
              {/* Progress Steps */}
              <div className="space-y-6">
                {statusSteps.map((step, index) => (
                  <div key={step.status} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-primary-600 text-white' 
                        : step.current
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 border-2 border-primary-500'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`${
                        step.completed || step.current
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <p className="font-medium text-lg">{step.label}</p>
                        <p className="text-sm mt-1">{step.description}</p>
                        {step.current && (
                          <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                            Current status
                          </p>
                        )}
                      </div>
                      {step.current && step.status !== 'delivered' && user?.role === 'farmer' && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleUpdateStatus(nextStatus)}
                            disabled={updating}
                            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                          >
                            {updating ? 'Updating...' : `Mark as ${statusSteps[index + 1]?.label}`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Farmer Quick Actions */}
                {user?.role === 'farmer' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => handleUpdateStatus(nextStatus)}
                          disabled={updating}
                          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                        >
                          {updating ? 'Updating...' : `Mark as ${statusSteps[statusSteps.findIndex(s => s.status === nextStatus)]?.label}`}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Consumer Actions */}
                {user?.role === 'consumer' && order.status === 'pending' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={updating}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 w-full sm:w-auto"
                  >
                    {updating ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}

                {updating && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Updating order status...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Order Items ({order.items?.length || 0})
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <img
                      src={item.product?.images?.[0]?.url || '/api/placeholder/80/80'}
                      alt={item.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-base sm:text-lg mb-1">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Quantity: {item.quantity} × ${(item.price || 0).toFixed(2)}
                      </p>
                      {item.farmer?.name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sold by: {item.farmer.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${(item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    ${order.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    ${order.shippingFee?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax</span>
                  <span className="text-gray-900 dark:text-white">
                    ${order.taxAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">Total</span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Information
              </h2>
              <div className="space-y-3">
                {order.shippingAddress ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {order.shippingAddress.addressLine1}
                        </p>
                        {order.shippingAddress.addressLine2 && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {order.shippingAddress.addressLine2}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                    
                    {(order.shippingAddress.firstName || order.consumer?.name) && (
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900 dark:text-white text-sm sm:text-base">
                          {order.shippingAddress.firstName && order.shippingAddress.lastName 
                            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                            : order.consumer?.name
                          }
                        </span>
                      </div>
                    )}
                    
                    {(order.shippingAddress.phone || order.consumer?.phone) && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900 dark:text-white text-sm sm:text-base">
                          {order.shippingAddress.phone || order.consumer?.phone}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Shipping information not available</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Method</span>
                  <span className="text-gray-900 dark:text-white capitalize text-sm sm:text-base">
                    {order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod || 'Credit Card'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Pending'}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Paid on</span>
                    <span className="text-gray-900 dark:text-white text-sm">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.paymentMethod === 'cash' && paymentStatus === 'paid' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Payment marked as paid for cash on delivery order
                  </p>
                )}
              </div>
            </div>

            {/* Consumer Information (for farmers) */}
            {user?.role === 'farmer' && order.consumer && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white text-sm sm:text-base">
                      {order.consumer.name}
                    </span>
                  </div>
                  {order.consumer.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base break-all">
                        {order.consumer.email}
                      </span>
                    </div>
                  )}
                  {order.consumer.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">
                        {order.consumer.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;