import axios from 'axios';

// Use relative path or ensure correct port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds default
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data
    });

    // Handle network errors
    if (!error.response) {
      console.error('Network error - No response received:', error.message);
      return Promise.reject({
        message: 'Cannot connect to server. Please check if the backend is running.',
        isNetworkError: true,
        originalError: error
      });
    }

    const { status, data, config } = error.response;

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Unauthorized - ONLY redirect for protected routes
        const isProtectedRoute = 
          config.url.includes('/wishlist') ||
          config.url.includes('/orders') ||
          config.url.includes('/profile') ||
          config.url.includes('/cart') ||
          config.url.includes('/admin') ||
          config.method !== 'get'; // Assume all non-GET requests are protected
        
        if (isProtectedRoute && window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          console.warn('Authentication failed for protected route, redirecting to login');
          window.location.href = '/login';
        } else {
          console.log('401 on public route, not redirecting');
        }
        break;
      
      case 400:
        console.error('Bad request:', data.message);
        break;
      
      case 403:
        console.error('Access forbidden:', data.message);
        break;
      
      case 404:
        console.error('Resource not found:', data.message);
        break;
      
      case 422:
        console.error('Validation error:', data.errors);
        break;
      
      case 429:
        console.error('Rate limit exceeded:', data.message);
        break;
      
      case 500:
        console.error('Server error:', data.message);
        break;
      
      default:
        console.error('API error:', data.message);
    }

    return Promise.reject({
      message: data?.message || 'An unexpected error occurred',
      errors: data?.errors,
      status: status,
      data: data,
      originalError: error
    });
  }
);

// Auth header helper function
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API endpoints
export const authAPI = {
  login: (credentials) => {
    console.log('Login attempt:', { email: credentials.email });
    return api.post('/auth/login', credentials);
  },
  register: (userData) => {
    console.log('Registration attempt:', { 
      name: userData.name, 
      email: userData.email, 
      role: userData.role 
    });
    return api.post('/auth/register', userData);
  },
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// Users API endpoints
export const usersAPI = {
  // Search users
  searchUsers: (params = {}) => api.get('/auth/search', { params }),
  
  // Get all farmers
  getFarmers: (params = {}) => api.get('/auth/farmers', { params }),
  
  // Get all consumers
  getConsumers: (params = {}) => api.get('/auth/consumers', { params }),
};

// User Settings API endpoints
export const userAPI = {
  // Notification settings
  updateNotificationSettings: (data) => api.put('/user/notifications', data),
  getNotificationSettings: () => api.get('/user/notifications'),
  
  // Payment settings
  updatePaymentSettings: (data) => api.put('/user/payment-settings', data),
  getPaymentSettings: () => api.get('/user/payment-settings'),
  
  // General user settings
  getSettings: () => api.get('/user/settings'),
  updateSettings: (data) => api.put('/user/settings', data),
  
  // Business hours
  updateBusinessHours: (data) => api.put('/user/business-hours', data),
  getBusinessHours: () => api.get('/user/business-hours'),
};

// Products API endpoints
export const productsAPI = {
  // Get all products with filtering, pagination, and search
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/products', { 
        params: {
          page: 1,
          limit: 50,
          ...params
        }
      });
      
      // Handle different response structures
      let products = [];
      if (response.data && Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      } else {
        console.warn('Unexpected products API response structure:', response.data);
        products = [];
      }
      
      // Return consistent structure
      return {
        ...response,
        data: {
          products,
          total: products.length,
          ...response.data
        }
      };
    } catch (error) {
      console.error('Products API getAll error:', error);
      throw error;
    }
  },
  
  // Get single product by ID
  getById: (id) => api.get(`/products/${id}`),
  
  // Create new product (farmer only)
  create: (data) => api.post('/products', data),
  
  // Update product (farmer only)
  update: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product (farmer only)
  delete: (id) => api.delete(`/products/${id}`),
  
  // Get farmer's own products
  getFarmerProducts: (params = {}) => api.get('/products/farmer/my-products', { params }),
  
  // Get products by category
  getByCategory: (category, params = {}) => 
    api.get('/products', { params: { category, ...params } }),
  
  // Search products
  search: (query, params = {}) => 
    api.get('/products', { params: { search: query, ...params } }),
  
  // Get featured products
  getFeatured: () => api.get('/products/featured'),
  
  // Get related products
  getRelated: (productId) => api.get(`/products/${productId}/related`),
};

