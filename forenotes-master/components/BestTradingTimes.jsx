'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTrades } from '../context/TradeContext';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Clock, Calendar, RefreshCw, Lock, TrendingUp, TrendingDown } from 'lucide-react';

const BestTradingTimes = () => {
  const [timeView, setTimeView] = useState('hours');
  const [isMobile, setIsMobile] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const { isSignedIn } = useUser();
  const { trades, loading, error, fetchTrades } = useTrades();

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!isSignedIn) return;

      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        if (data.success) {
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [isSignedIn]);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const generateBestTimesData = (trades, viewType) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    if (viewType === 'hours') {
      const timeSlots = {
        '0-2': { name: '0-2', value: 0, count: 0, wins: 0 },
        '2-4': { name: '2-4', value: 0, count: 0, wins: 0 },
        '4-6': { name: '4-6', value: 0, count: 0, wins: 0 },
        '6-8': { name: '6-8', value: 0, count: 0, wins: 0 },
        '8-10': { name: '8-10', value: 0, count: 0, wins: 0 },
        '10-12': { name: '10-12', value: 0, count: 0, wins: 0 },
        '12-14': { name: '12-14', value: 0, count: 0, wins: 0 },
        '14-16': { name: '14-16', value: 0, count: 0, wins: 0 },
        '16-18': { name: '16-18', value: 0, count: 0, wins: 0 },
        '18-20': { name: '18-20', value: 0, count: 0, wins: 0 },
        '20-22': { name: '20-22', value: 0, count: 0, wins: 0 },
        '22-24': { name: '22-24', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.time) {
          const time = trade.time;
          let hour = 0;

          if (time.includes(':')) {
            const timeParts = time.split(':');
            hour = parseInt(timeParts[0]);

            if (time.toLowerCase().includes('pm') && hour !== 12) {
              hour += 12;
            } else if (time.toLowerCase().includes('am') && hour === 12) {
              hour = 0;
            }
          } else if (typeof time === 'number') {
            hour = time;
          }

          let slot = '';
          if (hour >= 0 && hour < 2) slot = '0-2';
          else if (hour >= 2 && hour < 4) slot = '2-4';
          else if (hour >= 4 && hour < 6) slot = '4-6';
          else if (hour >= 6 && hour < 8) slot = '6-8';
          else if (hour >= 8 && hour < 10) slot = '8-10';
          else if (hour >= 10 && hour < 12) slot = '10-12';
          else if (hour >= 12 && hour < 14) slot = '12-14';
          else if (hour >= 14 && hour < 16) slot = '14-16';
          else if (hour >= 16 && hour < 18) slot = '16-18';
          else if (hour >= 18 && hour < 20) slot = '18-20';
          else if (hour >= 20 && hour < 22) slot = '20-22';
          else if (hour >= 22 && hour < 24) slot = '22-24';

          if (slot && timeSlots[slot]) {
            const pnl = parseFloat(trade.pnl) || 0;
            timeSlots[slot].value += pnl;
            timeSlots[slot].count += 1;
            if (pnl > 0) {
              timeSlots[slot].wins += 1;
            }
          }
        }
      });

      return Object.values(timeSlots);
    } else {
      const daysData = {
        'Mon': { name: 'Mon', value: 0, count: 0, wins: 0 },
        'Tue': { name: 'Tue', value: 0, count: 0, wins: 0 },
        'Wed': { name: 'Wed', value: 0, count: 0, wins: 0 },
        'Thu': { name: 'Thu', value: 0, count: 0, wins: 0 },
        'Fri': { name: 'Fri', value: 0, count: 0, wins: 0 }
      };

      trades.forEach(trade => {
        if (trade.date) {
          const tradeDate = new Date(trade.date);
          if (!isNaN(tradeDate.getTime())) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[tradeDate.getDay()];

            if (daysData[dayName]) {
              const pnl = parseFloat(trade.pnl) || 0;
              daysData[dayName].value += pnl;
              daysData[dayName].count += 1;
              if (pnl > 0) {
                daysData[dayName].wins += 1;
              }
            }
          }
        }
      });

      return Object.values(daysData);
    }
  };

  const bestTimesData = useMemo(() => {
    return generateBestTimesData(trades, timeView);
  }, [trades, timeView]);

  const handleRefresh = () => {
    fetchTrades();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.value >= 0;
      const winRate = data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : '0.0';

      return (
        <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
          <div className="space-y-2">
            <div className="font-bold text-white border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
              {timeView === 'hours' ? <Clock className="w-4 h-4 text-gray-400" /> : <Calendar className="w-4 h-4 text-gray-400" />}
              <span>{timeView === 'hours' ? 'Time Slot:' : 'Day:'} {label}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <span className="text-gray-400">Total P&L:</span>
              <span className={`font-bold text-right ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{data.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>

              <span className="text-gray-400">Trades:</span>
              <span className="text-white font-medium text-right">{data.count}</span>

              <span className="text-gray-400">Win Rate:</span>
              <span className={`font-bold text-right ${parseFloat(winRate) >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {winRate}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className="w-full mt-6">
        <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
                <div className="h-6 w-48 bg-white/5 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="w-20 h-8 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-[350px] w-full bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-6 bg-rose-900/10 p-6 rounded-3xl shadow-lg border border-rose-500/20 backdrop-blur-xl flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-rose-400 text-lg mb-4">Error loading data: {error}</div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/30 transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const totalTrades = bestTimesData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="w-full min-h-auto relative group mt-6 font-inter">
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">

        {/* Subtle light streak */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/5 text-cyan-400 border border-cyan-500/20 shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Time Analysis</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Best Trading Times
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setTimeView('hours')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${timeView === 'hours'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Hours
              </button>
              <button
                onClick={() => setTimeView('days')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${timeView === 'days'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                Days
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 cursor-pointer"
              title="Refresh data"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs text-gray-400 font-medium">Positive P&L</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <span className="text-xs text-gray-400 font-medium">Negative P&L</span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative z-10 h-[350px] sm:h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bestTimesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={timeView === 'hours' ? -45 : 0}
                textAnchor={timeView === 'hours' ? 'end' : 'middle'}
                height={60}
                interval={0}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="value"
                radius={[4, 4, 4, 4]}
                animationDuration={1500}
                barSize={isMobile ? 20 : 40}
              >
                {bestTimesData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient-${index})`}
                    stroke={entry.value >= 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)"}
                  />
                ))}
              </Bar>
              <defs>
                {bestTimesData.map((entry, index) => (
                  <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.value >= 0 ? "#10B981" : "#F43F5E"} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={entry.value >= 0 ? "#059669" : "#9F1239"} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trial Lock Overlay */}
        {subscriptionStatus?.isInTrial && (
          <div className="absolute inset-0 bg-[#0d0d0d]/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center p-8 max-w-md bg-[#0d0d0d]/90 border border-white/10 rounded-3xl shadow-2xl">
              <div className="mb-6 inline-flex p-4 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium Feature Locked</h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Best Trading Times analysis is available with a paid subscription. Upgrade to unlock this feature and optimize your schedule!
              </p>
              <Link
                href="/subscription"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 border border-white/10"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestTradingTimes;
