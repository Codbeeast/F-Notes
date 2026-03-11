'use client'

import React, { useState, useEffect } from 'react';
import { useTrades } from "@/context/TradeContext";
import { Activity, Clock, Globe } from 'lucide-react';

const SessionAnalysis = ({ strategyId = null }) => {
  const { trades, loading, error, fetchTrades, fetchTradesByStrategy } = useTrades();
  const [processedTrades, setProcessedTrades] = useState([]);

  useEffect(() => {
    const loadTrades = async () => {
      if (strategyId) {
        const strategyTrades = await fetchTradesByStrategy(strategyId);
        setProcessedTrades(processTradesData(strategyTrades));
      } else {
        setProcessedTrades(processTradesData(trades));
      }
    };

    loadTrades();
  }, [strategyId, trades, fetchTradesByStrategy]);

  // Process and normalize trade data
  const processTradesData = (tradesData) => {
    return tradesData
      .filter(trade => trade.session) // Only filter by session existence
      .map(trade => {
        const pnl = parseFloat(trade.pnl) || 0;
        return {
          ...trade,
          session: (trade.session || 'Unknown').trim(),
          pnl: pnl
        };
      });
  };

  const sessionColorMap = {
    London: '#06B6D4', // Cyan
    'New York': '#8B5CF6', // Violet
    Asian: '#10B981', // Emerald
    Others: '#F59E0B', // Amber
    Unknown: '#9CA3AF', // Gray
  };

  const getColorForSession = (session) => sessionColorMap[session] || sessionColorMap.Unknown;

  const generateSessionData = () => {
    if (!processedTrades.length) return { winRateData: [], totalTradesData: [] };

    const sessionsMap = {};
    const knownSessions = ['London', 'Asian', 'New York'];

    processedTrades.forEach(trade => {
      let sessionKey = (trade.session || 'Unknown').trim();
      if (!knownSessions.includes(sessionKey)) {
        sessionKey = 'Others';
      }

      if (!sessionsMap[sessionKey]) {
        sessionsMap[sessionKey] = {
          name: sessionKey,
          fullName: sessionKey,
          wins: 0,
          total: 0,
          winRate: 0,
          color: getColorForSession(sessionKey),
        };
      }

      sessionsMap[sessionKey].total += 1;
      const pnl = parseFloat(trade.pnl.toString()) || 0;
      if (pnl > 0) sessionsMap[sessionKey].wins += 1;
    });

    const sessionArray = Object.values(sessionsMap).map((session) => ({
      ...session,
      winRate: session.total > 0 ? (session.wins / session.total) * 100 : 0,
    }));

    const getFixedData = () => {
      const orderedNames = ['London', 'Asian', 'New York', 'Others'];
      return orderedNames.map(name => {
        const session = sessionArray.find(s => s.name === name);
        return session || {
          name: name,
          fullName: name,
          wins: 0,
          total: 0,
          winRate: 0,
          color: sessionColorMap[name] || sessionColorMap['Unknown'],
        };
      });
    };

    return {
      winRateData: getFixedData(),
      totalTradesData: getFixedData(),
    };
  };

  // Simple Triangle Skeleton Loader Component
  const SkeletonLoader = () => {
    return (
      <div className="w-full mt-6">
        <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-white/5 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/5 h-[400px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TriangleChart = ({ data, showWinRate = false, title }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const calculateTrianglePoints = (data, showWinRate) => {
      const center = { x: 250, y: showWinRate ? 250 : 280 };
      const maxRadius = 180;

      const values = data.map(session => showWinRate ? session.winRate : session.total);
      const maxValue = Math.max(...values, 1);

      const sessionOrder = ['London', 'New York', 'Asian'];
      return sessionOrder.map((sessionName, index) => {
        const session = data.find(s => s.name === sessionName) ||
          { name: sessionName, fullName: sessionName, wins: 0, total: 0, winRate: 0, color: sessionColorMap[sessionName] };

        const value = showWinRate ? session.winRate : session.total;
        let normalizedValue;
        let radius;

        if (value === 0) {
          radius = 0;
        } else if (showWinRate) {
          normalizedValue = value / 100;
          radius = 20 + (normalizedValue * maxRadius);
        } else {
          normalizedValue = Math.sqrt(value) / Math.sqrt(maxValue);
          radius = 25 + (normalizedValue * (maxRadius - 25));
        }

        const angles = [-90, 30, 150];
        const angle = (angles[index] * Math.PI) / 180;

        return {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          session: session,
          value: value,
          normalizedValue: normalizedValue || 0
        };
      });
    };

    const points = calculateTrianglePoints(data, showWinRate);
    const pathData = `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y} L ${points[2].x},${points[2].y} Z`;

    const handleMouseMove = (e, point) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setHoveredPoint(point);
    };

    return (
      <div className="relative w-full h-[350px] sm:h-[400px] bg-[#0a0a0a]/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center group/chart">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full max-w-[350px] max-h-[350px] sm:max-w-[400px] sm:max-h-[400px]"
          style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
        >
          <defs>
            <filter id={`glow-${title}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id={`gradient-${title}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
            <polygon
              key={i}
              points={`${250 + (points[0].x - 250) * scale},${(showWinRate ? 250 : 280) + (points[0].y - (showWinRate ? 250 : 280)) * scale} ${250 + (points[1].x - 250) * scale},${(showWinRate ? 250 : 280) + (points[1].y - (showWinRate ? 250 : 280)) * scale} ${250 + (points[2].x - 250) * scale},${(showWinRate ? 250 : 280) + (points[2].y - (showWinRate ? 250 : 280)) * scale}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {points.map((point, index) => (
            <line
              key={`axis-${index}`}
              x1="250"
              y1={showWinRate ? "250" : "280"}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Data area */}
          <polygon
            points={pathData.replace('M ', '').replace(' Z', '').replace(/L /g, ' ')}
            fill={`url(#gradient-${title})`}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={point.session.color}
                stroke="#0d0d0d"
                strokeWidth="3"
                filter={`url(#glow-${title})`}
                className="cursor-pointer transition-all duration-300 hover:r-10"
                onMouseEnter={(e) => handleMouseMove(e, point)}
                onMouseMove={(e) => handleMouseMove(e, point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Pulse effect */}
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill={point.session.color}
                opacity="0.2"
                className="animate-pulse pointer-events-none"
              />
            </g>
          ))}
        </svg>

        {/* Labels - Fixed Positions */}
        {points.map((point, index) => {
          const labelPositions = [
            { left: '50%', top: '5%', transform: 'translateX(-50%)' }, // London (Top)
            { right: '5%', bottom: '10%' }, // NY (Bottom Right)
            { left: '5%', bottom: '10%' } // Asian (Bottom Left)
          ];

          return (
            <div
              key={`label-${index}`}
              className="absolute flex items-center gap-2 bg-[#0d0d0d]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg"
              style={labelPositions[index]}
            >
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: point.session.color, backgroundColor: point.session.color }} />
              <div className="text-xs font-bold text-gray-300">
                {point.session.name === 'New York' ? 'NY' : point.session.name}
              </div>
            </div>
          );
        })}

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-50 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl pointer-events-none transition-all duration-200"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y - 10,
              boxShadow: `0 0 20px ${hoveredPoint.session.color}20`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">{hoveredPoint.session.name}</span>
            </div>
            <div className="text-lg font-bold text-white">
              {showWinRate
                ? <span style={{ color: hoveredPoint.session.color }}>{hoveredPoint.value.toFixed(1)}%</span>
                : <span style={{ color: hoveredPoint.session.color }}>{hoveredPoint.value} <span className="text-xs text-gray-500 font-normal">Trades</span></span>
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="w-full mt-6 bg-rose-900/10 p-6 rounded-3xl shadow-lg border border-rose-500/20 backdrop-blur-xl flex items-center justify-center min-h-[200px]">
        <div className="text-center text-rose-400 text-lg">Error loading session data: {error}</div>
      </div>
    );
  }

  const { winRateData, totalTradesData } = generateSessionData();

  return (
    <div className="w-full min-h-auto relative group mt-6 font-inter">
      {/* Background Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/10 via-violet-500/5 to-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden group-hover:border-white/10 transition-all duration-300">

        {/* Subtle light streak */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-400 border border-violet-500/20 shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-wide uppercase">Performance</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Session Analysis
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Auto-detected zones</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
              Win Rate Distribution
            </h2>
            <TriangleChart
              data={winRateData}
              showWinRate={true}
              title="winrate"
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
              Volume Distribution
            </h2>
            <TriangleChart
              data={totalTradesData}
              showWinRate={false}
              title="trades"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysis;