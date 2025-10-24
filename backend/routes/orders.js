const express = require('express');
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
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('consumer'), createOrder);
router.get('/consumer/my-orders', auth, authorize('consumer'), getConsumerOrders);
router.get('/farmer/my-orders', auth, authorize('farmer'), getFarmerOrders);
router.get('/farmer/analytics', auth, authorize('farmer'), getOrderAnalytics);
router.put('/:id/status', auth, updateOrderStatus);
router.post('/confirm-payment', auth, confirmPayment);
router.put('/:id/cancel', auth, cancelOrder);
router.get('/:id', auth, getOrderById);
router.post('/:id/process-payment', auth, processOrderPayment);

module.exports = router;