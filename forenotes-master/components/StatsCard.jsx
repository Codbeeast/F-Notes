"use client"
import React, { useCallback } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrades } from '../context/TradeContext';

const StatsCards = ({ trades: tradesProp }) => {
  const { trades: contextTrades, loading, error } = useTrades();
  const trades = tradesProp !== undefined ? tradesProp : contextTrades;

  const calculateOverallStats = useCallback(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return {
        totalPnL: 0, totalTrades: 0, winRate: 0, totalPips: 0,
        wins: 0, losses: 0, currentYearPnL: 0, currentYearTrades: 0,
        currentYearWins: 0, currentYearLosses: 0
      };
    }

    let totalPnL = 0;
    let totalTrades = 0;
    let wins = 0;
    let losses = 0;
    const totalPips = trades.reduce((sum, trade) => sum + (trade.pipsLost || 0), 0);

    let currentYearPnL = 0;
    let currentYearTrades = 0;
    let currentYearWins = 0;
    let currentYearLosses = 0;
    const currentYear = new Date().getFullYear();

    trades.forEach(trade => {
      const pnl = parseFloat(trade.pnl) || 0;
      totalTrades += 1;
      totalPnL += pnl;

      if (pnl > 0) wins += 1;
      else if (pnl < 0) losses += 1;

      if (trade.date) {
        const tradeDate = new Date(trade.date);
        if (!isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === currentYear) {
          currentYearTrades += 1;
          currentYearPnL += pnl;
          if (pnl > 0) currentYearWins += 1;
          else if (pnl < 0) currentYearLosses += 1;
        }
      }
    });

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    return {
      totalPnL, totalTrades, winRate, totalPips, wins, losses,
      currentYearPnL, currentYearTrades, currentYearWins, currentYearLosses
    };
  }, [trades]);

  const overallStats = calculateOverallStats();

  const statsCards = [
    {
      label: 'Total P&L (YTD)',
      value: `$${overallStats.currentYearPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: overallStats.currentYearPnL >= 0 ? 'Profit' : 'Loss',
      subInfo: `${overallStats.currentYearWins}W / ${overallStats.currentYearLosses}L`,
      icon: DollarSign,
      color: overallStats.currentYearPnL >= 0 ? 'emerald' : 'rose',
      positive: overallStats.currentYearPnL >= 0
    },
    {
      label: 'Total Trades',
      value: overallStats.totalTrades,
      change: 'Lifetime Activity',
      subInfo: `Avg P&L: $${(overallStats.totalTrades > 0 ? overallStats.totalPnL / overallStats.totalTrades : 0).toFixed(2)}`,
      icon: Activity,
      color: 'blue',
      positive: true
    },
    {
      label: 'Win Rate',
      value: `${overallStats.winRate.toFixed(1)}%`,
      change: overallStats.winRate >= 50 ? 'Strong Edge' : 'Needs Focus',
      subInfo: `${overallStats.wins} Wins in ${overallStats.totalTrades} trades`,
      icon: TrendingUp,
      color: overallStats.winRate >= 50 ? 'indigo' : 'orange',
      positive: overallStats.winRate >= 50
    },
    {
      label: 'Pip Count',
      value: `${overallStats.totalPips.toLocaleString()} Pips`,
      change: overallStats.totalPips >= 0 ? 'Positive Gain' : 'Net Loss',
      subInfo: 'Across all executions',
      icon: Calculator,
      color: overallStats.totalPips >= 0 ? 'amber' : 'rose',
      positive: overallStats.totalPips >= 0
    }
  ];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-inter">
      {statsCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="relative group cursor-default"
        >
          {/* Background Glow */}
          <div className={`absolute -inset-px bg-gradient-to-br opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 rounded-2xl
            ${stat.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
              stat.color === 'rose' ? 'from-rose-500 to-pink-500' :
                stat.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                  stat.color === 'indigo' ? 'from-indigo-500 to-purple-500' :
                    stat.color === 'orange' ? 'from-orange-500 to-amber-500' :
                      'from-amber-500 to-yellow-500'}`}
          />

          <div className="relative h-full bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 overflow-hidden group-hover:border-white/20 transition-all duration-300">
            {/* Subtle light streak */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br shadow-lg
                ${stat.color === 'emerald' ? 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' :
                  stat.color === 'rose' ? 'from-rose-500/20 to-rose-500/5 text-rose-400 border border-rose-500/20' :
                    stat.color === 'blue' ? 'from-blue-500/20 to-blue-500/5 text-blue-400 border border-blue-500/20' :
                      stat.color === 'indigo' ? 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border border-indigo-500/20' :
                        stat.color === 'orange' ? 'from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-500/20' :
                          'from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/20'}`}>
                <stat.icon className="w-5 h-5" />
              </div>

              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${stat.positive
                  ? 'bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400/90 border border-rose-500/20'}`}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${stat.positive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                {stat.subInfo}
              </p>
            </div>

            {/* Subtle Progress indicator detail */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full opacity-30 bg-gradient-to-r 
                  ${stat.color === 'emerald' ? 'from-emerald-500 to-teal-500' :
                    stat.color === 'rose' ? 'from-rose-500 to-pink-500' :
                      stat.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                        stat.color === 'indigo' ? 'from-indigo-500 to-purple-500' :
                          stat.color === 'orange' ? 'from-orange-500 to-amber-500' :
                            'from-amber-500 to-yellow-500'}`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;

