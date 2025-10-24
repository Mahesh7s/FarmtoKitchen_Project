const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Order = require('../models/Order');

const setupSocket = (io) => {
  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('❌ User not found for token');
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      console.log('✅ Socket authenticated for user:', user._id, 'Role:', user.role);
      next();
    } catch (error) {
      console.error('❌ Socket auth error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.userId, 'Socket:', socket.id);

    // Join user to their personal room
    socket.join(socket.userId);
    console.log(`📍 User ${socket.userId} joined room: ${socket.userId}`);

    // Handle joining order rooms for real-time updates
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`📍 User ${socket.userId} joined order room: order_${orderId}`);
    });

    // Handle leaving order rooms
    socket.on('leave_order', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`📍 User ${socket.userId} left order room: order_${orderId}`);
    });

    // Handle real-time messaging
    socket.on('send_message', async (data) => {
      try {
        console.log('📨 Received send_message event:', data);
        const { receiverId, content, orderId } = data;
        
        // Validate required fields
        if (!receiverId || receiverId === 'undefined') {
          socket.emit('message_error', { error: 'Receiver ID is required' });
          return;
        }

        // Create message in database
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          order: orderId,
          content: content || '',
          messageType: 'text'
        });

        await message.populate('sender receiver', 'name avatar role farmName');

        console.log(`✅ Message created: ${message._id}`);

        // Emit to both sender and receiver
        socket.emit('new_message', message); // To sender
        socket.to(receiverId).emit('new_message', message); // To receiver

        // Also emit to order room if orderId exists
        if (orderId) {
          socket.to(`order_${orderId}`).emit('new_message', message);
        }

        console.log(`📤 Message sent from ${socket.userId} to ${receiverId}`);

      } catch (error) {
        console.error('❌ Error sending message via socket:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Handle order status updates with real-time notifications
    socket.on('order_status_update', async (data) => {
      try {
        console.log('🔄 Order status update received:', data);
        const { orderId, newStatus, updatedBy } = data;

        // Find the order
        const order = await Order.findById(orderId)
          .populate('consumer', 'name email')
          .populate('items.farmer', 'name email');

        if (!order) {
          socket.emit('order_update_error', { error: 'Order not found' });
          return;
        }

        // Update order status
        order.status = newStatus;
        
        // Update delivery timestamp if delivered
        if (newStatus === 'delivered') {
          order.actualDelivery = new Date();
        }

        await order.save();

        console.log(`✅ Order ${orderId} status updated to: ${newStatus}`);

        // Notify all parties involved
        const notifyUsers = new Set();
        
        // Add consumer
        notifyUsers.add(order.consumer._id.toString());
        
        // Add all farmers in the order
        order.items.forEach(item => {
          notifyUsers.add(item.farmer._id.toString());
        });

        // Emit to all involved users
        notifyUsers.forEach(userId => {
          socket.to(userId).emit('order_updated', {
            orderId,
            newStatus,
            updatedBy,
            order: order,
            timestamp: new Date()
          });
        });

        // Also emit to order room
        socket.to(`order_${orderId}`).emit('order_updated', {
          orderId,
          newStatus,
          updatedBy,
          order: order,
          timestamp: new Date()
        });

        console.log(`📢 Order update notified to ${notifyUsers.size} users`);

      } catch (error) {
        console.error('❌ Error updating order status via socket:', error);
        socket.emit('order_update_error', { error: error.message });
      }
    });

    // Handle order cancellation with real-time notifications
    socket.on('order_cancelled', async (data) => {
      try {
        console.log('❌ Order cancellation received:', data);
        const { orderId, cancelledBy, reason } = data;

        const order = await Order.findById(orderId)
          .populate('consumer', 'name email')
          .populate('items.farmer', 'name email');

        if (!order) {
          socket.emit('order_update_error', { error: 'Order not found' });
          return;
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        console.log(`✅ Order ${orderId} cancelled by: ${cancelledBy}`);

        // Notify all parties involved
        const notifyUsers = new Set();
        notifyUsers.add(order.consumer._id.toString());
        
        order.items.forEach(item => {
          notifyUsers.add(item.farmer._id.toString());
        });

        // Emit cancellation event
        notifyUsers.forEach(userId => {
          socket.to(userId).emit('order_cancelled', {
            orderId,
            cancelledBy,
            reason,
            order: order,
            timestamp: new Date()
          });
        });

        // Emit to order room
        socket.to(`order_${orderId}`).emit('order_cancelled', {
          orderId,
          cancelledBy,
          reason,
          order: order,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('❌ Error cancelling order via socket:', error);
        socket.emit('order_update_error', { error: error.message });
      }
    });

    // NEW: Handle order rejection by farmer
    socket.on('order_rejected', async (data) => {
      try {
        console.log('🚫 Order rejection received via socket:', data);
        const { orderId, rejectedBy, reason } = data;

        const order = await Order.findById(orderId)
          .populate('consumer', 'name email')
          .populate('items.farmer', 'name email');

        if (!order) {
          socket.emit('order_update_error', { error: 'Order not found' });
          return;
        }

        // Update order status to rejected
        order.status = 'rejected';
        order.rejectionReason = reason;
        order.rejectedBy = rejectedBy;
        await order.save();

        console.log(`✅ Order ${orderId} marked as rejected`);

        // Notify consumer about rejection
        socket.to(order.consumer._id.toString()).emit('order_rejected', {
          orderId,
          rejectedBy,
          reason,
          order: order,
          timestamp: new Date()
        });

        console.log(`📢 Order rejection notified to consumer: ${order.consumer._id}`);

        // Also notify other farmers in the order
        const otherFarmerIds = [...new Set(order.items.map(item => 
          item.farmer._id.toString()
        ).filter(id => id !== rejectedBy))];

        otherFarmerIds.forEach(farmerId => {
          socket.to(farmerId).emit('order_rejected_by_farmer', {
            orderId,
            rejectedBy,
            reason,
            order: order,
            timestamp: new Date()
          });
        });

      } catch (error) {
        console.error('❌ Error handling order rejection via socket:', error);
        socket.emit('order_update_error', { error: error.message });
      }
    });

    // NEW: Handle order cancelled by consumer
    socket.on('order_cancelled_by_consumer', async (data) => {
      try {
        console.log('👤 Order cancelled by consumer via socket:', data);
        const { orderId, cancelledBy, reason } = data;

        const order = await Order.findById(orderId)
          .populate('consumer', 'name email')
          .populate('items.farmer', 'name email');

        if (!order) {
          socket.emit('order_update_error', { error: 'Order not found' });
          return;
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.cancelledBy = cancelledBy;
        await order.save();

        console.log(`✅ Order ${orderId} marked as cancelled by consumer`);

        // Notify all farmers involved that consumer cancelled
        const farmerIds = [...new Set(order.items.map(item => item.farmer._id.toString()))];
        
        farmerIds.forEach(farmerId => {
          socket.to(farmerId).emit('order_cancelled_by_consumer', {
            orderId,
            cancelledBy,
            reason,
            order: order,
            timestamp: new Date()
          });
        });

        console.log(`📢 Consumer cancellation notified to ${farmerIds.length} farmers`);

      } catch (error) {
        console.error('❌ Error handling consumer cancellation via socket:', error);
        socket.emit('order_update_error', { error: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.receiverId).emit('user_typing', {
        senderId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.receiverId).emit('user_typing', {
        senderId: socket.userId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log('👤 User disconnected:', socket.userId, 'Reason:', reason);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', socket.userId, error);
    });
  });
};

module.exports = setupSocket;