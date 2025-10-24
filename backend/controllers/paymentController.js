const Order = require('../models/Order');

// Simulate payment processing (FREE - no real payments)
exports.simulatePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentDetails } = req.body;
    const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

    // Find the order
    const order = await Order.findById(orderId)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images price')
      .populate('items.farmer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to the user
    if (order.consumer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Simulate different payment processing times and success rates
    let successRate = 0.95; // 95% success rate for simulation
    
    // Different success rates based on payment method
    if (paymentMethod === 'card') successRate = 0.92;
    if (paymentMethod === 'upi') successRate = 0.96;
    if (paymentMethod === 'wallet') successRate = 0.98;
    if (paymentMethod === 'cash') successRate = 1.0;

    // Simulate processing delay (2-4 seconds)
    const processingTime = 2000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Random success/failure based on success rate
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      // Payment successful
      order.paymentStatus = 'paid';
      
      // For cash payments, status remains pending until delivery
      if (paymentMethod !== 'cash') {
        order.status = 'confirmed';
      }
      
      await order.save();

      res.json({
        success: true,
        message: 'Payment processed successfully',
        order: order,
        transactionId: generateTransactionId()
      });
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again or use a different payment method.',
        order: order
      });
    }

  } catch (error) {
    console.error('Payment simulation error:', error);
    res.status(500).json({ 
      message: 'Payment processing error', 
      error: error.message 
    });
  }
};

// Get available payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your card',
        icons: ['visa', 'mastercard'],
        supported: true
      },
      {
        id: 'upi',
        name: 'UPI Payment',
        description: 'Google Pay, PhonePe, Paytm',
        icons: ['upi'],
        supported: true
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        description: 'PhonePe, Google Pay, Amazon Pay',
        icons: ['wallet'],
        supported: true
      },
      {
        id: 'cash',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icons: ['cash'],
        supported: true
      }
    ];

    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching payment methods', 
      error: error.message 
    });
  }
};

// Verify payment status
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paymentMethod: order.paymentMethod
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error verifying payment', 
      error: error.message 
    });
  }
};