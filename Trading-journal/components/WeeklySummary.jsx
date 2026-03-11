import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react'; // Import TrendingDown

const WeeklySummary = ({ weekNumber, weekStartDate, weekEndDate, tradeHistory }) => {
  const weeklyTrades = useMemo(() => {
    if (!weekStartDate || !weekEndDate) return [];

    const start = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
    const end = new Date(weekEndDate.getFullYear(), weekEndDate.getMonth(), weekEndDate.getDate());
    end.setHours(23, 59, 59, 999); // Include trades up to the end of the end date

    return tradeHistory.filter(trade => {
      const tradeDate = new Date(trade.date);
      // Ensure tradeDate is compared based on its date component only
      const tradeDateOnly = new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate());
      return tradeDateOnly >= start && tradeDateOnly <= end;
    });
  }, [weekStartDate, weekEndDate, tradeHistory]);

  const totalPnl = weeklyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalPips = weeklyTrades.reduce((sum, trade) => sum + (trade.pipsLost || 0), 0);
  const winRate = weeklyTrades.length > 0
    ? (weeklyTrades.filter(t => (t.pnl || 0) > 0).length / weeklyTrades.length) * 100
    : 0;
  const isProfitWeek = totalPnl > 0;
  const hasTrades = weeklyTrades.length > 0;

  // Define color classes based on profit/loss
  const profitBgClass = 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/10';
  const profitTextColor = 'text-emerald-400';
  const profitAccentColor = 'bg-emerald-500';

  // UPDATED FOR DARK RED LOSSES (border, text, and accent)
  const lossBgClass = 'from-rose-500/10 to-pink-500/5 border-rose-500/20 shadow-lg shadow-rose-500/10'; // Darker red background and border
  const lossTextColor = 'text-rose-400'; // Red text for overall loss
  const lossAccentColor = 'bg-rose-500'; // Darker red accent color

  const neutralBgClass = 'bg-white/5 border-white/5 shadow-none';
  const neutralTextColor = 'text-gray-400';
  const neutralAccentColor = 'bg-gray-700';

  // Format dates for display
  const startDateStr = weekStartDate ? weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const endDateStr = weekEndDate ? weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div className={`
      relative p-4 w-full rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl
      ${hasTrades
        ? (isProfitWeek ? profitBgClass : lossBgClass)
        : neutralBgClass
      }
      backdrop-blur-xl h-full flex flex-col justify-between overflow-hidden
    `}>
      {/* Decorative background elements */}
      <div className={`absolute inset-0 opacity-10 ${hasTrades ? (isProfitWeek ? profitAccentColor : lossAccentColor) : neutralAccentColor} blur-xl rounded-full scale-150`}></div>
      <div className={`absolute top-0 right-0 w-12 h-12 rounded-full ${hasTrades ? (isProfitWeek ? profitAccentColor : lossAccentColor) : neutralAccentColor} blur-md opacity-20 transform translate-x-1/2 -translate-y-1/2`}></div>
      <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full ${hasTrades ? (isProfitWeek ? profitAccentColor : lossAccentColor) : neutralAccentColor} blur-md opacity-15 transform -translate-x-1/2 translate-y-1/2`}></div>

      <div className="relative z-10 flex items-center justify-between mb-3">
        <h4 className={`text-sm sm:text-base font-bold ${hasTrades ? (isProfitWeek ? profitTextColor : lossTextColor) : neutralTextColor}`}>
          Week {weekNumber}
        </h4>
        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {startDateStr} - {endDateStr}
        </span>
      </div>

      {!hasTrades ? (
        <div className="relative z-10 text-center text-gray-500 text-sm italic py-4 flex flex-col items-center justify-center h-full">
          <Calendar className="w-8 h-8 mb-2 text-gray-600/70" />
          No trades this week
        </div>
      ) : (
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between p-1 bg-gray-800/50 rounded-md border border-gray-700/30">
            <div className="flex items-center space-x-2 text-gray-300">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">P&L</span>
            </div>
            <span className={`text-base font-bold ${isProfitWeek ? profitTextColor : lossTextColor}`}>
              ${totalPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between p-1 bg-gray-800/50 rounded-md border border-gray-700/30">
            <div className="flex items-center space-x-2 text-gray-300">
              {/* Conditional rendering for Pips arrow */}
              {totalPips >= 0 ? (
                <TrendingUp className="w-4 h-4 text-blue-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" /> // Red for downward arrow
              )}
              <span className="text-sm font-medium">Pips</span>
            </div>
            <span className={`text-base font-bold ${totalPips >= 0 ? profitTextColor : lossTextColor}`}>
              {totalPips > 0 ? '+' : ''}{totalPips}
            </span>
          </div>
          <div className="flex items-center justify-between p-1 bg-gray-800/50 rounded-md border border-gray-700/30">
            <div className="flex items-center space-x-2 text-gray-300">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            {/* Conditional text color for Win Rate */}
            <span className={`text-base font-bold ${winRate > 0 ? 'text-purple-400' : lossTextColor}`}>
              {winRate.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;
