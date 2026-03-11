// hooks/useChatHistory.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tradebot_chat_history';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveToStorage = useCallback((history) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, []);

  // Create a new chat
  const createChat = useCallback((title = 'New Trading Chat') => {
    const newChat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      lastMessage: '',
      timestamp: new Date().toISOString(),
      messageCount: 0,
      topics: [],
      messages: []
    };

    setChatHistory(prev => {
      const updated = [newChat, ...prev];
      saveToStorage(updated);
      return updated;
    });

    return newChat.id;
  }, [saveToStorage]);

  // Update chat with new message
  const updateChatWithMessage = useCallback((chatId, message, messageType = 'user') => {
    setChatHistory(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            lastMessage: messageType === 'user' ? message : chat.lastMessage,
            timestamp: new Date().toISOString(),
            messageCount: chat.messageCount + 1,
            messages: [...(chat.messages || []), {
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: message,
              type: messageType,
              timestamp: new Date().toISOString()
            }]
          };

          // Auto-detect topics from message content
          const messageWords = message.toLowerCase();
          const newTopics = [...new Set([
            ...chat.topics,
            ...(messageWords.includes('performance') || messageWords.includes('portfolio') ? ['performance'] : []),
            ...(messageWords.includes('trade') || messageWords.includes('stock') ? ['trades'] : []),
            ...(messageWords.includes('risk') || messageWords.includes('strategy') ? ['risk'] : [])
          ])];

          updatedChat.topics = newTopics;

          // Auto-generate title from first user message if still using default
          if (chat.title === 'New Trading Chat' && messageType === 'user' && message.length > 10) {
            const words = message.split(' ').slice(0, 4).join(' ');
            updatedChat.title = words.length > 20 ? `${words.substring(0, 20)}...` : words;
          }

          return updatedChat;
        }
        return chat;
      });

      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Rename a chat
  const renameChat = useCallback((chatId, newTitle) => {
    setChatHistory(prev => {
      const updated = prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Delete a chat
  const deleteChat = useCallback((chatId) => {
    setChatHistory(prev => {
      const updated = prev.filter(chat => chat.id !== chatId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Get chat by ID
  const getChatById = useCallback((chatId) => {
    return chatHistory.find(chat => chat.id === chatId);
  }, [chatHistory]);

  // Clear all chat history
  const clearAllChats = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get chat messages
  const getChatMessages = useCallback((chatId) => {
    const chat = getChatById(chatId);
    return chat?.messages || [];
  }, [getChatById]);

  return {
    chatHistory,
    loading,
    createChat,
    updateChatWithMessage,
    renameChat,
    deleteChat,
    getChatById,
    getChatMessages,
    clearAllChats
  };
};