const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['consumer', 'farmer', 'admin'],
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Farmer-specific fields
userSchema.add({
  farmName: {
    type: String,
    required: function() { return this.role === 'farmer'; }
  },
  farmLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  farmDescription: String,
  farmType: [String], // ['vegetables', 'fruits', 'dairy', etc.]
  certifications: [String], // ['organic', 'sustainable', etc.]
  contactNumber: String,
  businessLicense: String
});

// Consumer-specific fields
userSchema.add({
  deliveryAddress: {
    type: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      isDefault: Boolean
    }
  },
  preferences: {
    organic: Boolean,
    local: Boolean,
    seasonal: Boolean,
    productCategories: [String]
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);