import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessageContext';
import { ordersAPI, productsAPI } from '../../services/api';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  Home,
  Plus,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Sun,
  Moon,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const navigation = [
    { name: 'Overview', href: '/farmer', icon: Home },
    { name: 'My Products', href: '/farmer/products', icon: Package },
    { name: 'My Orders', href: '/farmer/orders', icon: ShoppingCart },
    { name: 'Messages', href: '/farmer/messages', icon: MessageCircle },
    { name: 'My Analytics', href: '/farmer/analytics', icon: TrendingUp },
    { name: 'My Customers', href: '/farmer/customers', icon: Users },
    { name: 'Settings', href: '/farmer/settings', icon: Settings },
  ];

  useEffect(() => {
    fetchDashboardData();
    
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const fetchDashboardData = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        ordersAPI.getFarmerOrders(),
        productsAPI.getFarmerProducts()
      ]);

      const orders = ordersResponse.data;
      const products = productsResponse.data;

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        revenue: orders
          .filter(order => order.paymentStatus === 'paid')
          .reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/farmer') return location.pathname === '/farmer';
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Stats cards data
  const statsCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      description: 'All time orders',
      icon: ShoppingCart,
      color: 'blue',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      description: 'Active listings',
      icon: Package,
      color: 'green',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.toFixed(2)}`,
      description: 'Total earnings',
      icon: DollarSign,
      color: 'purple',
      iconBg: 'bg-purple-500'
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      description: 'Need attention',
      icon: AlertCircle,
      color: 'orange',
      iconBg: 'bg-orange-500'
    }
  ];

  // Quick actions data
  const quickActions = [
    {
      to: "/farmer/orders",
      icon: ShoppingCart,
      title: "Manage Orders",
      description: "View and process incoming orders",
      color: "blue"
    },
    {
      to: "/farmer/products",
      icon: Package,
      title: "Manage Products",
      description: "Add or update your product listings",
      color: "green"
    },
    {
      to: "/farmer/messages",
      icon: MessageCircle,
      title: "Messages",
      description: "Chat with your customers",
      color: "purple"
    },
    {
      to: "/farmer/analytics",
      icon: TrendingUp,
      title: "View Analytics",
      description: "Track your sales and performance",
      color: "orange"
    },
    {
      to: "/farmer/customers",
      icon: Users,
      title: "My Customers",
      description: "View your customer base",
      color: "cyan"
    },
    {
      to: "/farmer/products/new",
      icon: Plus,
      title: "Add New Product",
      description: "List a new product for sale",
      color: "primary",
      special: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-64 bg-white dark:bg-gray-800 shadow-xl lg:shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3" onClick={closeSidebar}>
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    Farmer Dashboard
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.farmName || 'My Farm'}
                  </span>
                </div>
              </Link>
              <button 
                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive(item.href)
                    ? 'bg-primary-500 shadow-lg shadow-primary-500/25 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-md'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive(item.href) ? 'text-white' : 'text-current'
                }`} />
                <span className="font-medium flex-1">{item.name}</span>
                {item.name === 'Messages' && unreadCount > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold min-w-6 flex items-center justify-center ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white shadow-sm'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
            
            {/* Logout Button - Moved below Settings */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group mt-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>

          {/* Removed footer section since logout is now in navigation */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-w-[calc(100%-16rem)]">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Welcome back, {user?.farmName || user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3">
              {/* Mobile Messages Button */}
              <Link
                to="/farmer/messages"
                className="lg:hidden relative p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </Link>

              {/* Desktop Messages Button */}
              <Link
                to="/farmer/messages"
                className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 relative"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">Messages</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              {/* Add Product Button */}
              <Link
                to="/farmer/products/new"
                className="btn-primary flex items-center space-x-2 px-4 py-3 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Overview - Only show on overview page */}
        {location.pathname === '/farmer' && (
          <div className="p-4 sm:p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {statsCards.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs sm:text-sm font-medium text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                        {stat.label}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className={`text-xs text-${stat.color}-600 dark:text-${stat.color}-400 mt-1`}>
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 ${stat.iconBg} rounded-xl shadow-lg`}>
                      <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className={`group transition-all duration-300 hover:scale-105 ${
                    action.special 
                      ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 rounded-2xl p-4 sm:p-6 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/10' 
                      : 'bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      action.special 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40' 
                        : `bg-${action.color}-100 dark:bg-${action.color}-900/30 text-${action.color}-600 dark:text-${action.color}-400`
                    }`}>
                      <action.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm sm:text-base ${
                        action.special
                          ? 'text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300'
                          : `text-gray-900 dark:text-white group-hover:text-${action.color}-600 dark:group-hover:text-${action.color}-400`
                      }`}>
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Page Content for other routes */}
        {location.pathname !== '/farmer' && (
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;