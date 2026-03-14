"use client"
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useTrades } from '../context/TradeContext';
import RegulationFilters from './RegulationFilters';

const NewsChart = ({ trades: propTrades }) => {
  const [viewMode, setViewMode] = useState('news'); // 'news' | 'pairs'
  const [currentFilter, setCurrentFilter] = useState({
    mode: 'custom',
    year: new Date().getFullYear(),
    months: [new Date().getMonth() + 1]
  });

  const [selectedPairs, setSelectedPairs] = useState([]);
  const initialLoadDone = React.useRef(false);

  const { trades: contextTrades, loading, error, fetchTrades } = useTrades();
  const trades = propTrades || contextTrades;

  const uniquePairs = useMemo(() => {
    const pairs = new Set(trades.map(t => t.pair || 'Unknown'));
    return Array.from(pairs).sort();
  }, [trades]);

  useEffect(() => {
    if (uniquePairs.length > 0 && !initialLoadDone.current) {
      setSelectedPairs(uniquePairs);
      initialLoadDone.current = true;
    }
  }, [uniquePairs]);

  const timeFilteredTrades = useMemo(() => {
    if (!trades.length) return [];
    if (!currentFilter) return trades;

    return trades.filter(trade => {
      let date;
      if (typeof trade.date === 'string' && trade.date.includes('-')) {
        const [y, m, d] = trade.date.split('-').map(Number);
        date = new Date(y, m - 1, d);
      } else {
        date = new Date(trade.date);
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (year !== currentFilter.year) return false;
      if (currentFilter.mode === 'custom') {
        return currentFilter.months.includes(month);
      }
      return true;
    });
  }, [trades, currentFilter]);

  const chartData = useMemo(() => {
    if (viewMode === 'news') {
      const newsGroups = {};
      timeFilteredTrades.forEach(trade => {
        if (!trade.news || trade.news.trim() === '') return;
        const newsKey = trade.news.trim();
        if (!newsGroups[newsKey]) {
          newsGroups[newsKey] = {
            news: newsKey,
            totalPnL: 0,
            trades: [],
            impactCount: {
              'positively affected': 0,
              'negatively affected': 0,
              'affected': 0,
              'not affected': 0
            }
          };
        }

        const pnl = parseFloat(trade.pnl) || 0;
        newsGroups[newsKey].totalPnL += pnl;
        newsGroups[newsKey].trades.push({ ...trade, pnl });

        const impact = trade.affectedByNews || 'not affected';
        if (newsGroups[newsKey].impactCount[impact] !== undefined) {
          newsGroups[newsKey].impactCount[impact]++;
        } else {
          if (impact.toLowerCase().includes('positive')) newsGroups[newsKey].impactCount['positively affected']++;
          else if (impact.toLowerCase().includes('negative')) newsGroups[newsKey].impactCount['negatively affected']++;
          else newsGroups[newsKey].impactCount['not affected']++;
        }
      });

      return Object.values(newsGroups).map((group, index) => {
        const totalTradesCount = group.trades.length;
        const winTrades = group.trades.filter(t => t.pnl > 0).length;
        const winRate = totalTradesCount > 0 ? ((winTrades / totalTradesCount) * 100).toFixed(1) : 0;
        const primaryImpact = Object.entries(group.impactCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const newsText = group.news.length > 15 ? `${group.news.substring(0, 15)}...` : group.news;

        return {
          id: `news-${index}`,
          name: newsText,
          fullNews: group.news,
          pnl: group.totalPnL,
          winRate: winRate,
          totalTrades: totalTradesCount,
          impact: primaryImpact,
          details: group.trades
        };
      }).sort((a, b) => a.pnl - b.pnl);

    } else {
      let relevantTrades = timeFilteredTrades.filter(trade =>
        (trade.news && trade.news.trim() !== '') ||
        (trade.affectedByNews && trade.affectedByNews.toLowerCase() !== 'not affected')
      );

      if (selectedPairs.length > 0) {
        relevantTrades = relevantTrades.filter(t => selectedPairs.includes(t.pair || 'Unknown'));
      }

      return relevantTrades.map((trade, index) => {
        const pnl = parseFloat(trade.pnl) || 0;
        return {
          id: trade._id || index,
          x: new Date(trade.date).getTime(),
          y: pnl,
          z: Math.abs(pnl),
          pnl: pnl,
          pair: trade.pair || 'Unknown',
          news: trade.news || trade.affectedByNews || '',
          date: trade.date,
          formattedDate: new Date(trade.date).toLocaleDateString(),
          type: trade.tradeType || 'Unknown'
        };
      }).sort((a, b) => a.x - b.x);
    }
  }, [timeFilteredTrades, viewMode, selectedPairs]);

  const bubbleDomain = useMemo(() => {
    if (viewMode !== 'pairs' || chartData.length === 0) return [0, 100];
    const maxZ = Math.max(...chartData.map(d => d.z));
    return [0, maxZ];
  }, [chartData, viewMode]);

  const totalTrades = viewMode === 'news'
    ? chartData.reduce((acc, curr) => acc + curr.totalTrades, 0)
    : chartData.length;

  const profitTrades = viewMode === 'news'
    ? chartData.reduce((acc, curr) => acc + curr.details.filter(t => t.pnl > 0).length, 0)
    : chartData.filter(d => d.pnl > 0).length;

  const lossTrades = totalTrades - profitTrades;
  const winRate = totalTrades > 0 ? ((profitTrades / totalTrades) * 100).toFixed(1) : 0;

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-center text-red-200">
        <p>Error loading data: {error}</p>
        <button onClick={fetchTrades} className="mt-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl group-hover:from-blue-500/30 group-hover:via-cyan-400/30 group-hover:to-slate-700/30 transition-all duration-1000 shadow-blue-500/30" />

      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-4 md:p-6 w-full overflow-visible shadow-2xl">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                {viewMode === 'news' ? 'News Analysis' : 'Pairs Analysis'}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Total: {totalTrades}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Wins: {profitTrades}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Losses: {lossTrades}</span>
                <span className="font-semibold text-blue-400 ml-1">WR: {winRate}%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <RegulationFilters
                onFilterChange={setCurrentFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                uniquePairs={uniquePairs}
                selectedPairs={selectedPairs}
                setSelectedPairs={setSelectedPairs}
              />
              <button
                onClick={fetchTrades}
                disabled={loading}
                className={`p-2 rounded-xl bg-slate-800/80 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all ${loading ? 'animate-spin' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-[500px]">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-semibold text-gray-300 mb-2">No data found for the selected period.</p>
              <p className="text-sm text-gray-500 mb-4">
                {viewMode === 'news'
                  ? 'Try selecting a different time period or add trades with news events.'
                  : 'Try selecting a different time period, pair, or add trades with news data.'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'news' ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={['auto', 'auto']}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-blue-500/30 p-3 rounded-xl shadow-xl backdrop-blur-md">
                            <p className="font-bold text-white mb-2">{data.fullNews}</p>
                            <div className="text-sm space-y-1">
                              <p className={data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>PnL: ${data.pnl.toFixed(2)}</p>
                              <p className="text-blue-300">Win Rate: {data.winRate}%</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    stroke="#9CA3AF"
                    domain={['auto', 'auto']}
                    tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis type="number" dataKey="y" stroke="#9CA3AF" name="PnL" unit="$" />
                  <ZAxis type="number" dataKey="z" range={[100, 1000]} domain={bubbleDomain} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-blue-500/30 p-3 rounded-xl shadow-xl backdrop-blur-md">
                            <p className="font-bold text-white">{data.pair} ({data.formattedDate})</p>
                            <p className={`text-lg font-mono ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${data.pnl.toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Trades" data={chartData}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'}
                        stroke={entry.pnl >= 0 ? '#10B981' : '#EF4444'}
                        strokeWidth={2}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsChart;