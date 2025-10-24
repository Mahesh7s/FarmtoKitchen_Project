import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/useToast';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight,
  ShoppingBag,
  Package,
  Shield,
  Truck,
  ArrowLeft,
  X,
  AlertTriangle
} from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    showSuccess('Item removed from cart');
    setShowRemoveModal(null);
    setItemToRemove(null);
  };

  const openRemoveModal = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setItemToRemove(null);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }
    navigate('/consumer/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/consumer/products');
  };

  const openClearModal = () => {
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    setShowClearModal(false);
  };

  const handleClearCart = () => {
    clearCart();
    showSuccess('Cart cleared');
    closeClearModal();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Looks like you haven't added any items to your cart yet. Start shopping to discover amazing farm-fresh products!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Continue Shopping</span>
              </button>
              <Link
                to="/consumer/products"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Browse Products</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-3 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm sm:text-base">Back</span>
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Shopping Cart
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
                  </p>
                </div>
                
                <button
                  onClick={handleContinueShopping}
                  className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {cartItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.images?.[0]?.url || '/api/placeholder/120/120'}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <Link 
                        to={`/products/${item._id}`}
                        className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 flex-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => openRemoveModal(item)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg self-start sm:self-auto"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                          ${item.price}
                        </span>
                        {item.isOrganic && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                            Organic
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-8 text-center font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.quantity >= (item.inventory?.quantity || 10)}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right sm:text-left">
                          <span className="text-sm text-gray-600 dark:text-gray-300 block sm:hidden">
                            Subtotal
                          </span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.inventory?.quantity && item.quantity >= item.inventory.quantity && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-300 text-xs">
                          Only {item.inventory.quantity} left in stock
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={openClearModal}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Entire Cart</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-semibold py-3 sm:py-4 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-3 sm:py-4 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mt-3 text-sm sm:text-base"
              >
                Continue Shopping
              </button>

              {/* Security Badges */}
              <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-medium">Fresh Products</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium">Secure Checkout</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Remove Item Confirmation Modal */}
      <AnimatePresence>
        {showRemoveModal && itemToRemove && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={closeRemoveModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Remove Item
                    </h3>
                  </div>
                  <button
                    onClick={closeRemoveModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Are you sure you want to remove <strong className="text-gray-900 dark:text-white">{itemToRemove.name}</strong> from your cart?
                  </p>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <img
                      src={itemToRemove.images?.[0]?.url || '/api/placeholder/60/60'}
                      alt={itemToRemove.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {itemToRemove.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        ${itemToRemove.price} × {itemToRemove.quantity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeRemoveModal}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRemoveItem(itemToRemove._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove Item</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={closeClearModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Clear Cart
                    </h3>
                  </div>
                  <button
                    onClick={closeClearModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Are you sure you want to clear your entire cart? This will remove all {getCartCount()} items and cannot be undone.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        This action is permanent and cannot be reversed. All items in your cart will be removed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeClearModal}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear {getCartCount()} Items</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;