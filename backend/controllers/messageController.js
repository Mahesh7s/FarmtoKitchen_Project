const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Enhanced upload to Cloudinary for images only
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'image',
      folder: 'farm-to-kitchen/messages',
      access_mode: 'public',
      type: 'upload',
      invalidate: true,
      quality: 'auto',
      fetch_format: 'auto'
    };

    console.log('Uploading image to Cloudinary with options:', uploadOptions);

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload successful:', {
            url: result.secure_url,
            type: 'image',
            publicId: result.public_id,
            format: result.format
          });
          
          resolve(result);
        }
      }
    );

    // Handle both buffer and file path
    if (file.buffer) {
      uploadStream.end(file.buffer);
    } else if (file.path) {
      fs.createReadStream(file.path).pipe(uploadStream);
    } else {
      reject(new Error('No file buffer or path provided'));
    }
  });
};

// Send message with image upload support
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, orderId, messageType = 'text' } = req.body;
    const io = req.app.get('io');
    
    console.log('=== DEBUG: Received send_message request ===');
    console.log('Body:', req.body);
    console.log('Files count:', req.files ? req.files.length : 0);
    console.log('Files:', req.files ? req.files.map(f => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    })) : []);
    console.log('Sender ID:', req.user._id);
    console.log('=== END DEBUG ===');

    // Validate required fields
    if (!receiverId || receiverId === 'undefined') {
      console.log('ERROR: Missing receiverId. Full body:', req.body);
      return res.status(400).json({ 
        success: false,
        message: 'Receiver ID is required and must be valid' 
      });
    }

    // Validate that receiverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid receiver ID format' 
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ 
        success: false,
        message: 'Receiver not found' 
      });
    }

    let attachments = [];
    let finalMessageType = messageType;
    
    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} images for upload`);
      
      for (const file of req.files) {
        try {
          // Validate that file is an image
          if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({ 
              success: false,
              message: 'Only image files are supported' 
            });
          }

          console.log('Uploading image:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });

          const uploadResult = await uploadToCloudinary(file);
          
          const attachment = {
            filename: file.originalname,
            url: uploadResult.secure_url,
            fileType: 'image',
            size: file.size,
            publicId: uploadResult.public_id,
            resourceType: uploadResult.resource_type,
            previewUrl: uploadResult.secure_url
          };

          console.log('Image uploaded successfully:', attachment);
          attachments.push(attachment);
          
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          return res.status(500).json({ 
            success: false,
            message: `Error uploading image: ${uploadError.message}` 
          });
        }
      }

      // Set message type to image if we have attachments
      if (attachments.length > 0) {
        finalMessageType = 'image';
      }
    }

    // Validate that we have either content or images
    if (!content && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text content or images'
      });
    }

    const messageData = {
      sender: req.user._id,
      receiver: receiverId,
      content: content || '',
      attachments,
      messageType: finalMessageType,
      isRead: false
    };

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      messageData.order = orderId;
    }

    const message = await Message.create(messageData);

    // Populate sender and receiver details
    await message.populate('sender receiver', 'name avatar role farmName');

    console.log('Message created successfully:', {
      id: message._id,
      type: message.messageType,
      attachments: message.attachments.length
    });

    // Emit real-time message via Socket.io if available
    if (io) {
      io.to(req.user._id.toString()).emit('new_message', message);
      io.to(receiverId.toString()).emit('new_message', message);
      console.log(`Message emitted to sender ${req.user._id} and receiver ${receiverId}`);
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Enhanced image download function
const downloadImage = async (req, res) => {
  try {
    const { messageId, attachmentIndex = 0 } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ 
        success: false,
        message: 'Message ID is required' 
      });
    }

    // Find the message
    const message = await Message.findById(messageId)
      .populate('sender receiver', '_id name');
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message not found' 
      });
    }

    // Check if user has permission to access this image
    const canAccess = 
      message.sender._id.toString() === req.user._id.toString() ||
      message.receiver._id.toString() === req.user._id.toString();
    
    if (!canAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this image' 
      });
    }

    // Get the attachment
    const attachment = message.attachments[attachmentIndex];
    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Image not found' 
      });
    }

    console.log('Downloading image:', {
      filename: attachment.filename,
      publicId: attachment.publicId,
      url: attachment.url
    });

    // For Cloudinary images, redirect to the optimized URL
    const downloadUrl = cloudinary.url(attachment.publicId, {
      resource_type: 'image',
      secure: true,
      flags: 'attachment',
      quality: 'auto',
      fetch_format: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    });

    console.log('Redirecting to download URL:', downloadUrl);
    
    // Redirect to Cloudinary URL for download
    res.redirect(downloadUrl);

  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ 
      success: false,
      message: `Download failed: ${error.message}` 
    });
  }
};

// Get signed image URL
const getImageDownloadUrl = async (req, res) => {
  try {
    const { messageId, attachmentIndex = 0 } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ 
        success: false,
        message: 'Message ID is required' 
      });
    }

    const message = await Message.findById(messageId)
      .populate('sender receiver', '_id name');
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message not found' 
      });
    }

    const canAccess = 
      message.sender._id.toString() === req.user._id.toString() ||
      message.receiver._id.toString() === req.user._id.toString();
    
    if (!canAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this image' 
      });
    }

    const attachment = message.attachments[attachmentIndex];
    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Image not found' 
      });
    }

    // Generate a signed download URL
    const signedUrl = cloudinary.url(attachment.publicId, {
      resource_type: 'image',
      secure: true,
      flags: 'attachment',
      quality: 'auto',
      fetch_format: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });

    console.log('Generated signed download URL:', signedUrl);

    res.json({
      success: true,
      downloadUrl: signedUrl,
      filename: attachment.filename,
      message: 'Use this URL directly for download'
    });

  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ 
      success: false,
      message: `Failed to generate download URL: ${error.message}` 
    });
  }
};

// Enhanced image preview
const previewImage = async (req, res) => {
  try {
    const { messageId, attachmentIndex = 0 } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ 
        success: false,
        message: 'Message ID is required' 
      });
    }

    const message = await Message.findById(messageId)
      .populate('sender receiver', '_id name');
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message not found' 
      });
    }

    const canAccess = 
      message.sender._id.toString() === req.user._id.toString() ||
      message.receiver._id.toString() === req.user._id.toString();
    
    if (!canAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this image' 
      });
    }

    const attachment = message.attachments[attachmentIndex];
    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'Image not found' 
      });
    }

    // Generate optimized preview URL for images
    const previewUrl = cloudinary.url(attachment.publicId, {
      resource_type: 'image',
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      width: 800,
      crop: 'limit'
    });

    console.log('Generated preview URL:', previewUrl);
    
    res.json({
      success: true,
      previewUrl: previewUrl,
      filename: attachment.filename,
      fileType: 'image'
    });

  } catch (error) {
    console.error('Error generating preview URL:', error);
    res.status(500).json({ 
      success: false,
      message: `Failed to generate preview URL: ${error.message}` 
    });
  }
};

// Get conversation between users
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID format' 
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .populate('sender receiver', 'name avatar role farmName')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        sender: userId, 
        receiver: req.user._id,
        isRead: false 
      },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      messages: messages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(messages.length / limit),
      totalMessages: messages.length
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user._id': 1,
          'user.name': 1,
          'user.avatar': 1,
          'user.role': 1,
          'user.farmName': 1,
          lastMessage: 1,
          unreadCount: 1,
          lastActivity: '$lastMessage.createdAt'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const io = req.app.get('io');

    if (!conversationId) {
      return res.status(400).json({ 
        success: false,
        message: 'Conversation ID is required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid conversation ID format' 
      });
    }

    await Message.updateMany(
      { 
        receiver: req.user._id,
        sender: conversationId,
        isRead: false 
      },
      { $set: { isRead: true } }
    );

    // Notify the other user that messages were read
    if (io) {
      io.to(conversationId).emit('messages_read', {
        readerId: req.user._id.toString(),
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true,
      message: 'Messages marked as read' 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({ 
      success: true,
      unreadCount: count 
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete message and associated images
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const io = req.app.get('io');

    if (!messageId) {
      return res.status(400).json({ 
        success: false,
        message: 'Message ID is required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid message ID format' 
      });
    }

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message not found' 
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only delete your own messages' 
      });
    }

    // Delete images from Cloudinary if any
    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        if (attachment.publicId) {
          await cloudinary.uploader.destroy(attachment.publicId, {
            resource_type: 'image'
          });
        }
      }
    }

    await Message.findByIdAndDelete(messageId);

    // Notify both users about message deletion
    if (io) {
      io.to(req.user._id.toString()).emit('message_deleted', { messageId });
      io.to(message.receiver.toString()).emit('message_deleted', { messageId });
    }

    res.json({ 
      success: true,
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Verify image access
const verifyImageAccess = async (req, res) => {
  try {
    const { publicId } = req.query;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Try to get image info from Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image'
    });

    res.json({
      success: true,
      accessible: true,
      url: result.secure_url
    });
  } catch (error) {
    console.error('Image access verification failed:', error);
    res.status(404).json({
      success: false,
      message: 'Image not accessible',
      error: error.message
    });
  }
};

module.exports = {
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
};