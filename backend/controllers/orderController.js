const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const transporter = require('../config/email');

// Add this helper function to generate order numbers
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
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

// Create order
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

// FIXED: Enhanced update order status with better error handling
const updateOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const orderId = req.params.id;
    
    console.log(`🔄 Updating order ${orderId} to status: ${status}`);
    console.log(`👤 User role: ${req.user.role}, User ID: ${req.user._id}`);

    // Use lean() for faster query and avoid mongoose document overhead
    const order = await Order.findById(orderId)
      .populate('consumer', 'name email')
      .populate('items.farmer', 'name email')
      .populate('items.product', 'name price')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in the order
    const isFarmer = order.items.some(item => 
      item.farmer && item.farmer._id.toString() === req.user._id.toString()
    );
    const isConsumer = order.consumer && order.consumer._id.toString() === req.user._id.toString();
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

    // Use findByIdAndUpdate for better performance
    const updateData = {
      status: status,
      $push: {
        statusHistory: {
          status: status,
          updatedBy: req.user._id,
          updatedAt: new Date(),
          reason: reason || 'Status updated'
        }
      }
    };

    // Update delivery timestamp if delivered
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('consumer', 'name email')
    .populate('items.product', 'name images price')
    .populate('items.farmer', 'name email farmName');

    console.log(`✅ Order ${orderId} status updated from ${oldStatus} to ${status}`);

    // Emit real-time update
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      io.to(`order_${orderId}`).emit('order_updated', {
        orderId,
        oldStatus,
        newStatus: status,
        updatedBy: req.user._id,
        order: updatedOrder,
        timestamp: new Date()
      });

      console.log(`📢 Real-time update sent for order ${orderId}`);
    }

    res.json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
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

// FIXED: Enhanced cancel order with immediate response and better performance
const cancelOrder = async (req, res) => {
  try {
    const { reason = 'No reason provided' } = req.body;
    const orderId = req.params.id;
    
    console.log(`❌ Cancelling order ${orderId}, Reason: ${reason}`);
    console.log(`👤 User role: ${req.user.role}, User ID: ${req.user._id}`);

    // First get the order without population for quick validation
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

    // Update order status immediately first for quick response
    let newStatus, updateData;

    if (cancellationType === 'farmer') {
      // Farmer cancellation - mark as rejected
      newStatus = 'rejected';
      updateData = {
        status: newStatus,
        rejectionReason: reason,
        rejectedBy: req.user._id,
        rejectedAt: new Date(),
        $push: {
          statusHistory: {
            status: newStatus,
            updatedBy: req.user._id,
            updatedAt: new Date(),
            reason: reason,
            action: 'rejected_by_farmer'
          }
        }
      };
    } else {
      // Consumer or admin cancellation - mark as cancelled
      newStatus = 'cancelled';
      updateData = {
        status: newStatus,
        cancellationReason: reason,
        cancelledBy: req.user._id,
        cancelledAt: new Date(),
        $push: {
          statusHistory: {
            status: newStatus,
            updatedBy: req.user._id,
            updatedAt: new Date(),
            reason: reason,
            action: 'cancelled_by_consumer'
          }
        }
      };
    }

    // Update order status immediately
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    console.log(`✅ Order ${orderId} ${newStatus} successfully by ${req.user.role}`);

    // Restore product inventory ASYNCHRONOUSLY (don't wait for this)
    restoreInventoryAsync(orderId, req.user, cancellationType);

    // Populate for response
    const populatedOrder = await Order.findById(orderId)
      .populate('consumer', 'name email')
      .populate('items.product', 'name images price')
      .populate('items.farmer', 'name email farmName');

    // Emit real-time events ASYNCHRONOUSLY
    emitCancellationEventsAsync(orderId, oldStatus, newStatus, populatedOrder, req.user, reason, cancellationType);

    // Send immediate response
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
      error: error.message
    });
  }
};

