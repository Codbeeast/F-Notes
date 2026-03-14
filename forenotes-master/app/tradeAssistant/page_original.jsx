'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatbotInterface from '@/components/BotInterface';
import ChatbotSidebar from '@/components/ChatbotSidebar';

const TradingChatPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  // Initialize page load and mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate loading time - no automatic chat ID generation
    setTimeout(() => {
      setIsLoaded(true);
      // Keep currentChatId as null to show welcome screen
    }, 1000);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNewChat = () => {
    // Set to null to show welcome screen
    setCurrentChatId(null);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    if (isMobile) setSidebarOpen(false);
  };

  // Handle chat updates (when messages are sent, chats are created, etc.)

const handleChatUpdate = (chatId, updateData) => {
  
  // This ensures we update currentChatId when a new chat is created
  if (updateData?.isNewChat || currentChatId === null || !currentChatId) {
    setCurrentChatId(chatId);
  }
  
  // Trigger sidebar refresh to show updated chat list
  triggerSidebarRefresh();
};
  // Trigger sidebar refresh
  const triggerSidebarRefresh = () => {
    setSidebarRefreshTrigger(prev => prev + 1);
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      if (sidebarOpen && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      } else if (sidebarOpen && sidebarCollapsed) {
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0;
    if (isMobile) return 320;
    return sidebarCollapsed ? 80 : 320;
  };

  // Responsive Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background - dark theme */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-black to-gray-900/50 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 sm:w-40 sm:h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      
      {/* Main loading content - Responsive */}
      <div className="relative z-10 flex flex-col items-center space-y-4 sm:space-y-8 px-4">
        {/* Logo/Icon area - Responsive */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-3xl blur-xl animate-pulse" />
        </div>
        
        {/* Loading text - Responsive */}
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">TradeBot AI</h1>
          <p className="text-gray-400 text-base sm:text-lg px-2">Initializing your trading assistant...</p>
        </div>
        
        {/* Loading bar - Responsive */}
        <div className="w-64 sm:w-80 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 rounded-full animate-pulse transform scale-x-75 origin-left" />
        </div>
        
        {/* Feature indicators - Responsive */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-gray-400 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
            <span>AI Analysis</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <span>Smart Insights</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isLoaded) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans">
      {/* Background decorative elements - static */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Sidebar Toggle Button - Sticky Position with proper z-index - Hide on mobile when sidebar is open */}
      {!(isMobile && sidebarOpen) && (
        <button
          onClick={handleToggleSidebar}
          className={`fixed top-4 sm:top-6 z-50 p-2 sm:p-3 bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-lg hover:bg-black/40 transition-all duration-300 cursor-pointer ${
            sidebarOpen && !isMobile 
              ? sidebarCollapsed 
                ? 'left-20 sm:left-24' 
                : 'left-72 sm:left-80' 
              : 'left-2 sm:left-4'
          }`}
        >
          {isMobile ? (
            <Menu size={18} className="text-white sm:w-5 sm:h-5" />
          ) : (
            sidebarOpen ? (
              sidebarCollapsed ? (
                <ChevronRight size={18} className="text-white sm:w-5 sm:h-5" />
              ) : (
                <ChevronLeft size={18} className="text-white sm:w-5 sm:h-5" />
              )
            ) : (
              <Menu size={18} className="text-white sm:w-5 sm:h-5" />
            )
          )}
        </button>
      )}

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleCloseSidebar}
          />
        )}

        {/* Sidebar Container - Using your original width animation logic */}
        <div
          className={`${
            isMobile 
              ? sidebarOpen 
                ? 'fixed left-0 top-0 z-50 h-full' 
                : 'fixed left-0 top-0 z-50 pointer-events-none'
              : 'relative'
          }`}
          style={{
            width: getSidebarWidth(),
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {(sidebarOpen || (!isMobile && sidebarCollapsed)) && (
            <div 
              className={`h-full overflow-hidden ${
                isMobile 
                  ? 'transform transition-transform duration-400 ease-out' + (sidebarOpen ? ' translate-x-0' : ' -translate-x-full')
                  : ''
              }`}
            >
              {/* Collapsed Sidebar for Desktop */}
              {!isMobile && sidebarCollapsed ? (
                <div className="w-20 h-full bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 space-y-4">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Menu size={20} className="text-white" />
                    </div>
                    
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Full Sidebar */
                <div className="w-80 h-full">
                  <ChatbotSidebar 
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                    currentChatId={currentChatId}
                    isOpen={sidebarOpen}
                    onClose={handleCloseSidebar}
                    refreshTrigger={sidebarRefreshTrigger}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Chat Interface - This will automatically shift right when sidebar opens */}
        <div 
          className="flex-1 min-w-0"
          style={{
            transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: isMobile ? 0 : 0 // Let flexbox handle the positioning naturally
          }}
        >
          <ChatbotInterface 
            currentChatId={currentChatId}
            onChatUpdate={handleChatUpdate}
            onNewChat={handleNewChat}
            onSidebarRefresh={triggerSidebarRefresh}
            onOpenSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            welcomeMessage="Welcome to your Trade Journal Assistant! I can help you track trades, analyze performance, and provide insights. What would you like to do today?"
          />
        </div>
      </div>

      {/* Static background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          }}
        />
      </div>
    </div>
  );
};

export default TradingChatPage;
