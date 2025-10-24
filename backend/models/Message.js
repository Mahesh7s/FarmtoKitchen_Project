const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String, // 'image', 'pdf', 'document'
    size: Number
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'order_update'],
    default: 'text'
  }
}, { 
  timestamps: true 
});

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);