const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalConsumers = await User.countDocuments({ role: 'consumer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const recentOrders = await Order.find()
      .populate('consumer', 'name')
      .populate('items.farmer', 'farmName')
      .sort({ createdAt: -1 })
      .limit(10);

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalUsers,
      totalFarmers,
      totalConsumers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('consumer', 'name email')
      .populate('items.farmer', 'farmName')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllOrders
};