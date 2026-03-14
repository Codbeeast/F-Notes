"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';

// Weekly Psychology Profile Component with NewsChart UI styling
const WeeklyPsychProfile = () => {
  const { trades, loading, error } = useTrades();
  const [isMobile, setIsMobile] = useState(false);

  // Effect to determine if it's a mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fixed calculation logic for Weekly Psychology Profile
  const data = useMemo(() => {
    if (!trades || trades.length === 0) {
      return [
        { day: 'Mon', 'FOMO Control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear & Greed': 0 },
        { day: 'Tue', 'FOMO Control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear & Greed': 0 },
        { day: 'Wed', 'FOMO Control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear & Greed': 0 },
        { day: 'Thu', 'FOMO Control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear & Greed': 0 },
        { day: 'Fri', 'FOMO Control': 0, 'Execution Rate': 0, 'Patience Level': 0, 'Confidence Index': 0, 'Fear & Greed': 0 }
      ];
    }

    // Group trades by day of week with proper field tracking
    const dayStats = {
      Monday: {
        fomoSum: 0, executionSum: 0, patienceSum: 0, confidenceSum: 0, fearGreedSum: 0,
        count: 0
      },
      Tuesday: {
        fomoSum: 0, executionSum: 0, patienceSum: 0, confidenceSum: 0, fearGreedSum: 0,
        count: 0
      },
      Wednesday: {
        fomoSum: 0, executionSum: 0, patienceSum: 0, confidenceSum: 0, fearGreedSum: 0,
        count: 0
      },
      Thursday: {
        fomoSum: 0, executionSum: 0, patienceSum: 0, confidenceSum: 0, fearGreedSum: 0,
        count: 0
      },
      Friday: {
        fomoSum: 0, executionSum: 0, patienceSum: 0, confidenceSum: 0, fearGreedSum: 0,
        count: 0
      }
    };

    // Process each trade
    trades.forEach(trade => {
      const dateStr = trade.date || trade.createdAt;
      if (dateStr) {
        const tradeDate = new Date(dateStr);
        const dayName = tradeDate.toLocaleDateString('en-US', { weekday: 'long' });

        if (dayStats[dayName]) {
          const stats = dayStats[dayName];

          // Sum up all the rating fields (all are 1-10 scale)
          const fomoRating = parseFloat(trade.fomoRating);
          const executionRating = parseFloat(trade.executionRating);
          const patienceRating = parseFloat(trade.patience);
          const confidenceRating = parseFloat(trade.confidence);
          const fearGreedRating = parseFloat(trade.fearToGreed);

          // Only add valid ratings
          if (!isNaN(fomoRating) && fomoRating >= 1 && fomoRating <= 10) {
            stats.fomoSum += fomoRating;
          }
          if (!isNaN(executionRating) && executionRating >= 1 && executionRating <= 10) {
            stats.executionSum += executionRating;
          }
          if (!isNaN(patienceRating) && patienceRating >= 1 && patienceRating <= 10) {
            stats.patienceSum += patienceRating;
          }
          if (!isNaN(confidenceRating) && confidenceRating >= 1 && confidenceRating <= 10) {
            stats.confidenceSum += confidenceRating;
          }
          if (!isNaN(fearGreedRating) && fearGreedRating >= 1 && fearGreedRating <= 10) {
            stats.fearGreedSum += fearGreedRating;
          }

          stats.count += 1;
        }
      }
    });

    // Calculate averages and format data
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayAbbrev = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return dayOrder.map((day, index) => {
      const stats = dayStats[day];
      const count = stats.count;

      // If no trades for this day, return zeros for all metrics
      if (count === 0) {
        return {
          day: dayAbbrev[index],
          'FOMO Control': 0,
          'Execution Rate': 0,
          'Patience Level': 0,
          'Confidence Index': 0,
          'Fear & Greed': 0  // Fixed: Now returns 0 instead of 5
        };
      }

      // Calculate averages (all on 1-10 scale)
      const avgFomo = stats.fomoSum / count;
      const avgExecution = stats.executionSum / count;
      const avgPatience = stats.patienceSum / count;
      const avgConfidence = stats.confidenceSum / count;
      const avgFearGreed = stats.fearGreedSum / count;

      return {
        day: dayAbbrev[index],
        // FOMO Control: Direct mapping (High score = High control)
        'FOMO Control': Math.round(Math.max(0, Math.min(10, avgFomo))),
        // Execution Rate: Direct mapping
        'Execution Rate': Math.round(Math.max(0, Math.min(10, avgExecution))),
        // Patience Level: Use actual patience field
        'Patience Level': Math.round(Math.max(0, Math.min(10, avgPatience))),
        // Confidence Index: Use actual confidence field
        'Confidence Index': Math.round(Math.max(0, Math.min(10, avgConfidence))),
        // Fear & Greed: Direct mapping
        'Fear & Greed': Math.round(Math.max(0, Math.min(10, avgFearGreed)))
      };
    });
  }, [trades]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const maxValue = 10;
  const svgWidth = 900;
  const svgHeight = 550;
  const padding = { top: 60, right: 60, bottom: 100, left: 80 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Function to get path data for a line
  const getPathData = (values) => {
    const points = values.map((value, index) => {
      const x = padding.left + (index / (days.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Metrics with their corresponding colors
  const metrics = [
    { key: 'FOMO Control', label: 'FOMO Control', color: '#ef4444' },
    { key: 'Execution Rate', label: 'Execution Rate', color: '#10b981' },
    { key: 'Patience Level', label: 'Patience Level', color: '#3b82f6' },
    { key: 'Confidence Index', label: 'Confidence Index', color: '#f59e0b' },
    { key: 'Fear & Greed', label: 'Fear & Greed', color: '#8b5cf6' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-blue-800/30 to-slate-900/30 rounded-2xl blur-3xl shadow-blue-500/50 animate-pulse"></div>
        <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
            Weekly Psychology Profile
          </h2>
          <div className="flex items-center justify-center h-[400px]">
            <div className="relative">
              <div className="rounded-full h-20 w-20 border-4 border-blue-500/30 border-t-blue-400 shadow-blue-400/50 animate-spin"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-400/20 shadow-blue-400/50 animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-slate-800/30 to-blue-900/30 rounded-2xl blur-3xl shadow-red-500/50"></div>
        <div className="relative backdrop-blur-2xl bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl md:text-2xl font-bold text-white mb-5 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
            Weekly Psychology Profile
          </h2>
          <div className="text-red-400 text-center">
            <div className="text-6xl mb-6 drop-shadow-lg animate-shake">
              ⚠️
            </div>
            <div className="text-xl">Error: {error.message || 'Failed to fetch data'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      {/* Blue-themed outer glow effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-slate-800/40 rounded-2xl blur-3xl group-hover:from-blue-500/60 group-hover:via-cyan-400/60 group-hover:to-slate-700/60 transition-all duration-1000 shadow-blue-500/50 animate-pulse-light"
      />

      {/* Main container with blue-black glassy effect */}
      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">

        {/* Header with blue glowing text */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
            Weekly Psychology Profile
          </h2>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
            {metrics.map(metric => (
              <div key={metric.key} className="flex items-center gap-2">
                <div
                  className="w-4 h-2 rounded-full shadow-md"
                  style={{ backgroundColor: metric.color, boxShadow: `0 0 10px ${metric.color}60` }}
                ></div>
                <span className="text-gray-300">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart with blue-themed background */}
        <div className="flex justify-center items-center mb-5">
          <div className="w-full backdrop-blur-xl bg-slate-900/60 rounded-xl border border-blue-500/30 shadow-blue-400/30 p-6">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              width="100%"
              height="100%"
              style={{ display: "block" }}
              className="overflow-visible"
            >
              {/* Subtle background grid */}
              <defs>
                <pattern id="grid-psych" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
                </pattern>

                {/* Gradient definitions for lines */}
                {metrics.map(metric => (
                  <linearGradient key={`gradient-${metric.key}`} id={`lineGradient-${metric.key.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={metric.color} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={metric.color} stopOpacity="1" />
                    <stop offset="100%" stopColor={metric.color} stopOpacity="0.8" />
                  </linearGradient>
                ))}
              </defs>

              <rect width="100%" height="100%" fill="url(#grid-psych)" />

              {/* Y-axis labels and horizontal grid lines */}
              {[...Array(6)].map((_, i) => { // 0, 2, 4, 6, 8, 10
                const value = i * 2;
                const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
                return (
                  <g key={`y-axis-${value}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartWidth}
                      y2={y}
                      stroke="rgba(59, 130, 246, 0.2)"
                      strokeWidth="1"
                      opacity="0.7"
                    />
                    <text
                      x={padding.left - 20}
                      y={y + 5}
                      fill="#9ca3af"
                      fontSize="14"
                      textAnchor="end"
                      fontFamily="system-ui"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis label */}
              <text
                x={padding.left - 55}
                y={svgHeight / 2}
                fill="#d1d5db"
                fontSize="16"
                textAnchor="middle"
                fontFamily="system-ui"
                fontWeight="500"
                transform={`rotate(-90 ${padding.left - 55},${svgHeight / 2})`}
              >
                Score (0-10)
              </text>

              {/* X-axis labels (Days) */}
              {days.map((day, index) => {
                const x = padding.left + (index / (days.length - 1)) * chartWidth;
                return (
                  <g key={`x-axis-${day}`}>
                    <text
                      x={x}
                      y={padding.top + chartHeight + 30}
                      fill="#9ca3af"
                      fontSize="14"
                      textAnchor="middle"
                      fontFamily="system-ui"
                      fontWeight="500"
                    >
                      {day}
                    </text>
                  </g>
                );
              })}

              {/* X-axis label */}
              <text
                x={svgWidth / 2}
                y={svgHeight - 20}
                fill="#d1d5db"
                fontSize="16"
                textAnchor="middle"
                fontFamily="system-ui"
                fontWeight="500"
              >
                Day of Week
              </text>

              {/* Draw lines with glow effects */}
              {metrics.map(metric => (
                <g key={metric.key}>
                  {/* Glow effect */}
                  <path
                    d={getPathData(data.map(d => d[metric.key]))}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                    style={{
                      filter: `blur(3px)`
                    }}
                  />
                  {/* Main line */}
                  <path
                    d={getPathData(data.map(d => d[metric.key]))}
                    fill="none"
                    stroke={`url(#lineGradient-${metric.key.replace(/\s+/g, '')})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  />
                </g>
              ))}

              {/* Data points with enhanced styling */}
              {data.map((item, dayIndex) => (
                <g key={dayIndex}>
                  {metrics.map(metric => {
                    const x = padding.left + (dayIndex / (days.length - 1)) * chartWidth;
                    const y = padding.top + chartHeight - ((item[metric.key] / maxValue) * chartHeight);
                    return (
                      <g key={metric.key}>
                        {/* Glow circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill={metric.color}
                          opacity="0.3"
                          style={{
                            filter: 'blur(4px)'
                          }}
                        />
                        {/* Main circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill={metric.color}
                          stroke="#1f2937"
                          strokeWidth="2"
                          className="hover:r-6 transition-all cursor-pointer"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Blue-themed Custom Scrollbar Styles */}
      <style>{`
        @keyframes pulse-light {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }
        .animate-pulse-light {
          animation: pulse-light 4s infinite ease-in-out;
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default WeeklyPsychProfile;
