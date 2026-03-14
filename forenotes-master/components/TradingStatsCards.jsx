'use client'

import React, { useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTrades } from '@/context/TradeContext';
import { motion } from 'framer-motion';

const TradingStatsCards = () => {
  const { trades, loading, error, fetchTrades } = useTrades();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Calculate statistics from trades data
  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        bestTime: { time: '-', avgPnl: 0, count: 0 },
        worstTime: { time: '-', avgPnl: 0, count: 0 },
        mostTradesSession: { session: '-', count: 0, totalPnl: 0 },
        leastTradesSession: { session: '-', count: 0, totalPnl: 0 }
      };
    }

    // Group trades by time (hour) for best/worst time analysis
    const timeStats = trades.reduce((acc, trade) => {
      const time = trade.time || 'Unknown';
      const hour = time.split(':')[0] || 'Unknown';
      if (!acc[hour]) {
        acc[hour] = { trades: [], totalPnl: 0, count: 0 };
      }
      acc[hour].trades.push(trade);
      acc[hour].totalPnl += parseFloat(trade.pnl) || 0;
      acc[hour].count += 1;
      return acc;
    }, {});

    // Group trades by session
    const sessionStats = trades.reduce((acc, trade) => {
      const session = trade.session || 'Unknown';
      if (!acc[session]) {
        acc[session] = { trades: [], totalPnl: 0, count: 0 };
      }
      acc[session].trades.push(trade);
      acc[session].totalPnl += parseFloat(trade.pnl) || 0;
      acc[session].count += 1;
      return acc;
    }, {});

    const timeSummary = Object.entries(timeStats).map(([hour, data]) => ({
      time: hour.length <= 2 ? `${hour}:00` : hour,
      count: data.count,
      totalPnl: data.totalPnl,
      avgPnl: data.totalPnl / data.count
    }));

    const sessionSummary = Object.entries(sessionStats).map(([session, data]) => ({
      session,
      count: data.count,
      totalPnl: data.totalPnl,
      avgPnl: data.totalPnl / data.count
    }));

    const sortedByAvgPnl = [...timeSummary].sort((a, b) => b.avgPnl - a.avgPnl);
    const sortedByCount = [...sessionSummary].sort((a, b) => b.count - a.count);

    return {
      bestTime: sortedByAvgPnl[0] || { time: '-', avgPnl: 0, count: 0 },
      worstTime: sortedByAvgPnl[sortedByAvgPnl.length - 1] || { time: '-', avgPnl: 0, count: 0 },
      mostTradesSession: sortedByCount[0] || { session: '-', count: 0, totalPnl: 0 },
      leastTradesSession: sortedByCount[sortedByCount.length - 1] || { session: '-', count: 0, totalPnl: 0 }
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-[#0d0d0d]/40 backdrop-blur-xl rounded-3xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-6 bg-rose-900/10 p-6 rounded-3xl shadow-lg border border-rose-500/20 backdrop-blur-xl flex items-center justify-center min-h-[100px]">
        <div className="text-rose-400 text-sm font-medium">Error loading statistics: {error}</div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Best Time',
      value: stats.bestTime.time,
      subtitle: `Avg: $${stats.bestTime.avgPnl.toFixed(2)}`,
      detail: `${stats.bestTime.count} trades`,
      icon: TrendingUp,
      color: 'emerald',
      positive: true
    },
    {
      title: 'Worst Time',
      value: stats.worstTime.time,
      subtitle: `Avg: $${stats.worstTime.avgPnl.toFixed(2)}`,
      detail: `${stats.worstTime.count} trades`,
      icon: TrendingDown,
      color: 'rose',
      positive: false
    },
    {
      title: 'Most Trades',
      value: stats.mostTradesSession.count.toString(),
      subtitle: stats.mostTradesSession.session,
      detail: `Total: $${stats.mostTradesSession.totalPnl.toFixed(2)}`,
      icon: BarChart3,
      color: 'blue',
      positive: stats.mostTradesSession.totalPnl >= 0
    },
    {
      title: 'Least Trades',
      value: stats.leastTradesSession.count.toString(),
      subtitle: stats.leastTradesSession.session,
      detail: `Total: $${stats.leastTradesSession.totalPnl.toFixed(2)}`,
      icon: Activity,
      color: 'indigo',
      positive: stats.leastTradesSession.totalPnl >= 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 font-inter">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            className="relative group cursor-pointer"
          >
            {/* Enhanced Background Glow */}
            <div className={`absolute -inset-[2px] bg-gradient-to-br opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 rounded-[2.5rem]
              ${card.color === 'emerald' ? 'from-emerald-500/20 via-teal-500/10 to-transparent' :
                card.color === 'rose' ? 'from-rose-500/20 via-pink-500/10 to-transparent' :
                  card.color === 'blue' ? 'from-blue-500/20 via-indigo-500/10 to-transparent' :
                    'from-indigo-500/20 via-blue-500/10 to-transparent'}`}
            />

            <div className="relative h-full bg-[#0d0d0d]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 overflow-hidden group-hover:border-white/10 transition-all duration-300 shadow-2xl">

              {/* Subtle light streak */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              {/* Micro-pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity duration-500"
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              />

              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br shadow-xl transition-transform duration-500 group-hover:scale-110
                  ${card.color === 'emerald' ? 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10' :
                    card.color === 'rose' ? 'from-rose-500/20 to-rose-500/5 text-rose-400 border border-rose-500/20 shadow-rose-500/10' :
                      card.color === 'blue' ? 'from-blue-500/20 to-blue-500/5 text-blue-400 border border-blue-500/20 shadow-blue-500/10' :
                        'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border border-indigo-500/20 shadow-indigo-500/10'}`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group-hover:bg-opacity-20
                  ${card.positive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.positive ? 'Performance' : 'Risk'}
                </div>
              </div>

              <div className="relative z-10 space-y-1">
                <p className="text-gray-500 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 group-hover:text-gray-400">{card.title}</p>
                <h3 className="text-3xl font-black text-white tracking-tighter transition-transform duration-300 group-hover:translate-x-1">
                  {card.value}
                </h3>
                <div className="flex flex-col gap-0.5 mt-4">
                  <p className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {card.detail}
                  </p>
                </div>
              </div>

              {/* Bottom Glow bar */}
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className={`h-full opacity-40 bg-gradient-to-r 
                    ${card.color === 'emerald' ? 'from-emerald-500 to-teal-400' :
                      card.color === 'rose' ? 'from-rose-500 to-pink-400' :
                        card.color === 'blue' ? 'from-blue-500 to-indigo-400' :
                          'from-indigo-500 to-blue-400'}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TradingStatsCards;
