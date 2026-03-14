import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Target,
  Calendar,
  Star,
  Award,
  Flame,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  Zap,
  Activity
} from 'lucide-react';

const MonthlyWrapped = ({
  trades = [],
  currentStreak = 0,
  onClose = null,
  isModal = false
}) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Memoize the data calculation to prevent unnecessary re-renders
  const monthlyData = useMemo(() => {
    const now = new Date();
    // Calculate previous month
    const targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    // Filter trades for target month (previous month)
    const monthlyTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.entryDate || trade.createdAt);
      return tradeDate.getMonth() === targetMonth && tradeDate.getFullYear() === targetYear;
    });

    const totalTrades = monthlyTrades.length;
    const winningTrades = monthlyTrades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = totalTrades > 0 ? Math.round((winningTrades.length / totalTrades) * 100) : 0;

    const totalPnl = monthlyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const losingTrades = monthlyTrades.filter(trade => (trade.pnl || 0) < 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount).toFixed(1) : totalWinAmount > 0 ? 999 : 0;

    const biggestWin = Math.max(...monthlyTrades.map(trade => trade.pnl || 0), 0);
    const averageRisk = monthlyTrades.length > 0
      ? (monthlyTrades.reduce((sum, trade) => sum + (trade.riskPercentage || 1), 0) / monthlyTrades.length).toFixed(1)
      : 1.0;

    // Calculate trading days (unique dates)
    const tradingDates = [...new Set(monthlyTrades.map(trade => {
      const date = new Date(trade.entryDate || trade.createdAt);
      return date.toDateString();
    }))];

    // Find most common strategy, pair, session
    const strategies = monthlyTrades.map(trade => trade.strategy).filter(Boolean);
    const pairs = monthlyTrades.map(trade => trade.pair).filter(Boolean);
    const sessions = monthlyTrades.map(trade => trade.session).filter(Boolean);

    const getMostCommon = (arr) => {
      if (arr.length === 0) return 'N/A';
      const frequency = {};
      arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
      return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    };

    return {
      month: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalTrades,
      winRate,
      profitFactor: parseFloat(profitFactor),
      bestStreak: currentStreak,
      monthlyPnl: Math.round(totalPnl),
      consistency: Math.min(100, Math.round((winRate + (profitFactor * 10)) / 2)),
      riskManagement: Math.min(100, Math.round(100 - (averageRisk * 10))),
      topStrategy: getMostCommon(strategies),
      mostTradedPair: getMostCommon(pairs),
      bestSession: getMostCommon(sessions),
      topConfluence: 'Technical Analysis',
      emotionalControl: Math.min(100, Math.round(winRate * 1.2)),
      biggestWin: Math.round(biggestWin),
      averageRisk: parseFloat(averageRisk),
      tradingDays: tradingDates.length
    };
  }, [trades, currentStreak]);

  const wrappedCards = useMemo(() => [
    {
      id: 1,
      title: "Your Trading Journey",
      subtitle: monthlyData.month,
      content: (
        <div className="flex flex-col items-center justify-center space-y-8 w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full"></div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative z-10 text-7xl md:text-8xl font-black text-white tracking-tighter"
              style={{ textShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}
            >
              {monthlyData.totalTrades}
            </motion.div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-medium text-blue-200/80">trades executed</span>
            <div className="h-1 w-12 bg-blue-500/50 rounded-full mt-4 mb-6"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center hover:bg-white/10 transition-colors">
              <span className="text-2xl font-bold text-white">{monthlyData.tradingDays}</span>
              <span className="text-xs uppercase tracking-wider text-blue-300/70 mt-1">Active Days</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center hover:bg-white/10 transition-colors">
              <span className="text-2xl font-bold text-white">
                {monthlyData.tradingDays > 0 ? (monthlyData.totalTrades / monthlyData.tradingDays).toFixed(1) : 0}
              </span>
              <span className="text-xs uppercase tracking-wider text-blue-300/70 mt-1">Trades/Day</span>
            </div>
          </div>
        </div>
      ),
      icon: Calendar,
      gradient: "from-blue-900/60 via-indigo-900/60 to-slate-900/60",
      accent: "text-blue-400"
    },
    {
      id: 2,
      title: "Profit Performance",
      subtitle: "Financial Snapshot",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 w-full">
          <div className="relative w-full flex justify-center py-4">
            <div className={`absolute inset-0 blur-[80px] rounded-full ${monthlyData.monthlyPnl >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}></div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`relative z-10 text-5xl md:text-6xl font-bold tracking-tight ${monthlyData.monthlyPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              ${monthlyData.monthlyPnl.toLocaleString()}
            </motion.div>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-gray-300 font-medium">Biggest Win</span>
              </div>
              <span className="text-emerald-400 font-bold text-lg">+${monthlyData.biggestWin}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 font-medium">Win Rate</span>
              </div>
              <span className="text-blue-400 font-bold text-lg">{monthlyData.winRate}%</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300 font-medium">Profit Factor</span>
              </div>
              <span className="text-purple-400 font-bold text-lg">{monthlyData.profitFactor}</span>
            </div>
          </div>
        </div>
      ),
      icon: Activity,
      gradient: "from-emerald-900/50 via-teal-900/50 to-slate-900/50",
      accent: "text-emerald-400"
    },
    {
      id: 3,
      title: "Consistency",
      subtitle: "Streak & Discipline",
      content: (
        <div className="flex flex-col items-center justify-center space-y-8 w-full">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/30 blur-[60px] rounded-full group-hover:bg-orange-500/40 transition-all duration-500"></div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex flex-col items-center"
            >
              <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-red-500 filter drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                {monthlyData.bestStreak}
              </span>
              <Flame className="w-12 h-12 text-orange-500 -mt-2 animate-pulse" fill="currentColor" />
            </motion.div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">Day Streak</h3>
            <p className="text-orange-200/60 max-w-[200px]">Keep the fire burning! Consistency is your key to success.</p>
          </div>

          <div className="flex gap-1.5 p-3 bg-black/40 rounded-xl border border-white/5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-10 rounded-full transition-all duration-300 ${i < Math.min(monthlyData.bestStreak, 7) ? 'bg-gradient-to-t from-orange-600 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}
              />
            ))}
            {monthlyData.bestStreak > 7 && (
              <div className="flex items-end ml-1">
                <span className="text-xs text-orange-400 font-bold">+{monthlyData.bestStreak - 7}</span>
              </div>
            )}
          </div>
        </div>
      ),
      icon: Flame,
      gradient: "from-orange-900/50 via-red-900/50 to-slate-900/50",
      accent: "text-orange-400"
    }
  ], [monthlyData]);

  // Handle auto-advance
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentCard(current => (current + 1) % wrappedCards.length);
          return 0;
        }
        return prev + 1; // Smoother 1% increments
      });
    }, 50); // Faster update rate for smoother bar

    return () => clearInterval(interval);
  }, [isPlaying, wrappedCards.length]);

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % wrappedCards.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentCard((prev) => (prev - 1 + wrappedCards.length) % wrappedCards.length);
    setProgress(0);
  };

  const currentCardData = wrappedCards[currentCard];

  return (
    <div className={`
      ${isModal ? 'fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm' : 'min-h-screen flex items-center justify-center p-4 bg-black'}
      transition-all duration-500
    `}>
      <div className={`
        relative w-full max-w-md bg-[#0a0a0a] rounded-[32px] overflow-hidden shadow-2xl border border-white/10
        ${isModal ? 'max-h-[90vh]' : 'min-h-[700px]'}
      `}>
        {/* Background Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentCardData.gradient} opacity-40 transition-all duration-700 ease-in-out`}></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>

        {/* Close Button */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Trading Wrapped
            </h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest mt-1">
              {monthlyData.month}
            </p>
          </div>

          {/* Progress Bars */}
          <div className="flex gap-2 mb-8">
            {wrappedCards.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ease-linear ${idx === currentCard ? 'bg-white' : idx < currentCard ? 'bg-white/50' : 'bg-transparent'}`}
                  style={{ width: idx === currentCard ? `${progress}%` : idx < currentCard ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Main Card Content Area */}
          <div className="flex-1 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flexflex-col items-center"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Icon Badge */}
                  <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-xl ${currentCardData.accent}`}>
                    <currentCardData.icon className="w-8 h-8" />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-2 text-center">{currentCardData.title}</h2>
                  <p className="text-blue-200/60 mb-8 text-center">{currentCardData.subtitle}</p>

                  <div className="w-full">
                    {currentCardData.content}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MonthlyWrapped;
