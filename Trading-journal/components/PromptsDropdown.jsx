import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, TrendingDown, Clock, Brain, BarChart3, TrendingUp } from 'lucide-react';

const PromptsDropdown = ({ isOpen, onClose, onSelectPrompt, inputRef }) => {
  const dropdownRef = useRef(null);

  const prompts = [
    {
      category: "Self-Discovery & Pattern Recognition",
      icon: <BookOpen size={16} />,
      color: "from-purple-500 to-violet-600",
      items: [
        "Identify patterns in my winning and losing trades—what common factors or setups can you find?",
        "Based on my trade history, what times of day or market conditions do I perform best and worst in?"
      ]
    },
    {
      category: "Performance Review & Goal Setting", 
      icon: <Target size={16} />,
      color: "from-blue-500 to-cyan-600",
      items: [
        "Evaluate my last 30 trades and suggest areas for improvement.",
        "What trading style (scalping, swing, etc.) suits me the most based on my journaled activity?"
      ]
    },
    {
      category: "Risk Management Insights",
      icon: <TrendingDown size={16} />,
      color: "from-red-500 to-pink-600", 
      items: [
        "Examine my risk management—am I risking too much per trade or letting losers run too long?",
        "Spot instances where I violated my trading plan and assess the outcome versus sticking to the plan."
      ]
    },
    {
      category: "Tracking Improvement Over Time",
      icon: <Clock size={16} />,
      color: "from-green-500 to-emerald-600",
      items: [
        "Track my progress over the past three months and show improvements or regressions.",
        "What are the three best and three worst trades I made recently, and what can I learn from each?"
      ]
    },
    {
      category: "Psychological & Behavioral Insights",
      icon: <Brain size={16} />,
      color: "from-orange-500 to-amber-600",
      items: [
        "Analyze my journal for signs of FOMO, revenge trading, or hesitation. How can I address these behaviors?",
        "Review my trading journal and identify any emotional triggers—such as news, rapid price moves, or losses—that lead to impulsive trades. Suggest strategies to build discipline and reduce these reactions."
      ]
    },
    {
      category: "Market Contextualization",
      icon: <BarChart3 size={16} />,
      color: "from-teal-500 to-blue-600",
      items: [
        "Cross-analyze market volatility on trade days with my trade outcomes to spot any performance trends.",
        "How do my trades perform around major economic events, and should I adjust my strategies accordingly?"
      ]
    },
    {
      category: "Market Analysis Integration",
      icon: <TrendingUp size={16} />,
      color: "from-indigo-500 to-purple-600",
      items: [
        "Compare my journal entries to major market moves—am I consistently aligned with the broader trend, or am I fading moves?",
        "Analyze which indicators, news events, or economic data have reliably preceded my best and worst trades.",
        "Suggest realistic, measurable goals for the coming month based on my recent performance."
      ]
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, inputRef]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 max-h-96 overflow-hidden z-50"
      >
        {/* Prompts Content */}
        <div className="overflow-y-auto hide-scrollbar max-h-80 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <motion.div 
            className="p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.05 }}
          >
            {prompts.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-4 last:mb-2"
              >
                {/* Category Header */}
                <motion.div 
                  className="flex items-center gap-3 px-3 py-2 mb-2"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {category.icon}
                  </motion.div>
                  <h3 className="text-sm font-semibold text-white/90 tracking-wide">
                    {category.category}
                  </h3>
                </motion.div>

                {/* Category Items */}
                <div className="space-y-1">
                  {category.items.map((prompt, promptIndex) => (
                    <motion.button
                      key={promptIndex}
                      onClick={() => onSelectPrompt(prompt)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-white/10"
                      whileHover={{ 
                        x: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: (categoryIndex * 0.1) + (promptIndex * 0.03),
                        type: "spring",
                        stiffness: 400 
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div 
                          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 mt-2 opacity-60 group-hover:opacity-100"
                          whileHover={{ scale: 1.5 }}
                          transition={{ type: "spring", stiffness: 600 }}
                        />
                        <span className="leading-relaxed group-hover:text-white transition-colors duration-300">
                          {prompt}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="px-4 py-3 border-t border-white/10 bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 text-center">
            💡 Select a prompt to get started with your trading analysis
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptsDropdown;