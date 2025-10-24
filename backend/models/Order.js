const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'cash'],
    default: 'card'
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    failureReason: String
  },
  deliveryAddress: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  deliveryInstructions: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  farmerNotes: String,
  consumerNotes: String,
  
  // NEW: Enhanced cancellation/rejection fields
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
  rejectionReason: String,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  
  // Status history for tracking
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    cancelledBy: String // 'consumer', 'farmer', 'admin'
  }],
  
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String
}, { 
  timestamps: true 
});

// FIXED: Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Calculate totalAmount if not provided
  if (this.isNew && (!this.totalAmount || this.totalAmount === 0)) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);