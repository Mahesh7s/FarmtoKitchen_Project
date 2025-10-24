import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMessages } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { 
  Send, 
  Image, 
  Paperclip, 
  Search, 
  Users,
  X,
  Plus,
  Store,
  User,
  MessageCircle,
  AlertCircle,
  Trash2,
  Download,
  Eye,
  Info,
  Menu,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile Header Component
const MobileHeader = ({ 
  onBack, 
  onMenu, 
  user, 
  title, 
  subtitle,
  showBack = true,
  showMenu = false 
}) => (
  <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div className="flex items-center space-x-2">
      {showBack && (
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      {user && (
        <UserAvatar user={user} size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          {title || 'Messages'}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {showMenu && (
      <button
        onClick={onMenu}
        className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
    )}
  </div>
);

// User Avatar Component
const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  if (!user) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className} bg-gray-300 rounded-full flex items-center justify-center`}>
        <User className="h-1/2 w-1/2 text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover bg-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`w-full h-full rounded-full bg-gradient-to-br ${
          user.role === 'farmer' 
            ? 'from-green-400 to-green-600' 
            : 'from-blue-400 to-blue-600'
        } flex items-center justify-center text-white font-semibold ${user.avatar ? 'hidden' : 'flex'}`}
      >
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </div>
      {user.role === 'farmer' && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
          <Store className="h-2 w-2 text-white" />
        </div>
      )}
      {user.role === 'consumer' && (
        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
          <User className="h-2 w-2 text-white" />
        </div>
      )}
    </div>
  );
};

// Message Input Component
const MessageInput = ({ 
  messageInput, 
  setMessageInput, 
  attachments, 
  removeAttachment, 
  handleFileSelect, 
  handleSendMessage, 
  isSending,
  fileInputRef 
}) => (
  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    {/* Attachments Preview */}
    {attachments.length > 0 && (
      <div className="mb-2 flex flex-wrap gap-1">
        {attachments.map((file, index) => (
          <div key={index} className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1 text-xs">
            <Image className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60px]">
              {file.name}
            </span>
            <button
              onClick={() => removeAttachment(index)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )}

    <form onSubmit={handleSendMessage} className="flex space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
        title="Attach images"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isSending}
        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={(!messageInput.trim() && attachments.length === 0) || isSending}
        className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        title="Send message"
      >
        {isSending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  </div>
);

// Conversation List Component
const ConversationList = ({ 
  conversations, 
  activeConversation, 
  searchTerm, 
  setSearchTerm, 
  setShowNewConversation,
  handleConversationSelect,
  showNewConversation,
  user 
}) => (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
        <button
          onClick={() => {
            setShowNewConversation(true);
          }}
          className="p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0"
          title="Start new conversation"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No conversations yet</p>
          <button
            onClick={() => setShowNewConversation(true)}
            className="mt-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs"
          >
            Start Your First Conversation
          </button>
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.user._id}
            onClick={() => handleConversationSelect(conversation)}
            className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              activeConversation === conversation.user._id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserAvatar user={conversation.user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {conversation.user?.name || 'Unknown User'}
                    </h3>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {conversation.lastMessage?.createdAt 
                    ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''
                  }
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const Messages = () => {
  const { 
    conversations, 
    activeConversation, 
    messages, 
    loading, 
    fetchConversation, 
    sendMessage,
    setActiveConversation,
    fetchConversations,
    setMessages,
    deleteMessage,
    downloadImage,
    previewImage
  } = useMessages();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationSearch, setNewConversationSearch] = useState('');
  const [newConversationLoading, setNewConversationLoading] = useState(false);
  const [newConversationError, setNewConversationError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile || !activeConversation);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeConversation]);

  // Show error modal
  const showError = (message) => {
    setErrorModalMessage(message);
    setShowErrorModal(true);
  };

  // Enhanced message grouping
  const groupMessages = useCallback(() => {
    if (!messages || messages.length === 0) return [];

    const sorted = [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const groups = [];
    let currentGroup = null;

    sorted.forEach((message, index) => {
      const isSender = message.sender?._id === user?._id || 
                      (message.sender && message.sender._id === user?._id) ||
                      (typeof message.sender === 'string' && message.sender === user?._id);

      if (!currentGroup) {
        currentGroup = {
          id: `group-${message._id}-${index}`,
          senderId: message.sender?._id || message.sender,
          sender: message.sender,
          isSender: isSender,
          messages: [message],
          date: new Date(message.createdAt).toDateString()
        };
        groups.push(currentGroup);
        return;
      }

      const timeDiff = new Date(message.createdAt) - new Date(currentGroup.messages[currentGroup.messages.length - 1].createdAt);
      const minutesDiff = timeDiff / (1000 * 60);
      
      const shouldStartNewGroup = 
        currentGroup.senderId !== (message.sender?._id || message.sender) ||
        minutesDiff > 5 ||
        currentGroup.date !== new Date(message.createdAt).toDateString();

      if (shouldStartNewGroup) {
        currentGroup = {
          id: `group-${message._id}-${index}`,
          senderId: message.sender?._id || message.sender,
          sender: message.sender,
          isSender: isSender,
          messages: [message],
          date: new Date(message.createdAt).toDateString()
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  }, [messages, user?._id]);

  const messageGroups = groupMessages();

  // Enhanced scroll effect
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && messagesContainerRef.current) {
        const scrollHeight = messagesContainerRef.current.scrollHeight;
        const clientHeight = messagesContainerRef.current.clientHeight;
        
        const isNearBottom = scrollHeight - clientHeight - messagesContainerRef.current.scrollTop < 100;
        
        if (isNearBottom || initialLoad) {
          messagesContainerRef.current.scrollTop = scrollHeight;
        }
      }
    };

    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, activeConversation, messageGroups, initialLoad]);

  // Reset initial load when conversation changes
  useEffect(() => {
    if (activeConversation) {
      setInitialLoad(true);
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeConversation]);

  // Handle mobile back button
  const handleMobileBack = () => {
    setActiveConversation(null);
    setShowSidebar(true);
  };

  // Handle file select
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      const allowedTypes = [
        'image/jpeg', 
        'image/jpg',
        'image/png', 
        'image/gif', 
        'image/webp'
      ];
      
      if (file.size > maxSize) {
        showError('File size too large. Maximum 10MB allowed.');
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        showError('Only images (JPEG, PNG, GIF, WebP) are allowed.');
        return false;
      }
      
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      setDeletingMessageId(messageToDelete);
      await deleteMessage(messageToDelete);
      
      if (activeConversation) {
        await fetchConversation(activeConversation);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Failed to delete message. Please try again.');
    } finally {
      setDeletingMessageId(null);
      setMessageToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Enhanced send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!activeConversation || activeConversation === 'undefined') {
      showError('Please select a conversation first');
      return;
    }

    if ((!messageInput.trim() && attachments.length === 0) || isSending) return;

    try {
      setIsSending(true);
      
      const messageContent = messageInput.trim();
      const currentAttachments = [...attachments];
      
      setMessageInput('');
      setAttachments([]);
      
      await sendMessage({
        receiverId: activeConversation,
        content: messageContent
      }, currentAttachments);
      
      setTimeout(() => {
        fetchConversations();
      }, 500);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      showError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Fetch available users
  const fetchAvailableUsers = async (searchQuery = '') => {
    try {
      setNewConversationLoading(true);
      setNewConversationError('');
      
      let response;
      
      if (user.role === 'consumer') {
        try {
          response = await usersAPI.getFarmers({ search: searchQuery });
        } catch (error) {
          response = await usersAPI.getUsers({ 
            role: 'farmer', 
            search: searchQuery 
          });
        }
      } else if (user.role === 'farmer') {
        try {
          response = await usersAPI.getConsumers({ search: searchQuery });
        } catch (error) {
          response = await usersAPI.getUsers({ 
            role: 'consumer', 
            search: searchQuery 
          });
        }
      } else {
        throw new Error('Invalid user role');
      }
      
      if (response.data && Array.isArray(response.data)) {
        setAvailableUsers(response.data);
      } else if (response.data && response.data.users) {
        setAvailableUsers(response.data.users);
      } else if (response.data && Array.isArray(response.data.farmers)) {
        setAvailableUsers(response.data.farmers);
      } else if (response.data && Array.isArray(response.data.consumers)) {
        setAvailableUsers(response.data.consumers);
      } else {
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      setNewConversationError('Failed to load users. Please try again.');
      setAvailableUsers([]);
    } finally {
      setNewConversationLoading(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    try {
      setInitialLoad(true);
      setActiveConversation(conversation.user._id);
      await fetchConversation(conversation.user._id);
      setShowNewConversation(false);
      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
      showError('Failed to load conversation. Please try again.');
    }
  };

  const handleStartNewConversation = async (selectedUser) => {
    try {
      setInitialLoad(true);
      setActiveConversation(selectedUser._id);
      setShowNewConversation(false);
      setNewConversationSearch('');
      setMessages([]);
      await fetchConversation(selectedUser._id);
      if (isMobile) {
        setShowSidebar(false);
      }
      setTimeout(() => {
        fetchConversations();
      }, 100);
    } catch (error) {
      console.error('Error starting new conversation:', error);
      showError('Failed to start conversation. Please try again.');
    }
  };

  // Handle image preview
  const handlePreviewImage = async (messageId, attachment, attachmentIndex = 0) => {
    try {
      setSelectedImage({
        url: attachment.url,
        filename: attachment.filename,
        messageId,
        attachmentIndex
      });
      setShowImageModal(true);
    } catch (error) {
      console.error('Preview failed:', error);
      showError('Failed to preview image. Please try again.');
    }
  };

  // Handle image download
  const handleDownloadImage = async (messageId, attachment, attachmentIndex = 0) => {
    try {
      await downloadImage(messageId, attachment, attachmentIndex);
    } catch (error) {
      console.error('Download failed:', error);
      showError('Failed to download image. Please try again.');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.user?.farmName && conv.user.farmName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCurrentConversationUser = () => {
    if (showNewConversation) return null;
    const conversation = conversations.find(conv => conv.user._id === activeConversation);
    return conversation?.user || null;
  };

  const filteredAvailableUsers = availableUsers.filter(availableUser =>
    availableUser.name?.toLowerCase().includes(newConversationSearch.toLowerCase()) ||
    (availableUser.farmName && availableUser.farmName.toLowerCase().includes(newConversationSearch.toLowerCase())) ||
    (availableUser.email && availableUser.email.toLowerCase().includes(newConversationSearch.toLowerCase()))
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Load available users when new conversation modal opens
  useEffect(() => {
    if (showNewConversation) {
      fetchAvailableUsers(newConversationSearch);
    }
  }, [showNewConversation, newConversationSearch]);

  // Get conversation user info safely
  const currentConversationUser = getCurrentConversationUser();
  const conversationTitle = currentConversationUser?.name || 'Messages';
  const conversationSubtitle = currentConversationUser ? 
    `${currentConversationUser?.role || 'User'}${currentConversationUser?.farmName ? ` • ${currentConversationUser.farmName}` : ''}` : 
    null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      {/* Reduced height container for better mobile experience */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden h-[85vh] sm:h-[75vh] md:h-[70vh]">
        <div className="flex h-full">
          {/* Sidebar for desktop and mobile when active */}
          {(showSidebar || !isMobile) && (
            <div className={`${
              isMobile ? 'w-full absolute inset-0 z-40 bg-white dark:bg-gray-800' : 'w-full md:w-1/3 lg:w-1/3'
            } border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
              {isMobile && (
                <MobileHeader
                  title="Messages"
                  showBack={false}
                  showMenu={true}
                  onMenu={() => setShowSidebar(false)}
                />
              )}
              
              {showNewConversation ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        New Conversation
                      </h3>
                      <button
                        onClick={() => setShowNewConversation(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <input
                        type="text"
                        placeholder={`Search ${user.role === 'consumer' ? 'farmers' : 'customers'}...`}
                        value={newConversationSearch}
                        onChange={(e) => {
                          setNewConversationSearch(e.target.value);
                          fetchAvailableUsers(e.target.value);
                        }}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {newConversationError && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-1 text-red-700 dark:text-red-300 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          <span>{newConversationError}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {newConversationLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                      </div>
                    ) : filteredAvailableUsers.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No {user.role === 'consumer' ? 'farmers' : 'customers'} found</p>
                        <p className="text-xs mt-1">
                          {newConversationSearch ? 'Try a different search term' : `No ${user.role === 'consumer' ? 'farmers' : 'customers'} available`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAvailableUsers.map((availableUser) => (
                          <div
                            key={availableUser._id}
                            onClick={() => handleStartNewConversation(availableUser)}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <UserAvatar user={availableUser} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {availableUser.name || 'Unknown User'}
                                  </h4>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                  {availableUser.role === 'farmer' 
                                    ? availableUser.farmName || 'Farmer'
                                    : 'Customer'
                                  }
                                </p>
                              </div>
                              <MessageCircle className="h-4 w-4 text-primary-500 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <ConversationList
                  conversations={filteredConversations}
                  activeConversation={activeConversation}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setShowNewConversation={setShowNewConversation}
                  handleConversationSelect={handleConversationSelect}
                  showNewConversation={showNewConversation}
                  user={user}
                />
              )}
            </div>
          )}

          {/* Chat Area - Reduced height for better mobile experience */}
          {activeConversation && (!showSidebar || !isMobile) ? (
            <div className={`flex-1 flex flex-col ${
              isMobile ? 'w-full' : 'w-full md:w-2/3 lg:w-2/3'
            }`}>
              {/* Chat Header */}
              {isMobile ? (
                <MobileHeader
                  onBack={handleMobileBack}
                  user={currentConversationUser}
                  title={conversationTitle}
                  subtitle={conversationSubtitle}
                  showBack={true}
                  showMenu={true}
                />
              ) : (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <UserAvatar user={currentConversationUser} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {conversationTitle}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                        {conversationSubtitle}
                      </p>
                    </div>
                  </div>
                  {!isMobile && (
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Video className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Area - Reduced height */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900"
                style={{ maxHeight: isMobile ? 'calc(85vh - 140px)' : 'calc(75vh - 140px)' }}
              >
                {(loading || initialLoad) && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                ) : messageGroups.length === 0 ? (
                  <div className="flex justify-center items-center h-20 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No messages yet</p>
                      <p className="text-xs">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messageGroups.map((group, groupIndex) => {
                      const showDateSeparator = groupIndex === 0 || 
                        group.date !== messageGroups[groupIndex - 1].date;
                      
                      return (
                        <div key={group.id}>
                          {/* Date Separator */}
                          {showDateSeparator && (
                            <div className="flex justify-center my-2">
                              <div className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                  {formatDate(group.date)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Message Group */}
                          <div className={`flex ${group.isSender ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] ${group.isSender ? 'flex-row-reverse' : 'flex-row'} items-end gap-1`}>
                              {/* Avatar */}
                              {!group.isSender && (
                                <div className="flex-shrink-0">
                                  <UserAvatar 
                                    user={group.sender} 
                                    size="xs"
                                  />
                                </div>
                              )}
                              
                              {/* Messages in this group */}
                              <div className={`flex flex-col ${group.isSender ? 'items-end' : 'items-start'} space-y-1`}>
                                {group.messages.map((message, messageIndex) => {
                                  const isSender = message.sender?._id === user._id;
                                  const isLastMessage = messageIndex === group.messages.length - 1;
                                  
                                  return (
                                    <div 
                                      key={message._id} 
                                      className={`relative group ${isSender ? 'pr-4' : 'pl-4'}`}
                                    >
                                      {/* Delete button for sender's messages */}
                                      {isSender && (
                                        <button
                                          onClick={() => handleDeleteMessage(message._id)}
                                          disabled={deletingMessageId === message._id}
                                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                                          title="Delete message"
                                        >
                                          {deletingMessageId === message._id ? (
                                            <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                                          ) : (
                                            <Trash2 className="h-2 w-2" />
                                          )}
                                        </button>
                                      )}
                                      
                                      {/* Image Attachments */}
                                      {message.attachments && message.attachments.length > 0 && (
                                        <div className="mb-1 space-y-1">
                                          {message.attachments.map((attachment, index) => (
                                            <div key={`${message._id}-attachment-${index}`} className="relative">
                                              {attachment.fileType === 'image' && (
                                                <div className="relative">
                                                  <img
                                                    src={attachment.url}
                                                    alt={attachment.filename}
                                                    className="max-w-full h-auto rounded-lg max-h-24 object-cover border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => handlePreviewImage(message._id, attachment, index)}
                                                  />
                                                  <div className="absolute top-1 right-1 flex space-x-0.5 opacity-0 hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePreviewImage(message._id, attachment, index);
                                                      }}
                                                      className="p-0.5 bg-black bg-opacity-50 text-white rounded text-xs"
                                                      title="Preview"
                                                    >
                                                      <Eye className="h-2 w-2" />
                                                    </button>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadImage(message._id, attachment, index);
                                                      }}
                                                      className="p-0.5 bg-black bg-opacity-50 text-white rounded text-xs"
                                                      title="Download"
                                                    >
                                                      <Download className="h-2 w-2" />
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {/* Text Message */}
                                      {message.content && (
                                        <div
                                          className={`px-3 py-1.5 rounded-xl text-xs ${
                                            group.isSender
                                              ? 'bg-primary-500 text-white rounded-br-md'
                                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-600'
                                          } ${!isLastMessage ? 'mb-0.5' : ''}`}
                                        >
                                          <p className="break-words whitespace-pre-wrap text-xs">{message.content}</p>
                                        </div>
                                      )}
                                      
                                      {/* Timestamp */}
                                      {isLastMessage && (
                                        <p className={`text-xs mt-0.5 px-1 ${
                                          group.isSender ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                          {new Date(message.createdAt).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Avatar for sender's messages */}
                              {group.isSender && (
                                <div className="flex-shrink-0">
                                  <UserAvatar 
                                    user={group.sender} 
                                    size="xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <MessageInput
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                attachments={attachments}
                removeAttachment={removeAttachment}
                handleFileSelect={handleFileSelect}
                handleSendMessage={handleSendMessage}
                isSending={isSending}
                fileInputRef={fileInputRef}
              />
            </div>
          ) : (
            /* Empty State - No conversation selected */
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4">
              <div className="text-center">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <h3 className="text-sm font-medium mb-1">
                  {showNewConversation ? 'Select someone to message' : 'Select a conversation'}
                </h3>
                <p className="text-xs mb-2">
                  {showNewConversation 
                    ? `Choose a ${user.role === 'consumer' ? 'farmer' : 'customer'} to start messaging`
                    : 'Choose a conversation from the sidebar to start messaging'
                  }
                </p>
                {!showNewConversation && !isMobile && (
                  <button
                    onClick={() => {
                      setShowNewConversation(true);
                      setNewConversationSearch('');
                      fetchAvailableUsers();
                    }}
                    className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs"
                  >
                    Start New Conversation
                  </button>
                )}
                {isMobile && !showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs"
                  >
                    Show Conversations
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same */}
      {/* ... (modal code remains unchanged) ... */}
    </div>
  );
};

export default Messages;