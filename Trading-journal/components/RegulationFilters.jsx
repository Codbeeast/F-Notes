import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const RegulationFilters = ({
    onFilterChange,
    viewMode,
    setViewMode,
    uniquePairs,
    selectedPairs,
    setSelectedPairs
}) => {
    const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
    const [pairDropdownOpen, setPairDropdownOpen] = useState(false);

    // Time Filter State
    // Simplified: Always 'custom' implicitly. We just track years and months.
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonths, setSelectedMonths] = useState([new Date().getMonth() + 1]);

    const timeDropdownRef = useRef(null);
    const pairDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
                setTimeDropdownOpen(false);
            }
            if (pairDropdownRef.current && !pairDropdownRef.current.contains(event.target)) {
                setPairDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update parent when filter changes
    useEffect(() => {
        // We send 'custom' mode which implies: use year + months array
        onFilterChange({
            mode: 'custom',
            year: selectedYear,
            months: selectedMonths
        });
    }, [selectedYear, selectedMonths]);


    const months = [
        { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
        { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
        { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
    ];

    const toggleMonth = (m) => {
        if (selectedMonths.includes(m)) {
            // Prevent empty selection if possible, or allow it
            if (selectedMonths.length > 1) {
                setSelectedMonths(selectedMonths.filter(x => x !== m));
            }
        } else {
            setSelectedMonths([...selectedMonths, m]);
        }
    };

    const selectAllMonths = () => {
        if (selectedMonths.length === 12) {
            setSelectedMonths([]); // or deselect all? Let's assume reset to current month or just empty
        } else {
            setSelectedMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        }
    }

    const togglePair = (pair) => {
        if (pair === 'All Pairs') {
            if (selectedPairs.length === uniquePairs.length) {
                setSelectedPairs([]);
            } else {
                setSelectedPairs([...uniquePairs]);
            }
        } else {
            if (selectedPairs.includes(pair)) {
                setSelectedPairs(selectedPairs.filter(p => p !== pair));
            } else {
                setSelectedPairs([...selectedPairs, pair]);
            }
        }
    };


    return (
        <div className="flex flex-wrap items-center gap-2">

            {/* 1. View Mode Toggle */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/10">
                <button
                    onClick={() => setViewMode('pairs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'pairs'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Pairs
                </button>
                <button
                    onClick={() => setViewMode('news')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'news'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    News
                </button>
            </div>

            {/* 2. Pair Multi-Select (Only for Pairs View) */}
            {viewMode === 'pairs' && (
                <div className="relative" ref={pairDropdownRef}>
                    <button
                        onClick={() => setPairDropdownOpen(!pairDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 transition-all text-sm shadow-lg min-w-[140px] justify-between backdrop-blur-md"
                    >
                        <span className="truncate max-w-[100px]">
                            {selectedPairs.length === 0 ? 'Select Pairs' :
                                selectedPairs.length === uniquePairs.length ? 'All Pairs' :
                                    `${selectedPairs.length} Pairs`}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${pairDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {pairDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl z-50 p-2 max-h-80 overflow-y-auto backdrop-blur-xl">
                            <button
                                onClick={() => togglePair('All Pairs')}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center justify-between group"
                            >
                                <span className="text-gray-300 group-hover:text-white">All Pairs</span>
                                {selectedPairs.length === uniquePairs.length && <Check className="w-4 h-4 text-blue-400" />}
                            </button>
                            <div className="my-1 border-b border-white/10"></div>
                            {uniquePairs.filter(p => p !== 'All Pairs').map(pair => (
                                <button
                                    key={pair}
                                    onClick={() => togglePair(pair)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center justify-between group"
                                >
                                    <span className={`text-gray-300 group-hover:text-white ${selectedPairs.includes(pair) ? 'text-blue-200' : ''}`}>{pair}</span>
                                    {selectedPairs.includes(pair) && <Check className="w-4 h-4 text-blue-400" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* 3. Time Filter Multi-Select */}
            <div className="relative" ref={timeDropdownRef}>
                <button
                    onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-gray-700 bg-gray-900/60 text-gray-200 hover:bg-gray-800/80 hover:text-white transition-all text-sm shadow-lg min-w-[140px] justify-between backdrop-blur-md"
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>
                            {selectedMonths.length === 12 ? selectedYear
                                : selectedMonths.length === 0 ? `Select Date (${selectedYear})`
                                    : selectedMonths.length <= 2 ? `${months.filter(m => selectedMonths.includes(m.value)).map(m => m.label).join(', ')} '${selectedYear.toString().slice(-2)}`
                                        : `${selectedMonths.length} Months '${selectedYear.toString().slice(-2)}`}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${timeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {timeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl p-3">

                        {/* Year Selector */}
                        <div className="flex justify-between items-center mb-3 bg-white/5 p-2 rounded-lg">
                            <button onClick={() => setSelectedYear(selectedYear - 1)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                &lt;
                            </button>
                            <span className="font-bold font-mono text-lg">{selectedYear}</span>
                            <button onClick={() => setSelectedYear(selectedYear + 1)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                &gt;
                            </button>
                        </div>

                        {/* Monthly Selection Grid */}
                        <div className="grid grid-cols-4 gap-1">
                            {months.map(m => (
                                <button
                                    key={m.value}
                                    onClick={() => toggleMonth(m.value)}
                                    className={`py-2 rounded-md text-xs font-medium transition-all ${selectedMonths.includes(m.value)
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Select All Helper */}
                        <div className="mt-3 pt-2 border-t border-white/10 flex justify-center">
                            <button
                                onClick={selectAllMonths}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                            >
                                {selectedMonths.length === 12 ? 'Deselect All' : 'Select Full Year'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default RegulationFilters;
