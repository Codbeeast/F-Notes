'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTrades } from '../context/TradeContext';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { GitMerge, RefreshCw, Lock, TrendingUp } from 'lucide-react';

const ConfluenceAnalysis = () => {
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

  const truncateText = (text, maxLength = 12) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const generateConfluenceData = (trades) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) return [];

    const confluenceData = {};

    trades.forEach(trade => {
      if (trade.confluences) {
        let rawConfluences = Array.isArray(trade.confluences)
          ? trade.confluences
          : (typeof trade.confluences === 'string' ? trade.confluences.split(',') : []);

        const confluences = [];
        rawConfluences.forEach(c => {
          if (typeof c === 'string') {
            c.split(',').forEach(part => {
              const trimmed = part.trim();
              if (trimmed) confluences.push(trimmed);
            });
          }
        });

        confluences.forEach(confluence => {
          if (!confluenceData[confluence]) {
            confluenceData[confluence] = {
              name: confluence,
              displayName: truncateText(confluence),
              value: 0,
              wins: 0,
              losses: 0,
              totalPnl: 0
            };
          }
          confluenceData[confluence].value += 1;
          confluenceData[confluence].totalPnl += parseFloat(trade.pnl) || 0;
          if ((parseFloat(trade.pnl) || 0) > 0) {
            confluenceData[confluence].wins += 1;
          } else {
            confluenceData[confluence].losses += 1;
          }
        });
      }
    });

    return Object.values(confluenceData)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map(item => ({
        ...item,
        winRate: item.value > 0 ? parseFloat(((item.wins / item.value) * 100).toFixed(1)) : 0
      }));
  };

  const confluenceData = useMemo(() => {
    return generateConfluenceData(trades);
  }, [trades]);

  const handleRefresh = () => {
    fetchTrades();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = confluenceData.find(d => d.displayName === label);
      return (
        <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
          <div className="space-y-2">
            <div className="font-bold text-white border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-400" />
              <span>{item?.name || label}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <span className="text-gray-400">Trades:</span>
              <span className="text-white font-medium text-right">{item?.value || 0}</span>

              <span className="text-gray-400">Win Rate:</span>
              <span className="text-emerald-400 font-bold text-right">{payload[0]?.value || '0'}%</span>

              <span className="text-gray-400">Total P&L:</span>
              <span className={`font-bold text-right ${item?.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${item?.totalPnl?.toFixed(2) || '0.00'}
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

  const totalTrades = confluenceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full min-h-auto relative group mt-6 font-inter">
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 text-emerald-400 border border-emerald-500/20 shadow-lg">
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Strategy Insights</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Top Confluences
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-300">
                <span className="text-white font-bold">{totalTrades}</span> trades analyzed
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300"
              title="Refresh data"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative z-10 h-[350px] sm:h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confluenceData} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="displayName"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="winRate"
                radius={[6, 6, 0, 0]}
                animationDuration={1800}
                barSize={isMobile ? 30 : 45}
              >
                {confluenceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient-${index})`}
                    stroke="rgba(16, 185, 129, 0.2)"
                  />
                ))}
              </Bar>
              <defs>
                {confluenceData.map((entry, index) => (
                  <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.1} />
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
                Top Confluences analysis is available with a paid subscription. Upgrade to unlock this feature and gain deeper insights!
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

export default ConfluenceAnalysis;
