import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TimelineSidebar = ({ trades, onSelectFilter, activeFilter, className = '' }) => {
    const [expandedYears, setExpandedYears] = useState({});
    const [expandedMonths, setExpandedMonths] = useState({});
    const [expandedWeeks, setExpandedWeeks] = useState({});

    // Group trades hierarchy: Year -> Month -> Week -> Day
    const timelineData = useMemo(() => {
        const groups = {};

        trades.forEach(trade => {
            if (!trade.date) return;
            const date = new Date(trade.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });
            const monthIndex = date.getMonth(); // For sorting

            // Calculate Week Number
            const firstDayOfYear = new Date(year, 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            const weekKey = `Week ${weekNum}`;

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dayNum = date.getDate();
            const fullDate = date.toISOString().split('T')[0];

            if (!groups[year]) groups[year] = { months: {}, count: 0 };
            groups[year].count++;

            if (!groups[year].months[month]) groups[year].months[month] = { weeks: {}, count: 0, index: monthIndex };
            groups[year].months[month].count++;

            if (!groups[year].months[month].weeks[weekKey]) groups[year].months[month].weeks[weekKey] = { days: {}, count: 0 };
            groups[year].months[month].weeks[weekKey].count++;

            if (!groups[year].months[month].weeks[weekKey].days[fullDate]) {
                groups[year].months[month].weeks[weekKey].days[fullDate] = {
                    dayName,
                    dayNum,
                    count: 0
                };
            }
            groups[year].months[month].weeks[weekKey].days[fullDate].count++;
        });

        return groups;
    }, [trades]);

    const toggleYear = (year) => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    const toggleMonth = (year, month) => setExpandedMonths(prev => ({ ...prev, [`${year}-${month}`]: !prev[`${year}-${month}`] }));
    const toggleWeek = (year, month, week) => setExpandedWeeks(prev => ({ ...prev, [`${year}-${month}-${week}`]: !prev[`${year}-${month}-${week}`] }));

    // Helper to check if a node is active
    const isActive = (type, value) => activeFilter?.type === type && activeFilter?.value === value;

    return (
        <div className={`w-64 flex-shrink-0 bg-black/20 backdrop-blur-xl border-r border-white/10 h-[calc(100vh-100px)] overflow-y-auto sticky top-24 rounded-r-2xl self-start z-30 ${className}`}>
            <div className="p-6">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Timeline
                </h2>

                <div className="space-y-1">
                    {/* Show "All Time" Option */}
                    <div
                        onClick={() => onSelectFilter('all', null)}
                        className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter?.type === 'all' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        All Time
                    </div>

                    {Object.entries(timelineData)
                        .sort(([yearA], [yearB]) => yearB - yearA) // Newest years first
                        .map(([year, yearData]) => (
                            <div key={year} className="mt-4">
                                {/* Year Node */}
                                <div
                                    className={`group flex items-center justify-between cursor-pointer py-2 px-2 rounded-lg transition-colors ${isActive('year', year) ? 'bg-blue-500/10 text-blue-300' : 'text-gray-300 hover:bg-white/5'}`}
                                    onClick={() => {
                                        toggleYear(year);
                                        onSelectFilter('year', parseInt(year));
                                    }}
                                >
                                    <div className="flex items-center gap-2 font-bold">
                                        <Calendar className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                        {year}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-600 bg-black/40 px-1.5 py-0.5 rounded-full">{yearData.count}</span>
                                        {expandedYears[year] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                    </div>
                                </div>

                                {/* Months List */}
                                <AnimatePresence>
                                    {expandedYears[year] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-2 border-l border-white/10 pl-2 overflow-hidden"
                                        >
                                            {Object.entries(yearData.months)
                                                .sort(([, a], [, b]) => b.index - a.index) // Newest months first
                                                .map(([month, monthData]) => (
                                                    <div key={month} className="mt-1">
                                                        <div
                                                            className={`flex items-center justify-between cursor-pointer py-1.5 px-2 rounded-lg text-sm transition-colors ${isActive('month', `${year}-${month}`) ? 'bg-blue-500/10 text-blue-300' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleMonth(year, month);
                                                                onSelectFilter('month', { year: parseInt(year), month: monthData.index + 1 });
                                                            }}
                                                        >
                                                            <span className="font-medium uppercase tracking-wide text-xs">{month}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-gray-600 group-hover:text-gray-500">{monthData.count}</span>
                                                            </div>
                                                        </div>

                                                        {/* Weeks List */}
                                                        <AnimatePresence>
                                                            {expandedMonths[`${year}-${month}`] && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="ml-2 border-l border-white/10 pl-2 overflow-hidden"
                                                                >
                                                                    {Object.entries(monthData.weeks)
                                                                        .sort(([weekA], [weekB]) => Number(weekB.replace('Week ', '')) - Number(weekA.replace('Week ', '')))
                                                                        .map(([week, weekData]) => (
                                                                            <div key={week} className="mt-1">
                                                                                <div
                                                                                    className={`flex items-center justify-between cursor-pointer py-1 px-2 rounded-lg text-xs transition-colors ${isActive('week', `${year}-${week}`) ? 'bg-blue-500/10 text-blue-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toggleWeek(year, month, week);
                                                                                        // Logic for week filtering might be complex, simplified here or requires custom date logic
                                                                                        // For now we might just expand/collapse visuals or filter by specific week range if backend supports it
                                                                                        // Just treating it as a collapsible header for now unless specific week filtering logic is added to page.jsx

                                                                                    }}
                                                                                >
                                                                                    <span>{week}</span>
                                                                                    {expandedWeeks[`${year}-${month}-${week}`] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                                                </div>

                                                                                {/* Days List */}
                                                                                <AnimatePresence>
                                                                                    {expandedWeeks[`${year}-${month}-${week}`] && (
                                                                                        <motion.div
                                                                                            initial={{ height: 0, opacity: 0 }}
                                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                                            exit={{ height: 0, opacity: 0 }}
                                                                                            className="ml-2 border-l border-white/10 pl-2 overflow-hidden"
                                                                                        >
                                                                                            {Object.entries(weekData.days)
                                                                                                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                                                                                                .map(([fullDate, dayData]) => (
                                                                                                    <div
                                                                                                        key={fullDate}
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            onSelectFilter('day', fullDate);
                                                                                                        }}
                                                                                                        className={`cursor-pointer py-1 px-2 rounded-lg text-xs flex justify-between items-center transition-colors ${isActive('day', fullDate) ? 'text-blue-300 font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                                                                                                    >
                                                                                                        <span>{dayData.dayName}, {dayData.dayNum}</span>
                                                                                                        <span className="text-[9px] bg-white/5 px-1 rounded-sm">{dayData.count}</span>
                                                                                                    </div>
                                                                                                ))}
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                        ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default TimelineSidebar;
