const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'dairy', 'grains', 'meat', 'poultry', 'herbs', 'other']
  },
  images: [{
    url: String,
    public_id: String
  }],
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lb', 'piece', 'bunch', 'dozen', 'pack'],
      required: true
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isSeasonal: {
    type: Boolean,
    default: false
  },
  harvestDate: Date,
  expiryDate: Date,
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);