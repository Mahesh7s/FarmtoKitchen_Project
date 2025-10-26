import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ordersAPI } from '../services/api';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  ShoppingBag,
  ChevronRight,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader,
  RefreshCcw,
  X,
  Archive,
  AlertTriangle,
  Ban,
  MoreVertical,
  Eye
} from 'lucide-react';

// Toast Notification Component
const ToastNotification = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 text-orange-800 dark:text-orange-300';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'info':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getToastStyles()} border rounded-lg shadow-lg p-4 flex items-start space-x-3`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Cancel Order Modal Component
const CancelOrderModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderNumber,
  isLoading = false 
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 mx-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              Cancel Order
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
            Are you sure you want to cancel order <strong>#{orderNumber}</strong>? 
            This action cannot be undone.
          </p>
          
          <form onSubmit={handleSubmit}>
            <label htmlFor="reason" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              Reason for cancellation *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this order..."
              rows="3"
              required
              disabled={isLoading}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors duration-200"
            />
            
            {!reason.trim() && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">Please provide a cancellation reason</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 sm:space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Cancel Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(status)}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
};

// Order Item Component
const OrderItem = ({ item }) => (
  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <img
      src={item.product?.images?.[0]?.url || '/api/placeholder/60/60'}
      alt={item.product?.name}
      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-lg flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">
        {item.product?.name}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        Qty: {item.quantity} • ${item.price?.toFixed(2)} each
      </p>
      {item.farmer?.name && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Farmer: {item.farmer.name}
        </p>
      )}
    </div>
    <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">
      ${(item.quantity * item.price)?.toFixed(2)}
    </span>
  </div>
);

// Mobile Order Card Component
const MobileOrderCard = ({ 
  order, 
  user, 
  onUpdateStatus, 
  onCancelOrder, 
  updatingOrders,
  viewMode 
}) => {
  const [showActions, setShowActions] = useState(false);
  const nextAction = getNextStatusAction(order.status);
  const isUpdating = updatingOrders[order._id];
  const canCancel = canCancelOrder(order, user);
  const isRejected = order.status === 'cancelled' || order.status === 'rejected';
  const totalItems = getTotalItems(order);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${
      isRejected 
        ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' 
        : 'border-gray-200 dark:border-gray-700'
    } p-3 sm:p-4`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              Order #{order.orderNumber}
            </h3>
            {isRejected && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                ({order.status === 'rejected' ? 'Rejected' : 'Cancelled'})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300">
            <Calendar className="h-3 w-3" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <Package className="h-3 w-3 ml-2" />
            <span>{totalItems} items</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="mb-3">
        {order.items?.slice(0, 2).map((item, index) => (
          <div key={index} className="mb-2 last:mb-0">
            <OrderItem item={item} />
          </div>
        ))}
        {order.items?.length > 2 && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
            +{order.items.length - 2} more items
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex justify-between items-center">
          <Link
            to={`/${user?.role}/orders/${order._id}`}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-xs sm:text-sm transition-colors duration-200"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Details</span>
          </Link>

          {viewMode === 'active' && !isRejected && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[140px]">
                  {/* Farmer Actions */}
                  {user?.role === 'farmer' && !isUpdating && (
                    <>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => {
                            onUpdateStatus(order._id, 'confirmed');
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400"
                        >
                          Confirm & Accept
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => {
                            onUpdateStatus(order._id, 'processing');
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-orange-600 dark:text-orange-400"
                        >
                          Start Processing
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => {
                            onUpdateStatus(order._id, 'shipped');
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => {
                            onUpdateStatus(order._id, 'delivered');
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-green-600 dark:text-green-400"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </>
                  )}

                  {/* Cancel Action */}
                  {canCancel && (
                    <button 
                      onClick={() => {
                        onCancelOrder(order);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700"
                    >
                      {user?.role === 'farmer' ? 'Reject Order' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading state */}
        {isUpdating && (
          <div className="flex justify-center items-center space-x-2 mt-2 text-gray-600 dark:text-gray-400">
            <Loader className="h-3 w-3 animate-spin" />
            <span className="text-xs">Updating...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Desktop Order Card Component
const DesktopOrderCard = ({ 
  order, 
  user, 
  onUpdateStatus, 
  onCancelOrder, 
  updatingOrders,
  viewMode 
}) => {
  const nextAction = getNextStatusAction(order.status);
  const isUpdating = updatingOrders[order._id];
  const canCancel = canCancelOrder(order, user);
  const isRejected = order.status === 'cancelled' || order.status === 'rejected';
  const totalItems = getTotalItems(order);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${
      isRejected 
        ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' 
        : 'border-gray-200 dark:border-gray-700'
    } p-4 sm:p-6 hover:shadow-md transition-all duration-200`}>
      {/* Order Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className={`p-2 rounded-lg ${
            isRejected 
              ? 'bg-red-100 dark:bg-red-900/20' 
              : 'bg-primary-50 dark:bg-primary-900/20'
          }`}>
            {getStatusIcon(order.status)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg sm:text-xl mb-1">
              Order #{order.orderNumber}
              {isRejected && (
                <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-medium">
                  ({order.status === 'rejected' ? 'Rejected by Farmer' : 'Cancelled by You'})
                </span>
              )}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>{totalItems} items</span>
              </div>
              {order.deliveryAddress && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate max-w-[150px]">
                    {order.deliveryAddress.city}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <OrderStatusBadge status={order.status} />
          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {order.items?.slice(0, 2).map((item, index) => (
            <OrderItem key={index} item={item} />
          ))}
          {order.items?.length > 2 && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <span className="font-semibold text-primary-600 dark:text-primary-400 text-sm">+{order.items.length - 2}</span>
              </div>
              <p className="text-sm sm:text-base">more items</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {/* Active Order Actions */}
            {viewMode === 'active' && !isRejected && (
              <>
                {/* Farmer Actions */}
                {user?.role === 'farmer' && !isUpdating && (
                  <>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'confirmed')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        Confirm Payment & Accept
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'processing')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        Start Processing
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'shipped')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button 
                        onClick={() => onUpdateStatus(order._id, 'delivered')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </>
                )}

                {/* Cancel Order Button */}
                {canCancel && (
                  <button 
                    onClick={() => onCancelOrder(order)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 sm:space-x-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{user?.role === 'farmer' ? 'Reject Order' : 'Cancel Order'}</span>
                  </button>
                )}
              </>
            )}

            {/* Loading state */}
            {isUpdating && (
              <div className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400">
                <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Updating...</span>
              </div>
            )}
          </div>
          
          <Link
            to={`/${user?.role}/orders/${order._id}`}
            className="flex items-center space-x-1 sm:space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-xs sm:text-sm transition-colors duration-200 group w-full sm:w-auto justify-center sm:justify-start"
          >
            <span>View Details</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper Functions
