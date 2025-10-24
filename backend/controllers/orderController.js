const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const stripe = require('../config/stripe');
const transporter = require('../config/email');

// Add this helper function to generate order numbers
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

// Create order - FIXED VERSION
const createOrder = async (req, res) => {
  try {
    console.log('🔄 Creating order with data:', req.body);
    console.log('👤 User ID:', req.user._id);

    const { 
      items, 
      deliveryAddress, 
      paymentMethod = 'card',
      totalAmount,
      deliveryInstructions,
      consumerNotes,
      orderNumber
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Order must contain at least one item' 
      });
    }

    if (!deliveryAddress || !deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      return res.status(400).json({ 
        message: 'Complete delivery address is required (address, city, state, zipCode)' 
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ 
        message: 'Valid total amount is required' 
      });
    }

    // Validate items and calculate total
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('📦 Processing item:', item);
      
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({ 
          message: 'Each item must have product, quantity, and price' 
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.product}` 
        });
      }

      if (product.inventory.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for ${product.name}. Available: ${product.inventory.quantity}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        farmer: product.farmer
      });
    }

    // Verify calculated total matches provided total
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      console.warn(`Total amount mismatch: Calculated ${calculatedTotal}, Provided ${totalAmount}`);
    }

    console.log('✅ Creating order with items:', orderItems.length);
    console.log('💰 Total amount:', calculatedTotal);

    // Generate order number if not provided from frontend
    const finalOrderNumber = orderNumber || generateOrderNumber();
    console.log('🔢 Using order number:', finalOrderNumber);

    // Create order with all required fields INCLUDING orderNumber
    const order = new Order({
      orderNumber: finalOrderNumber,
      consumer: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      deliveryAddress,
      paymentMethod,
      deliveryInstructions,
      consumerNotes,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid'
    });

    console.log('📝 Order object before save:', order);

    await order.save();
    console.log('✅ Order saved successfully:', order._id);

    // Update product inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.quantity': -item.quantity }
      });
      console.log(`📦 Updated inventory for product ${item.product}, reduced by ${item.quantity}`);
    }

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images price')
      .populate('items.farmer', 'name email farmName')
      .populate('consumer', 'name email');

    console.log('🎉 Order creation completed successfully');

    // Emit real-time order creation event
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Notify all farmers involved in the order
      const farmerIds = [...new Set(orderItems.map(item => item.farmer.toString()))];
      
      farmerIds.forEach(farmerId => {
        io.to(farmerId).emit('new_order', {
          orderId: order._id,
          order: populatedOrder,
          timestamp: new Date()
        });
      });

      console.log(`📢 New order notification sent to ${farmerIds.length} farmers`);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('📋 Validation errors:', errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    if (error.code === 11000) {
      console.error('🔑 Duplicate key error:', error);
      return res.status(400).json({ 
        message: 'Duplicate order number. Please try again.' 
      });
    }
    
    console.error('💥 Unexpected error:', error);
    res.status(500).json({ 
      message: 'Error creating order', 
      error: error.message 
    });
  }
};

// Get consumer orders
const getConsumerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user._id })
      .populate('items.product', 'name images')
      .populate('items.farmer', 'name farmName')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get farmer orders - UPDATED: Exclude orders cancelled by consumer
const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      'items.farmer': req.user._id,
      // Exclude orders that were cancelled by consumer
      $or: [
        { status: { $ne: 'cancelled' } },
        { 
          status: 'cancelled',
          cancelledBy: { $exists: true },
          $expr: { $ne: ['$cancelledBy', req.user._id] }
        }
      ]
    })
      .populate('consumer', 'name email deliveryAddress')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper functions for order status validation
const isValidStatusTransition = (currentStatus, newStatus, userRole) => {
  const validTransitions = {
    consumer: {
      pending: ['cancelled'],
      confirmed: ['cancelled']
    },
    farmer: {
      pending: ['confirmed', 'rejected'],
      confirmed: ['processing', 'rejected'],
      processing: ['shipped', 'rejected'],
      shipped: ['delivered']
    },
    admin: {
      pending: ['confirmed', 'cancelled', 'rejected'],
      confirmed: ['processing', 'cancelled', 'rejected'],
      processing: ['shipped', 'cancelled', 'rejected'],
      shipped: ['delivered'],
      delivered: ['cancelled']
    }
  };

  return validTransitions[userRole]?.[currentStatus]?.includes(newStatus) || false;
};

const calculateDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate, endDate = now;

  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
  } else {
    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
  }

  return { startDate, endDate };
};

const getRevenueTrend = async (farmerId, dateRange) => {
  try {
    return await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 
        'items.farmer': farmerId,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        status: { $nin: ['cancelled', 'rejected'] }
      }},
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
  } catch (error) {
    console.error('Error calculating revenue trend:', error);
    return [];
  }
};

const sendStatusUpdateEmail = async (order, oldStatus, newStatus, updatedBy) => {
  try {
    const emailContent = `
      <h2>Order Status Updated</h2>
      <p>Your order <strong>#${order.orderNumber}</strong> status has been updated.</p>
      <p><strong>Previous Status:</strong> ${oldStatus}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p><strong>Updated By:</strong> ${updatedBy.name}</p>
      <p><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.consumer.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: emailContent
    });

    console.log(`📧 Status update email sent to ${order.consumer.email}`);
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
  }
};

