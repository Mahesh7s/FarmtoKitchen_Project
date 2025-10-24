const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  simulatePayment,
  getPaymentMethods,
  verifyPayment
} = require('../controllers/paymentController');

// @route   POST /api/payments/simulate
// @desc    Simulate payment processing
// @access  Private
router.post('/simulate', auth, simulatePayment);

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', getPaymentMethods);

// @route   GET /api/payments/verify/:orderId
// @desc    Verify payment status
// @access  Private
router.get('/verify/:orderId', auth, verifyPayment);

module.exports = router;