const getStatusIcon = (status) => {
  switch (status) {
    case 'delivered': return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
    case 'shipped': return <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
    case 'processing': return <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />;
    case 'confirmed': return <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />;
    case 'cancelled':
    case 'rejected': return <Ban className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
    default: return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
  }
};

const getNextStatusAction = (currentStatus) => {
  switch (currentStatus) {
    case 'pending': return { label: 'Confirm Payment & Accept', status: 'confirmed', color: 'bg-purple-600 hover:bg-purple-700' };
    case 'confirmed': return { label: 'Start Processing', status: 'processing', color: 'bg-orange-600 hover:bg-orange-700' };
    case 'processing': return { label: 'Mark as Shipped', status: 'shipped', color: 'bg-blue-600 hover:bg-blue-700' };
    case 'shipped': return { label: 'Mark as Delivered', status: 'delivered', color: 'bg-green-600 hover:bg-green-700' };
    default: return null;
  }
};

const getTotalItems = (order) => {
  return order.items?.reduce((total, item) => total + item.quantity, 0) || 0;
};

const canCancelOrder = (order, user) => {
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  
  if (!cancellableStatuses.includes(order.status)) {
    return false;
  }

  if (user?.role === 'consumer') {
    const isConsumerOrder = order.consumer?._id === user?._id || 
                           order.consumer === user?._id;
    return isConsumerOrder;
  }
  
  if (user?.role === 'farmer') {
    const isOrderFarmer = order.items?.some(item => 
      item.farmer?._id === user?._id || item.farmer === user?._id
    );
    return isOrderFarmer;
  }
  
  return false;
};

