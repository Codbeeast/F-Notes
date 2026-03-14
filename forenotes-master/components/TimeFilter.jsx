"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Filter, TrendingUp, Clock } from 'lucide-react';

const TimeFilter = ({
  monthGroups,
  onFilterChange,
  showAllMonths = false,
  onToggleShowAll,
  simpleMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('current-month');
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [customMonth, setCustomMonth] = useState(new Date().getMonth() + 1);
  const [customQuarter, setCustomQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  // Get unique years from month groups, with fallback to comprehensive range
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020; // Default start year
    const endYear = currentYear + 1; // Include next year for planning

    // Get years from monthGroups if available
    const dataYears = monthGroups.length > 0
      ? [...new Set(monthGroups.map(group => group.year))]
      : [];

    // Create comprehensive year range
    const allYears = new Set();
    for (let year = startYear; year <= endYear; year++) {
      allYears.add(year);
    }

    // Add any years from data that might be outside the range
    dataYears.forEach(year => allYears.add(year));

    // Return sorted array (newest first)
    return Array.from(allYears).sort((a, b) => b - a);
  };

  const years = getYearRange();

  // Get current year, month, quarter
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  // Filter options
  const filterOptions = [
    { value: 'current-month', label: 'Current Month', icon: Calendar, type: 'quick' },
    { value: 'last-month', label: 'Last Month', icon: Calendar, type: 'quick' },
    { value: 'current-quarter', label: 'Current Quarter', icon: TrendingUp, type: 'quick' },
    { value: 'last-quarter', label: 'Last Quarter', icon: TrendingUp, type: 'quick' },
    { value: 'current-year', label: 'Current Year', icon: Calendar, type: 'quick' },
    { value: 'last-year', label: 'Last Year', icon: Calendar, type: 'quick' },
    { value: 'all-time', label: 'All Time', icon: Clock, type: 'quick' },
    { value: 'custom-month', label: 'Custom Month', icon: Calendar, type: 'custom' },
    { value: 'custom-quarter', label: 'Custom Quarter', icon: TrendingUp, type: 'custom' },
    { value: 'custom-year', label: 'Custom Year', icon: Calendar, type: 'custom' },
  ];

  // Get month name
  const getMonthName = (month) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  // Handle filter mode change
  const handleFilterModeChange = (filterValue) => {
    setSelectedFilter(filterValue);
    // Don't close dropdown for custom filters immediately
    if (!filterValue.startsWith('custom-')) {
      setIsOpen(false);
    }
  };

  // Sync filter data whenever state changes
  useEffect(() => {
    let filterData = { type: 'all' };

    switch (selectedFilter) {
      case 'current-month':
        filterData = { type: 'month', year: currentYear, month: currentMonth };
        break;
      case 'last-month':
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        filterData = { type: 'month', year: lastMonthYear, month: lastMonth };
        break;
      case 'current-quarter':
        filterData = { type: 'quarter', year: currentYear, quarter: currentQuarter };
        break;
      case 'last-quarter':
        const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const lastQuarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
        filterData = { type: 'quarter', year: lastQuarterYear, quarter: lastQuarter };
        break;
      case 'current-year':
        filterData = { type: 'year', year: currentYear };
        break;
      case 'last-year':
        filterData = { type: 'year', year: currentYear - 1 };
        break;
      case 'custom-month':
        filterData = { type: 'month', year: customYear, month: customMonth };
        break;
      case 'custom-quarter':
        filterData = { type: 'quarter', year: customYear, quarter: customQuarter };
        break;
      case 'custom-year':
        filterData = { type: 'year', year: customYear };
        break;
      case 'all-time':
      default:
        filterData = { type: 'all' };
        break;
    }

    onFilterChange(filterData);
  }, [selectedFilter, customYear, customMonth, customQuarter, currentYear, currentMonth, currentQuarter]);

  // Get display text for selected filter
  const getDisplayText = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    if (!option) return 'Select Period';

    switch (selectedFilter) {
      case 'custom-month':
        return `${getMonthName(customMonth)} ${customYear}`;
      case 'custom-quarter':
        return `Q${customQuarter} ${customYear}`;
      case 'custom-year':
        return `${customYear}`;
      default:
        return option.label;
    }
  };

  // Get filtered stats
  const getFilteredStats = () => {
    const totalTrades = monthGroups.reduce((sum, group) => sum + group.trades.length, 0);
    const totalPnL = monthGroups.reduce((sum, group) => sum + group.totalPnL, 0);
    return { totalTrades, totalPnL };
  };

  const stats = getFilteredStats();

  return (
    <div className="relative">
      {/* Main Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white transition-all text-sm shadow-lg min-w-[160px] justify-between backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span>{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="p-4">
            {/* Quick Filters - Condensed in Simple Mode */}
            {!simpleMode ? (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Filters</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.filter(opt => opt.type === 'quick').map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterModeChange(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === option.value
                          ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                          : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Filters</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.filter(opt =>
                    opt.value === 'current-month' ||
                    opt.value === 'last-month' ||
                    opt.value === 'current-quarter' ||
                    opt.value === 'all-time'
                  ).map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterModeChange(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === option.value
                          ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                          : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Filters */}
            <div className={`${!simpleMode ? 'border-t border-white/10 pt-4' : ''}`}>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Custom Period</h4>

              {/* Custom Month */}
              <div className="mb-3">
                <button
                  onClick={() => handleFilterModeChange('custom-month')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === 'custom-month'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Custom Month</span>
                  </div>
                  <span className="text-xs">{getMonthName(customMonth)} {customYear}</span>
                </button>

                {selectedFilter === 'custom-month' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <select
                      value={customMonth}
                      onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                      className="px-2 py-1 bg-gray-800/70 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{getMonthName(month)}</option>
                      ))}
                    </select>
                    <select
                      value={customYear}
                      onChange={(e) => setCustomYear(parseInt(e.target.value))}
                      className="px-2 py-1 bg-gray-800/70 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Custom Quarter */}
              <div className="mb-3">
                <button
                  onClick={() => handleFilterModeChange('custom-quarter')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === 'custom-quarter'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Custom Quarter</span>
                  </div>
                  <span className="text-xs">Q{customQuarter} {customYear}</span>
                </button>

                {selectedFilter === 'custom-quarter' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <select
                      value={customQuarter}
                      onChange={(e) => setCustomQuarter(parseInt(e.target.value))}
                      className="px-2 py-1 bg-gray-800/70 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={1}>Q1 (Jan-Mar)</option>
                      <option value={2}>Q2 (Apr-Jun)</option>
                      <option value={3}>Q3 (Jul-Sep)</option>
                      <option value={4}>Q4 (Oct-Dec)</option>
                    </select>
                    <select
                      value={customYear}
                      onChange={(e) => setCustomYear(parseInt(e.target.value))}
                      className="px-2 py-1 bg-gray-800/70 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Custom Year */}
              <div>
                <button
                  onClick={() => handleFilterModeChange('custom-year')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === 'custom-year'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Custom Year</span>
                  </div>
                  <span className="text-xs">{customYear}</span>
                </button>

                {selectedFilter === 'custom-year' && (
                  <div className="mt-2">
                    <select
                      value={customYear}
                      onChange={(e) => setCustomYear(parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-800/70 border border-gray-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Preview - Hidden in Simple Mode */}
            {!simpleMode && (
              <div className="border-t border-white/10 pt-3 mt-4">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Trades: <span className="text-white font-semibold">{stats.totalTrades}</span></span>
                  <span>PnL: <span className={`font-semibold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.totalPnL.toFixed(2)}
                  </span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TimeFilter;
