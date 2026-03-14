"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrades } from '../context/TradeContext';

// --- Premium Color Palette & Gradients ---
// We will use standard CSS colors for recharts, but enhanced with filters/gradients in definitions
const COLORS = [
    '#3b82f6', // bright blue
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
];

const GENERATE_COLOR = (index) => COLORS[index % COLORS.length];

// --- Custom Active Shape for Hover Effect ---
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
        <g>
            {/* Glow Effect behind the active slice */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0 0 10px ${fill})` }}
                opacity={0.6}
            />
            {/* The main active slice */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#fff"
                strokeWidth={2}
            />
            {/* Center Text Info */}
            <text x={cx} y={cy - 10} dy={-5} textAnchor="middle" fill="#fff" className="text-xl font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                {payload.name}
            </text>
            <text x={cx} y={cy + 15} dy={5} textAnchor="middle" fill="#9ca3af" className="text-xs font-medium uppercase tracking-widest">
                {(percent * 100).toFixed(1)}% Vol
            </text>
        </g>
    );
};

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 border border-blue-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2 border-b border-gray-700 pb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill, boxShadow: `0 0 10px ${data.fill}` }} />
                    <span className="font-bold text-white text-lg">{data.name}</span>
                </div>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-8">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className={`font-mono font-bold ${data.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.winRate}%
                        </span>
                    </div>
                    <div className="flex justify-between gap-8">
                        <span className="text-gray-400">P&L:</span>
                        <span className={`font-mono font-bold ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${data.pnl.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-8">
                        <span className="text-gray-400">Trades:</span>
                        <span className="font-mono text-white">{data.value}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                        <span className="text-gray-400">Wins/Losses:</span>
                        <span className="font-mono text-white">{data.wins}W / {data.losses}L</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function WinRate() {
    const { trades, loading, error } = useTrades();
    const [activeIndex, setActiveIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onPieEnter = useCallback((_, index) => {
        setActiveIndex(index);
    }, []);

    // --- Data Processing (Memoized) ---
    const data = useMemo(() => {
        if (!trades || trades.length === 0) return [];

        const pairData = {};

        trades.forEach(trade => {
            if (!pairData[trade.pair]) {
                pairData[trade.pair] = {
                    wins: 0,
                    losses: 0,
                    value: 0, // Total trade count for this pair
                    pnl: 0,
                    totalVolume: 0,
                    avgPnl: 0
                };
            }

            pairData[trade.pair].value++;
            pairData[trade.pair].totalVolume += Math.abs(trade.pnl || 0);
            pairData[trade.pair].pnl += trade.pnl || 0;

            if ((trade.pnl || 0) > 0) {
                pairData[trade.pair].wins++;
            } else {
                pairData[trade.pair].losses++;
            }
        });

        const processedData = Object.keys(pairData).map((pairName, index) => {
            const stats = pairData[pairName];
            const winRate = stats.value > 0 ? (stats.wins / stats.value) * 100 : 0;
            const avgPnl = stats.value > 0 ? stats.pnl / stats.value : 0;

            return {
                name: pairName,
                value: stats.value, // Using trade count for slice size by default
                wins: stats.wins,
                losses: stats.losses,
                winRate: parseFloat(winRate.toFixed(1)),
                pnl: stats.pnl,
                avgPnl: parseFloat(avgPnl.toFixed(2)),
                fill: GENERATE_COLOR(index),
            };
        }).sort((a, b) => b.value - a.value); // Sort by volume descending

        return processedData;
    }, [trades]);


    // Dimensions & Logic
    if (!mounted) return null; // Prevent hydration issues

    if (loading) {
        return (
            <div className="relative w-full h-[500px] flex items-center justify-center bg-slate-900/40 rounded-3xl animate-pulse">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-blue-400 font-medium">Loading Analysis...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center bg-red-900/10 border border-red-500/30 rounded-3xl">
                <div className="text-center">
                    <span className="text-4xl block mb-2">⚠️</span>
                    <p className="text-red-400">Unable to load chart data</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-slate-800/20 to-blue-900/20 rounded-2xl blur-3xl shadow-blue-500/30"></div>
                <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 shadow-2xl text-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">Currency Pairs Performance</h2>
                    <p className="text-slate-400 mb-6">No trade data available yet. Start trading to populate this chart!</p>
                    <div className="flex justify-center opacity-30">
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group w-full"
        >
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/10 to-slate-900/20 rounded-3xl blur-3xl -z-10" />

            <div className="relative backdrop-blur-2xl bg-slate-950/80 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                    <div className='text-center sm:text-left'>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></span>
                            Pair Performance
                        </h2>
                        <p className='text-sm text-slate-400 mt-1 pl-4'>Distribution by trade volume</p>
                    </div>

                    {/* Total Trades Badge */}
                    <div className='mt-4 sm:mt-0 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 font-mono text-sm'>
                        Total Trades: <span className='font-bold text-white'>{data.reduce((a, b) => a + b.value, 0)}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-8">

                    {/* Chart Section */}
                    <div className="w-full lg:w-1/2 h-[400px] flex items-center justify-center relative">
                        {/* Background Circle Decor */}
                        <div className='absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none'>
                            <div className='w-[280px] h-[280px] rounded-full border border-blue-500 border-dashed animate-[spin_60s_linear_infinite]'></div>
                            <div className='absolute w-[350px] h-[350px] rounded-full border border-cyan-500/50'></div>
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                {/* Definition for gradients/filters if needed for advanced usage, 
                      though activeShape handles glow nicely */}
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={85}
                                    outerRadius={140}
                                    paddingAngle={4}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.3))' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend / Stats List Section */}
                    <div className="w-full lg:w-1/2 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence>
                                {data.map((entry, index) => (
                                    <motion.div
                                        key={entry.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`group p-4 rounded-xl border transition-all duration-300 cursor-default
                        ${index === activeIndex
                                                ? 'bg-gradient-to-r from-slate-800 to-slate-900/50 border-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02]'
                                                : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                                            }
                    `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                                                    style={{ color: entry.fill, backgroundColor: entry.fill }}
                                                />
                                                <span className="font-bold text-slate-200">{entry.name}</span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    ({entry.value} trades)
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <div className={`font-bold font-mono ${entry.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {entry.winRate}% WR
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expandable Details on Active */}
                                        <motion.div
                                            initial={false}
                                            animate={{ height: index === activeIndex ? 'auto' : 0, opacity: index === activeIndex ? 1 : 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-slate-400">
                                                <div>
                                                    P&L: <span className={entry.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>${entry.pnl.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    Avg: <span className={entry.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>${entry.avgPnl}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scope-specific styles for scrollbar if global not sufficient */}
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
        </motion.div>
    );
}