// Main Orders Component
const Orders = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingOrders, setUpdatingOrders] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState('active');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // State for cancellation modal
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
    isLoading: false
  });

  // State for toast notifications
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast({
      isVisible: false,
      message: '',
      type: 'success'
    });
  };

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchOrders();
    
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      setupSocketListeners();
    }
    
    return () => {
      cleanupSocketListeners();
    };
  }, [socket, isConnected]);

  useEffect(() => {
    // Separate orders into active, delivered, and rejected
    const active = orders.filter(order => 
      order.status !== 'delivered' && 
      order.status !== 'cancelled' && 
      order.status !== 'rejected'
    );
    const delivered = orders.filter(order => order.status === 'delivered');
    
    const rejected = user?.role === 'consumer' 
      ? orders.filter(order => order.status === 'rejected' || order.status === 'cancelled')
      : orders.filter(order => order.status === 'rejected');
    
    setActiveOrders(active);
    setDeliveredOrders(delivered);
    setRejectedOrders(rejected);
    
    let currentOrders = [];
    switch (viewMode) {
      case 'active':
        currentOrders = active;
        break;
      case 'delivered':
        currentOrders = delivered;
        break;
      case 'rejected':
        currentOrders = rejected;
        break;
      default:
        currentOrders = active;
    }
    filterOrders(currentOrders);
  }, [orders, viewMode, user?.role]);

  useEffect(() => {
    let currentOrders = [];
    switch (viewMode) {
      case 'active':
        currentOrders = activeOrders;
        break;
      case 'delivered':
        currentOrders = deliveredOrders;
        break;
      case 'rejected':
        currentOrders = rejectedOrders;
        break;
      default:
        currentOrders = activeOrders;
    }
    filterOrders(currentOrders);
  }, [statusFilter, searchTerm, activeOrders, deliveredOrders, rejectedOrders, viewMode]);

  const setupSocketListeners = () => {
    if (!socket) return;

    console.log('🔌 Setting up socket listeners for orders');

    const handleOrderUpdate = (data) => {
      console.log('🔄 Real-time order update received:', data);
      handleRealTimeOrderUpdate(data);
    };

    const handleOrderCancellation = (data) => {
      console.log('❌ Real-time order cancellation received:', data);
      handleRealTimeOrderCancellation(data);
    };

    const handleOrderRejection = (data) => {
      console.log('🚫 Real-time order rejection received:', data);
      handleRealTimeOrderRejection(data);
    };

    const handleOrderCancelledByConsumer = (data) => {
      console.log('👤 Order cancelled by consumer received:', data);
      handleRealTimeConsumerCancellation(data);
    };

    const handleOrderRejectedByFarmer = (data) => {
      console.log('🚫 Order rejected by another farmer received:', data);
      handleRealTimeOrderRejectedByFarmer(data);
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('order_cancelled', handleOrderCancellation);
    socket.on('order_rejected', handleOrderRejection);
    socket.on('order_cancelled_by_consumer', handleOrderCancelledByConsumer);
    socket.on('order_rejected_by_farmer', handleOrderRejectedByFarmer);

    orders.forEach(order => {
      socket.emit('join_order', order._id);
      console.log(`📍 Joined order room: ${order._id}`);
    });

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('order_cancelled', handleOrderCancellation);
      socket.off('order_rejected', handleOrderRejection);
      socket.off('order_cancelled_by_consumer', handleOrderCancelledByConsumer);
      socket.off('order_rejected_by_farmer', handleOrderRejectedByFarmer);
    };
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    console.log('🧹 Cleaning up socket listeners');
    
    socket.off('order_updated');
    socket.off('order_cancelled');
    socket.off('order_rejected');
    socket.off('order_cancelled_by_consumer');
    socket.off('order_rejected_by_farmer');
    
    orders.forEach(order => {
      socket.emit('leave_order', order._id);
    });
  };

  const handleRealTimeOrderUpdate = (data) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === data.orderId 
          ? { ...data.order, updatedAt: data.timestamp }
          : order
      )
    );
    
    setLastUpdated(new Date());
    
    // Show toast notification for real-time updates
    if (data.newStatus) {
      const statusMessages = {
        'confirmed': 'Order confirmed and accepted!',
        'processing': 'Order is now being processed!',
        'shipped': 'Order has been shipped!',
        'delivered': 'Order has been delivered!'
      };
      
      if (statusMessages[data.newStatus]) {
        showToast(statusMessages[data.newStatus], 'success');
      }
    }
    
    console.log(`✅ Order ${data.orderId} updated in real-time to: ${data.newStatus}`);
  };

  const handleRealTimeOrderCancellation = (data) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === data.orderId 
          ? { ...order, status: 'cancelled', cancellationReason: data.reason, updatedAt: new Date() }
          : order
      )
    );
    
    setLastUpdated(new Date());
    
    // Show toast notification for cancellation
    showToast('Order has been cancelled', 'error');
    
    console.log(`✅ Order ${data.orderId} marked as cancelled in real-time`);
  };

  const handleRealTimeOrderRejection = (data) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === data.orderId 
          ? { 
              ...order, 
              status: 'rejected',
              rejectionReason: data.reason,
              updatedAt: data.timestamp 
            }
          : order
      )
    );
    
    setLastUpdated(new Date());
    
    // Show toast notification for rejection
    showToast('Order has been rejected', 'error');
    
    console.log(`✅ Order ${data.orderId} marked as rejected in real-time`);
  };

  const handleRealTimeConsumerCancellation = (data) => {
    if (user?.role === 'farmer') {
      setOrders(prevOrders => 
        prevOrders.filter(order => order._id !== data.orderId)
      );
      
      setLastUpdated(new Date());
      
      // Show toast notification for consumer cancellation
      showToast('Order cancelled by consumer', 'warning');
      
      console.log(`✅ Order ${data.orderId} removed from farmer's view (cancelled by consumer)`);
    }
  };

  const handleRealTimeOrderRejectedByFarmer = (data) => {
    if (user?.role === 'farmer') {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId 
            ? { 
                ...order, 
                status: 'rejected',
                rejectionReason: data.reason,
                updatedAt: data.timestamp 
              }
            : order
        )
      );
      
      setLastUpdated(new Date());
      
      // Show toast notification for rejection by another farmer
      showToast('Order rejected by another farmer', 'warning');
      
      console.log(`✅ Order ${data.orderId} updated to rejected by another farmer`);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching orders...');
      
      let response;
      if (user?.role === 'consumer') {
        response = await ordersAPI.getConsumerOrders();
      } else if (user?.role === 'farmer') {
        response = await ordersAPI.getFarmerOrders();
      }
      
      setOrders(response.data);
      setLastUpdated(new Date());
      
      console.log(`✅ Loaded ${response.data.length} orders`);
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (ordersToFilter) => {
    let filtered = ordersToFilter;

    if (statusFilter !== 'all' && viewMode === 'active') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
      
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      // Optimistically update the UI
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date() }
            : order
        )
      );
      
      const response = await ordersAPI.updateStatus(orderId, { 
        status: newStatus
      });
      
      console.log('✅ Order status update successful:', response.data);
      
      // Show success toast based on the new status
      const statusMessages = {
        'confirmed': 'Order confirmed and accepted successfully!',
        'processing': 'Order is now being processed!',
        'shipped': 'Order marked as shipped!',
        'delivered': 'Order marked as delivered!'
      };
      
      showToast(statusMessages[newStatus] || 'Order status updated successfully!', 'success');
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      
      // Revert optimistic update on error
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: order.status, updatedAt: new Date() }
            : order
        )
      );
      
      let errorMessage = 'Failed to update order status. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleOpenCancelModal = (order) => {
    setCancelModal({
      isOpen: true,
      order: order,
      isLoading: false
    });
  };

  const handleCloseCancelModal = () => {
    setCancelModal({
      isOpen: false,
      order: null,
      isLoading: false
    });
  };

  const handleCancelOrder = async (reason) => {
    const { order } = cancelModal;
    
    if (!order) return;

    try {
      setCancelModal(prev => ({ ...prev, isLoading: true }));
      
      console.log(`❌ Cancelling order ${order._id}, Reason: ${reason}`);
      
      // Optimistically update the UI
      if (user?.role === 'consumer') {
        setOrders(prevOrders =>
          prevOrders.filter(o => o._id !== order._id)
        );
      } else if (user?.role === 'farmer') {
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o._id === order._id
              ? { 
                  ...o, 
                  status: 'rejected', 
                  rejectionReason: reason, 
                  updatedAt: new Date() 
                }
              : o
          )
        );
      }
      
      const response = await ordersAPI.cancel(order._id, { 
        reason: reason 
      });
      
      console.log('✅ Order cancellation API call successful:', response.data);
      
      // Show success toast
      const message = user?.role === 'consumer' 
        ? 'Order cancelled successfully!' 
        : 'Order rejected successfully!';
      showToast(message, 'success');
      
      handleCloseCancelModal();
      
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      
      // Revert optimistic update on error
      fetchOrders();
      
      let errorMessage = 'Failed to cancel order. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setCancelModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleContinueShopping = () => {
    navigate('/consumer/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        <ToastNotification
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.role === 'consumer' ? 'My Orders' : 'Order Management'}
                </h1>
                
                {/* Real-time status indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className={`text-xs ${
                    isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                  
                  {lastUpdated && (
                    <button
                      onClick={fetchOrders}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                      title="Refresh orders"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      <span className="hidden sm:inline">Updated {lastUpdated.toLocaleTimeString()}</span>
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base">
                {user?.role === 'consumer' 
                  ? 'Track and manage your orders' 
                  : 'Manage incoming customer orders'
                }
                {isConnected && ' • Live updates enabled'}
              </p>
            </div>
            
            {user?.role === 'consumer' && (
              <button 
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2 sm:py-3 px-3 sm:px-4 md:px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span>Continue Shopping</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('active')}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  viewMode === 'active'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Active ({activeOrders.length})</span>
              </button>
              
              <button
                onClick={() => setViewMode('delivered')}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  viewMode === 'delivered'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>History ({deliveredOrders.length})</span>
              </button>

              <button
                onClick={() => setViewMode('rejected')}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  viewMode === 'rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Ban className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  {user?.role === 'consumer' ? 'Cancelled' : 'Rejected'} 
                  ({rejectedOrders.length})
                </span>
              </button>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {viewMode === 'active' 
                ? 'Manage current orders' 
                : viewMode === 'delivered'
                ? 'View completed orders'
                : user?.role === 'consumer'
                ? 'View cancelled orders'
                : 'View rejected orders'
              }
            </div>
          </div>
        </div>

        {/* Filters section - Only show for active orders */}
        {viewMode === 'active' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-start lg:items-center">
              <div className="relative flex-1 max-w-lg w-full">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                />
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 lg:flex-none border border-gray-300 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                </select>
              </div>
            </div>

            {/* Active Filters Indicator */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Showing {filteredOrders.length} of {activeOrders.length} orders
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs sm:text-sm font-medium transition-colors duration-200"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 md:p-12 text-center">
              {viewMode === 'active' ? (
                <Package className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
              ) : viewMode === 'delivered' ? (
                <Archive className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
              ) : (
                <Ban className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
              )}
              <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                {viewMode === 'active' 
                  ? (searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No active orders')
                  : viewMode === 'delivered'
                  ? 'No order history yet'
                  : user?.role === 'consumer'
                  ? 'No cancelled orders'
                  : 'No rejected orders'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-md mx-auto text-xs sm:text-sm md:text-base">
                {viewMode === 'active'
                  ? (searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search terms or filters.' 
                      : user?.role === 'consumer'
                        ? 'Start shopping to see your orders here.'
                        : 'Customer orders will appear here when placed.'
                    )
                  : viewMode === 'delivered'
                  ? 'Completed orders will appear here.'
                  : user?.role === 'consumer'
                  ? 'Cancelled orders will appear here.'
                  : 'Rejected orders will appear here.'
                }
              </p>
              {user?.role === 'consumer' && viewMode === 'active' && (
                <button 
                  onClick={handleContinueShopping}
                  className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base"
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => 
              isMobile ? (
                <MobileOrderCard
                  key={order._id}
                  order={order}
                  user={user}
                  onUpdateStatus={handleUpdateStatus}
                  onCancelOrder={handleOpenCancelModal}
                  updatingOrders={updatingOrders}
                  viewMode={viewMode}
                />
              ) : (
                <DesktopOrderCard
                  key={order._id}
                  order={order}
                  user={user}
                  onUpdateStatus={handleUpdateStatus}
                  onCancelOrder={handleOpenCancelModal}
                  updatingOrders={updatingOrders}
                  viewMode={viewMode}
                />
              )
            )
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModal.isOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelOrder}
        orderNumber={cancelModal.order?.orderNumber}
        isLoading={cancelModal.isLoading}
      />
    </div>
  );
};

export default Orders;