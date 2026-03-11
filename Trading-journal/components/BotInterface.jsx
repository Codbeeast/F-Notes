import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageInterface from './MessageInterface';
import ChatInput from './ChatInput';
import PopNotification from './PopNotification';
import { useTrades } from '@/context/TradeContext';


const ChatbotInterface = ({
  currentChatId,
  currentChatIdRef,
  welcomeMessage = "Welcome to your Trade Journal Assistant! Click the sync button to connect your trade data and start chatting.",
  onChatUpdate,
  onNewChat,
  onSidebarRefresh
}) => {
  const {
    trades,
    allTrades,
    strategies,
    sessions,
    loading,
    error,
    isSignedIn,
    userId,
    currentStrategy // Get current strategy filter request
  } = useTrades();


  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [chatLoadingStates, setChatLoadingStates] = useState({}); // Track loading per chat
  const [pendingChatCreation, setPendingChatCreation] = useState(false);

  // Chat limit state
  const [chatUsage, setChatUsage] = useState({
    promptsUsed: 0,
    promptsRemaining: 60,
    monthlyLimit: 60,
    limitReached: false,
    loading: true
  });
  const [notification, setNotification] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdCounter = useRef(0);


  // Generate unique message IDs
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg_${Date.now()}_${messageIdCounter.current}`;
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  // Handle chat changes - but preserve sync state
  useEffect(() => {
    if (!currentChatId) {
      resetChat(true); // Always preserve sync state
    }
    // MessageInterface will handle loading the history only if synced
  }, [currentChatId]);


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);


  const handleMessagesLoaded = (loadedMessages, sessionIdFromChat) => {
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      // Just mark as ready if messages exist (means it was synced before)
      setIsReady(true);
      setSyncError(null);
    } else {
      resetChat(true);
    }
  };

  // Fetch chat usage on mount and when userId changes
  // Fetch chat usage on mount and when userId changes
  useEffect(() => {
    const fetchChatUsage = async () => {
      if (!userId) {
        setChatUsage(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch(`/api/chat/usage?userId=${userId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const { promptsRemaining, limitReached } = result.data;
            // Apply safety check here too
            const safeLimitReached = promptsRemaining > 0 ? false : limitReached;

            setChatUsage({
              promptsUsed: result.data.promptsUsed,
              promptsRemaining: promptsRemaining,
              monthlyLimit: result.data.monthlyLimit,
              limitReached: safeLimitReached,
              loading: false
            });
          }
        }
      } catch (error) {
        console.error('[Chat Usage] Failed to fetch:', error);
        setChatUsage(prev => ({ ...prev, loading: false }));
      }
    };

    fetchChatUsage();

    // Also set up an interval to keep it in sync periodically? 
    // Maybe unnecessary load, but ensures eventual consistency.
    const interval = setInterval(fetchChatUsage, 60000); // Check every minute
    return () => clearInterval(interval);

  }, [userId]);


  // Reset chat state - but preserve sync state unless explicitly resetting
  const resetChat = (preserveSync = true) => {
    setMessages([]);
    setInputValue('');
    setShowPrompts(false);
    messageIdCounter.current = 0;

    if (!preserveSync) {
      setIsSyncing(false);
      setSyncError(null);
      setIsReady(false);
    }

    setIsTyping(false);
  };


  // Handle new chat button - preserve sync state
  const handleNewChat = () => {
    resetChat(true); // Preserve sync state
    if (onNewChat) {
      onNewChat(null); // Pass null to indicate no chat ID needed
    }
  };


  // Set loading state for specific chat
  const setChatLoading = (chatId, loading) => {
    setChatLoadingStates(prev => ({
      ...prev,
      [chatId]: loading
    }));
  };


  // Process trade data for AI
  const processTradeDataForAI = () => {
    if (!allTrades || allTrades.length === 0) {
      return null;
    }

    // Use all trades for AI context so it has the full picture
    const tradesToAnalyze = allTrades || [];

    // Log data being sent to AI for validation
    console.log(`[Chatbot Data] Processing ${tradesToAnalyze.length} trades (FULL HISTORY)`);
    console.log(`[Chatbot Data] User ID: ${userId}`);

    // Find active strategy name if any
    const activeStrategy = currentStrategy ? strategies.find(s => s._id === currentStrategy) : null;
    const filterName = activeStrategy ? `Strategy: ${activeStrategy.strategyName}` : 'All Trades';

    const totalPnL = tradesToAnalyze.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = tradesToAnalyze.filter(trade => (trade.pnl || 0) > 0);
    const winRate = tradesToAnalyze.length > 0 ? winningTrades.length / tradesToAnalyze.length : 0;
    const symbols = [...new Set(tradesToAnalyze.map(trade => trade.symbol || trade.pair))];

    const strategyPerformance = strategies.map(strategy => {
      // Calculate based on the visible trades to keep context consistent
      // OR keeps it based on allTrades if we want strategy context to always be global?
      // User requested "dashboard data match", so if dashboard shows breakdown of ALL strategies, we usually show that in tables.
      // BUT if the main dashboard cards (P&L, WinRate) are filtered, the bot should focus on that.
      // Let's keep strategy performance global BUT maybe highlight the selected one.
      const strategyTrades = allTrades.filter(trade => trade.strategy?._id === strategy._id);
      const strategyPnL = strategyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      return {
        name: strategy.strategyName,
        trades: strategyTrades.length,
        pnl: strategyPnL,
        // Added details for context awareness
        description: strategy.strategyDescription,
        type: strategy.strategyType,
        pairs: strategy.tradingPairs,
        timeframe: strategy.timeframes,
        setupType: strategy.setupType,
        confluences: strategy.confluences,
        entryType: strategy.entryType
      };
    });


    return {
      activeFilter: filterName, // Send filter context
      trades: tradesToAnalyze.map(trade => ({
        id: trade._id,
        symbol: trade.symbol || trade.pair,
        pair: trade.pair || trade.symbol,
        date: trade.entryDate || trade.date,
        time: trade.entryTime || trade.time,
        pnl: trade.pnl,
        strategyName: trade.strategyName || trade.strategy?.strategyName || 'Unknown',
        notes: trade.notes,
        positionType: trade.positionType,
        entry: trade.entry,
        exit: trade.exit,
        rFactor: trade.rFactor,
        session: trade.session,
        setupType: trade.setupType,
        timeFrame: trade.timeFrame,
        confluences: trade.confluences,
        confluences: trade.confluences,
        rulesFollowed: trade.rulesFollowed,
        news: trade.news,
        affectedByNews: trade.affectedByNews,
        newsImpactDetails: trade.newsImpactDetails,
      })),
      portfolio: {
        totalTrades: tradesToAnalyze.length,
        totalPnL: totalPnL,
        winRate: winRate,
        winningTrades: winningTrades.length,
        losingTrades: tradesToAnalyze.length - winningTrades.length,
        symbols: symbols
      },
      strategies: strategyPerformance,
      sessions: sessions
    };
  };


  // Add message utility function
  const addMessage = (content, type = 'bot', isSystem = false, replaceId = null) => {
    const newMessage = {
      id: replaceId || generateMessageId(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString(),
      isSystem
    };


    setMessages(prev => {
      if (replaceId) {
        return prev.map(msg =>
          msg.id === replaceId ? newMessage : msg
        );
      } else {
        return [...prev, newMessage];
      }
    });


    return newMessage.id;
  };


  const handleSync = async () => {
    if (!isSignedIn || !userId) {
      setSyncError("Please sign in to sync your trade data.");
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    setIsReady(false);

    const syncingMessageId = addMessage(
      "Syncing with your trade data... This will just take a moment!",
      'bot',
      true
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tradeData = processTradeDataForAI();

      if (!tradeData) {
        throw new Error("No trade data available to sync");
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync',
          userId: userId,
          tradeData: tradeData
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          try {
            const errorData = await response.json();
            if (errorData.chatLimit) {
              setChatUsage({
                promptsUsed: errorData.chatLimit.promptsUsed,
                promptsRemaining: errorData.chatLimit.promptsRemaining,
                monthlyLimit: errorData.chatLimit.monthlyLimit,
                limitReached: errorData.chatLimit.promptsRemaining <= 0,
                loading: false
              });
            }
          } catch (e) {
            // Fallback if no JSON
            setChatUsage(prev => ({ ...prev, limitReached: true }));
          }

          setNotification({
            type: 'warning',
            message: "Your credits are zero. Please come again on the 1st of the month."
          });
          // Treat as "ready" but limited, so they don't get stuck in sync loop error
          // Or maybe just stop syncing and show limit.
          setIsReady(true);
          setSyncError(null);
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to sync`);
      }

      const result = await response.json();

      // Update chat usage from response
      if (result.chatLimit) {
        setChatUsage({
          promptsUsed: result.chatLimit.promptsUsed,
          promptsRemaining: result.chatLimit.promptsRemaining,
          monthlyLimit: result.chatLimit.monthlyLimit,
          limitReached: result.chatLimit.promptsRemaining <= 0,
          loading: false
        });
      }

      if (result.success) {
        setIsReady(true);
        setSyncError(null);

        addMessage(
          result.response || result.message || `Successfully synced! Found ${tradeData.trades.length} trades. Ready to chat!`,
          'bot',
          true,
          syncingMessageId
        );
      } else {
        throw new Error(result.error || 'Sync failed');
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error.message);

      addMessage(
        `Sync failed: ${error.message}. Try again in a moment.`,
        'bot',
        true,
        syncingMessageId
      );
    } finally {
      setIsSyncing(false);
    }
  };


  const handleSelectPrompt = (prompt) => {
    setInputValue(prompt);
    setShowPrompts(false);
    inputRef.current?.focus();

    if (isReady && sessionId) {
      setTimeout(() => {
        handleSendMessage(prompt);
      }, 100);
    }
  };


  // creating the newChat


  const createNewChatInDB = async (firstUserMessage, botResponse) => {
    if (!userId) return null;

    try {
      const newChatId = currentChatId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(`/api/chat/${newChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: firstUserMessage,
          response: botResponse,
          userId: userId,
          title: firstUserMessage.substring(0, 50),
          tradeDataSummary: {
            totalTrades: allTrades?.length || 0,
            totalPnL: allTrades?.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0,
            lastSyncAt: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.chatId) {
          return result.chatId;
        }
      } else {
        console.error('Failed to create chat:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to create chat in DB:', error);
    }
    return null;
  };
  // ✅ FIXED FUNCTION: Save messages to existing chat using correct endpoint
  const saveMessageToExistingChat = async (chatId, userMessage, botResponse) => {
    if (!userId || !chatId) return;

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          response: botResponse,
          userId: userId
        })
      });

      if (!response.ok) {
        console.error('Failed to save message to existing chat:', response.status);
      } else {
        const result = await response.json();
        console.log('Successfully saved message to existing chat:', result);
      }
    } catch (error) {
      console.error('Error saving message to existing chat:', error);
    }
  };

  // Send message function
  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputValue.trim();

    if (!textToSend) return;

    if (!isSignedIn || !userId) {
      addMessage("Please sign in first to start chatting with your trade data!", 'bot');
      return;
    }

    if (!isReady) {
      addMessage("Sync required! Please click the sync button to connect your trade data before chatting.", 'bot');
      return;
    }

    // Check chat limit
    if (chatUsage.limitReached) {
      setNotification({
        type: 'warning',
        message: "Your credits are zero. Please come again on the 1st of the month."
      });
      return;
    }

    addMessage(textToSend, 'user');
    setInputValue('');
    setShowPrompts(false);

    // ✅ Set loading states BEFORE the API call
    const chatIdToUse = currentChatIdRef?.current || currentChatId;
    setIsTyping(true);
    if (chatIdToUse) {
      setChatLoading(chatIdToUse, true);
    }

    try {
      const tradeData = processTradeDataForAI();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          userId: userId,
          message: textToSend,
          tradeData: tradeData,
          chatId: chatIdToUse
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to get response`;
        let isLimitError = response.status === 429;

        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
          if (errorData.limitReached) isLimitError = true;

          // Update chat usage from error response if available
          if (errorData.chatLimit) {
            setChatUsage({
              promptsUsed: errorData.chatLimit.promptsUsed,
              promptsRemaining: errorData.chatLimit.promptsRemaining,
              monthlyLimit: errorData.chatLimit.monthlyLimit,
              limitReached: errorData.chatLimit.promptsRemaining <= 0,
              loading: false
            });
          }
        } catch (e) {
          // If JSON parsing fails, stick to the status code check
          if (response.status === 429) {
            errorMessage = "Monthly chat limit reached";
            isLimitError = true;
          }
        }

        if (isLimitError) {
          setChatUsage(prev => ({ ...prev, limitReached: true }));
          // Ensure we throw a descriptive error for the user
          if (!errorMessage || errorMessage.includes('Failed to get response') || errorMessage === "Monthly chat limit reached") {
            errorMessage = "Your credits are zero. Please come again on the 1st of the month.";
          }
        }

        // Handle User not found error more gracefully
        if (errorMessage === "User not found") {
          errorMessage = "Account error: Please try signing out and signing back in to resync.";
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Update chat usage from response
      if (result.chatLimit) {
        setChatUsage({
          promptsUsed: result.chatLimit.promptsUsed,
          promptsRemaining: result.chatLimit.promptsRemaining,
          monthlyLimit: result.chatLimit.monthlyLimit,
          limitReached: result.chatLimit.promptsRemaining <= 0,
          loading: false
        });
      }

      if (result.success && result.response) {
        addMessage(result.response, 'bot');

        const needsNewChat = !currentChatIdRef?.current ||
          currentChatIdRef.current === 'new_chat' ||
          currentChatIdRef.current.startsWith('new_');

        if (needsNewChat) {
          console.log('Creating new chat for first message...');
          const newChatId = await createNewChatInDB(textToSend, result.response);

          if (newChatId) {
            console.log('New chat created with ID:', newChatId);

            if (onChatUpdate) {
              onChatUpdate(newChatId, {
                lastMessage: textToSend,
                messageCount: messages.length + 2,
                timestamp: new Date().toISOString(),
                userId: userId,
                title: textToSend.substring(0, 50),
                isNewChat: true
              });
            }

            if (onSidebarRefresh) {
              onSidebarRefresh();
            }
          }
        } else {
          console.log('Message saved via backend logic for chat:', currentChatIdRef.current);

          if (onChatUpdate) {
            onChatUpdate(currentChatIdRef.current, {
              lastMessage: textToSend,
              messageCount: messages.length + 2,
              timestamp: new Date().toISOString(),
              userId: userId
            });
          }
        }
      } else {
        addMessage("Sorry, I'm having a technical hiccup! Try asking again.", 'bot');
      }

    } catch (error) {
      // Only log genuine errors to console
      if (!error.message?.includes('Account error') && !error.message?.includes('limit')) {
        console.error('Send message failed:', error);
      }

      // Check for known user-friendly errors
      if (error.message && (
        error.message.includes('credits are zero') ||
        error.message.includes('Account error') ||
        error.message.includes('Monthly chat limit')
      )) {
        // Silently handle expected errors (don't console.error them)
        console.warn(`[Handled] ${error.message}`);

        // If it's a limit error, ensure state is updated
        if (error.message.includes('credits are zero') || error.message.includes('Monthly chat limit')) {
          setChatUsage(prev => ({ ...prev, limitReached: true }));
          setNotification({
            type: 'warning',
            message: "Your credits are zero. Please come again on the 1st of the month."
          });
        } else {
          // Account error
          addMessage(error.message, 'bot');
        }
      } else {
        addMessage(`Error: ${error.message}. Try asking me again!`, 'bot');
      }
    } finally {
      // ✅ ALWAYS clear loading states when done
      setIsTyping(false);
      if (chatIdToUse) {
        setChatLoading(chatIdToUse, false);
      }
    }
  };

  // REMOVE this entire useEffect:
  // useEffect(() => {
  //   return () => {
  //     if (sessionId && userId) {
  //       fetch('/api/chat', {...clearSession...})
  //     }
  //   };
  // }, [sessionId, userId]);

  // Safety check: if we have prompts remaining, limit cannot be reached
  useEffect(() => {
    if (chatUsage.promptsRemaining > 0 && chatUsage.limitReached) {
      setChatUsage(prev => ({ ...prev, limitReached: false }));
      setNotification(null);
    }
  }, [chatUsage.promptsRemaining, chatUsage.limitReached]);

  return (
    <motion.div
      className="flex-1 flex flex-col h-screen bg-black text-white relative overflow-hidden font-sans"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
      </div>


      {/* Additional subtle lighting effects */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-48"
        style={{
          background: 'radial-gradient(ellipse 400px 200px at center, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 30%, transparent 70%)',
          filter: 'blur(1px)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />


      {/* Header Component */}
      <ChatHeader chatUsage={chatUsage} />

      {notification && (
        <PopNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}


      {/* Removed redundant loading indicator - handled in MessageInterface */}


      {/* User Authentication Status */}
      {!isSignedIn && (
        <motion.div
          className="bg-orange-500/10 border-l-4 border-orange-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-orange-300 text-sm">🔐 Please sign in to access your trade data and start chatting</p>
        </motion.div>
      )}


      {isSyncing && (
        <motion.div
          className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-yellow-300 text-sm">🔄 Syncing your trade data...</p>
        </motion.div>
      )}


      {syncError && (
        <motion.div
          className="bg-red-500/10 border-l-4 border-red-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-red-300 text-sm">❌ Sync failed: {syncError}</p>
        </motion.div>
      )}


      {isReady && isSignedIn && userId && (
        <motion.div
          className="bg-green-500/10 border-l-4 border-green-500 p-3 mx-4 rounded-r-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-green-300 text-sm">✅ Connected! Ready for trading insights</p>
        </motion.div>
      )}



      {/* Messages Area - Sync UI has absolute priority */}
      <MessageInterface
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        currentChatId={isReady ? currentChatId : null}
        userId={userId}
        onMessagesLoaded={handleMessagesLoaded}
        isReady={isReady}
        isSyncing={isSyncing}
        onSync={handleSync}
        syncError={syncError}
        isSignedIn={isSignedIn}
        chatLoadingStates={chatLoadingStates}
        tradesLoading={loading}
      />


      {/* Input Area */}
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={handleSendMessage}
        inputRef={inputRef}
        showPrompts={showPrompts}
        setShowPrompts={setShowPrompts}
        onSelectPrompt={handleSelectPrompt}
        onSync={handleSync}
        isSyncing={isSyncing}
        isReady={isReady}
        isSignedIn={isSignedIn}
        userId={userId}
        onNewChat={handleNewChat}
        tradesLoading={loading}
        chatUsage={chatUsage}
      />
    </motion.div>
  );
};


export default ChatbotInterface;