// Wishlist API endpoints
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clear: () => api.delete('/wishlist/clear'),
};

// Orders API endpoints - COMPLETELY UPDATED with optimized timeouts
export const ordersAPI = {
  // Create new order
  create: (data) => api.post('/orders', data, { timeout: 20000 }),
  
  // Get consumer's orders
  getConsumerOrders: (params = {}) => api.get('/orders/consumer/my-orders', { params }),
  
  // Get farmer's orders
  getFarmerOrders: (params = {}) => api.get('/orders/farmer/my-orders', { params }),
  
  // Get order by ID
  getById: (id) => api.get(`/orders/${id}`),
  
  // Update order status - OPTIMIZED: Reduced timeout
  updateStatus: (orderId, data) => 
    api.put(`/orders/${orderId}/status`, data, { timeout: 15000 }),
  
  // Cancel or reject order (works for both consumers and farmers) - OPTIMIZED: Reduced timeout
  cancel: (orderId, data) => 
    api.put(`/orders/${orderId}/cancel`, data, { timeout: 15000 }),

  // Get order analytics (farmer only)
  getAnalytics: (params = {}) => api.get('/orders/farmer/analytics', { params }),
  
  // Process payment
  processPayment: (orderId, data) => api.post(`/orders/${orderId}/process-payment`, data, { timeout: 20000 }),

  // Track order
  track: (id) => api.get(`/orders/${id}/track`),
  
  // Get rejected orders specifically
  getRejectedOrders: (params = {}) => api.get('/orders/rejected', { params }),
  
  // Get cancelled orders specifically
  getCancelledOrders: (params = {}) => api.get('/orders/cancelled', { params }),
};

// Payment API endpoints
export const paymentsAPI = {
  // Simulate payment processing
  simulate: (data) => api.post('/payments/simulate', data, { timeout: 20000 }),
  
  // Get available payment methods
  getMethods: () => api.get('/payments/methods'),
  
  // Verify payment status
  verify: (orderId) => api.get(`/payments/verify/${orderId}`),
  
  // Create payment intent
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data, { timeout: 20000 }),
  
  // Confirm payment
  confirmPayment: (data) => api.post('/payments/confirm-payment', data, { timeout: 20000 }),
};

// Reviews API endpoints
export const reviewsAPI = {
  // Create review
  create: (data) => api.post('/reviews', data),
  
  // Get reviews for a farmer
  getFarmerReviews: (farmerId, params = {}) => 
    api.get(`/reviews/farmer/${farmerId}`, { params }),
  
  // Get reviews for a product
  getProductReviews: (productId, params = {}) => 
    api.get(`/reviews/product/${productId}`, { params }),
  
  // Get user's reviews
  getUserReviews: () => api.get('/reviews/user/my-reviews'),
  
  // Update review
  update: (id, data) => api.put(`/reviews/${id}`, data),
  
  // Delete review
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Get review statistics
  getStats: (farmerId) => api.get(`/reviews/farmer/${farmerId}/stats`),
};

