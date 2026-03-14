"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, DollarSign, Clock, Activity, Target, BarChart3, Image as ImageIcon, XCircle } from 'lucide-react';
import WeeklySummary from './WeeklySummary';
import { useTrades } from '@/context/TradeContext';
import { ImageViewer } from './ImageViewer';

const EliteTradingCalendar = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickedDate, setClickedDate] = useState(null); // Changed from hoveredDate to clickedDate
  const [mounted, setMounted] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Add state for ImageViewer
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageTitle, setImageTitle] = useState('');

  // Get tradeHistory from the centralized context
  const { trades: contextTrades, loading: contextLoading, error: contextError, fetchTrades } = useTrades();

  // Use trades from props if available, otherwise use context
  const tradeHistory = trades || contextTrades;
  const loading = trades ? false : contextLoading;
  const error = trades ? null : contextError;

  useEffect(() => {
    setMounted(true);
    if (!trades) {
      fetchTrades();
    }
  }, [fetchTrades, trades]);

  const today = new Date();
  const todayString = today.toLocaleDateString('en-CA');

  const tradesByDate = useMemo(() => {
    const grouped = {};
    tradeHistory.forEach(trade => {
      let dateStr = null;

      if (trade.date) {
        const tradeDate = new Date(trade.date);
        dateStr = tradeDate.toLocaleDateString('en-CA');
      } else if (trade.createdAt) {
        const createdDate = new Date(trade.createdAt);
        dateStr = createdDate.toLocaleDateString('en-CA');
      }

      if (dateStr) {
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(trade);
      }
    });
    return grouped;
  }, [tradeHistory]);

  // Function to get all images for a trade (combining different image fields)
  const getAllTradeImages = (trade) => {
    const allImages = [];

    // Check uploadedImage field (legacy field)
    if (trade.uploadedImage) {
      if (typeof trade.uploadedImage === 'string') {
        // Handle comma-separated images
        const imageUrls = trade.uploadedImage.split(',').map(img => img.trim()).filter(img => img);
        allImages.push(...imageUrls);
      }
    }

    // Check image field (primary image)
    if (trade.image && typeof trade.image === 'string') {
      const imageUrls = trade.image.split(',').map(img => img.trim()).filter(img => img);
      imageUrls.forEach(img => {
        if (!allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }

    // Check images field (array of images)
    if (trade.images && Array.isArray(trade.images)) {
      trade.images.forEach(img => {
        if (img && typeof img === 'string' && !allImages.includes(img)) {
          allImages.push(img);
        }
      });
    }

    return allImages.filter(img => img && img.trim() !== '');
  };

  // Function to handle image viewing
  const handleViewImage = (trade, e) => {
    if (e) {
      e.stopPropagation();
    }

    const allImages = getAllTradeImages(trade);

    if (allImages.length > 0) {
      setSelectedImages(allImages);
      setImageTitle(`${trade.pair || 'Unknown Pair'} - ${trade.setupType || 'Trade'} (${trade.date || 'Unknown Date'})`);
      setImageViewerOpen(true);
    }
  };

  // Function to close image viewer
  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImages([]);
    setImageTitle('');
  };

  const getCalendarWeeks = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const allDays = [];

    let firstWeekdayOfMonth = firstDayOfMonth.getDay();
    let daysToPrepend = 0;
    if (firstWeekdayOfMonth === 0) {
      daysToPrepend = 5; // Sunday
    } else if (firstWeekdayOfMonth === 1) {
      daysToPrepend = 0; // Monday
    } else {
      daysToPrepend = firstWeekdayOfMonth - 1;
    }

    for (let i = 0; i < daysToPrepend; i++) {
      allDays.push({ date: null, isCurrentMonth: false, isEmpty: true });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        allDays.push({ date, isCurrentMonth: true, isEmpty: false });
      }
    }

    while (allDays.length % 5 !== 0) {
      allDays.push({ date: null, isCurrentMonth: false, isEmpty: true });
    }

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 5) {
      weeks.push(allDays.slice(i, i + 5));
    }

    return weeks;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
    setAnimationKey(prev => prev + 1);
  };

  const getDayTradeStats = (dateString) => {
    const trades = tradesByDate[dateString] || [];
    const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalPips = trades.reduce((sum, trade) => sum + (trade.pipsLost || 0), 0);
    const winRate = trades.length > 0 ? (trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100 : 0;
    return { count: trades.length, totalPnl, totalPips, trades, winRate };
  };

  const getTooltipPosition = (dayIndexInWeek, weekIndex, totalWeeks) => {
    let horizontalPos = '';
    if (dayIndexInWeek === 0) horizontalPos = 'left-0';
    else if (dayIndexInWeek === 1) horizontalPos = '-left-[20px] sm:left-0';
    else if (dayIndexInWeek === 2) horizontalPos = '-left-[85px] sm:-left-[120px]';
    else if (dayIndexInWeek === 3) horizontalPos = '-right-[20px] sm:right-0';
    else if (dayIndexInWeek === 4) horizontalPos = 'right-0';

    const isBottomRow = weekIndex >= totalWeeks - 2;
    const verticalPos = isBottomRow ? 'bottom-full mb-2' : 'top-full mt-2';
    return { horizontalPos, verticalPos, isBottomRow };
  };

  const renderCalendarDay = (dayInfo, weekIndex, dayIndexInWeek, totalWeeks) => {
    if (dayInfo.isEmpty) {
      return (
        <div
          key={`empty-${weekIndex}-${dayIndexInWeek}-${animationKey}`}
          className="p-2 sm:p-3 min-h-[60px] sm:min-h-[80px] bg-gray-950/30 border-2 border-gray-800/20 rounded-lg cursor-not-allowed"
        ></div>
      );
    }

    const dateString = formatDate(dayInfo.date);
    const dayStats = getDayTradeStats(dateString);
    const hasTrades = dayStats.count > 0;
    const isToday = dateString === todayString;
    const { horizontalPos, verticalPos } = getTooltipPosition(dayIndexInWeek, weekIndex, totalWeeks);
    const isProfit = dayStats.totalPnl > 0;

    const dayColorClass = isProfit ?
      'from-green-600/20 via-gray-900/90 to-gray-800/80 shadow-lg shadow-green-400/20 border-2 border-green-500/40' :
      'from-red-900/40 via-gray-900/90 to-gray-800/80 shadow-lg shadow-red-700/20 border-2 border-red-800/60';
    const textColorClass = isProfit ? 'text-green-400' : 'text-red-500';
    const accentBgClass = isProfit ? 'bg-green-400/20' : 'bg-red-700/20';

    return (
      <div
        key={`${dateString}-${animationKey}`}
        className={`
          relative p-2 sm:p-3 min-h-[60px] sm:min-h-[80px] transition-all duration-300 rounded-lg transform
          ${dayInfo.isCurrentMonth ? 'bg-gray-900/80' : 'bg-gray-950/60 text-gray-500'}
          ${isToday ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/30' : ''}
          ${hasTrades ? dayColorClass : 'border-2 border-gray-700/30'}
          hover:border-gray-600/60 hover:transform hover:scale-105 hover:shadow-xl cursor-pointer bg-gradient-to-br from-gray-900/60 to-gray-800/40
          ${clickedDate === dateString ? 'z-50 scale-105' : 'z-10'}
        `}
        style={{
          backdropFilter: 'blur(10px)',
          animation: mounted ? `fadeInUp 0.4s ease-out ${dayIndexInWeek * 0.05}s both` : 'none',
        }}
        // Replaced hover events with a single onClick event
        onClick={() => hasTrades && setClickedDate(prev => prev === dateString ? null : dateString)}
      >
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <span className={`text-lg sm:text-xl font-bold ${isToday ? 'text-cyan-400' : 'text-gray-200'}`}>
            {dayInfo.date.getDate()}
          </span>
          {hasTrades && (
            <div className="flex items-center space-x-1">
              <Activity className={`w-3 h-3 sm:w-4 sm:h-4 ${textColorClass}`} />
              <span className={`text-xs sm:text-sm font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded ${textColorClass} ${accentBgClass}`}>
                {dayStats.count}
              </span>
            </div>
          )}
        </div>

        {hasTrades && (
          <div className="space-y-0.5 sm:space-y-2 overflow-hidden">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-0.5">
              <div className={`text-[10px] sm:text-xs md:text-sm lg:text-base font-bold ${textColorClass} truncate`}>
                ${dayStats.totalPnl.toFixed(0)}
              </div>
              <div className="flex items-center space-x-0.5">
                {dayStats.totalPips >= 0 ?
                  <TrendingUp className='w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-green-400' /> : <TrendingDown className='w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-red-500' />}
                <span className={`text-[9px] sm:text-xs font-semibold ${dayStats.totalPips >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                  {dayStats.totalPips >= 0 ? '+' : ''}{dayStats.totalPips}
                </span>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-0.5">
              <div className="flex items-center space-x-0.5">
                <Target className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${textColorClass}`} />
                <span className={`text-[9px] sm:text-xs font-medium ${textColorClass}`}>
                  {dayStats.winRate.toFixed(0)}%
                </span>
              </div>
              <div className={`hidden lg:block w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 ${isProfit ? 'bg-green-400' : 'bg-red-700'} rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
            </div>
          </div>
        )}

        {/* Tooltip now renders based on clickedDate state */}
        {clickedDate === dateString && (
          <div
            className={`absolute z-[9999] ${verticalPos} ${horizontalPos} w-[260px] sm:w-80 bg-gray-900/98 backdrop-blur-2xl border-2 ${isProfit ? 'border-green-500/60' : 'border-red-800/60'} rounded-2xl shadow-2xl ${isProfit ? 'shadow-green-500/20' : 'shadow-red-700/20'} p-2.5 sm:p-3 transform transition-all duration-300 animate-slideIn`}
            style={{
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.5),
                0 0 40px ${isProfit ? 'rgba(34, 197, 94, 0.2)' : 'rgba(220, 38, 38, 0.2)'},
                inset 0 2px 0 rgba(255, 255, 255, 0.1)
              `,
              position: 'absolute',
              zIndex: 9999,
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 100%)'
            }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isProfit ? 'text-green-400' : 'text-red-500'}`} />
                <h4 className={`font-bold text-[13px] sm:text-base ${isProfit ? 'text-green-400' : 'text-red-500'} truncate`}>
                  {dayInfo.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h4>
              </div>
              <span className={`text-[10px] sm:text-xs text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm font-semibold tracking-wide ${isProfit ? 'bg-green-600/80' : 'bg-red-700/80'} whitespace-nowrap`}>
                {dayStats.count} {dayStats.count === 1 ? 'Trade' : 'Trades'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className={`bg-gradient-to-br ${isProfit ? 'from-green-900/60 to-green-800/40 border-green-700/50' : 'from-red-900/60 to-red-800/40 border-red-700/50'} backdrop-blur-sm p-1.5 sm:p-2 rounded-lg border`}>
                <div className="flex items-center justify-center sm:justify-start space-x-1 mb-0.5 sm:mb-1">
                  <DollarSign className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={`text-[9px] sm:text-xs ${isProfit ? 'text-green-300' : 'text-red-300'} font-medium uppercase tracking-wider`}>PnL</span>
                </div>
                <div className={`text-center sm:text-left text-xs sm:text-sm font-bold ${textColorClass} truncate`}>
                  ${dayStats.totalPnl.toFixed(0)}
                </div>
              </div>

              <div className={`bg-gradient-to-br ${dayStats.totalPips >= 0 ? 'from-blue-900/60 to-blue-800/40 border-blue-700/50' : 'from-red-900/60 to-red-800/40 border-red-700/50'} backdrop-blur-sm p-1.5 sm:p-2 rounded-lg border`}>
                <div className="flex items-center justify-center sm:justify-start space-x-1 mb-0.5 sm:mb-1">
                  {dayStats.totalPips >= 0 ?
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />}
                  <span className={`text-[9px] sm:text-xs ${dayStats.totalPips >= 0 ? 'text-blue-300' : 'text-red-300'} font-medium uppercase tracking-wider`}>Pips</span>
                </div>
                <div className={`text-center sm:text-left text-xs sm:text-sm font-bold ${dayStats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dayStats.totalPips > 0 ? '+' : ''}{dayStats.totalPips}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/40 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg border border-purple-700/50">
                <div className="flex items-center justify-center sm:justify-start space-x-1 mb-0.5 sm:mb-1">
                  <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                  <span className="text-[9px] sm:text-xs text-purple-300 font-medium uppercase tracking-wider">Win</span>
                </div>
                <div className="text-center sm:text-left text-xs sm:text-sm font-bold text-purple-400">
                  {dayStats.winRate.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Trade list in tooltip */}
            <div className="space-y-1.5 max-h-[140px] sm:max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800">
              {dayStats.trades.map((trade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gradient-to-r from-gray-900/80 to-gray-800/60 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <div className="flex flex-col min-w-0 flex-1 pr-1">
                    <span className="text-gray-200 font-bold text-[11px] sm:text-xs truncate">{trade.pair}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className={`px-1 py-0.5 rounded text-[9px] sm:text-[10px] tracking-wider font-bold uppercase ${trade.positionType === 'Long' ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
                        {trade.positionType}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 truncate min-w-0">{trade.setupType}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    {(() => {
                      const allImages = getAllTradeImages(trade);
                      return allImages.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <div
                            className="p-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 cursor-pointer group relative"
                            onClick={(e) => handleViewImage(trade, e)}
                            role="button"
                            aria-label={`View ${allImages.length} trade image${allImages.length > 1 ? 's' : ''} for ${trade.pair || 'trade'}`}
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleViewImage(trade, e);
                              }
                            }}
                          >
                            <ImageIcon
                              className="w-4 h-4 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-200"
                              aria-hidden="true"
                            />
                            {/* Enhanced tooltip for better UX */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              View {allImages.length} image{allImages.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          {allImages.length > 1 && (
                            <span className="text-xs text-blue-400 font-semibold">
                              {allImages.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className="p-1.5 rounded-md bg-gray-500/10 cursor-not-allowed"
                          role="img"
                          aria-label="No images available for this trade"
                        >
                          <XCircle className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        </div>
                      );
                    })()}
                    <div className="flex flex-col items-end">
                      <div className={`font-bold text-[11px] sm:text-sm ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${typeof trade.pnl === 'number' ? trade.pnl.toFixed(0) : 'N/A'}
                      </div>
                      <div className="text-gray-400 text-[9px] sm:text-xs flex items-center space-x-0.5 sm:space-x-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{trade.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const weeks = getCalendarWeeks();

  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center bg-[#0d0d0d]/80 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="text-center text-gray-500 text-lg animate-pulse">Loading calendar data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center bg-rose-900/10 p-6 rounded-3xl shadow-lg border border-rose-500/20 backdrop-blur-xl">
        <div className="text-center text-rose-400 text-lg">Error loading calendar: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-auto relative group mt-6 font-inter">
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">

        {/* Subtle light streak */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Calendar Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-400 border border-indigo-500/20 shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Overview</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Trading Calendar
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-800/80 to-gray-700/60 backdrop-blur-xl hover:from-gray-700/80 hover:to-gray-600/60 rounded-lg transition-all duration-300 border border-gray-600/50 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              </button>
              <div className="text-center">
                <span className="text-sm sm:text-lg lg:text-xl text-white font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">
                  {currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-800/80 to-gray-700/60 backdrop-blur-xl hover:from-gray-700/80 hover:to-gray-600/60 rounded-lg transition-all duration-300 border border-gray-600/50 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-8">
          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-[repeat(5,minmax(60px,1fr))_minmax(280px,320px)] gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <div key={day} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 rounded-xl border border-white/5">
                {day}
              </div>
            ))}
            <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 rounded-xl border border-white/5">
              Weekly Performance
            </div>

            {weeks.map((week, weekIndex) => {
              const actualDays = week.filter(day => day.date !== null);
              const weekStartDate = actualDays.length > 0 ? actualDays[0].date : null;
              const weekEndDate = actualDays.length > 0 ? actualDays[actualDays.length - 1].date : null;

              return (
                <React.Fragment key={weekIndex}>
                  {week.map((dayInfo, dayIndexInWeek) => renderCalendarDay(dayInfo, weekIndex, dayIndexInWeek, weeks.length))}
                  <div className="col-span-1 min-h-[60px] sm:min-h-[80px] flex items-stretch">
                    <WeeklySummary
                      weekNumber={weekIndex + 1}
                      weekStartDate={weekStartDate}
                      weekEndDate={weekEndDate}
                      tradeHistory={tradeHistory}
                    />
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-6">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 rounded-lg border border-white/5">
                  {day}
                </div>
              ))}

              {weeks.map((week, weekIndex) =>
                week.map((dayInfo, dayIndexInWeek) => renderCalendarDay(dayInfo, weekIndex, dayIndexInWeek, weeks.length))
              )}
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Weekly Performance Summary
                </h4>
              </div>

              <div className="space-y-3">
                {weeks.map((week, weekIndex) => {
                  const actualDays = week.filter(day => day.date !== null);
                  const weekStartDate = actualDays.length > 0 ? actualDays[0].date : null;
                  const weekEndDate = actualDays.length > 0 ? actualDays[actualDays.length - 1].date : null;

                  if (!weekStartDate && !weekEndDate) return null;

                  return (
                    <div key={`mobile-week-${weekIndex}`} className="w-full">
                      <WeeklySummary
                        weekNumber={weekIndex + 1}
                        weekStartDate={weekStartDate}
                        weekEndDate={weekEndDate}
                        tradeHistory={tradeHistory}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* ImageViewer Component */}
        <ImageViewer
          imageUrl={selectedImages}
          title={imageTitle}
          isOpen={imageViewerOpen}
          onClose={handleCloseImageViewer}
          initialIndex={0}
        />

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }

          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 2px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
};

export default EliteTradingCalendar;
