const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
 
const { sendPasswordResetEmail } = require('../utils/emailService');

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role, ...roleData } = req.body;

    console.log('Registration attempt:', { name, email, role });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user based on role
    const userData = {
      name,
      email,
      password,
      role,
      isVerified: true, // Auto-verify users
      ...roleData
    };

    const user = await User.create(userData);

    // Generate token for immediate login
    const token = generateToken(user._id);

    console.log('✅ User registered successfully:', email);
      
    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        farmName: user.farmName,
        specialty: user.specialty,
        location: user.location
      }
    });

  } catch (error) {
    console.log('Registration error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // No email verification check - users can login immediately
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        farmName: user.farmName,
        specialty: user.specialty,
        location: user.location,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`Password reset requested for: ${email}`);

    const user = await User.findOne({ email });
    
    // Only send email if user exists
    if (!user) {
      console.log(`❌ Password reset requested for non-existent email: ${email}`);
      // Still return success to prevent email enumeration
      return res.json({ 
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    console.log(`🔐 Generated reset token for: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);

    try {
      // Send email with reset link
      await sendPasswordResetEmail(user.email, resetUrl);
      
      console.log(`✅ Password reset email sent successfully to: ${email}`);
      
      res.json({ 
        message: 'Password reset instructions have been sent to your email.',
        // Only include resetToken in development for testing
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken, 
          resetUrl,
          debug: 'Email sent successfully' 
        })
      });
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      
      // Clear the reset token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset process' });
  }
};

// Reset password - UPDATED VERSION
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        message: 'Reset token and new password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    console.log(`🔐 Password reset attempt with token: ${token.substring(0, 10)}...`);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log(`❌ Invalid or expired reset token: ${token.substring(0, 10)}...`);
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    console.log(`✅ Valid reset token found for user: ${user.email}`);

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.',
      success: true
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};


// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all farmers
const getFarmers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { role: 'farmer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { farmName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }
    
    const farmers = await User.find(query)
      .select('name email avatar role farmName specialty location')
      .limit(50);
    
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all consumers
const getConsumers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { role: 'consumer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const consumers = await User.find(query)
      .select('name email avatar role location')
      .limit(50);
    
    res.json(consumers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { search, role, excludeCurrent } = req.query;
    
    let query = {};
    
    // Filter by role if specified
    if (role) {
      query.role = role;
    }
    
    // Exclude current user
    if (excludeCurrent) {
      query._id = { $ne: req.user._id };
    }
    
    // Search by name or farm name
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { farmName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('name email avatar role farmName specialty location')
      .limit(20);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  getFarmers,
  getConsumers,
  searchUsers
};