"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTrades } from '../context/TradeContext';
import { ChevronDown, Filter, Settings, Info } from 'lucide-react';

const DailyTrades = ({ trades }) => {
  const { trades: contextTrades, loading, error } = useTrades();

  // Use trades from props if available, otherwise context
  const activeTrades = trades || contextTrades;
  const [tradeLimit, setTradeLimit] = useState(3);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  // Initialize available months
  useEffect(() => {
    if (activeTrades && activeTrades.length > 0) {
      const monthsSet = new Set();
      activeTrades.forEach(trade => {
        if (trade.date) {
          const d = new Date(trade.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthsSet.add(key);
        }
      });
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(currentMonthKey);
      setAvailableMonths(Array.from(monthsSet).sort().reverse());
      if (selectedMonths.length === 0) setSelectedMonths([currentMonthKey]);
    } else {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setAvailableMonths([currentMonthKey]);
      if (selectedMonths.length === 0) setSelectedMonths([currentMonthKey]);
    }
  }, [activeTrades]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsMonthDropdownOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target)) setIsSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMonth = (monthKey) => {
    setSelectedMonths(prev => prev.includes(monthKey) ? prev.filter(m => m !== monthKey) : [...prev, monthKey]);
  };

  const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const chartData = useMemo(() => {
    if (!activeTrades || selectedMonths.length === 0) return [];
    let relevantDays = [];
    const sortedSelected = [...selectedMonths].sort();

    sortedSelected.forEach(monthKey => {
      const [year, month] = monthKey.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Include all days (including weekends)
        relevantDays.push(new Date(d));
      }
    });

    return relevantDays.map(date => {
      // Use local date to avoid timezone shifts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayKey = `${year}-${month}-${day}`;

      const dayTrades = activeTrades.filter(t => t.date && t.date.startsWith(dayKey));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayTrades.length,
        date: date,
        dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }, [activeTrades, selectedMonths]);

  // Dimensions
  const minValue = 0;
  const maxValue = Math.max(tradeLimit + 2, Math.max(...chartData.map(d => d.count)) + 1);
  const minBarWidth = 45;
  const padding = { top: 40, right: 30, bottom: 60, left: 50 };
  const svgHeight = 400;
  const calculatedWidth = Math.max(800, chartData.length * minBarWidth + padding.left + padding.right);
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = 24;
  const stepX = (calculatedWidth - padding.left - padding.right) / chartData.length;

  if (loading) return <div className="h-[400px] flex items-center justify-center text-blue-400 font-medium animate-pulse">Loading trade data...</div>;
  if (error) return <div className="h-[400px] flex items-center justify-center text-red-400">Error loading data</div>;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/5 shadow-2xl">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative p-6 md:p-8 z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Overtrading Monitor
              <div className="group relative">
                <Info className="w-4 h-4 text-slate-500 hover:text-blue-400 transition-colors cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Tracks daily trade volume against your set limit to prevent overtrading.
                </div>
              </div>
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>Disciplined</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>Overtraded</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Limit Settings */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isSettingsOpen ? 'bg-slate-800 border-blue-500/50 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Limit: {tradeLimit}</span>
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 p-5 transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Daily Trade Limit</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={tradeLimit}
                      onChange={(e) => setTradeLimit(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Recommended: 2-4 trades per day for focus.</p>
                </div>
              )}
            </div>

            {/* Month Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isMonthDropdownOpen ? 'bg-slate-800 border-blue-500/50 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedMonths.length === 0 ? 'Period' : `${selectedMonths.length} Month${selectedMonths.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMonthDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 max-h-72 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 p-2 custom-scrollbar transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Select Months</div>
                  {availableMonths.map(month => (
                    <button
                      key={month}
                      onClick={() => toggleMonth(month)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedMonths.includes(month)
                        ? 'bg-blue-600/10 text-blue-400 font-medium'
                        : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <span>{getMonthLabel(month)}</span>
                      {selectedMonths.includes(month) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Chart Container */}
        <div className="w-full overflow-x-auto custom-scrollbar pb-2 mask-linear-fade">
          <div style={{ width: `${calculatedWidth}px`, height: `${svgHeight}px` }}>
            <svg
              viewBox={`0 0 ${calculatedWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Clean Gradients */}
                <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="barGradientRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
                </linearGradient>
                {/* Glow Filters */}
                <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines (Dashed, Subtle) */}
              {[...Array(maxValue + 1)].map((_, i) => {
                const y = padding.top + chartHeight - ((i / maxValue) * chartHeight);
                return (
                  <g key={`grid-${i}`}>
                    <line x1={padding.left} y1={y} x2={calculatedWidth - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={padding.left - 12} y={y + 4} fill="#64748b" fontSize="11" textAnchor="end" fontFamily="sans-serif">{i}</text>
                  </g>
                );
              })}

              {/* Limit Line */}
              <line
                x1={padding.left}
                y1={padding.top + chartHeight - (tradeLimit / maxValue * chartHeight)}
                x2={calculatedWidth - padding.right}
                y2={padding.top + chartHeight - (tradeLimit / maxValue * chartHeight)}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="6 4"
                strokeOpacity="0.5"
              />
              <text x={calculatedWidth - padding.right} y={padding.top + chartHeight - (tradeLimit / maxValue * chartHeight) - 8} fill="#64748b" fontSize="10" textAnchor="end">Limit: {tradeLimit}</text>

              {/* Chart Bars */}
              {chartData.map((d, i) => {
                const x = padding.left + (i * stepX) + (stepX / 2); // Center of band
                const barHeight = (d.count / maxValue) * chartHeight;
                const isOverLimit = d.count > tradeLimit;

                return (
                  <g key={i} className="group cursor-pointer">
                    {/* Hover Overlay Background */}
                    <rect
                      x={padding.left + i * stepX}
                      y={padding.top}
                      width={stepX}
                      height={chartHeight}
                      fill="transparent"
                      className="hover:fill-white/5 transition-colors duration-200"
                    />

                    {/* The Bar */}
                    {d.count > 0 && (
                      <rect
                        x={x - barWidth / 2}
                        y={padding.top + chartHeight - barHeight}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={isOverLimit ? "url(#barGradientRed)" : "url(#barGradientBlue)"}
                        className="transition-all duration-300 ease-out group-hover:opacity-90"
                        style={{ filter: isOverLimit ? 'url(#glowRed)' : 'url(#glowBlue)' }}
                      />
                    )}

                    {/* Date Label */}
                    <text x={x} y={padding.top + chartHeight + 20} fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="500">{d.date.getDate()}</text>
                    <text x={x} y={padding.top + chartHeight + 36} fill="#64748b" fontSize="10" textAnchor="middle">{d.day}</text>

                    {/* Value Top Label */}
                    {d.count > 0 && (
                      <text
                        x={x}
                        y={padding.top + chartHeight - barHeight - 8}
                        fill={isOverLimit ? "#f87171" : "#60a5fa"}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        {d.count}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Trades</span>
            <span className="text-2xl font-bold text-white">{chartData.reduce((acc, curr) => acc + curr.count, 0)}</span>
          </div>
          <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Limit Breaches</span>
            <span className={`text-2xl font-bold ${chartData.filter(d => d.count > tradeLimit).length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {chartData.filter(d => d.count > tradeLimit).length}
            </span>
          </div>
          <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Avg Trades/Day</span>
            <span className="text-2xl font-bold text-white">
              {(chartData.length > 0 ? chartData.reduce((acc, curr) => acc + curr.count, 0) / chartData.length : 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30,41,59,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71,85,105,0.8); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.8); }
        .mask-linear-fade { mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%); }
      `}</style>
    </div>
  );
};

export default DailyTrades;