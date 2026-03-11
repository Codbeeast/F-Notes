'use client'

import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTrades } from '../context/TradeContext';
import { X, TrendingUp, Filter, RefreshCw } from 'lucide-react';

const MonthlyPerformanceChart = () => {
    const { trades, loading, error, fetchTrades } = useTrades();
    const [isMobile, setIsMobile] = useState(false);
    const [activeView, setActiveView] = useState('daily');
    const [chartData, setChartData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredTrades, setFilteredTrades] = useState([]);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Filter trades based on date range
    useEffect(() => {
        if (!trades || trades.length === 0) {
            setFilteredTrades([]);
            return;
        }

        let filtered = trades;

        if (startDate || endDate) {
            filtered = trades.filter(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return false;

                const tradeDateOnly = new Date(tradeDate.toDateString());

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    return tradeDateOnly >= start && tradeDateOnly <= end;
                } else if (startDate) {
                    const start = new Date(startDate);
                    return tradeDateOnly >= start;
                } else if (endDate) {
                    const end = new Date(endDate);
                    return tradeDateOnly <= end;
                }
                return true;
            });
        }

        setFilteredTrades(filtered);
    }, [trades, startDate, endDate]);

    const getQuarter = (month) => {
        if (month >= 0 && month <= 2) return 'Q1';
        if (month >= 3 && month <= 5) return 'Q2';
        if (month >= 6 && month <= 8) return 'Q3';
        return 'Q4';
    };

    const getTradeDate = (trade) => {
        const dateValue = trade.date || trade.createdAt || trade.entryDate || trade.timestamp;
        if (!dateValue) return null;
        return new Date(dateValue);
    };

    const generateData = (view) => {
        const tradesToUse = (startDate || endDate) ? filteredTrades : trades;
        if (!tradesToUse || tradesToUse.length === 0) return [];

        let data = {};
        const validTrades = tradesToUse.filter(trade => {
            const tradeDate = getTradeDate(trade);
            return tradeDate && !isNaN(tradeDate.getTime());
        });

        const sortedTrades = validTrades.sort((a, b) => getTradeDate(a) - getTradeDate(b));

        if (view === 'daily') {
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;

                const dayOfWeek = tradeDate.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    const dateKey = tradeDate.toISOString().split('T')[0];
                    const dateLabel = tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (!data[dateKey]) {
                        data[dateKey] = { name: dateLabel, value: 0, date: tradeDate };
                    }
                    data[dateKey].value += parseFloat(trade.pnl) || 0;
                }
            });
            const sortedData = Object.values(data).sort((a, b) => a.date - b.date);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });
        } else if (view === 'weekly') {
            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            weekDays.forEach((day, index) => {
                data[day] = { name: day, value: 0, order: index };
            });
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayOfWeek = dayNames[tradeDate.getDay()];
                if (data[dayOfWeek]) {
                    data[dayOfWeek].value += parseFloat(trade.pnl) || 0;
                }
            });
            const sortedData = Object.values(data).sort((a, b) => a.order - b.order);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });
        } else if (view === 'monthly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach((month, index) => {
                data[month] = { name: month, value: 0, order: index };
            });
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;
                const month = months[tradeDate.getMonth()];
                if (data[month]) {
                    data[month].value += parseFloat(trade.pnl) || 0;
                }
            });
            const sortedData = Object.values(data).sort((a, b) => a.order - b.order);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });
        } else if (view === 'quarterly') {
            const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            quarters.forEach((quarter, index) => {
                data[quarter] = { name: quarter, value: 0, order: index };
            });
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;
                const quarter = getQuarter(tradeDate.getMonth());
                if (data[quarter]) {
                    data[quarter].value += parseFloat(trade.pnl) || 0;
                }
            });
            const sortedData = Object.values(data).sort((a, b) => a.order - b.order);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });
        } else {
            sortedTrades.forEach(trade => {
                const tradeDate = getTradeDate(trade);
                if (!tradeDate) return;
                const year = tradeDate.getFullYear().toString();
                if (!data[year]) {
                    data[year] = { name: year, value: 0, year: tradeDate.getFullYear() };
                }
                data[year].value += parseFloat(trade.pnl) || 0;
            });
            const sortedData = Object.values(data).sort((a, b) => a.year - b.year);
            let cumulativeTotal = 0;
            return sortedData.map(item => {
                cumulativeTotal += item.value;
                return { name: item.name, value: cumulativeTotal };
            });
        }
    };

    useEffect(() => {
        setChartData(generateData(activeView));
    }, [trades, filteredTrades, activeView, startDate, endDate]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const isPositive = value >= 0;

            return (
                <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
                    <div className="space-y-2">
                        <div className="font-bold text-white border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                            <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`} />
                            <span>{label}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Cumulative P&L</span>
                            <span className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}{value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                <h2 className="text-xl font-bold text-white mb-2">Performance Overview</h2>
                <div className="text-rose-400 text-sm mb-4">Error loading chart: {error}</div>
                <button
                    onClick={() => fetchTrades()}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/30 transition-all duration-300"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    const viewButtons = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

    return (
        <div className="w-full min-h-auto relative group mt-6 font-inter">
            <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}</style>

            {/* Background Glow */}
            <div className="absolute -inset-px bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">

                {/* Subtle light streak */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/5 text-violet-400 border border-violet-500/20 shadow-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Performance Metrics</p>
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                Cumulative P&L
                            </h3>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        {/* View Switching */}
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full hide-scrollbar">
                            {viewButtons.map(view => (
                                <button
                                    key={view}
                                    onClick={() => setActiveView(view)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap capitalize ${activeView === view
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>

                        {/* Date Filtering */}
                        <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-4 py-2 hover:border-white/10 transition-all group/picker">
                            <Filter className="w-3.5 h-3.5 text-gray-400 group-hover/picker:text-violet-400 transition-colors" />
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker()}
                                    className="bg-transparent border-none text-[11px] text-gray-300 focus:ring-0 p-0 w-24 placeholder-gray-500 cursor-pointer outline-none font-bold relative z-10"
                                />
                                <span className="text-gray-600 text-[10px] font-black uppercase">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker()}
                                    className="bg-transparent border-none text-[11px] text-gray-300 focus:ring-0 p-0 w-24 placeholder-gray-500 cursor-pointer outline-none font-bold relative z-10"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="ml-2 p-1 rounded-full hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative z-10 h-[350px] sm:h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <defs>
                                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                angle={isMobile && activeView === 'daily' ? -45 : 0}
                                textAnchor={isMobile && activeView === 'daily' ? 'end' : 'middle'}
                                height={60}
                                interval="auto"
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#performanceGradient)"
                                animationDuration={2000}
                                activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default MonthlyPerformanceChart;