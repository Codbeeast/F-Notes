import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const TimeFilterDropdown = ({ onFilterChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('monthly');
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);

  // Memoize current date info to prevent unnecessary recalculations
  const dateInfo = useMemo(() => {
    const currentDate = new Date();
    return {
      currentYear: currentDate.getFullYear(),
      currentMonth: currentDate.getMonth() + 1
    };
  }, []);

  // Helper functions - memoized for performance
  const getMonthName = useCallback((month) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }, []);



  // State for selected month and year for monthly filter
  const [selectedMonth, setSelectedMonth] = useState(dateInfo.currentMonth);
  const [selectedYear, setSelectedYear] = useState(dateInfo.currentYear);

  // Generate list of years for selection (e.g., last 10 years)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = dateInfo.currentYear; y >= dateInfo.currentYear - 10; y--) {
      years.push(y);
    }
    return years;
  }, [dateInfo.currentYear]);

  // List of months for selection
  const monthOptions = useMemo(() => [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' }
  ], []);

  // Memoize filter options to prevent recreation on every render
  const filterOptions = useMemo(() => [
    {
      value: 'monthly',
      label: 'Monthly',
      icon: Calendar,
      description: `${getMonthName(selectedMonth)} ${selectedYear}`
    },
    {
      value: 'yearly',
      label: 'Yearly',
      icon: Calendar,
      description: `${selectedYear}`
    }
  ], [selectedMonth, selectedYear, getMonthName]);


  // Get display text for selected filter - memoized
  const getDisplayText = useCallback(() => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'Time Period';
  }, [filterOptions, selectedFilter]);

  // Handle filter selection - memoized to prevent unnecessary re-renders
  const handleFilterSelect = useCallback((filterValue) => {
    setSelectedFilter(filterValue);
    setIsOpen(false);

    // Create filter data based on selection
    let filterData = { type: 'all' };

    switch (filterValue) {
      case 'monthly':
        filterData = { type: 'month', year: selectedYear, month: selectedMonth };
        break;
      case 'yearly':
        filterData = { type: 'year', year: selectedYear };
        break;
      default:
        filterData = { type: 'all' };
        break;
    }

    onFilterChange(filterData);
  }, [selectedYear, selectedMonth, onFilterChange]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.time-filter-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative time-filter-dropdown ${className}`}>
      {/* Main Filter Button - Matches ActionButtons styling exactly */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white transition-all text-sm shadow-lg min-w-[140px] justify-between backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>{getDisplayText()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            {/* Header with Back Button */}
            <div className="px-3 py-2 border-b border-white/10 mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-300">
                {showMonthSelector ? 'Select Month' : showYearSelector ? 'Select Year' : 'Select Time Period'}
              </h4>
              {(showMonthSelector || showYearSelector) && (
                <button
                  onClick={() => {
                    setShowMonthSelector(false);
                    setShowYearSelector(false);
                  }}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
              )}
            </div>

            {/* Month Selector */}
            {showMonthSelector && (
              <div className="px-3 py-3">
                <div className="grid grid-cols-4 gap-1">
                  {monthOptions.map((month) => (
                    <button
                      key={month.value}
                      onClick={() => {
                        setSelectedMonth(month.value);
                        setShowMonthSelector(false);
                        setIsOpen(false);
                        onFilterChange({ type: 'month', year: selectedYear, month: month.value });
                      }}
                      className={`px-2 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedMonth === month.value
                          ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                          : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 text-gray-300 hover:text-white'
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Selector */}
            {showYearSelector && (
              <div className="px-3 py-3">
                <div className="grid grid-cols-3 gap-1">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearSelector(false);
                        setIsOpen(false);
                        onFilterChange({ type: 'year', year });
                      }}
                      className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedYear === year
                          ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                          : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 text-gray-300 hover:text-white'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Filter Options */}
            {!showMonthSelector && !showYearSelector && (
              <>
                <div className="space-y-1">
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedFilter === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          if (option.value === 'monthly') {
                            setShowMonthSelector(true);
                          } else if (option.value === 'yearly') {
                            setShowYearSelector(true);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                            : 'bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="px-3 py-1">
                    <p className="text-xs text-gray-500">
                      Filter trades by time period for focused analysis
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeFilterDropdown;
