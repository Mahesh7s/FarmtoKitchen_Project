const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryAreas: [{
    zipCode: String,
    city: String,
    state: String,
    deliveryTime: {
      minDays: Number,
      maxDays: Number
    },
    cost: Number,
    freeShippingAbove: Number
  }],
  timeSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String, // "09:00"
      endTime: String,   // "11:00"
      maxOrders: Number,
      currentOrders: {
        type: Number,
        default: 0
      }
    }]
  }],
  sameDayDelivery: {
    available: Boolean,
    cutOffTime: String, // "14:00"
    extraCharge: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Shipping', shippingSchema);