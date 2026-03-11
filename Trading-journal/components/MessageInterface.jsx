import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageInterface = ({
  messages,
  isTyping,
  messagesEndRef,
  currentChatId,
  userId,
  onMessagesLoaded,
  isReady,
  isSyncing,
  onSync,
  syncError,
  isSignedIn,
  chatLoadingStates = {},
  tradesLoading = false
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentChatId && userId && !currentChatId.startsWith('new_') && isReady) {
      loadChatMessages();
    } else {
      if (onMessagesLoaded) {
        onMessagesLoaded([], null);
      }
    }
  }, [currentChatId, userId, isReady]);

  const isCurrentChatLoading = currentChatId ? chatLoadingStates[currentChatId] || false : false;

  const loadChatMessages = async () => {
    if (!currentChatId || !userId) return;

    setError(null);

    try {
      const response = await fetch(`/api/chat/${currentChatId}?userId=${encodeURIComponent(userId)}&limit=100`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chat) {
          const formattedMessages = data.chat.messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp
          }));

          if (onMessagesLoaded) {
            onMessagesLoaded(formattedMessages, data.chat.sessionId);
          }
        } else {
          setError(data.error || 'Failed to load chat messages');
        }
      } else if (response.status === 404) {
        if (onMessagesLoaded) {
          onMessagesLoaded([], null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch chat messages');
      }
    } catch (err) {
      console.error('Error loading chat messages:', err);
      setError('Network error loading messages');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        staggerChildren: 0.2
      }
    }
  };

  const shouldShowSyncUI = isSignedIn && !isReady;
  const shouldShowWelcome = !error && messages.length === 0 && isSignedIn && isReady && (!currentChatId || currentChatId === null || currentChatId.startsWith('new_'));
  const shouldShowUnauthenticated = !error && !isSignedIn;

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-3 sm:p-8 space-y-4 sm:space-y-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10">
      <AnimatePresence mode="wait">

        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            className="text-center py-8 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-red-400 text-center">
              <p className="mb-2">Failed to load chat messages</p>
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={loadChatMessages}
                className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Sync UI */}
        {shouldShowSyncUI && (
          <motion.div
            key="sync"
            className="flex-1 flex items-center justify-center min-h-[45vh] py-4"
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="text-center max-w-md mx-auto px-4">
              <motion.div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl shadow-lg border border-white/10 mx-auto mb-6 sm:mb-8 relative overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(255, 255, 255, 0.1)',
                    '0 0 40px rgba(147, 51, 234, 0.2)',
                    '0 0 30px rgba(255, 255, 255, 0.1)'
                  ],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <img
                  src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
                  alt="Forenotes Logo"
                  className="w-full h-full object-cover rounded-3xl"
                />
              </motion.div>

              <motion.h3
                className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-tight mb-4 sm:mb-6 px-4"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700
                }}
              >
                Sync Your Trade Data
              </motion.h3>

              <motion.div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <Sparkles size={16} className="sm:w-5 sm:h-5 text-blue-400" />
                <motion.p
                  className="text-gray-400 max-w-xs sm:max-w-lg mx-auto leading-relaxed text-sm sm:text-base px-4"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  Connect your trade data to start getting AI-powered insights and analysis.
                </motion.p>
                <Zap size={16} className="sm:w-5 sm:h-5 text-blue-400" />
              </motion.div>

              <motion.button
                onClick={onSync}
                disabled={isSyncing || tradesLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSyncing ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Syncing...
                  </div>
                ) : tradesLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading Trade Data...
                  </div>
                ) : (
                  'Sync Trade Data'
                )}
              </motion.button>

              {syncError && (
                <motion.p
                  className="text-red-400 text-sm mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {syncError}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Unauthenticated State */}
        {shouldShowUnauthenticated && !shouldShowSyncUI && (
          <motion.div
            key="unauthenticated"
            className="text-center py-8 sm:py-16"
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl shadow-lg border border-white/10 mx-auto mb-6 sm:mb-8 relative overflow-hidden"
              animate={{
                boxShadow: [
                  '0 0 30px rgba(255, 255, 255, 0.1)',
                  '0 0 40px rgba(147, 51, 234, 0.2)',
                  '0 0 30px rgba(255, 255, 255, 0.1)'
                ],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
                alt="Forenotes Logo"
                className="w-full h-full object-cover rounded-3xl"
              />
            </motion.div>

            <motion.h3
              className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-tight mb-4 sm:mb-6 px-4"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}
            >
              Welcome to FONO AI
            </motion.h3>

            <motion.div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-blue-400" />
              <motion.p
                className="text-gray-400 max-w-xs sm:max-w-lg mx-auto leading-relaxed text-sm sm:text-base px-4"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Please sign in to access your trading data and start chatting with your AI assistant.
              </motion.p>
              <Zap size={16} className="sm:w-5 sm:h-5 text-blue-400" />
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span>🔐 Secure Authentication Required</span>
            </motion.div>
          </motion.div>
        )}

        {/* Welcome Page */}
        {shouldShowWelcome && !shouldShowSyncUI && (
          <motion.div
            key="welcome"
            className="text-center py-8 sm:py-16"
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl shadow-lg border border-white/10 mx-auto mb-6 sm:mb-8 relative overflow-hidden"
              animate={{
                boxShadow: [
                  '0 0 30px rgba(255, 255, 255, 0.1)',
                  '0 0 40px rgba(147, 51, 234, 0.2)',
                  '0 0 30px rgba(255, 255, 255, 0.1)'
                ],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              whileHover={{
                scale: 1.1,
                rotate: 180,
                transition: { duration: 0.6, type: "spring" }
              }}
            >
              <img
                src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
                alt="Forenotes Logo"
                className="w-full h-full object-cover rounded-3xl"
              />
            </motion.div>

            <motion.h3
              className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-tight mb-4 sm:mb-6 px-4"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}
            >
              Welcome to FONO AI
            </motion.h3>

            <motion.div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Sparkles size={16} className="sm:w-5 sm:h-5 text-blue-400" />
              <motion.p
                className="text-gray-400 max-w-xs sm:max-w-lg mx-auto leading-relaxed text-sm sm:text-base px-4"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                Your intelligent trading companion for logging trades, analyzing performance, and gaining market insights.
              </motion.p>
              <Zap size={16} className="sm:w-5 sm:h-5 text-blue-400" />
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span>✨ AI-Powered Insights</span>
              <span className="hidden sm:inline">•</span>
              <span>📊 Real-time Analysis</span>
              <span className="hidden sm:inline">•</span>
              <span>🎯 Smart Recommendations</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Display with Markdown Support */}
      {!error && messages.length > 0 && isReady && !shouldShowSyncUI && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
              >
                <motion.div
                  className={`max-w-[90%] sm:max-w-lg lg:max-w-[550px] px-4 sm:px-6 py-3 sm:py-4 rounded-3xl relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-800/40 hover:shadow-blue-500/60 animate-gradient-move bg-[length:200%_200%]'
                      : 'bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 text-white hover:bg-white/15 hover:shadow-white/20'
                    }`}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: message.type === 'user'
                      ? '0 20px 40px rgba(59, 130, 246, 0.3)'
                      : '0 20px 40px rgba(255, 255, 255, 0.1)'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {message.type === 'user' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}

                  {/* Render Markdown for bot messages, plain text for user */}
                  <motion.div
                    className="text-sm leading-[2.5] relative z-10 markdown-content"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {message.type === 'bot' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-2 text-white" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm" {...props} />
                            ) : (
                              <code className="block bg-black/30 p-3 rounded-lg my-2 text-sm overflow-x-auto" {...props} />
                            ),
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-400 pl-4 italic my-3" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </motion.div>

                  <motion.p
                    className={`text-xs mt-2 sm:mt-3 relative z-10 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {message.timestamp}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <motion.div
              className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 px-4 sm:px-6 py-3 sm:py-4"
              animate={{
                boxShadow: [
                  '0 10px 30px rgba(255, 255, 255, 0.05)',
                  '0 15px 40px rgba(59, 130, 246, 0.2)',
                  '0 10px 30px rgba(255, 255, 255, 0.05)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex space-x-2 sm:space-x-3">
                <motion.div
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageInterface;