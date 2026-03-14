"use client"
import React, { useCallback } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Calculator } from 'lucide-react';
import { useTrades } from '../context/TradeContext'; // Use the centralized context

const QuarterlyAnalysis = () => {
  // Use the centralized trade context instead of separate fetch
  const { trades, loading, error } = useTrades();

  // Generate quarterly data
  const generateQuarterlyData = useCallback(() => {
    if (!trades.length) return [];

    const quarters = {
      Q1: { name: 'Q1', months: ['Jan', 'Feb', 'Mar'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 },
      Q2: { name: 'Q2', months: ['Apr', 'May', 'Jun'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 },
      Q3: { name: 'Q3', months: ['Jul', 'Aug', 'Sep'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 },
      Q4: { name: 'Q4', months: ['Oct', 'Nov', 'Dec'], taken: 0, wins: 0, winRate: 0, totalPips: 0, totalPnl: 0 }
    };

    trades.forEach(trade => {
      if (trade.date) {
        const tradeDate = new Date(trade.date);
        const month = tradeDate.getMonth();

        let quarter = '';
        if (month >= 0 && month <= 2) quarter = 'Q1';
        else if (month >= 3 && month <= 5) quarter = 'Q2';
        else if (month >= 6 && month <= 8) quarter = 'Q3';
        else if (month >= 9 && month <= 11) quarter = 'Q4';

        if (quarter && quarters[quarter]) {
          quarters[quarter].taken += 1;
          if ((trade.pnl || 0) > 0) {
            quarters[quarter].wins += 1;
          }

          // FIXED: Use the correct field name from your schema
          if (typeof trade.pipsLost === 'number') {
            quarters[quarter].totalPips += trade.pipsLost;
          }

          // Add PnL
          quarters[quarter].totalPnl += (trade.pnl || 0);
        }
      }
    });

    // Calculate win rates
    Object.values(quarters).forEach(quarter => {
      quarter.winRate = quarter.taken > 0 ? (quarter.wins / quarter.taken) * 100 : 0;
    });

    return Object.values(quarters);
  }, [trades]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-xl blur-xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="col-span-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-400 opacity-20 rounded-xl blur-xl"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="text-red-400 text-center">
              <p className="text-xl font-semibold">Error loading quarterly data</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quarterlyData = generateQuarterlyData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {quarterlyData.map((quarter, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/40 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
        >
          {/* Subtle Gradient Glow Effect */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{quarter.name}</h3>
                <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">{quarter.months.join(' • ')}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-4">

              {/* Win Rate Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-400">Win Rate</span>
                  <span className={`text-lg font-bold ${quarter.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quarter.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${quarter.winRate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${quarter.winRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Trades Taken */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-gray-400">Trades</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{quarter.taken}</p>
                </div>

                {/* Total Pips */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    {quarter.totalPips >= 0 ?
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    }
                    <span className="text-xs text-gray-400">Pips</span>
                  </div>
                  <p className={`text-lg font-semibold ${quarter.totalPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quarter.totalPips > 0 ? '+' : ''}{quarter.totalPips.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Total PnL */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Net Profit</span>
                  </div>
                  <p className={`text-xl font-bold tracking-tight ${quarter.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${quarter.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuarterlyAnalysis;
