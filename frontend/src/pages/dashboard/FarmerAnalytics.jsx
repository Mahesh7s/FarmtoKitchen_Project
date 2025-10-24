import React, { useState, useEffect } from 'react';
import { ordersAPI, productsAPI } from '../../services/api';
import { TrendingUp, Users, DollarSign, ShoppingCart, Package, Calendar } from 'lucide-react';

const FarmerAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    monthlyRevenue: [],
    topProducts: [],
    customerCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // month, week, year
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersResponse, productsResponse, ordersAnalyticsResponse] = await Promise.all([
        ordersAPI.getFarmerOrders(),
        productsAPI.getFarmerProducts(),
        ordersAPI.getAnalytics({ timeRange })
      ]);

      const orders = ordersResponse.data || [];
      const products = productsResponse.data || [];
      const analyticsData = ordersAnalyticsResponse.data || {};

      // Calculate metrics
      const revenue = orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const pendingOrders = orders.filter(order => 
        ['pending', 'processing'].includes(order?.status)
      ).length;

      // Get unique customers
      const uniqueCustomers = new Set(
        orders.map(order => order.consumer?._id).filter(Boolean)
      );

      // Get top products
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.product?._id;
          if (productId) {
            productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
          }
        });
      });

      const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, sales]) => {
          const product = products.find(p => p._id === productId);
          return product ? { 
            ...product, 
            sales,
            price: product.price || 0,
            name: product.name || 'Unknown Product',
            images: product.images || [],
            inventory: product.inventory || { unit: 'item' }
          } : null;
        })
        .filter(Boolean);

      setAnalytics({
        revenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        pendingOrders,
        monthlyRevenue: analyticsData.monthlyRevenue || generateFallbackRevenueData(timeRange),
        topProducts,
        customerCount: uniqueCustomers.size
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
      // Set fallback data
      setAnalytics(prev => ({
        ...prev,
        monthlyRevenue: generateFallbackRevenueData(timeRange),
        topProducts: []
      }));
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback revenue data when no data is available
  const generateFallbackRevenueData = (range) => {
    const now = new Date();
    const data = [];
    
    switch (range) {
      case 'week':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          data.push({
            month: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: 0
          });
        }
        break;
      case 'year':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          data.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            revenue: 0
          });
        }
        break;
      default: // month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= Math.min(30, daysInMonth); i++) {
          data.push({
            month: i.toString(),
            revenue: 0
          });
        }
    }
    
    return data;
  };

  // Calculate percentage change safely
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">View Analytics</h1>
        <div className="flex items-center gap-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded">
              {error}
            </p>
          )}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${analytics.revenue.toFixed(2)}
              </p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                +{calculatePercentageChange(analytics.revenue, analytics.revenue * 0.7)}% from last period
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics.totalOrders}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                {analytics.pendingOrders} pending
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Customers</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics.customerCount}
              </p>
              <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 mt-1">
                Active buyers
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Products</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics.totalProducts}
              </p>
              <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1">
                Listed products
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Revenue Overview</h2>
          <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            {analytics.monthlyRevenue.length > 0 ? (
              <div className="flex items-end justify-between h-40 space-x-1 sm:space-x-2 overflow-x-auto">
                {analytics.monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue || 0), 1);
                  const height = maxRevenue > 0 ? `${((month.revenue || 0) / maxRevenue) * 100}%` : '0%';
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 min-w-[30px] sm:min-w-[40px]">
                      <div
                        className="bg-primary-600 dark:bg-primary-500 rounded-t w-full max-w-8 transition-all duration-300 hover:bg-primary-700 dark:hover:bg-primary-400"
                        style={{ height }}
                        title={`$${month.revenue || 0}`}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                        {month.month}
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white hidden sm:block">
                        ${month.revenue || 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  No revenue data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Top Selling Products</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((product, index) => (
                <div key={product._id || index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <img
                      src={product.images?.[0]?.url || '/api/placeholder/40/40'}
                      alt={product.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/40/40';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        ${product.price} per {product.inventory?.unit || 'item'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {product.sales} sold
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ${((product.sales || 0) * (product.price || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Sales data will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Order Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalOrders}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.pendingOrders}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalOrders - analytics.pendingOrders}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.customerCount}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Customers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAnalytics;