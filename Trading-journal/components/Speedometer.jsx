"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { animate } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTrades } from '../context/TradeContext';

// Skeleton Loading Component with NewsChart styling
const SpeedometerSkeleton = () => {
  return (
    <div className="relative group backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col items-center">
        <div className="w-56 h-56 rounded-full border-4 border-blue-500/30 animate-pulse mb-4" />
        <div className="w-20 h-8 bg-blue-500/30 rounded-lg animate-pulse mb-2" />
        <div className="w-32 h-4 bg-blue-500/20 rounded animate-pulse" />
      </div>
    </div>
  );
};

// Enhanced Speedometer Card with NewsChart UI
const SpeedometerCard = ({ label, value, color, comparison, isLoading = false, animationDelay = 0 }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [displayedValue, setDisplayedValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef(null);

  const clampedValue = Math.max(0, Math.min(100, value));

  const getSegmentOpacity = (progress, segmentIndex, totalSegments) => {
    const segmentStart = (segmentIndex / totalSegments) * 100;
    const segmentEnd = ((segmentIndex + 1) / totalSegments) * 100;

    let opacity = 0;
    let intensity = 0;

    if (progress >= segmentEnd) {
      opacity = 1;
      intensity = 1;
    } else if (progress >= segmentStart) {
      const progressRatio = (progress - segmentStart) / (segmentEnd - segmentStart);
      opacity = Math.pow(progressRatio, 0.8);
      intensity = progressRatio;
    }

    return { opacity, intensity, isActive: opacity > 0 };
  };

  useEffect(() => {
    if (!hasAnimated && !isLoading) {
      const startAnimation = async () => {
        if (animationDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, animationDelay));
        }

        const animation = animate(0, clampedValue, {
          duration: 2,
          ease: [0.4, 0, 0.2, 1],
          onUpdate: (latest) => {
            setCurrentProgress(latest);
            setDisplayedValue(Math.round(latest));
          },
          onComplete: () => {
            setHasAnimated(true);
          }
        });

        animationRef.current = animation;
      };

      startAnimation();

      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    }
  }, [clampedValue, hasAnimated, isLoading, animationDelay]);

  // Reset animation when value changes significantly
  useEffect(() => {
    if (hasAnimated && Math.abs(clampedValue - currentProgress) > 5) {
      setHasAnimated(false);
      setCurrentProgress(0);
      setDisplayedValue(0);
    }
  }, [clampedValue, hasAnimated, currentProgress]);

  if (isLoading) {
    return <SpeedometerSkeleton />;
  }

  return (
    <motion.div
      className="relative group backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-6 shadow-2xl transition-all duration-500"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-slate-800/10 rounded-2xl blur-lg transition-all duration-500" />

      {/* Comparison Badge */}
      {comparison !== null && comparison !== undefined && (
        <div className="flex justify-end mb-2">
          <div className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center space-x-2 backdrop-blur-sm border ${comparison > 0
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : comparison < 0
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
            }`}>
            <span>{comparison > 0 ? '↑' : comparison < 0 ? '↓' : '→'}</span>
            {comparison !== 0 && <span>{Math.abs(comparison)}%</span>}
          </div>
        </div>
      )}

      {/* Speedometer */}
      <div className="flex flex-col items-center relative">
        <div className="relative w-64 h-64 mb-4">
          <svg className="w-full h-full filter drop-shadow-2xl" viewBox="0 0 400 220">
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4b5563" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
            </defs>

            <circle cx="200" cy="170" r="150" fill="none" stroke={`url(#gradient-${label})`} strokeWidth="2" opacity="0.3" />

            {[...Array(30)].map((_, i) => {
              const startAngle = 180 - i * 6;
              const endAngle = startAngle - 4;
              const outerRadius = 200;
              const innerRadius = 160;

              const x1 = 200 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 170 - outerRadius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 200 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y2 = 170 - innerRadius * Math.sin((startAngle * Math.PI) / 180);
              const x3 = 200 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y3 = 170 - innerRadius * Math.sin((endAngle * Math.PI) / 180);
              const x4 = 200 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y4 = 170 - outerRadius * Math.sin((endAngle * Math.PI) / 180);

              const { isActive } = getSegmentOpacity(currentProgress, i, 30);

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`}
                  fill={isActive ? color : '#4b5563'}
                  opacity={isActive ? 0.8 : 0.3}
                  style={{
                    filter: isActive ? `drop-shadow(0 0 4px ${color}40)` : 'none',
                    transition: 'all 0.1s ease-out'
                  }}
                />
              );
            })}

            <circle cx="200" cy="170" r="6" fill="#1f2937" stroke="#ffffff" strokeWidth="2" />
            <circle cx="200" cy="170" r="3" fill={color} opacity="0.9" />

            <text x="60" y="180" fill="#9ca3af" fontSize="12" textAnchor="middle">0</text>
            <text x="200" y="40" fill="#9ca3af" fontSize="12" textAnchor="middle">50</text>
            <text x="340" y="180" fill="#9ca3af" fontSize="12" textAnchor="middle">100</text>
          </svg>
        </div>

        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div
            className="text-4xl font-black tracking-tight mb-2"
            style={{
              color: color,
              textShadow: `0 0 10px ${color}40`,
              fontFamily: 'ui-monospace, monospace'
            }}
          >
            {displayedValue}<span className="text-lg text-white/90 ml-1">%</span>
          </div>
          <div className="text-sm font-bold text-white uppercase tracking-[0.2em] bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {label}
          </div>
        </motion.div>
      </div>

      <div className="mt-4">
        <div className="flex justify-center space-x-1">
          {[...Array(20)].map((_, i) => {
            const { isActive } = getSegmentOpacity(currentProgress, i, 20);
            return (
              <div
                key={i}
                className="h-1.5 w-3 rounded-full transition-all duration-75"
                style={{
                  backgroundColor: isActive ? color : '#4b5563',
                  opacity: isActive ? 0.8 : 0.5,
                  boxShadow: isActive ? `0 0 4px ${color}40` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Month Navigation Component
const MonthNavigation = ({ selectedDate, onDateChange }) => {
  const formatMonth = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToCurrentMonth = () => {
    onDateChange(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
  };

  return (
    <div className="flex flex-col space-y-4 mb-8 px-2">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent tracking-tight">
          {formatMonth(selectedDate)}
        </h2>
      </div>

      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={goToPreviousMonth}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          title="Previous Month"
        >
          <ChevronLeft size={20} />
        </motion.button>

        <motion.button
          onClick={goToCurrentMonth}
          disabled={isCurrentMonth()}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl border font-bold transition-all duration-300 ${isCurrentMonth()
            ? 'bg-slate-700/50 border-slate-600/30 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
            }`}
          whileHover={!isCurrentMonth() ? { scale: 1.05 } : {}}
          whileTap={!isCurrentMonth() ? { scale: 0.95 } : {}}
        >
          <Calendar size={16} />
          <span className="text-sm uppercase tracking-wider">Current</span>
        </motion.button>

        <motion.button
          onClick={goToNextMonth}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          title="Next Month"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  );
};

// Main Component with improved calculations and month filtering
const SpeedometerGrid = ({ isLoading, onMetricsChange }) => {
  const { trades, loading, error } = useTrades();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter trades by selected month
  const filteredTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === selectedDate.getMonth() &&
        tradeDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [trades, selectedDate]);

  // FIXED: Metrics calculation with precise percentage conversion
  const metrics = useMemo(() => {
    if (!filteredTrades || filteredTrades.length === 0) {
      return {
        fomoControl: 0,
        executionRate: 0,
        patienceLevel: 0,
        confidenceIndex: 0,
        fearGreed: 0,
        fomoComparison: null,
        executionComparison: null,
        patienceComparison: null,
        confidenceComparison: null,
        fearGreedComparison: null
      };
    }

    const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
    const validTrades = filteredTrades.filter(trade => trade && typeof trade === 'object');

    console.log('Processing trades for', selectedDate.toLocaleDateString(), ':', validTrades.length);

    // FIXED: Precise percentage conversion - (rating / 10) * 100
    // This ensures: 5/10 = 50.0%, 1/10 = 10.0%, 10/10 = 100.0%

    // FOMO Control (1-10 scale, direct conversion)
    // User Update: If control is more, % should be more.
    // So 8/10 -> 80% control.
    const fomoRatings = validTrades
      .map(t => parseFloat(t.fomoRating))
      .filter(rating => !isNaN(rating) && rating >= 1 && rating <= 10);

    const avgFomo = fomoRatings.length > 0 ? fomoRatings.reduce((sum, rating) => sum + rating, 0) / fomoRatings.length : 5;
    const fomoControl = (avgFomo / 10) * 100;

    // Execution Rate (1-10 scale, direct conversion)
    const executionRatings = validTrades
      .map(t => parseFloat(t.executionRating))
      .filter(rating => !isNaN(rating) && rating >= 1 && rating <= 10);

    const avgExecution = executionRatings.length > 0 ? executionRatings.reduce((sum, rating) => sum + rating, 0) / executionRatings.length : 5;
    const executionRate = (avgExecution / 10) * 100;

    // Patience Level (1-10 scale, direct conversion)
    const patienceRatings = validTrades
      .map(t => parseFloat(t.patience))
      .filter(rating => !isNaN(rating) && rating >= 1 && rating <= 10);

    const avgPatience = patienceRatings.length > 0 ? patienceRatings.reduce((sum, rating) => sum + rating, 0) / patienceRatings.length : 5;
    const patienceLevel = (avgPatience / 10) * 100;

    // Confidence Index (1-10 scale, direct conversion)
    const confidenceRatings = validTrades
      .map(t => parseFloat(t.confidence))
      .filter(rating => !isNaN(rating) && rating >= 1 && rating <= 10);

    let confidenceIndex;
    if (confidenceRatings.length > 0) {
      const avgConfidence = confidenceRatings.reduce((sum, rating) => sum + rating, 0) / confidenceRatings.length;
      confidenceIndex = (avgConfidence / 10) * 100;
    } else {
      // Fallback to win rate if no confidence ratings exist
      const tradesWithPnl = validTrades.filter(t => t.pnl !== undefined && t.pnl !== null);
      const profitableTrades = tradesWithPnl.filter(t => parseFloat(t.pnl) > 0).length;
      confidenceIndex = tradesWithPnl.length > 0 ? (profitableTrades / tradesWithPnl.length) * 100 : 0;
    }

    // Fear & Greed (1-10 scale, direct conversion)
    const fearGreedRatings = validTrades
      .map(t => parseFloat(t.fearToGreed))
      .filter(rating => !isNaN(rating) && rating >= 1 && rating <= 10);

    const avgFearGreed = fearGreedRatings.length > 0 ? fearGreedRatings.reduce((sum, rating) => sum + rating, 0) / fearGreedRatings.length : 5;
    const fearGreed = (avgFearGreed / 10) * 100;

    const result = {
      fomoControl: Math.round(clamp(fomoControl)),
      executionRate: Math.round(clamp(executionRate)),
      patienceLevel: Math.round(clamp(patienceLevel)),
      confidenceIndex: Math.round(clamp(confidenceIndex)),
      fearGreed: Math.round(clamp(fearGreed)),
      fomoComparison: null,
      executionComparison: null,
      patienceComparison: null,
      confidenceComparison: null,
      fearGreedComparison: null
    };

    console.log('Final metrics:', result);
    console.log('Raw averages - FOMO:', avgFomo, 'Execution:', avgExecution, 'Patience:', avgPatience, 'Fear/Greed:', avgFearGreed);
    return result;
  }, [filteredTrades, selectedDate]);

  // Calculate previous month metrics for comparison
  const previousMonthMetrics = useMemo(() => {
    if (!trades || trades.length === 0) return null;

    const previousMonth = new Date(selectedDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const previousMonthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === previousMonth.getMonth() &&
        tradeDate.getFullYear() === previousMonth.getFullYear();
    });

    if (previousMonthTrades.length === 0) return null;

    const validTrades = previousMonthTrades.filter(trade => trade && typeof trade === 'object');

    const fomoRatings = validTrades.map(t => parseFloat(t.fomoRating)).filter(r => !isNaN(r) && r >= 1 && r <= 10);
    const executionRatings = validTrades.map(t => parseFloat(t.executionRating)).filter(r => !isNaN(r) && r >= 1 && r <= 10);
    const patienceRatings = validTrades.map(t => parseFloat(t.patience)).filter(r => !isNaN(r) && r >= 1 && r <= 10);
    const confidenceRatings = validTrades.map(t => parseFloat(t.confidence)).filter(r => !isNaN(r) && r >= 1 && r <= 10);
    const fearGreedRatings = validTrades.map(t => parseFloat(t.fearToGreed)).filter(r => !isNaN(r) && r >= 1 && r <= 10);

    return {
      fomoControl: fomoRatings.length > 0 ? Math.round(((fomoRatings.reduce((sum, r) => sum + r, 0) / fomoRatings.length) / 10) * 100) : 0,
      executionRate: executionRatings.length > 0 ? Math.round(((executionRatings.reduce((sum, r) => sum + r, 0) / executionRatings.length) / 10) * 100) : 0,
      patienceLevel: patienceRatings.length > 0 ? Math.round(((patienceRatings.reduce((sum, r) => sum + r, 0) / patienceRatings.length) / 10) * 100) : 0,
      confidenceIndex: confidenceRatings.length > 0 ? Math.round(((confidenceRatings.reduce((sum, r) => sum + r, 0) / confidenceRatings.length) / 10) * 100) : 0,
      fearGreed: fearGreedRatings.length > 0 ? Math.round(((fearGreedRatings.reduce((sum, r) => sum + r, 0) / fearGreedRatings.length) / 10) * 100) : 50
    };
  }, [trades, selectedDate]);

  // Calculate comparisons
  const metricsWithComparisons = useMemo(() => {
    if (!previousMonthMetrics) return metrics;

    return {
      ...metrics,
      fomoComparison: Math.round(metrics.fomoControl - previousMonthMetrics.fomoControl),
      executionComparison: Math.round(metrics.executionRate - previousMonthMetrics.executionRate),
      patienceComparison: Math.round(metrics.patienceLevel - previousMonthMetrics.patienceLevel),
      confidenceComparison: Math.round(metrics.confidenceIndex - previousMonthMetrics.confidenceIndex),
      fearGreedComparison: Math.round(metrics.fearGreed - previousMonthMetrics.fearGreed)
    };
  }, [metrics, previousMonthMetrics]);

  useEffect(() => {
    if (onMetricsChange && metricsWithComparisons) {
      onMetricsChange(metricsWithComparisons);
    }
  }, [metricsWithComparisons, onMetricsChange]);

  if (loading) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-blue-800/30 to-slate-900/30 rounded-2xl blur-3xl shadow-blue-500/50 animate-pulse"></div>
        <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => <SpeedometerSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-slate-800/30 to-blue-900/30 rounded-2xl blur-3xl shadow-red-500/50"></div>
        <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-red-400 text-center">
            <div className="text-6xl mb-6 animate-shake">⚠️</div>
            <div className="text-xl">Error: {error.message || 'Failed to fetch data'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl transition-all duration-1000 shadow-blue-500/30" />

      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">

        {/* Month Navigation */}
        <MonthNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Trades Count Display */}
        <div className="text-center mb-6">
          <div className="text-sm text-slate-400">
            {filteredTrades.length} trades found for {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <motion.div className="space-y-6 max-w-full mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-6" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <SpeedometerCard
              key={`fomo-${selectedDate.getMonth()}-${selectedDate.getFullYear()}`}
              label="FOMO Control"
              value={metricsWithComparisons.fomoControl}
              color="#ef4444"
              comparison={metricsWithComparisons.fomoComparison}
              isLoading={isLoading || loading}
              animationDelay={0}
            />
            <SpeedometerCard
              key={`execution-${selectedDate.getMonth()}-${selectedDate.getFullYear()}`}
              label="Execution Rate"
              value={metricsWithComparisons.executionRate}
              color="#10b981"
              comparison={metricsWithComparisons.executionComparison}
              isLoading={isLoading || loading}
              animationDelay={300}
            />
            <SpeedometerCard
              key={`patience-${selectedDate.getMonth()}-${selectedDate.getFullYear()}`}
              label="Patience Level"
              value={metricsWithComparisons.patienceLevel}
              color="#3b82f6"
              comparison={metricsWithComparisons.patienceComparison}
              isLoading={isLoading || loading}
              animationDelay={600}
            />
          </motion.div>

          <motion.div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <SpeedometerCard
              key={`confidence-${selectedDate.getMonth()}-${selectedDate.getFullYear()}`}
              label="Confidence Index"
              value={metricsWithComparisons.confidenceIndex}
              color="#f59e0b"
              comparison={metricsWithComparisons.confidenceComparison}
              isLoading={isLoading || loading}
              animationDelay={900}
            />
            <SpeedometerCard
              key={`feargreed-${selectedDate.getMonth()}-${selectedDate.getFullYear()}`}
              label="Fear & Greed"
              value={metricsWithComparisons.fearGreed}
              color="#8b5cf6"
              comparison={metricsWithComparisons.fearGreedComparison}
              isLoading={isLoading || loading}
              animationDelay={1200}
            />
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse-light {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }
        .animate-pulse-light {
          animation: pulse-light 4s infinite ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default SpeedometerGrid;