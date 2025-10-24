import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { Users, Mail, Phone, Calendar, DollarSign, MapPin, ShoppingCart } from 'lucide-react';

const FarmerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getFarmerOrders();
      const orders = response.data || [];

      // Aggregate customer data from orders
      const customerMap = new Map();

      orders.forEach(order => {
        if (order.consumer && order.consumer._id) {
          const customerId = order.consumer._id;
          const orderAmount = order.totalAmount || 0;
          const orderDate = order.createdAt || new Date().toISOString();

          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              _id: customerId,
              name: order.consumer.name || 'Unknown Customer',
              email: order.consumer.email || 'No email',
              contactNumber: order.consumer.contactNumber || '',
              address: order.consumer.address || {},
              totalOrders: 0,
              totalSpent: 0,
              firstOrder: orderDate,
              lastOrder: orderDate
            });
          }

          const customer = customerMap.get(customerId);
          customer.totalOrders += 1;
          customer.totalSpent += orderAmount;
          
          const currentFirstOrder = new Date(customer.firstOrder);
          const currentLastOrder = new Date(customer.lastOrder);
          const newOrderDate = new Date(orderDate);

          if (newOrderDate < currentFirstOrder) {
            customer.firstOrder = orderDate;
          }
          if (newOrderDate > currentLastOrder) {
            customer.lastOrder = orderDate;
          }
        }
      });

      const customersData = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);

      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customer data');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and view your customer relationships
          </p>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded">
              {error}
            </p>
          )}
          <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
          </div>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers yet</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Your customers will appear here once they start placing orders from your farm.
          </p>
        </div>
      ) : (
        <>
          {/* Customer Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalSpent, 0))}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customers.reduce((sum, customer) => sum + customer.totalOrders, 0)}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(customers.reduce((sum, customer) => sum + customer.totalOrders, 0) / customers.length).toFixed(1)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm hidden lg:table-cell">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                      Orders
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm">
                      Total Spent
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 text-sm hidden md:table-cell">
                      Last Order
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((customer) => (
                    <tr 
                      key={customer._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-32 sm:max-w-48">
                            {customer.name}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              Joined {formatDate(customer.firstOrder)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info - Hidden on mobile */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-32">{customer.email}</span>
                          </div>
                          {customer.contactNumber && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{customer.contactNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {customer.totalOrders}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                            {customer.totalOrders === 1 ? 'order' : 'orders'}
                          </span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {customer.totalSpent.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Last Order - Hidden on mobile */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(customer.lastOrder)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Contact Info - Show for each customer on mobile */}
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
              {customers.map((customer) => (
                <div key={customer._id} className="border-b border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(customer.firstOrder)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.totalOrders} orders
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.contactNumber && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.contactNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Last order: {formatDate(customer.lastOrder)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FarmerCustomers;