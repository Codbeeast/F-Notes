import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  X, 
  Trash2, 
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTrades } from '@/context/TradeContext';



const ChatbotSidebar = ({ 
  onNewChat, 
  onSelectChat, 
  currentChatId, 
  isOpen, 
  onClose,
  refreshTrigger = 0 // New prop to trigger refresh
}) => {
  const { userId, isSignedIn } = useTrades(); // Get userId from context
  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0
  });



  // Load chats on component mount and when sidebar opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (isSignedIn && userId) {
        loadChats();
      } else {
        // Clear previous data when not signed in
        setChats([]);
        setError(null);
        setPagination({ page: 1, hasNext: false, total: 0 });
        setInitialized(true);
      }
    }
  }, [isOpen, isSignedIn, userId]);



  // Refresh chats when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && isSignedIn && userId && isOpen) {
      loadChats();
    }
  }, [refreshTrigger, isSignedIn, userId, isOpen]);



  const loadChats = async (page = 1, append = false) => {
    if (!userId || !isSignedIn) {
      setError('User authentication required');
      setInitialized(true);
      return;
    }



    setLoading(true);
    if (!append) {
      setError(null);
    }
    
    try {
      // Use the correct API endpoint path - /api/chat instead of /api/chats
      const url = `/api/chats?userId=${encodeURIComponent(userId)}&limit=20&page=${page}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if this is actually the health check response
        if (data.status === 'healthy') {
          console.error('Received health check response instead of chat list - routing issue detected');
          setError('API routing error - receiving health check instead of chat list');
          setChats([]);
          setPagination({ page: 1, hasNext: false, total: 0 });
          return;
        }
        
        if (data.success) {
          const newChats = data.chats || [];
          
          if (append) {
            setChats(prev => [...prev, ...newChats]);
          } else {
            setChats(newChats);
          }
          
          setPagination({
            page: page,
            hasNext: data.pagination?.hasNext || false,
            total: data.pagination?.total || newChats.length
          });
          
          // Clear any previous errors
          setError(null);
          
        } else {
          // API returned success: false
          console.error('API returned success: false', data);
          setError(data.error || 'Failed to load chats');
          setChats([]);
          setPagination({ page: 1, hasNext: false, total: 0 });
        }
      } else {
        // HTTP error
        const errorData = await response.json().catch(() => ({}));
        console.error('HTTP Error:', response.status, errorData);
        setError(errorData.error || `HTTP ${response.status}: Failed to fetch chats`);
        setChats([]);
        setPagination({ page: 1, hasNext: false, total: 0 });
      }
    } catch (err) {
      console.error('Network error loading chats:', err);
      setError('Network error loading chats');
      setChats([]);
      setPagination({ page: 1, hasNext: false, total: 0 });
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };



  const loadMoreChats = () => {
    if (pagination.hasNext && !loading) {
      loadChats(pagination.page + 1, true);
    }
  };



  const handleNewChat = () => {
    onNewChat();
  };



  const handleSelectChat = (chatId) => {
    onSelectChat(chatId);
  };



  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent chat selection
    
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }



    if (!userId || !isSignedIn) {
      alert('Please sign in to delete chats');
      return;
    }



    try {
      const response = await fetch(`/api/chat/${chatId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });



      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove from local state
          setChats(prev => prev.filter(chat => chat.chatId !== chatId));
          
          // Update pagination total
          setPagination(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1)
          }));
          
          // If deleted chat was current, create new chat
          if (currentChatId === chatId) {
            handleNewChat();
          }
        } else {
          alert(result.error || 'Failed to delete chat');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Network error deleting chat');
    }
  };



  const handleRetry = () => {
    if (userId && isSignedIn) {
      setError(null);
      setInitialized(false);
      loadChats();
    }
  };



  // ✅ FIXED: Correct date formatting logic
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today.getTime() - chatDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));


    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };



  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };



  const truncateTitle = (title, maxLength = 45) => {
    if (!title) return 'Untitled Chat';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };



  // Determine what to show in the main content area
  const shouldShowError = error && initialized && !loading;
  const shouldShowEmptyState = !loading && !error && initialized && isSignedIn && chats.length === 0;
  const shouldShowUnauthenticated = !loading && !error && initialized && !isSignedIn;
  const shouldShowChats = !loading && !error && chats.length > 0;
  const shouldShowInitialLoading = loading && chats.length === 0 && !initialized;



  return (
    <motion.div
      className="h-full bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            className="text-lg sm:text-xl font-bold text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            FoNo
          </motion.h2>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="sm:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>



     



        {!isSignedIn && (
          <motion.div
            className="mb-3 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 text-orange-400 text-xs">
              <AlertCircle size={14} />
              <span>Sign in to view chats</span>
            </div>
          </motion.div>
        )}



        {/* New Chat Button - Always enabled for signed in users */}
        <motion.button
          onClick={handleNewChat}
          disabled={!isSignedIn}
          className={`w-full rounded-xl p-3 sm:p-4 font-medium transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group ${
            isSignedIn 
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white'
              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={isSignedIn ? { scale: 1.02, y: -2 } : {}}
          whileTap={isSignedIn ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Plus size={18} className={isSignedIn ? "group-hover:rotate-180 transition-transform duration-300" : ""} />
          New Chat
        </motion.button>
      </div>



      {/* Chat List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          {/* Initial Loading State */}
          {shouldShowInitialLoading && (
            <motion.div
              key="loading"
              className="p-4 text-center text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin" />
                Loading chats...
              </div>
            </motion.div>
          )}



          {/* Error State */}
          {shouldShowError && (
            <motion.div
              key="error"
              className="p-4 text-center text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-300 mb-3">{error}</p>
              {isSignedIn && (
                <button
                  onClick={handleRetry}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Try again
                </button>
              )}
              
              {/* Additional debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-2 bg-red-900/20 rounded text-xs text-left">
                  <p className="text-red-200 font-mono">Debug Info:</p>
                  <p className="text-red-300">URL: /api/chat?userId={userId}&limit=20&page=1</p>
                  <p className="text-red-300">Fixed: Now using /api/chat endpoint</p>
                </div>
              )}
            </motion.div>
          )}



          {/* Unauthenticated State */}
          {shouldShowUnauthenticated && (
            <motion.div
              key="unauthenticated"
              className="p-4 text-center text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sign in to view your chats</p>
              <p className="text-xs mt-1">Connect your account to access chat history</p>
            </motion.div>
          )}



          {/* Empty State (Signed in but no chats) */}
          {shouldShowEmptyState && (
            <motion.div
              key="empty"
              className="p-4 text-center text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start your first conversation!</p>
            </motion.div>
          )}



          {/* Chat List */}
          {shouldShowChats && (
            <motion.div
              key="chats"
              className="p-2 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {chats.map((chat, index) => (
                <motion.div
                  key={chat.chatId}
                  className={`group relative rounded-xl ml-1.5 p-3 cursor-pointer transition-all duration-200 border ${
                    currentChatId === chat.chatId
                      ? 'bg-blue-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                  onClick={() => handleSelectChat(chat.chatId)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Chat Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-medium text-sm leading-tight flex-1">
                      {truncateTitle(chat.title)}
                    </h3>
                    
                    {/* Delete Button - Visible on mobile, hover on desktop */}
                    <button
                      onClick={(e) => handleDeleteChat(chat.chatId, e)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      title="Delete chat"
                    >
                      <Trash2 size={14} className="text-red-400 hover:text-red-300" />
                    </button>
                  </div>



                  {/* Chat Metadata */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{chat.messageCount || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTime(chat.updatedAt)}</span>
                    </div>
                  </div>



                  {/* Date Badge */}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                      <Calendar size={10} />
                      {formatDate(chat.updatedAt)}
                    </span>
                  </div>



                  {/* Active Indicator */}
                  {currentChatId === chat.chatId && (
                    <motion.div
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}



              {/* Load More Button */}
              {pagination.hasNext && (
                <motion.button
                  onClick={loadMoreChats}
                  disabled={loading}
                  className="w-full p-3 mt-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Load More Chats
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <TrendingUp size={12} />
          <span>FoNo</span>
        </div>
      </div>
    </motion.div>
  );
};



export default ChatbotSidebar;
