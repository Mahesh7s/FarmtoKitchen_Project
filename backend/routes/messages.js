const express = require('express');
const { 
  sendMessage, 
  getConversation, 
  getConversations, 
  markAsRead, 
  getUnreadCount, 
  deleteMessage,
  verifyImageAccess,
  downloadImage,
  getImageDownloadUrl,
  previewImage
} = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const { uploadMessageFiles, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Apply rate limiting to message routes if needed
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 messages per minute
  message: {
    success: false,
    message: 'Too many messages sent, please try again in a minute'
  }
});

// Use the enhanced upload middleware with error handling
router.post('/', auth, (req, res, next) => {
  uploadMessageFiles(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, messageLimiter, sendMessage);

router.get('/conversations', auth, getConversations);
router.get('/conversation/:userId', auth, getConversation);
router.put('/mark-read', auth, markAsRead);
router.get('/unread-count', auth, getUnreadCount);
router.delete('/:messageId', auth, deleteMessage);
router.get('/verify-image-access', auth, verifyImageAccess);

// Enhanced image download routes
router.get('/:messageId/download/:attachmentIndex', auth, downloadImage);
router.get('/:messageId/download-url/:attachmentIndex', auth, getImageDownloadUrl);
router.get('/:messageId/preview/:attachmentIndex', auth, previewImage);

module.exports = router;