// Async function to restore inventory (non-blocking)
const restoreInventoryAsync = async (orderId, user, cancellationType) => {
  try {
    const orderWithProducts = await Order.findById(orderId)
      .populate('items.product')
      .populate('items.farmer');

    for (const item of orderWithProducts.items) {
      if (cancellationType === 'farmer') {
        // Farmer only restores inventory for their own products
        if (item.farmer && item.farmer._id.toString() === user._id.toString()) {
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
  } catch (error) {
    console.error('❌ Error restoring inventory:', error);
  }
};

// Async function to emit cancellation events (non-blocking)
const emitCancellationEventsAsync = async (orderId, oldStatus, newStatus, order, user, reason, cancellationType) => {
  try {
    if (!order || !order.consumer) return;

    if (global.io) {
      const io = global.io;
      
      if (cancellationType === 'farmer') {
        // Farmer rejected order - notify consumer
        io.to(order.consumer._id.toString()).emit('order_rejected', {
          orderId,
          oldStatus,
          rejectedBy: user._id,
          reason: reason,
          order: order,
          timestamp: new Date()
        });
        
        console.log(`📢 Order rejection sent to consumer: ${order.consumer._id}`);
        
        // Also notify all farmers in the order (except the one who rejected)
        const farmerIds = [...new Set(order.items.map(item => 
          item.farmer && item.farmer._id.toString()
        ).filter(id => id && id !== user._id.toString()))];
        
        farmerIds.forEach(farmerId => {
          io.to(farmerId).emit('order_rejected_by_farmer', {
            orderId,
            oldStatus,
            rejectedBy: user._id,
            reason: reason,
            order: order,
            timestamp: new Date()
          });
        });
      } else {
        // Consumer cancelled order - notify all farmers involved
        const farmerIds = [...new Set(order.items.map(item => 
          item.farmer && item.farmer._id.toString()
        ).filter(id => id))];
        
        farmerIds.forEach(farmerId => {
          io.to(farmerId).emit('order_cancelled_by_consumer', {
            orderId,
            oldStatus,
            cancelledBy: user._id,
            reason: reason,
            order: order,
            timestamp: new Date()
          });
        });
        
        console.log(`📢 Order cancellation sent to ${farmerIds.length} farmers`);
      }

      // Always emit to order room
      io.to(`order_${orderId}`).emit('order_updated', {
        orderId,
        oldStatus,
        newStatus: newStatus,
        updatedBy: user._id,
        order: order,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('❌ Error emitting cancellation events:', error);
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
      item.farmer && item.farmer._id.toString() === req.user._id.toString()
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

// Other order controller functions (getOrderAnalytics, confirmPayment, etc.)
const getOrderAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    const farmerId = req.user._id;

    console.log(`📊 Fetching analytics for farmer: ${farmerId}, Period: ${period}`);

    // Calculate date range
    const now = new Date();
    let startDateObj, endDateObj = now;

    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          startDateObj = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDateObj = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDateObj = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDateObj = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDateObj = new Date(now.setMonth(now.getMonth() - 1));
      }
    }

    // Get orders for the farmer with proper filtering
    const orders = await Order.find({
      'items.farmer': farmerId,
      createdAt: { $gte: startDateObj, $lte: endDateObj },
      status: { $nin: ['cancelled', 'rejected'] }
    })
    .populate('items.product', 'name price')
    .populate('consumer', 'name email');

    // Calculate analytics
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

    const analytics = {
      period,
      dateRange: { startDate: startDateObj, endDate: endDateObj },
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      completedOrders,
      pendingOrders,
      averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
      ordersByStatus: revenueByStatus,
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

    res.json({ message: 'Payment confirmed successfully', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
      order.status = 'confirmed';
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

module.exports = {
  createOrder,
  getConsumerOrders,
  getFarmerOrders,
  updateOrderStatus,
  confirmPayment,
  cancelOrder,
  getOrderAnalytics,
  getOrderById,
  processOrderPayment
};