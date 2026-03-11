"use client";

import React, { useState } from 'react';
import TimeFilter from './TimeFilter';

// Sample data for demonstration
const createSampleMonthGroups = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const sampleData = [];
  
  // Generate data for current year and previous year
  for (let year = currentYear - 1; year <= currentYear; year++) {
    const startMonth = year === currentYear - 1 ? 1 : 1;
    const endMonth = year === currentYear ? currentMonth : 12;
    
    for (let month = startMonth; month <= endMonth; month++) {
      const trades = [];
      const numTrades = Math.floor(Math.random() * 15) + 5; // 5-20 trades per month
      
      for (let i = 0; i < numTrades; i++) {
        trades.push({
          id: `trade_${year}_${month}_${i}`,
          date: `${year}-${month.toString().padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
          pair: ['EUR/USD', 'GBP/USD', 'USD/JPY'][Math.floor(Math.random() * 3)],
          pnl: (Math.random() - 0.5) * 200, // Random PnL between -100 and 100
          positionType: Math.random() > 0.5 ? 'Long' : 'Short'
        });
      }
      
      const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
      const winCount = trades.filter(trade => trade.pnl > 0).length;
      const totalTrades = trades.length;
      
      sampleData.push({
        year,
        month,
        monthKey: `${year}-${month.toString().padStart(2, '0')}`,
        trades,
        totalPnL,
        winCount,
        totalTrades
      });
    }
  }
  
  return sampleData;
};

const TimeFilterDemo = () => {
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [timeFilter, setTimeFilter] = useState({ type: 'current', year: null, month: null });
  
  const sampleMonthGroups = createSampleMonthGroups();
  
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    console.log('Time filter changed:', filter);
  };
  
  const handleToggleShowAll = () => {
    setShowAllMonths(!showAllMonths);
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Time Filter Demo</h1>
          <p className="text-gray-400">
            Interactive demonstration of the trading journal time filter functionality
          </p>
        </div>
        
        <TimeFilter
          monthGroups={sampleMonthGroups}
          onFilterChange={handleTimeFilterChange}
          showAllMonths={showAllMonths}
          onToggleShowAll={handleToggleShowAll}
        />
        
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filter Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400">Filter Type:</span>
              <span className="text-white font-medium ml-2">{timeFilter.type}</span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400">Show All Months:</span>
              <span className={`font-medium ml-2 ${showAllMonths ? 'text-green-400' : 'text-red-400'}`}>
                {showAllMonths ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400">Total Months:</span>
              <span className="text-white font-medium ml-2">{sampleMonthGroups.length}</span>
            </div>
          </div>
          
          {timeFilter.type === 'specific' && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <span className="text-blue-400">Selected Period:</span>
              <span className="text-white font-medium ml-2">
                {timeFilter.month && timeFilter.year 
                  ? `${new Date(timeFilter.year, timeFilter.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : 'Not set'
                }
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sample Data Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-gray-400">Period</th>
                  <th className="text-left py-2 text-gray-400">Trades</th>
                  <th className="text-left py-2 text-gray-400">Total PnL</th>
                  <th className="text-left py-2 text-gray-400">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {sampleMonthGroups.slice(0, 10).map((group) => (
                  <tr key={group.monthKey} className="border-b border-white/5">
                    <td className="py-2 text-white">
                      {new Date(group.year, group.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2 text-gray-300">{group.trades.length}</td>
                    <td className={`py-2 font-medium ${group.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {group.totalPnL.toFixed(2)}
                    </td>
                    <td className="py-2 text-blue-400">
                      {group.totalTrades > 0 ? ((group.winCount / group.totalTrades) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeFilterDemo;
