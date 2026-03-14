import React from 'react';
import { motion } from 'framer-motion';
import { Settings, HelpCircle } from 'lucide-react';

const ChatHeader = ({ chatUsage }) => {
  const getUsageColor = () => {
    if (!chatUsage) return 'text-gray-400';
    const remaining = chatUsage.promptsRemaining;
    if (remaining <= 5) return 'text-red-400';
    if (remaining <= 15) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <motion.header
      className="bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/10 p-2 sm:p-3 md:p-5 z-40 m-1 sm:m-2 md:m-4 sticky top-0"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 sm:gap-3 md:gap-5 sm:ml-6"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative flex-shrink-0"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 255, 255, 0.1)',
                '0 0 30px rgba(147, 51, 234, 0.2)',
                '0 0 20px rgba(255, 255, 255, 0.1)'
              ],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            whileHover={{
              scale: 1.05,
              rotate: [0, 3, -3, 0],
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            <img
              src="https://framerusercontent.com/images/rZ69z1xaFyAlaWj5xMpvc6uUxc4.jpg"
              alt="Forenotes Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="min-w-0 flex-1">
            <motion.h2
              className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-wide truncate"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}
            >
              FoNo
            </motion.h2>
            <motion.p
              className="text-xs sm:text-sm text-gray-400 tracking-wide hidden sm:block truncate"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI-powered trading insights and analysis
            </motion.p>
          </div>
        </motion.div>

        {/* Credit Counter Widget */}
        {chatUsage && !chatUsage.loading && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-200"></div>
              <div className="relative flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/10">
                <div className={`w-2 h-2 rounded-full animate-pulse ${chatUsage.promptsRemaining <= 5 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                    chatUsage.promptsRemaining <= 15 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' :
                      'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                  }`} />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Credits</span>
                  <span className={`text-xs sm:text-sm font-bold font-mono ${getUsageColor()}`}>
                    {chatUsage.promptsRemaining} <span className="text-gray-600">/</span> {chatUsage.monthlyLimit}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default ChatHeader;