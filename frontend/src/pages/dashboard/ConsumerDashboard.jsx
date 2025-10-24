import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useMessages } from '../../context/MessageContext';
import { ordersAPI } from '../../services/api';
import {
  ShoppingCart,
  Package,
  Heart,
  Settings,
  Home,
  User,
  Clock,
  CheckCircle,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Store,
  MessageCircle,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

const ConsumerDashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { getCartCount } = useCart();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/consumer', icon: Home },
    { name: 'Products', href: '/consumer/products', icon: Store },
    { name: 'Orders', href: '/consumer/orders', icon: Package },
    { name: 'Wishlist', href: '/consumer/wishlist', icon: Heart },
    { name: 'Cart', href: '/consumer/cart', icon: ShoppingCart },
    { name: 'Messages', href: '/consumer/messages', icon: MessageCircle },
    { name: 'Profile', href: '/consumer/profile', icon: User },
    { name: 'Settings', href: '/consumer/settings', icon: Settings },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getConsumerOrders();
      setOrders(response.data);
      setRecentOrders(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/consumer') return location.pathname === '/consumer';
    return location.pathname.startsWith(path);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': 
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'shipped': 
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing': 
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: 
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleContinueShopping = () => {
    navigate('/consumer/products');
  };

  const handleViewCart = () => {
    navigate('/consumer/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 lg:w-72 bg-white dark:bg-gray-800 shadow-xl lg:shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-green-500 rounded-full flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  My Account
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.name || 'User'}
                </p>
              </div>
            </div>
            <button 
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 sm:p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 relative group ${
                isActive(item.href)
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${
                isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'
              }`} />
              <span className="font-medium text-sm sm:text-base">{item.name}</span>
              
              {/* Badges for Messages and Cart */}
              {item.name === 'Messages' && unreadCount > 0 && (
                <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {item.name === 'Cart' && getCartCount() > 0 && (
                <span className="absolute right-3 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] shadow-sm">
                  {getCartCount() > 99 ? '99+' : getCartCount()}
                </span>
              )}
            </Link>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm group"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
             <div className="min-w-0 flex-1">
  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate">
    {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
  </h1>
  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">
    Welcome back, {user?.name}
  </p>
</div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>

              {/* Messages Button */}
              <Link
                to="/consumer/messages"
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center min-w-[16px] sm:min-w-[20px] text-[10px] sm:text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={handleViewCart}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center min-w-[16px] sm:min-w-[20px] text-[10px] sm:text-xs">
                    {getCartCount() > 99 ? '99+' : getCartCount()}
                  </span>
                )}
              </button>

              <button
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className= "xs:inline">Shop Now</span>
              </button>
            </div>
          </div>
        </header>

        {/* Overview Content - Only show on overview page */}
        {location.pathname === '/consumer' && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {orders.filter(order => order.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {orders.filter(order => order.status === 'delivered').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{unreadCount}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                    <Link 
                      to="/consumer/orders" 
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm sm:text-base flex items-center space-x-1"
                    >
                      <span>View All Orders</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">No orders yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start shopping to see your orders here</p>
                        <button 
                          onClick={handleContinueShopping}
                          className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 bg-gray-50/50 dark:bg-gray-700/30">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                {order.items?.length || 0} items • ${order.totalAmount?.toFixed(2) || '0.00'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end space-x-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                            </span>
                            <Link
                              to={`/consumer/orders/${order._id}`}
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center space-x-1"
                            >
                              <span className="hidden sm:inline">View</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      to="/consumer/products"
                      className="flex items-center space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-300 group bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-green-50 dark:hover:from-green-900/10"
                    >
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors">
                        <Store className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 text-sm sm:text-base">
                          Browse Products
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                          Discover fresh products from local farmers
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
                    </Link>

                    <Link
                      to="/consumer/messages"
                      className="flex items-center space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-300 group bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-purple-50 dark:hover:from-purple-900/10"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 text-sm sm:text-base">
                          Messages
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                          Chat with farmers and sellers
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
                    </Link>

                    <Link
                      to="/consumer/wishlist"
                      className="flex items-center space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-300 group bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-red-50 dark:hover:from-red-900/10"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/30 transition-colors">
                        <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 text-sm sm:text-base">
                          My Wishlist
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                          View your saved favorite products
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-red-600 flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content for other routes */}
        {location.pathname !== '/consumer' && (
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;