const sendCancellationEmail = async (order, cancelledBy, reason) => {
  try {
    const emailContent = `
      <h2>Order Cancelled</h2>
      <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
      <p><strong>Cancelled By:</strong> ${cancelledBy.name}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Cancellation Time:</strong> ${new Date().toLocaleString()}</p>
      <p>If this was a mistake, please contact support immediately.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.consumer.email,
      subject: `Order Cancelled - ${order.orderNumber}`,
      html: emailContent
    });

    console.log(`📧 Cancellation email sent to ${order.consumer.email}`);
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
  }
};

// NEW: Send rejection email for farmer cancellations
const sendRejectionEmail = async (order, rejectedBy, reason) => {
  try {
    const emailContent = `
      <h2>Order Rejected</h2>
      <p>Your order <strong>#${order.orderNumber}</strong> has been rejected by the farmer.</p>
      <p><strong>Rejected By:</strong> ${rejectedBy.name}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Rejection Time:</strong> ${new Date().toLocaleString()}</p>
      <p>If you have any questions, please contact the farmer directly.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.consumer.email,
      subject: `Order Rejected - ${order.orderNumber}`,
      html: emailContent
    });

    console.log(`📧 Rejection email sent to ${order.consumer.email}`);
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
  }
};

// Enhanced update order status with real-time notifications
const updateOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const orderId = req.params.id;
    
    console.log(`🔄 Updating order ${orderId} to status: ${status}`);

    const order = await Order.findById(orderId)
      .populate('consumer', 'name email')
      .populate('items.farmer', 'name email')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in the order
    const isFarmer = order.items.some(item => 
      item.farmer._id.toString() === req.user._id.toString()
    );
    const isConsumer = order.consumer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isConsumer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Validate status transition
    if (!isValidStatusTransition(order.status, status, req.user.role)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status} for ${req.user.role}` 
      });
    }

    const oldStatus = order.status;
    order.status = status;
    
    // Update delivery timestamp if delivered
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    // Add status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    order.statusHistory.push({
      status: status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      reason: reason
    });

    await order.save();

    // Populate for response
    await order.populate('consumer', 'name email');
    await order.populate('items.product', 'name images price');
    await order.populate('items.farmer', 'name email farmName');

    console.log(`✅ Order ${orderId} status updated from ${oldStatus} to ${status}`);

    // Emit real-time update
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      io.to(`order_${orderId}`).emit('order_updated', {
        orderId,
        oldStatus,
        newStatus: status,
        updatedBy: req.user._id,
        order: order,
        timestamp: new Date()
      });

      // Notify specific users
      const notifyUsers = new Set();
      notifyUsers.add(order.consumer._id.toString());
      
      order.items.forEach(item => {
        notifyUsers.add(item.farmer._id.toString());
      });

      notifyUsers.forEach(userId => {
        io.to(userId).emit('order_updated', {
          orderId,
          oldStatus,
          newStatus: status,
          updatedBy: req.user._id,
          order: order,
          timestamp: new Date()
        });
      });

      console.log(`📢 Real-time update sent for order ${orderId}`);
    }

    // Send email notification
    await sendStatusUpdateEmail(order, oldStatus, status, req.user);

    res.json({
      message: `Order status updated to ${status}`,
      order: order,
      realTimeUpdate: true
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ 
      message: 'Error updating order status', 
      error: error.message 
    });
  }
};

// UPDATED: Enhanced cancel order with immediate updates and proper notifications
const cancelOrder = async (req, res) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const orderId = req.params.id;
    
    console.log(`❌ Cancelling order ${orderId}, Reason: ${reason}`);
    console.log(`👤 User role: ${req.user.role}, User ID: ${req.user._id}`);

    // First get the order without population to avoid population issues
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Enhanced authorization check
    let isAuthorized = false;
    let cancellationType = '';

    if (req.user.role === 'consumer') {
      isAuthorized = order.consumer.toString() === req.user._id.toString();
      cancellationType = 'consumer';
    } else if (req.user.role === 'farmer') {
      // For farmer, check if any items belong to this farmer
      const orderWithItems = await Order.findById(orderId).populate('items.product');
      const farmerItems = orderWithItems.items.filter(item => {
        return item.farmer && item.farmer.toString() === req.user._id.toString();
      });
      isAuthorized = farmerItems.length > 0;
      cancellationType = 'farmer';
    } else if (req.user.role === 'admin') {
      isAuthorized = true;
      cancellationType = 'admin';
    }

    console.log(`🔐 Authorization check: ${isAuthorized} - ${cancellationType}`);

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: 'Not authorized to cancel this order'
      });
    }

    // Validate if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: `Order cannot be cancelled in "${order.status}" status. Only orders in pending, confirmed, or processing status can be cancelled.` 
      });
    }

    const oldStatus = order.status;

    // Restore product inventory for cancelled items
    const orderWithProducts = await Order.findById(orderId)
      .populate('items.product')
      .populate('items.farmer');

    for (const item of orderWithProducts.items) {
      if (req.user.role === 'farmer') {
        // Farmer only restores inventory for their own products
        if (item.farmer && item.farmer._id.toString() === req.user._id.toString()) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: { 'inventory.quantity': item.quantity }
          });
          console.log(`📦 Restored inventory for ${item.product.name}: +${item.quantity}`);
        }
      } else {
        // Consumer and admin restore all inventory
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { 'inventory.quantity': item.quantity }
        });
        console.log(`📦 Restored inventory for ${item.product.name}: +${item.quantity}`);
      }
    }

    // Update order based on who cancelled
    if (cancellationType === 'farmer') {
      // Farmer cancellation - mark as rejected for consumer
      order.status = 'rejected';
      order.rejectionReason = reason;
      order.rejectedBy = req.user._id;
      order.rejectedAt = new Date();
    } else {
      // Consumer or admin cancellation - mark as cancelled
      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledBy = req.user._id;
      order.cancelledAt = new Date();
    }

    // Add to status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    order.statusHistory.push({
      status: order.status,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      reason: reason,
      cancelledBy: cancellationType
    });

    await order.save();

    // Populate for real-time events and response
    const populatedOrder = await Order.findById(order._id)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images price')
      .populate('items.farmer', 'name email farmName');

    console.log(`✅ Order ${orderId} ${order.status} successfully by ${req.user.role}`);

    // Emit real-time events based on cancellation type
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      if (cancellationType === 'farmer') {
        // Farmer rejected order - notify consumer
        io.to(populatedOrder.consumer._id.toString()).emit('order_rejected', {
          orderId,
          oldStatus,
          rejectedBy: req.user._id,
          reason: reason,
          order: populatedOrder,
          timestamp: new Date()
        });
        
        console.log(`📢 Order rejection sent to consumer: ${populatedOrder.consumer._id}`);
        
        // Also notify all farmers in the order (except the one who rejected)
        const farmerIds = [...new Set(populatedOrder.items.map(item => 
          item.farmer && item.farmer._id.toString()
        ).filter(id => id && id !== req.user._id.toString()))];
        
        farmerIds.forEach(farmerId => {
          io.to(farmerId).emit('order_rejected_by_farmer', {
            orderId,
            oldStatus,
            rejectedBy: req.user._id,
            reason: reason,
            order: populatedOrder,
            timestamp: new Date()
          });
        });
      } else {
        // Consumer cancelled order - notify all farmers involved
        const farmerIds = [...new Set(populatedOrder.items.map(item => 
          item.farmer && item.farmer._id.toString()
        ).filter(id => id))];
        
        farmerIds.forEach(farmerId => {
          io.to(farmerId).emit('order_cancelled_by_consumer', {
            orderId,
            oldStatus,
            cancelledBy: req.user._id,
            reason: reason,
            order: populatedOrder,
            timestamp: new Date()
          });
        });
        
        console.log(`📢 Order cancellation sent to ${farmerIds.length} farmers`);
      }

      // Always emit to order room
      io.to(`order_${orderId}`).emit('order_updated', {
        orderId,
        oldStatus,
        newStatus: order.status,
        updatedBy: req.user._id,
        order: populatedOrder,
        timestamp: new Date()
      });
    }

    // Send appropriate email notification
    if (cancellationType === 'farmer') {
      await sendRejectionEmail(populatedOrder, req.user, reason);
    } else {
      await sendCancellationEmail(populatedOrder, req.user, reason);
    }

    res.json({ 
      message: `Order ${cancellationType === 'farmer' ? 'rejected' : 'cancelled'} successfully`,
      order: populatedOrder,
      cancellationType: cancellationType,
      realTimeUpdate: true
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ 
      message: 'Error cancelling order', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    console.log('🔍 Fetching order by ID:', req.params.id);
    
    const order = await Order.findById(req.params.id)
      .populate('consumer', 'name email phone')
      .populate('items.product', 'name images price category')
      .populate('items.farmer', 'name email farmName phone');

    if (!order) {
      console.log('❌ Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has permission to view this order
    const isConsumer = order.consumer._id.toString() === req.user._id.toString();
    const isFarmer = order.items.some(item => 
      item.farmer._id.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isConsumer && !isFarmer && !isAdmin) {
      console.log('🚫 Unauthorized access attempt by user:', req.user._id);
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    console.log('✅ Order found and authorized:', order.orderNumber);
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    res.status(500).json({ 
      message: 'Error fetching order details', 
      error: error.message 
    });
  }
};

// Enhanced order analytics with proper revenue calculation
const getOrderAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    const farmerId = req.user._id;

    console.log(`📊 Fetching analytics for farmer: ${farmerId}, Period: ${period}`);

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate, endDate);
    
    // Get orders for the farmer with proper filtering
    const orders = await Order.find({
      'items.farmer': farmerId,
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $nin: ['cancelled', 'rejected'] } // Exclude cancelled and rejected orders from revenue
    })
    .populate('items.product', 'name price')
    .populate('consumer', 'name email');

    // Calculate analytics with proper revenue tracking
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let completedOrders = 0;
    let pendingOrders = 0;

    const revenueByStatus = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0
    };

    orders.forEach(order => {
      // Count orders by status
      revenueByStatus[order.status] = (revenueByStatus[order.status] || 0) + 1;
      
      if (order.status === 'delivered') completedOrders++;
      if (['pending', 'confirmed'].includes(order.status)) pendingOrders++;

      // Calculate farmer's revenue from this order
      const farmerItems = order.items.filter(item => 
        item.farmer.toString() === farmerId.toString()
      );
      
      const orderRevenue = farmerItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      totalRevenue += orderRevenue;
    });

    // Get popular products
    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 
        'items.farmer': farmerId,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        status: { $nin: ['cancelled', 'rejected'] }
      }},
      { $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $addToSet: '$_id' }
      }},
      { $project: {
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: { $size: '$orderCount' }
      }},
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: '$product' }
    ]);

    // Get revenue trend
    const revenueTrend = await getRevenueTrend(farmerId, dateRange);

    const analytics = {
      period,
      dateRange,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      completedOrders,
      pendingOrders,
      averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
      ordersByStatus: revenueByStatus,
      popularProducts,
      revenueTrend,
      calculatedAt: new Date()
    };

    console.log(`✅ Analytics calculated: $${analytics.totalRevenue} revenue from ${analytics.totalOrders} orders`);

    res.json(analytics);

  } catch (error) {
    console.error('❌ Error fetching order analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    // Notify farmers about the new order
    const farmerIds = [...new Set(order.items.map(item => item.farmer.toString()))];
    
    for (const farmerId of farmerIds) {
      const farmer = await User.findById(farmerId);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: farmer.email,
        subject: 'New Order Received - Farm To Kitchen',
        html: `
          <h2>New Order Alert!</h2>
          <p>You have received a new order #${order.orderNumber}.</p>
          <p>Please check your dashboard for order details.</p>
        `
      });
    }

    res.json({ message: 'Payment confirmed successfully', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Process order payment
const processOrderPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentDetails } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment method
    order.paymentMethod = paymentMethod;
    
    // For cash payments, payment status remains pending
    if (paymentMethod === 'cash') {
      order.paymentStatus = 'pending';
      order.status = 'confirmed'; // Still confirm the order for cash
    } else {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
    }

    await order.save();

    // Populate order details for response
    const populatedOrder = await Order.findById(orderId)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images price')
      .populate('items.farmer', 'name email');

    res.json({
      message: 'Order payment processed successfully',
      order: populatedOrder
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing order payment', 
      error: error.message 
    });
  }
};

// Get orders trend (simplified implementation)
const getOrdersTrend = async (farmerId, period) => {
  // Simplified implementation for trend analysis
  return [];
};

module.exports = {
  createOrder,
  getConsumerOrders,
  getFarmerOrders,
  updateOrderStatus,
  confirmPayment,
  cancelOrder,
  getOrderAnalytics,
  getOrderById,
  processOrderPayment,
  getOrdersTrend
};