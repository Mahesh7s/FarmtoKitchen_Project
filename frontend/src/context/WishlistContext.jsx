import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const fetchWishlist = async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('👤 User not authenticated, using empty wishlist');
      setWishlist({ products: [] });
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching wishlist for user:', user._id);
      const response = await wishlistAPI.get();
      console.log('✅ Wishlist fetched successfully:', response.data.products?.length || 0, 'items');
      setWishlist(response.data);
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      // Initialize empty wishlist on error
      setWishlist({ products: [] });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    // Only add if authenticated
    if (!isAuthenticated || !user) {
      return { success: false, message: 'Please login to add to wishlist' };
    }

    try {
      console.log('➕ Adding to wishlist:', productId);
      const response = await wishlistAPI.add(productId);
      setWishlist(response.data.wishlist);
      console.log('✅ Added to wishlist successfully');
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  const removeFromWishlist = async (productId) => {
    // Only remove if authenticated
    if (!isAuthenticated || !user) {
      return { success: false, message: 'Please login to modify wishlist' };
    }

    try {
      console.log('➖ Removing from wishlist:', productId);
      const response = await wishlistAPI.remove(productId);
      setWishlist(response.data.wishlist);
      console.log('✅ Removed from wishlist successfully');
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  const clearWishlist = async () => {
    // Only clear if authenticated
    if (!isAuthenticated || !user) {
      return { success: false, message: 'Please login to clear wishlist' };
    }

    try {
      console.log('🗑️ Clearing wishlist');
      const response = await wishlistAPI.clear();
      setWishlist(response.data.wishlist);
      console.log('✅ Wishlist cleared successfully');
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist?.products?.some(item => item.product._id === productId) || false;
  };

  const getWishlistCount = () => {
    return wishlist?.products?.length || 0;
  };

  // Fetch wishlist when authentication status changes
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, user]); // Re-fetch when authentication or user changes

  // Clear wishlist when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚪 User logged out, clearing wishlist state');
      setWishlist({ products: [] });
    }
  }, [isAuthenticated]);

  const value = {
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};