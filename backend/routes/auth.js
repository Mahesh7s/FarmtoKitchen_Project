const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  getFarmers,
  getConsumers,
  searchUsers
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

// User search and listing routes
router.get('/farmers', auth, getFarmers);
router.get('/consumers', auth, getConsumers);
router.get('/search', auth, searchUsers);

module.exports = router;