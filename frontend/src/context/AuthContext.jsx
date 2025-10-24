import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState('light');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  // Rate limiting helper
  const canAttemptLogin = () => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    // Reset attempts after 1 minute
    if (timeSinceLastAttempt > 60000) {
      setLoginAttempts(0);
      return true;
    }
    
    // Allow max 5 attempts per minute
    if (loginAttempts >= 5) {
      return false;
    }
    
    return true;
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      console.log('🔄 Auth initialization started');
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');

      const savedToken = localStorage.getItem('token');
      console.log('📝 Token found:', !!savedToken);
      
      if (savedToken) {
        try {
          setAuthLoading(true);
          console.log('🔄 Verifying token with API...');
          const response = await authAPI.getMe();
          console.log('✅ Token valid, user data received');
          if (isMounted) {
            setUser(response.data);
            setToken(savedToken);
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          if (isMounted) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } finally {
          if (isMounted) {
            setAuthLoading(false);
            console.log('✅ Auth loading completed');
          }
        }
      } else {
        console.log('ℹ️ No token found, user is not authenticated');
      }
      
      if (isMounted) {
        setLoading(false);
        console.log('🏁 Auth initialization completed, loading:', false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      console.log('🧹 Auth initialization cleanup');
    };
  }, []);

  const login = async (email, password) => {
    try {
      // Check rate limiting
      if (!canAttemptLogin()) {
        throw new Error('Too many login attempts. Please wait 1 minute before trying again.');
      }

      setAuthLoading(true);
      setLoginAttempts(prev => prev + 1);
      setLastAttemptTime(Date.now());
      
      console.log('🔐 Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Reset attempts on successful login
      setLoginAttempts(0);
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Login successful for user:', userData._id);
      
      return { 
        success: true, 
        user: userData,
        message: 'Login successful!' 
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let message = 'Login failed. Please check your credentials.';
      
      if (error.response?.status === 429) {
        message = 'Too many login attempts. Please wait a few minutes.';
      } else if (error.response?.status === 401) {
        message = 'Invalid email or password.';
      } else if (error.message.includes('Too many login attempts')) {
        message = error.message;
      } else if (error.isNetworkError) {
        message = 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      return { 
        success: false, 
        message 
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setAuthLoading(true);
      console.log('📝 Registration data being sent:', userData);
      
      // Prepare registration data based on role
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        ...(userData.role === 'farmer' && {
          farmName: userData.farmName,
          contactNumber: userData.contactNumber,
          farmLocation: userData.farmLocation
        })
      };

      // Remove undefined or empty fields
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] === undefined || registrationData[key] === '') {
          delete registrationData[key];
        }
      });

      // Remove empty farmLocation if no address
      if (registrationData.farmLocation && !registrationData.farmLocation.address) {
        delete registrationData.farmLocation;
      }

      console.log('📤 Final registration data:', registrationData);
      
      const response = await authAPI.register(registrationData);
      console.log('✅ Registration response received');
      
      return { 
        success: true, 
        data: response.data,
        message: 'Registration successful! You can now login to your account.' 
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let message = 'Registration failed. Please try again.';
      
      if (error.isNetworkError) {
        message = 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      return { 
        success: false, 
        message 
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user?._id);
    
    // Clear all user-specific data
    localStorage.removeItem('token');
    
    // Clear user-specific cart data
    if (user) {
      localStorage.removeItem(`cart_${user._id}`);
    }
    
    // Reset state
    setToken(null);
    setUser(null);
    setLoginAttempts(0);
    
    console.log('✅ Logout completed');
    
    // Redirect to home page
    window.location.href = '/';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout(); // Logout if refresh fails
      throw error;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const hasPermission = (permission) => {
    const permissions = {
      // Farmer permissions
      manageProducts: user?.role === 'farmer' || user?.role === 'admin',
      viewAnalytics: user?.role === 'farmer' || user?.role === 'admin',
      manageOrders: user?.role === 'farmer' || user?.role === 'admin',
      
      // Consumer permissions
      placeOrders: user?.role === 'consumer' || user?.role === 'admin',
      writeReviews: user?.role === 'consumer' || user?.role === 'admin',
      
      // Admin permissions
      manageUsers: user?.role === 'admin',
      manageAllProducts: user?.role === 'admin',
      viewAllAnalytics: user?.role === 'admin',
    };

    return permissions[permission] || false;
  };

  const value = {
    // State
    user,
    loading: loading || authLoading,
    theme,
    token,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    refreshUser,
    toggleTheme,
    hasRole,
    hasPermission,
    
    // Computed properties
    isAuthenticated: !!user && !!token,
    isFarmer: user?.role === 'farmer',
    isConsumer: user?.role === 'consumer',
    isAdmin: user?.role === 'admin',
    
    // Role-based access helpers (for convenience)
    canManageProducts: hasPermission('manageProducts'),
    canViewAnalytics: hasPermission('viewAnalytics'),
    canManageUsers: hasPermission('manageUsers'),
    canPlaceOrders: hasPermission('placeOrders'),
    canWriteReviews: hasPermission('writeReviews'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;