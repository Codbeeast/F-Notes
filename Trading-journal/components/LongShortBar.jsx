'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTrades } from "@/context/TradeContext";

// Single 3D Bar with Long/Short segments
const UnifiedBar = ({ longPercentage, shortPercentage }) => {
  const [animatedLong, setAnimatedLong] = useState(0);
  const [animatedShort, setAnimatedShort] = useState(0);

  // Smooth animation
  useEffect(() => {
    let animationId;
    const animate = () => {
      setAnimatedLong(prev => {
        const target = longPercentage;
        const newValue = prev + (target - prev) * 0.08;
        return Math.abs(newValue - target) < 0.1 ? target : newValue;
      });
      setAnimatedShort(prev => {
        const target = shortPercentage;
        const newValue = prev + (target - prev) * 0.08;
        return Math.abs(newValue - target) < 0.1 ? target : newValue;
      });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [longPercentage, shortPercentage]);

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-0">

      {/* Single unified bar container */}
      <div className="relative h-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:border-white/20 transition-all">
        {/* Background glow */}

        {/* Long segment (left side) */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-2xl transition-all duration-500 ease-out"
          style={{ width: `${animatedLong}%` }}
        >
          {/* Subtle sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

          {/* Long percentage text */}
          {animatedLong > 15 && (
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md tracking-tight">
              {Math.round(animatedLong)}%
            </div>
          )}
        </div>

        {/* Short segment (right side) */}
        <div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-rose-500 to-pink-500 rounded-r-2xl transition-all duration-500 ease-out"
          style={{ width: `${animatedShort}%` }}
        >
          {/* Subtle sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

          {/* Short percentage text */}
          {animatedShort > 15 && (
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md tracking-tight">
              {Math.round(animatedShort)}%
            </div>
          )}
        </div>

        {/* Center divider line */}
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-black/20 z-10"
          style={{ left: `${animatedLong}%` }}
        />
      </div>
    </div>
  );
};

// Skeleton Loader for Long/Short Bar
const LongShortSkeleton = () => {
  return (
    <div className="flex flex-col w-full items-center p-6 md:p-8 bg-[#0d0d0d]/80 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl mx-auto mt-6">
      <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg mb-4"></div>

      <div className="w-full mb-6 bg-white/5 rounded-2xl p-6 border border-white/5">
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg mx-auto mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-white/5 animate-pulse rounded-xl"></div>
          <div className="h-16 bg-white/5 animate-pulse rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

// Main component with dynamic data fetching
const LongShortBar3D = () => {
  const { trades, loading, error, fetchTrades } = useTrades();
  const [longTrades, setLongTrades] = useState(0);
  const [shortTrades, setShortTrades] = useState(0);
  const [longPercentage, setLongPercentage] = useState(0);
  const [shortPercentage, setShortPercentage] = useState(0);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    if (trades && trades.length > 0) {
      // Calculate long/short trades from actual data using positionType field
      const longTradesCount = trades.filter(trade =>
        trade.positionType && trade.positionType.toLowerCase() === 'long'
      ).length;

      const shortTradesCount = trades.filter(trade =>
        trade.positionType && trade.positionType.toLowerCase() === 'short'
      ).length;

      const totalTrades = longTradesCount + shortTradesCount;

      if (totalTrades > 0) {
        const longPct = (longTradesCount / totalTrades) * 100;
        const shortPct = (shortTradesCount / totalTrades) * 100;

        setLongTrades(longTradesCount);
        setShortTrades(shortTradesCount);
        setLongPercentage(longPct);
        setShortPercentage(shortPct);
      }
    }
  }, [trades]);

  if (loading) {
    return (
      <div className="w-full mt-6">
        <LongShortSkeleton />
      </div>
    );
  }

  if (error) {
    return null; // Silently fail or minimal error UI to avoid breaking dashboard layout
  }

  const totalTrades = longTrades + shortTrades;

  if (totalTrades === 0) {
    return null;
  }

  return (
    <div className="relative group mt-6 font-inter">
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-rose-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">
        {/* Subtle light streak */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="flex flex-col mb-8 relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400 border border-blue-500/20 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scale"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></svg>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Distribution</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Long vs Short Ratio
              </h2>
            </div>
          </div>
        </div>

        {/* Unified Bar */}
        <div className="mb-8 relative z-10">
          <UnifiedBar longPercentage={longPercentage} shortPercentage={shortPercentage} />

          <div className="flex justify-between mt-3 px-1 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              Long Side
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              Short Side
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* Total Trades - Highlighted */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-center items-center text-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Executions</p>
            <p className="text-3xl font-bold text-white tracking-tight">{totalTrades}</p>
          </div>

          {/* Long Stats */}
          <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors flex flex-col justify-center items-center text-center group/long">
            <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-wider mb-1 group-hover/long:text-emerald-400 transition-colors">Longs</p>
            <p className="text-2xl font-bold text-emerald-400/90">{longTrades}</p>
          </div>

          {/* Short Stats */}
          <div className="bg-rose-500/5 rounded-2xl p-4 border border-rose-500/10 hover:border-rose-500/20 transition-colors flex flex-col justify-center items-center text-center group/short">
            <p className="text-rose-500/60 text-xs font-bold uppercase tracking-wider mb-1 group-hover/short:text-rose-400 transition-colors">Shorts</p>
            <p className="text-2xl font-bold text-rose-400/90">{shortTrades}</p>
          </div>
        </div>

        {/* Footer Ratios */}
        <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
          <div className="bg-[#0a0a0a]/40 rounded-xl p-3 border border-white/5 flex items-center justify-between px-5">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Dominance</span>
            <span className={`text-sm font-bold ${longPercentage > shortPercentage ? 'text-emerald-400' : 'text-rose-400'}`}>
              {longPercentage > shortPercentage ? 'LONG' : shortPercentage > longPercentage ? 'SHORT' : 'EQUAL'}
            </span>
          </div>
          <div className="bg-[#0a0a0a]/40 rounded-xl p-3 border border-white/5 flex items-center justify-between px-5">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Ratio</span>
            <span className="text-sm font-bold text-white font-mono">
              {shortTrades > 0 ? (longTrades / shortTrades).toFixed(2) : '∞'}<span className="text-gray-600">:</span>1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongShortBar3D;