// Messages API endpoints
export const messagesAPI = {
  // Send message with image upload support
  send: (data) => {
    // Check if data is FormData (for image uploads) or regular object
    if (data instanceof FormData) {
      console.log('Sending FormData with images');
      return api.post('/messages', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...authHeader()
        },
        timeout: 60000 // 60 second timeout for image uploads
      });
    } else {
      console.log('Sending JSON data:', data);
      return api.post('/messages', data, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        timeout: 15000
      });
    }
  },
  
  // Get conversation with user
  getConversation: (userId, params = {}) => 
    api.get(`/messages/conversation/${userId}`, { 
      params,
      headers: authHeader()
    }),
  
  // Get user's conversations
  getConversations: () => api.get('/messages/conversations', {
    headers: authHeader()
  }),
  
  // Mark messages as read
  markAsRead: (conversationId) => 
    api.put('/messages/mark-read', { conversationId }, {
      headers: authHeader()
    }),
  
  // Delete message
  delete: (messageId) => api.delete(`/messages/${messageId}`, {
    headers: authHeader()
  }),

  // Get unread message count
  getUnreadCount: () => api.get('/messages/unread-count', {
    headers: authHeader()
  }),

  // Enhanced image download and preview endpoints
  downloadImage: (messageId, attachmentIndex = 0) => 
    api.get(`/messages/${messageId}/download/${attachmentIndex}`, {
      headers: authHeader(),
      responseType: 'blob',
      timeout: 30000
    }),

  getImageDownloadUrl: (messageId, attachmentIndex = 0) =>
    api.get(`/messages/${messageId}/download-url/${attachmentIndex}`, {
      headers: authHeader()
    }),

  previewImage: (messageId, attachmentIndex = 0) =>
    api.get(`/messages/${messageId}/preview/${attachmentIndex}`, {
      headers: authHeader()
    }),

  verifyImageAccess: (publicId) => 
    api.get('/messages/verify-image-access', {
      params: { publicId },
      headers: authHeader()
    }),
};

// Search API endpoints
export const searchAPI = {
  // Advanced search with multiple filters
  advanced: (params = {}) => api.get('/search', { params }),
  
  // Quick search
  quick: (query) => api.get('/search/quick', { params: { q: query } }),
  
  // Search suggestions
  suggestions: (query) => api.get('/search/suggestions', { params: { q: query } }),
};

// Admin API endpoints
export const adminAPI = {
  // User management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Product management
  getAllProducts: (params = {}) => api.get('/admin/products', { params }),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Order management
  getAllOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data, { timeout: 15000 }),
  cancelOrder: (id, data) => api.put(`/admin/orders/${id}/cancel`, data, { timeout: 15000 }),
  
  // Analytics
  getPlatformAnalytics: () => api.get('/admin/analytics'),
  getRevenueAnalytics: (params = {}) => api.get('/admin/analytics/revenue', { params }),
  
  // Reports
  generateReport: (type, params = {}) => 
    api.get(`/admin/reports/${type}`, { 
      params,
      responseType: 'blob',
      timeout: 45000 // Longer timeout for report generation
    }),
};

// Upload API endpoints
export const uploadAPI = {
  // Upload single image
  image: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000
    });
  },
  
  // Upload multiple images
  images: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000
    });
  },
  
  // Delete uploaded file
  delete: (fileUrl) => api.delete('/upload/delete', { data: { fileUrl } }),
};

// Notifications API endpoints
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  delete: (id) => api.delete(`/notifications/${id}`),
  
  // Order specific notifications
  getOrderNotifications: (orderId) => api.get(`/notifications/order/${orderId}`),
  markOrderNotificationsRead: (orderId) => api.put(`/notifications/order/${orderId}/read`),
};

// Cart API endpoints
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/update/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  getCount: () => api.get('/cart/count'),
};

// Delivery API endpoints
export const deliveryAPI = {
  calculate: (data) => api.post('/delivery/calculate', data),
  getZones: () => api.get('/delivery/zones'),
  getTimeSlots: (date) => api.get('/delivery/time-slots', { params: { date } }),
};

