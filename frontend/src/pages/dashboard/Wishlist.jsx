import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../hooks/useToast';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Plus,
  ShoppingBag,
  ArrowLeft,
  Star,
  MapPin,
  Leaf,
  X,
  AlertTriangle
} from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  const { 
    wishlist, 
    loading, 
    removeFromWishlist, 
    clearWishlist, 
    fetchWishlist 
  } = useWishlist();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleContinueShopping = () => {
    navigate('/consumer/products');
  };

  const handleAddToCart = async (product) => {
    try {
      addToCart(product, 1);
      showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      showError('Failed to add product to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        showSuccess('Product removed from wishlist');
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Failed to remove product from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    try {
      const result = await clearWishlist();
      if (result.success) {
        showSuccess('Wishlist cleared');
        setShowClearModal(false);
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Failed to clear wishlist');
    }
  };

  const openClearModal = () => {
    setShowClearModal(true);
  };

  const closeClearModal = () => {
    setShowClearModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  const wishlistItems = wishlist?.products || [];

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-4 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="text-center py-8 sm:py-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Your wishlist is empty
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Save your favorite products here to easily find them later. Start exploring our fresh farm products!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/consumer/products"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Browse Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    Your Wishlist
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={openClearModal}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All</span>
                  </button>
                  
                  <button
                    onClick={handleContinueShopping}
                    className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Shop More</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <motion.div
          layout
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.product._id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={item.product.images?.[0]?.url || '/api/placeholder/300/200'}
                  alt={item.product.name}
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.product._id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-red-500 hover:text-red-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Product Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.product.isOrganic && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-md">
                      <Leaf className="h-3 w-3 mr-1" />
                      Organic
                    </span>
                  )}
                  {item.product.isSeasonal && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                      Seasonal
                    </span>
                  )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3">
                  <span className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
                    ${item.product.price}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 text-base sm:text-lg">
                  {item.product.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {item.product.description}
                </p>

                {/* Farmer and Rating Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                      {item.product.farmer?.farmName || 'Local Farm'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {item.product.rating?.average || '4.5'}
                    </span>
                  </div>
                </div>

                {/* Inventory Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-medium ${
                    item.product.inventory?.quantity > 10 
                      ? 'text-green-600 dark:text-green-400' 
                      : item.product.inventory?.quantity > 0 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.product.inventory?.quantity > 10 
                      ? 'In Stock' 
                      : item.product.inventory?.quantity > 0 
                        ? `Only ${item.product.inventory?.quantity} left` 
                        : 'Out of Stock'
                    }
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.product.inventory?.quantity || 0} {item.product.inventory?.unit || 'unit'}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item.product)}
                  disabled={!item.product.inventory?.quantity || item.product.inventory?.quantity === 0}
                  className="w-full bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm sm:text-base">
                    {!item.product.inventory?.quantity || item.product.inventory?.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Footer */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Found {wishlistItems.length} products you love
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openClearModal}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Wishlist</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Wishlist Confirmation Modal */}
        <AnimatePresence>
          {showClearModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={closeClearModal}
              >
                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Clear Wishlist
                      </h3>
                    </div>
                    <button
                      onClick={closeClearModal}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Are you sure you want to clear your entire wishlist? This action will remove all {wishlistItems.length} items and cannot be undone.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          This action is permanent and cannot be reversed. All your saved items will be lost.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={closeClearModal}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearWishlist}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear {wishlistItems.length} Items</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;