const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllOrders
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth, authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/orders', getAllOrders);
router.put('/users/:id', updateUserStatus);

module.exports = router;