// Analytics API endpoints
export const analyticsAPI = {
  // Farmer analytics
  getFarmerAnalytics: (params = {}) => api.get('/analytics/farmer', { params }),
  getFarmerRevenue: (params = {}) => api.get('/analytics/farmer/revenue', { params }),
  getFarmerProducts: (params = {}) => api.get('/analytics/farmer/products', { params }),
  
  // Platform analytics (admin only)
  getPlatformStats: () => api.get('/analytics/platform/stats'),
  getRevenueStats: (params = {}) => api.get('/analytics/platform/revenue', { params }),
  getUserStats: () => api.get('/analytics/platform/users'),
};

// Utility functions
export const apiUtils = {
  // Helper to handle API errors in components
  handleError: (error, defaultMessage = 'An error occurred') => {
    if (error.isNetworkError) {
      return error.message || 'Network error: Cannot connect to server';
    }
    
    // Handle timeout specifically
    if (error.message?.includes('timeout') || error.originalError?.code === 'ECONNABORTED') {
      return 'Request timeout: Please check your connection and try again';
    }
    
    return error.message || defaultMessage;
  },
  
  // Helper to extract validation errors
  getValidationErrors: (error) => {
    return error.errors || {};
  },
  
  // Helper to check if error is validation error
  isValidationError: (error) => {
    return error.status === 422;
  },
  
  // Helper to check if error is network error
  isNetworkError: (error) => {
    return error.isNetworkError || !error.status;
  },
  
  // Helper to check if error is timeout
  isTimeoutError: (error) => {
    return error.message?.includes('timeout') || error.originalError?.code === 'ECONNABORTED';
  },
  
  // Helper to format API response data
  formatResponse: (response) => {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers
    };
  },
  
  // Helper to handle order cancellation/rejection with better error handling
  handleOrderAction: async (action, orderId, reason = '') => {
    try {
      let response;
      switch (action) {
        case 'cancel':
          response = await ordersAPI.cancel(orderId, { reason });
          break;
        case 'reject':
          response = await ordersAPI.cancel(orderId, { reason });
          break;
        case 'updateStatus':
          response = await ordersAPI.updateStatus(orderId, { status: reason });
          break;
        default:
          throw new Error('Invalid order action');
      }
      return response;
    } catch (error) {
      console.error(`Error performing ${action} on order:`, error);
      
      // Enhanced error handling
      if (apiUtils.isTimeoutError(error)) {
        throw new Error('Order action timeout. Please try again in a moment.');
      } else if (apiUtils.isNetworkError(error)) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  },
  
  // Helper to check if order can be cancelled/rejected
  canCancelOrder: (order, user) => {
    if (!order || !user) return false;
    
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    
    if (!cancellableStatuses.includes(order.status)) {
      return false;
    }

    // Consumer can cancel their own orders
    if (user.role === 'consumer') {
      return order.consumer?._id === user._id || order.consumer === user._id;
    }
    
    // Farmer can cancel orders containing their products
    if (user.role === 'farmer') {
      return order.items?.some(item => 
        item.farmer?._id === user._id || item.farmer === user._id
      );
    }
    
    // Admin can cancel any order
    if (user.role === 'admin') {
      return true;
    }
    
    return false;
  },
  
  // Helper to retry failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        console.log(`Retry attempt ${attempt} for failed request`);
      }
    }
  }
};

// Contact API endpoints
export const contactAPI = {
  sendMessage: (data) => api.post('/contact/send', data),
  getMessages: (params = {}) => api.get('/contact/messages', { params }),
  updateMessageStatus: (id, data) => api.put(`/contact/messages/${id}/status`, data),
};

// Subscription API endpoints
export const subscriptionAPI = {
  getPlans: () => api.get('/subscription/plans'),
  subscribe: (data) => api.post('/subscription/subscribe', data, { timeout: 20000 }),
  cancel: () => api.delete('/subscription/cancel'),
  getStatus: () => api.get('/subscription/status'),
  updatePayment: (data) => api.put('/subscription/payment', data),
};

// Health check endpoint
export const healthAPI = {
  check: () => api.get('/health', { timeout: 10000 })
};

// Export the main api instance for custom requests
export default api;