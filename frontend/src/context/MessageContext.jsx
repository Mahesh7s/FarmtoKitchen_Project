import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Use ref to track processed message IDs to prevent duplicates
  const processedMessageIds = useRef(new Set());

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      const convs = response?.data?.conversations ?? response?.data ?? [];
      setConversations(Array.isArray(convs) ? convs : []);
      
      // Calculate total unread count
      const totalUnread = convs.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      setLoading(true);
      setMessages([]); // Clear previous messages
      
      const response = await messagesAPI.getConversation(userId);
      const fetched = response?.data?.messages ?? response?.data ?? [];
      
      // Reset processed IDs for new conversation
      processedMessageIds.current.clear();
      
      const uniqueMessages = [];
      const seen = new Set();
      
      for (const message of (Array.isArray(fetched) ? fetched : [])) {
        if (!message || !message._id) continue;
        if (!seen.has(message._id)) {
          seen.add(message._id);
          processedMessageIds.current.add(message._id);
          uniqueMessages.push(message);
        }
      }
      
      console.log('Fetched messages:', uniqueMessages.length);
      setMessages(uniqueMessages);
      setActiveConversation(userId);
      
      // Mark as read when opening conversation
      if (userId) {
        await markAsRead(userId);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData, images = []) => {
    try {
      console.log('Sending message:', { messageData, images });
      
      // Validate receiverId before sending
      if (!messageData.receiverId || messageData.receiverId === 'undefined') {
        throw new Error('Invalid recipient selected');
      }

      let response;
      if (images.length > 0) {
        const formData = new FormData();
        formData.append('receiverId', messageData.receiverId);
        formData.append('content', messageData.content || '');
        
        if (messageData.orderId) {
          formData.append('orderId', messageData.orderId);
        }

        images.forEach(file => {
          console.log('Appending image to FormData:', file.name, file.type, file.size);
          formData.append('attachments', file);
        });

        // Debug: Log FormData contents
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`- ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
          } else {
            console.log(`- ${key}:`, value);
          }
        }

        console.log('Sending FormData with images:', {
          receiverId: messageData.receiverId,
          content: messageData.content,
          imagesCount: images.length
        });

        response = await messagesAPI.send(formData);
      } else {
        console.log('Sending JSON message:', messageData);
        response = await messagesAPI.send({
          receiverId: messageData.receiverId,
          content: messageData.content,
          orderId: messageData.orderId
        });
      }

      const newMsg = response?.data?.data || response?.data?.message || response?.data;
      
      if (newMsg && newMsg._id) {
        console.log('New message sent successfully:', newMsg);
        // Add to processed IDs immediately
        processedMessageIds.current.add(newMsg._id);
        
        setMessages(prev => {
          if (prev.find(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Refresh conversations after sending to update last message
      setTimeout(() => {
        fetchConversations();
      }, 500);

      return response?.data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid message data';
      } else if (error.response?.status === 404) {
        errorMessage = 'Recipient not found';
      } else if (error.message.includes('Invalid recipient')) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messagesAPI.markAsRead(conversationId);
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.user._id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await messagesAPI.delete(messageId);
      
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Update conversations list
      await fetchConversations();
      
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  // Enhanced image download function
  const downloadImage = async (messageId, attachment, attachmentIndex = 0) => {
    try {
      console.log('Downloading image:', { messageId, attachment, attachmentIndex });

      // Method 1: Try to get signed URL first (most reliable)
      try {
        const response = await messagesAPI.getImageDownloadUrl(messageId, attachmentIndex);
        const signedUrl = response.data.downloadUrl;
        
        console.log('Using signed URL for download:', signedUrl);
        
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = attachment.filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Signed URL download initiated');
        return;
      } catch (signedError) {
        console.log('Signed URL failed, trying direct download:', signedError);
      }

      // Method 2: Try server-side download with auth token
      try {
        const downloadUrl = `http://localhost:3000/api/messages/${messageId}/download/${attachmentIndex}?token=${token}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = attachment.filename;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Server download with token initiated');
        return;
      } catch (serverError) {
        console.log('Server download failed, trying direct Cloudinary:', serverError);
      }

      // Method 3: Fallback to direct Cloudinary URL
      const directWindow = window.open(attachment.url, '_blank');
      if (!directWindow) {
        throw new Error('All download methods failed and popup was blocked');
      }
      
      console.log('Direct Cloudinary download initiated');

    } catch (error) {
      console.error('All download methods failed:', error);
      alert('Failed to download image. Please try again or contact support.');
    }
  };

  // Enhanced image preview function
  const previewImage = async (messageId, attachment, attachmentIndex = 0) => {
    try {
      console.log('Previewing image:', { messageId, attachment, attachmentIndex });

      // Try to get preview URL from server first
      try {
        const response = await messagesAPI.previewImage(messageId, attachmentIndex);
        const previewUrl = response.data.previewUrl;
        
        const previewWindow = window.open(previewUrl, '_blank');
        if (!previewWindow) {
          throw new Error('Popup blocked');
        }
        
        console.log('Server preview initiated');
        return;
      } catch (previewError) {
        console.log('Server preview failed, using direct URL:', previewError);
      }

      // Fallback: Direct URL
      const fallbackWindow = window.open(attachment.url, '_blank');
      if (!fallbackWindow) {
        alert('Failed to preview image. Please allow popups for this site.');
      } else {
        console.log('Direct preview initiated');
      }
      
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Failed to preview image. Please try again.');
    }
  };

  // Simple download function for the Messages component
  const handleDownload = async (messageId, attachment, attachmentIndex = 0) => {
    return downloadImage(messageId, attachment, attachmentIndex);
  };

  // Simple preview function for the Messages component
  const handlePreview = async (messageId, attachment, attachmentIndex = 0) => {
    return previewImage(messageId, attachment, attachmentIndex);
  };

  // Fixed socket listener - prevent duplicates and handle image messages
  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (message) => {
      try {
        console.log('Socket new_message received:', message);
        
        if (!message || !message._id) return;
        
        // Skip if we've already processed this message
        if (processedMessageIds.current.has(message._id)) {
          console.log('Message already processed, skipping:', message._id);
          return;
        }
        
        // Add to processed IDs
        processedMessageIds.current.add(message._id);
        
        // Only add to messages if it belongs to active conversation
        const isForActiveConversation = activeConversation && 
          (message.sender?._id === activeConversation || message.receiver?._id === activeConversation);
        
        if (isForActiveConversation) {
          setMessages(prev => {
            // Double check for duplicates
            if (prev.some(m => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
        
        // Always refresh conversations for unread counts and last message
        fetchConversations();
        
      } catch (err) {
        console.error('onNewMessage handler error:', err);
      }
    };

    socket.on('new_message', onNewMessage);
    
    return () => {
      socket.off('new_message', onNewMessage);
    };
  }, [socket, user, activeConversation]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      processedMessageIds.current.clear(); // Reset on user change
    }
  }, [user]);

  const value = {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    loading,
    fetchConversations,
    fetchConversation,
    sendMessage,
    markAsRead,
    setActiveConversation,
    setMessages,
    deleteMessage,
    downloadImage: handleDownload,
    previewImage: handlePreview
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};