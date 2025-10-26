const express = require('express');
const router = express.Router();
const {
  createOrder,
  getConsumerOrders,
  getFarmerOrders,
  updateOrderStatus,
  confirmPayment,
  cancelOrder,
  getOrderAnalytics,
  getOrderById,
  processOrderPayment
} = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth'); // Changed protect to auth

// All routes are protected
router.use(auth); // Changed protect to auth

// Consumer routes
router.post('/', createOrder);
router.get('/consumer/my-orders', getConsumerOrders);
router.get('/:id', getOrderById);

// Farmer routes
router.get('/farmer/my-orders', authorize('farmer', 'admin'), getFarmerOrders);
router.get('/farmer/analytics', authorize('farmer', 'admin'), getOrderAnalytics);

// Order management routes
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/process-payment', processOrderPayment);
router.post('/confirm-payment', confirmPayment);

module.exports = router;