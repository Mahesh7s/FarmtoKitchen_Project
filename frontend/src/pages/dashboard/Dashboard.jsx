import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Package, 
  User, 
  Settings, 
  LogOut,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Total Orders', value: '24', icon: ShoppingCart, color: 'blue' },
    { label: 'Revenue', value: '$1,240', icon: DollarSign, color: 'green' },
    { label: 'Customers', value: '89', icon: Users, color: 'purple' },
    { label: 'Products', value: '15', icon: Package, color: 'orange' },
  ];

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove your products',
      icon: Package,
      href: '/farmer/products',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'View Orders',
      description: 'Check and manage incoming orders',
      icon: ShoppingCart,
      href: '/farmer/orders',
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Analytics',
      description: 'View your sales and performance',
      icon: TrendingUp,
      href: '/farmer/analytics',
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Profile Settings',
      description: 'Update your farm information',
      icon: Settings,
      href: '/profile',
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Here's what's happening with your {user?.role === 'farmer' ? 'farm' : 'account'} today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : 
                                 stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                                 stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                                 'bg-orange-100 dark:bg-orange-900/20'}`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="card p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${action.color.split(' ')[1]}`}>
                  <action.icon className={`h-6 w-6 ${action.color.split(' ')[0]}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="card p-6">
            <div className="space-y-4">
              {[
                { action: 'New order received', time: '2 hours ago', type: 'order' },
                { action: 'Product review received', time: '5 hours ago', type: 'review' },
                { action: 'Payment confirmed', time: '1 day ago', type: 'payment' },
                { action: 'Product added to store', time: '2 days ago', type: 'product' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'review' ? 'bg-blue-500' :
                      activity.type === 'payment' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                    <span className="text-gray-900 dark:text-white">{activity.action}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;