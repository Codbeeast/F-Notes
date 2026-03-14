import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Mic, ChevronDown, RefreshCw, Zap } from 'lucide-react';

// Import PromptsDropdown Component
import PromptsDropdown from './PromptsDropdown';

const ChatInput = ({
  inputValue,
  setInputValue,
  onSendMessage,
  inputRef,
  showPrompts,
  setShowPrompts,
  onSelectPrompt,
  onSync,
  isSyncing,
  isReady,
  isSignedIn,
  userId,
  tradesLoading = false, // New prop to track trade data loading
  chatUsage = { promptsRemaining: 60, monthlyLimit: 60, limitReached: false } // Chat limit prop
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  const handleInputFocus = () => {
    setInputFocused(true);
    // Only show prompts if synced and ready
    if (isReady && isSignedIn) {
      setShowPrompts(true);
    }
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    // Don't close prompts on blur - let the PromptsDropdown handle its own closing
  };

  const handleSendMessage = () => {
    // Enforce sync requirement - don't send if not ready
    if (!inputValue.trim() || !isReady || !isSignedIn) return;

    // Store the message before clearing (CRITICAL FIX)
    const messageToSend = inputValue.trim();

    // Call onSendMessage FIRST with the message
    onSendMessage(messageToSend);

    // THEN clear the input and UI state
    setInputValue('');
    setShowPrompts(false);
    setInputFocused(false);

    // Remove focus from input after sending
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Updated: Auto-send prompt instead of just selecting
  const handleSelectPrompt = (prompt) => {
    console.log('ChatInput: Prompt selected:', prompt);

    // Only allow prompt selection if synced
    if (!isReady || !isSignedIn) return;

    // Set the input value first
    setInputValue(prompt);
    setShowPrompts(false); // Close dropdown when prompt is selected

    // Auto-send the prompt if ready
    if (isReady && isSignedIn && prompt.trim()) {
      // Small delay to ensure UI updates
      setTimeout(() => {
        onSendMessage(prompt);
        setInputValue(''); // Clear after sending
        setInputFocused(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }, 100);
    }
  };

  const handleSyncClick = () => {
    if (onSync && !isSyncing && !tradesLoading && isSignedIn && userId) {
      onSync();
    }
  };

  const getSyncButtonContent = () => {
    if (isSyncing) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center space-x-2"
        >
          <RefreshCw size={18} className="text-yellow-400" />
        </motion.div>
      );
    }

    if (tradesLoading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center space-x-2"
        >
          <RefreshCw size={18} className="text-orange-400" />
        </motion.div>
      );
    }

    if (isReady) {
      return (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap size={18} className="text-green-400" />
        </motion.div>
      );
    }

    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <RefreshCw size={18} className="text-blue-400" />
      </motion.div>
    );
  };

  const getSyncTooltip = () => {
    if (isSyncing) return "Syncing with your trade data...";
    if (tradesLoading) return "Loading trade data...";
    if (isReady) return "Synced! Ready to chat";
    if (!isSignedIn) return "Please sign in first";
    return "Click to sync your trade data";
  };

  const isSyncButtonDisabled = isSyncing || tradesLoading || !isSignedIn || !userId;

  // Get usage indicator color based on remaining prompts
  const getUsageColor = () => {
    const remaining = chatUsage.promptsRemaining;
    if (remaining <= 5) return 'text-red-400';
    if (remaining <= 15) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <motion.div
      className="p-3 sm:p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 relative z-10 m-2 sm:m-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center gap-2 sm:gap-5 max-w-5xl mx-auto relative">


        <div className="flex-1 relative">
          {/* Prompts Dropdown - Only show when ready */}
          {isReady && (
            <PromptsDropdown
              isOpen={showPrompts}
              onClose={() => setShowPrompts(false)}
              onSelectPrompt={handleSelectPrompt}
              inputRef={inputRef}
            />
          )}

          <motion.div
            className={`absolute inset-0 rounded-3xl transition-all duration-500 ${inputFocused && isReady
              ? 'bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 shadow-lg shadow-blue-500/20'
              : !isReady
                ? 'bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10'
                : 'bg-black/10'
              }`}
            animate={inputFocused && isReady ? {
              boxShadow: [
                '0 0 30px rgba(59, 130, 246, 0.3)',
                '0 0 40px rgba(59, 130, 246, 0.4)',
                '0 0 30px rgba(59, 130, 246, 0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={
              !isSignedIn
                ? "Please sign in to start chatting..."
                : isSyncing
                  ? "Syncing your trade data..."
                  : tradesLoading
                    ? "Loading trade data..."
                    : !isReady
                      ? "Click the sync button to start chatting..."
                      : "Ask anything about your trading..."
            }
            disabled={!isSignedIn || isSyncing || tradesLoading || !isReady}
            className={`
              w-full px-4 py-3 sm:px-8 sm:py-5
              bg-white/5 backdrop-blur-md
              border border-white/20
              rounded-3xl
              focus:outline-none
              focus:ring-4 focus:ring-blue-500/30
              focus:border-blue-400
              placeholder-gray-300 text-white
              shadow-lg shadow-blue-500/10
              transition-all duration-500 ease-in-out
              hover:bg-white/10 hover:border-blue-400
              relative z-10
              text-sm sm:text-base
              ${!isSignedIn || !isReady || isSyncing || tradesLoading ? 'cursor-not-allowed opacity-70' : ''}
            `}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          />

          {/* Sync Button - Replaces Mic when not ready or not signed in */}
          {!isSignedIn || !isReady ? (
            <motion.button
              onClick={handleSyncClick}
              disabled={isSyncButtonDisabled}
              className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 transition-all duration-300 rounded-xl z-20 ${isSyncButtonDisabled
                ? 'cursor-not-allowed bg-gray-500/20 opacity-50'
                : 'cursor-pointer bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-400/70'
                }`}
              whileHover={!isSyncButtonDisabled ? {
                scale: 1.15,
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
                borderColor: 'rgba(96, 165, 250, 0.8)'
              } : {}}
              whileTap={!isSyncButtonDisabled ? { scale: 0.9 } : {}}
              title={getSyncTooltip()}
            >
              {getSyncButtonContent()}
            </motion.button>
          ) : (
            <motion.button
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 text-gray-400 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10"
              whileHover={{
                scale: 1.1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Mic size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}

          {/* Dropdown Toggle Button - Only show when ready */}
          {isReady && (
            <motion.button
              onClick={() => setShowPrompts(!showPrompts)}
              className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10"
              whileHover={{
                scale: 1.1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: showPrompts ? 180 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <ChevronDown size={18} className="sm:w-5 sm:h-5" />
              </motion.div>
            </motion.button>
          )}
        </div>

        <motion.button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !isReady || !isSignedIn}
          className="p-3 sm:p-4 
          bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 
          hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 
          disabled:from-gray-700 disabled:via-gray-600 disabled:to-gray-700 
          disabled:cursor-not-allowed 
          rounded-2xl transition-all duration-500 
          shadow-xl shadow-blue-500/30 hover:shadow-blue-600/40 
          disabled:shadow-none 
          relative overflow-hidden group"
          whileHover={inputValue.trim() && isReady && isSignedIn ? {
            scale: 1.05,
            boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)"
          } : {}}
          whileTap={inputValue.trim() && isReady && isSignedIn ? { scale: 0.95 } : {}}
        >
          {inputValue.trim() && isReady && isSignedIn && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          )}
          <Send size={20} className="sm:w-6 sm:h-6 relative z-10 text-white" />
        </motion.button>
      </div>

      <motion.p
        className="text-center text-xs text-gray-400 mt-3 sm:mt-5 tracking-wide px-4"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {!isSignedIn
          ? "Sign in to access your trading data and start chatting"
          : isSyncing
            ? "Syncing with your trade data..."
            : tradesLoading
              ? "Loading your trade data..."
              : !isReady
                ? "Sync your trade data to start chatting with AI"
                : "FoNo AI can make mistakes. Verify important trading information."
        }
      </motion.p>

      {/* Chat Usage Indicator */}
      {isReady && isSignedIn && !chatUsage.loading && (
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className={`text-xs font-semibold ${getUsageColor()}`}>
            {chatUsage.limitReached
              ? `Limit reached - Resets on 1st of next month`
              : `${chatUsage.promptsRemaining}/${chatUsage.monthlyLimit} prompts remaining this month`
            }
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatInput;
