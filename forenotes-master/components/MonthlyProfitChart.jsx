"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, BarChart3, Info } from 'lucide-react';
import { useTrades } from '../context/TradeContext';

const MonthlyProfitChart = () => {
  const { trades, loading, error, fetchTrades } = useTrades();

  const monthlyProfitData = useMemo(() => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return { monthlyData: [], ytdAverage: 0, ytdTotal: 0, year: new Date().getFullYear(), totalTrades: 0 };
    }

    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    months.forEach(month => {
      monthlyData[month] = { name: month, profit: 0, trades: 0, percentage: 0 };
    });

    let totalProfit = 0;
    let totalTrades = 0;
    const baseCapital = 10000;

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        if (!isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === currentYear) {
          const month = months[tradeDate.getMonth()];
          const pnl = parseFloat(trade.pnl) || 0;
          if (monthlyData[month]) {
            monthlyData[month].profit += pnl;
            monthlyData[month].trades += 1;
            totalProfit += pnl;
            totalTrades += 1;
          }
        }
      }
    });

    Object.values(monthlyData).forEach(month => {
      month.percentage = month.trades > 0 ? (month.profit / baseCapital) * 100 : 0;
    });

    return {
      monthlyData: Object.values(monthlyData),
      ytdAverage: totalTrades > 0 ? (totalProfit / baseCapital) * 100 : 0,
      ytdTotal: totalProfit,
      year: currentYear,
      totalTrades: totalTrades
    };
  }, [trades]);

  const getCellStyles = (percentage) => {
    if (percentage > 0) return 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40';
    if (percentage < 0) return 'bg-gradient-to-br from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20 hover:border-rose-500/40';
    return 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10';
  };

  if (loading) return (
    <div className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/10 mt-6" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group mt-6 font-inter"
    >
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">
        {/* Subtle light streak */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Performance</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Monthly Profit
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {monthlyProfitData.year}</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>Base: $10,000</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border text-xs font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-2
              ${monthlyProfitData.ytdTotal >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <span>YTD Return</span>
              <span className="text-sm">
                {monthlyProfitData.ytdAverage.toFixed(2)}%
              </span>
            </div>

            <button
              onClick={fetchTrades}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all group/btn"
              title="Sync Analytics"
            >
              <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10 custom-scrollbar pb-2">
          <div className="grid grid-cols-13 min-w-[1000px] gap-3">
            {/* Year Label */}
            <div className="flex items-center justify-center font-bold text-gray-500 text-sm py-4 bg-white/5 rounded-2xl border border-white/5">
              {monthlyProfitData.year}
            </div>

            {/* Monthly Cells */}
            {monthlyProfitData.monthlyData.map((month, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-300 cursor-default group/cell relative overflow-hidden
                  ${getCellStyles(month.percentage)}`}
              >
                {/* Subtle sheen effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2 z-10">{month.name}</span>
                <span className="text-sm font-bold tracking-tight z-10">
                  {month.percentage === 0 ? '0.00' : month.percentage.toFixed(2)}%
                </span>

                {/* Progress bar */}
                <div className="mt-2 w-full h-[2px] bg-white/10 rounded-full overflow-hidden opacity-0 group-hover/cell:opacity-100 transition-opacity z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    className={`h-full ${month.percentage >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  />
                </div>
              </motion.div>
            ))}

            {/* YTD Cell */}
            <div className="flex flex-col items-center justify-between p-3 rounded-2xl border bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group/ytd">
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/ytd:opacity-100 transition-opacity duration-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2 z-10">YTD</span>
              <span className="text-sm font-extrabold tracking-tight z-10">
                {monthlyProfitData.ytdAverage.toFixed(2)}%
              </span>
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse z-10" />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5 text-[10px] font-medium text-gray-500 uppercase tracking-widest relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Loss</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <Info className="w-3 h-3" />
            <span>Real-time Analysis</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-cols-13 {
          grid-template-columns: 60px repeat(12, 1fr) 80px;
        }
      `}</style>
    </motion.div>
  );
};

export default MonthlyProfitChart;

