"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Waves, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useTrades } from '../context/TradeContext';

const TradeStatistics = () => {
  const { trades, loading, error } = useTrades();

  const tradeStatistics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return [
        { label: 'Biggest Win', value: '0.00', color: 'emerald', icon: Trophy, currency: true },
        { label: 'Biggest Loss', value: '0.00', color: 'rose', icon: TrendingDown, currency: true },
        { label: 'Consecutive Wins', value: '0', color: 'blue', icon: Zap },
        { label: 'Consecutive Losses', value: '0', color: 'orange', icon: Waves },
        { label: 'Average Win', value: '0.00', color: 'indigo', icon: TrendingUp, currency: true },
        { label: 'Average Loss', value: '0.00', color: 'pink', icon: Target, currency: true },
      ];
    }

    let biggestWin = 0;
    let biggestLoss = 0;
    let currentConsecWins = 0, maxConsecWins = 0;
    let currentConsecLosses = 0, maxConsecLosses = 0;
    let totalWinsPnl = 0, winCount = 0;
    let totalLossesPnl = 0, lossCount = 0;

    trades.forEach(trade => {
      const pnl = parseFloat(trade.pnl) || 0;
      if (pnl > biggestWin) biggestWin = pnl;
      if (pnl < biggestLoss) biggestLoss = pnl;

      if (pnl > 0) {
        currentConsecWins++;
        currentConsecLosses = 0;
        totalWinsPnl += pnl;
        winCount++;
      } else if (pnl < 0) {
        currentConsecLosses++;
        currentConsecWins = 0;
        totalLossesPnl += pnl;
        lossCount++;
      } else {
        currentConsecWins = 0;
        currentConsecLosses = 0;
      }

      if (currentConsecWins > maxConsecWins) maxConsecWins = currentConsecWins;
      if (currentConsecLosses > maxConsecLosses) maxConsecLosses = currentConsecLosses;
    });

    const avgWin = winCount > 0 ? (totalWinsPnl / winCount) : 0;
    const avgLoss = lossCount > 0 ? (totalLossesPnl / lossCount) : 0;

    return [
      { label: 'Biggest Win', value: biggestWin.toFixed(2), color: 'emerald', icon: Trophy, currency: true },
      { label: 'Biggest Loss', value: biggestLoss.toFixed(2), color: 'rose', icon: TrendingDown, currency: true },
      { label: 'Consec Wins', value: maxConsecWins.toString(), color: 'blue', icon: Zap },
      { label: 'Consec Losses', value: maxConsecLosses.toString(), color: 'orange', icon: Waves },
      { label: 'Average Win', value: avgWin.toFixed(2), color: 'indigo', icon: TrendingUp, currency: true },
      { label: 'Average Loss', value: avgLoss.toFixed(2), color: 'pink', icon: Target, currency: true },
    ];
  }, [trades]);

  if (loading) return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 mt-4 font-inter">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Trade Performance Insights
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {tradeStatistics.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative group cursor-default"
          >
            {/* Ambient Glow */}
            <div className={`absolute -inset-px bg-gradient-to-br opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500 rounded-2xl
              ${stat.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                stat.color === 'rose' ? 'from-rose-500 to-red-500' :
                  stat.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                    stat.color === 'indigo' ? 'from-indigo-500 to-purple-500' :
                      stat.color === 'orange' ? 'from-orange-500 to-yellow-500' :
                        'from-pink-500 to-rose-500'}`}
            />

            <div className={`relative h-full bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 overflow-hidden transition-all duration-300
              ${stat.color === 'emerald' ? 'group-hover:border-emerald-500/30' :
                stat.color === 'rose' ? 'group-hover:border-rose-500/30' :
                  stat.color === 'blue' ? 'group-hover:border-blue-500/30' :
                    stat.color === 'indigo' ? 'group-hover:border-indigo-500/30' :
                      stat.color === 'orange' ? 'group-hover:border-orange-500/30' :
                        'group-hover:border-pink-500/30'}`}>
              <div className="flex items-center gap-3 mb-3 text-xs font-bold tracking-widest uppercase text-gray-300">
                <div className={`p-2 rounded-xl bg-gradient-to-br shadow-inner
                  ${stat.color === 'emerald' ? 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' :
                    stat.color === 'rose' ? 'from-rose-500/20 to-rose-500/5 text-rose-400 border border-rose-500/20' :
                      stat.color === 'blue' ? 'from-blue-500/20 to-blue-500/5 text-blue-400 border border-blue-500/20' :
                        stat.color === 'indigo' ? 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border border-indigo-500/20' :
                          stat.color === 'orange' ? 'from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-500/20' :
                            'from-pink-500/20 to-pink-500/5 text-pink-400 border border-pink-500/20'}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                {stat.label}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-baseline">
                  {stat.currency && <span className="text-gray-500 font-medium text-lg mr-1">$</span>}
                  <span className="tabular-nums tracking-tighter text-3xl">
                    {stat.value.split('.')[0]}
                  </span>
                  {stat.value.includes('.') && (
                    <span className="text-lg text-gray-500 font-medium ml-0.5">
                      .{stat.value.split('.')[1]}
                    </span>
                  )}
                </h3>
              </div>

              {/* Progress Detail Line */}
              <div className={`mt-3 h-[1px] w-full bg-white/5 relative overflow-hidden`}>
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TradeStatistics;