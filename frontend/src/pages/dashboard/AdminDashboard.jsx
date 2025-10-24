import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your farm-to-kitchen platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">1,234</p>
            <p className="text-green-600 text-sm mt-1">↑ 12% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">567</p>
            <p className="text-green-600 text-sm mt-1">↑ 8% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">$12,456</p>
            <p className="text-green-600 text-sm mt-1">↑ 15% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900">Active Farmers</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">89</p>
            <p className="text-green-600 text-sm mt-1">↑ 5% from last month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New order #ORD{item}234</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                Manage Users
              </button>
              <button className="bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                View Reports
              </button>
              <button className="bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                System Settings
              </button>
              <button className="bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                Manage Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;