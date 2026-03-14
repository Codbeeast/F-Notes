"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const SearchBar = ({
  strategies = [],
  trades = [],
  allTrades = [], // Add allTrades prop
  selectedStrategy = '',
  selectedStrategyName = '',
  searchOpen = false,
  onStrategySelect,
  onClearFilter,
  onToggleSearch
}) => {

  // Use allTrades for counting, not the filtered trades
  const tradesForCounting = allTrades.length > 0 ? allTrades : trades;
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by strategy..."
          value={selectedStrategy ? selectedStrategyName : ''}
          onClick={onToggleSearch}
          onChange={() => {}}
          className="w-64 pl-9 pr-10 py-2.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          readOnly
        />
        {selectedStrategy && (
          <button
            onClick={onClearFilter}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-lg font-bold transition-colors"
            title="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {searchOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto"
        >
          <div 
            onClick={onClearFilter}
            className="px-4 py-2.5 hover:bg-white/10 cursor-pointer border-b border-white/10 transition-colors"
          >
            <span className="text-white font-medium text-sm">All Strategies</span>
            <span className="text-gray-400 ml-2 text-xs">({tradesForCounting.length} trades)</span>
          </div>
          {strategies.map((strategy) => {
            // Debug for each strategy
            const approach1 = tradesForCounting.filter(t => t.strategy?._id === strategy._id);
            const approach2 = tradesForCounting.filter(t => t.strategy === strategy._id);
            const approach3 = tradesForCounting.filter(t => t.strategy?.toString() === strategy._id?.toString());
            const approach4 = tradesForCounting.filter(t => {
              const tradeStrategyId = t.strategy?._id || t.strategy;
              return tradeStrategyId?.toString() === strategy._id?.toString();
            });
            
            // Log some matching trades for this strategy
            const matchingTrades = approach4;
            if (matchingTrades.length > 0) {
              console.log('Sample matching trades:', matchingTrades.slice(0, 2));
            } else {
              console.log('No matching trades found');
              // Show sample trades for debugging
              console.log('Sample trades for comparison:', tradesForCounting.slice(0, 2).map(t => ({
                id: t._id,
                strategy: t.strategy,
                strategyType: typeof t.strategy
              })));
            }
            
            // Use the most successful approach
            const tradeCount = approach4.length;
            
            return (
              <div
                key={strategy._id}
                onClick={() => onStrategySelect(strategy._id)}
                className="px-4 py-2.5 hover:bg-white/10 cursor-pointer flex justify-between items-center transition-colors"
              >
                <span className="text-white text-sm">{strategy.strategyName}</span>
                <span className="text-gray-400 text-xs">({tradeCount} trades)</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;