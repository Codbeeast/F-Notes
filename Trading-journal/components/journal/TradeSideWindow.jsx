import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Check, Upload, ChevronDown, AlertCircle, Trash2 } from 'lucide-react';
import CloudinaryImageUpload from '@/components/CloudinaryImageUpload';
import { getDropdownOptions, shouldShowNewsField } from './journalUtils';



// Helper Components Defined Outside to preventing re-rendering/focus loss
const RenderInput = ({ label, value, onChange, type = 'text', placeholder, error, className = '' }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-gray-800/50 border ${error ? 'border-red-500/50' : 'border-gray-700/50'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-800 transition-all placeholder:text-gray-600`}
        />
        {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
);

const RenderSelect = ({ label, value, onChange, options, placeholder, error, className = '' }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = React.useRef(null);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = React.useMemo(() => {
        if (!value) return placeholder;
        const opt = options.find(o => (o.value || o) === value);
        return opt ? (opt.label || opt) : value;
    }, [value, options, placeholder]);

    return (
        <div className={`flex flex-col gap-1.5 ${className}`} ref={dropdownRef}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
            <div className="relative">
                <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`w-full bg-gray-800/50 border ${error ? 'border-red-500/50' : 'border-gray-700/50'} rounded-xl px-4 py-3 text-sm text-white cursor-pointer min-h-[46px] flex items-center justify-between transition-all ${showDropdown ? 'border-blue-500/50 bg-gray-800' : ''}`}
                >
                    <span className={!value ? "text-gray-500" : "text-white"}>{selectedLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D24] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                            <div
                                onClick={() => {
                                    onChange("");
                                    setShowDropdown(false);
                                }}
                                className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors text-gray-500 border-b border-gray-700/50"
                            >
                                <span className="text-sm">{placeholder}</span>
                            </div>
                            {options.map((opt, idx) => {
                                const optValue = opt.value || opt;
                                const optLabel = opt.label || opt;
                                const isSelected = value === optValue;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            onChange(optValue);
                                            setShowDropdown(false);
                                        }}
                                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                                    >
                                        <span className={`text-sm ${isSelected ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>
                                            {optLabel}
                                        </span>
                                        {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Custom Multi-Select Dropdown
const RenderMultiSelect = ({ label, value, onChange, options, placeholder, error }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = React.useRef(null);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedValues = React.useMemo(() => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(', ').filter(Boolean);
        return [];
    }, [value]);

    const toggleValue = (val) => {
        const current = selectedValues;
        let newValues;

        if (current.includes(val)) {
            newValues = current.filter(v => v !== val);
        } else {
            newValues = [...current, val];
        }

        onChange(newValues.join(', '));
    };

    return (
        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
            <div className="relative">
                <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`w-full bg-gray-800/50 border ${error ? 'border-red-500/50' : 'border-gray-700/50'} rounded-xl px-4 py-3 text-sm text-white cursor-pointer min-h-[46px] flex items-center justify-between`}
                >
                    <div className="flex flex-wrap gap-2">
                        {selectedValues.length > 0 ? (
                            selectedValues.map(val => (
                                <span key={val} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                                    {val}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D24] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                            {options.map(opt => {
                                const isSelected = selectedValues.includes(opt);
                                return (
                                    <div
                                        key={opt}
                                        onClick={() => toggleValue(opt)}
                                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                                    >
                                        <span className={`text-sm ${isSelected ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>
                                            {opt}
                                        </span>
                                        {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Helper for Rating Color
const getRatingColor = (rating) => {
    if (rating <= 3) return 'text-red-400';
    if (rating <= 6) return 'text-yellow-400';
    return 'text-green-400';
};

// Render Slider for Psychology
const RenderSlider = ({ label, value, onChange, minLabel = 'Low', maxLabel = 'High' }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${getRatingColor(value)}`}>
                    {value}/10
                </span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 w-8">{minLabel}</span>
            <input
                type="range"
                min="1"
                max="10"
                value={value || 5}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-custom"
            />
            <span className="text-[10px] text-gray-600 w-8 text-right">{maxLabel}</span>
        </div>
    </div>
);

const TradeSideWindow = ({
    isOpen,
    onClose,
    trade,
    isEditMode,
    sessions = [],
    strategies = [],
    onSave,
    onDelete
}) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Initialize form data when trade changes
    useEffect(() => {
        if (trade) {
            setFormData({
                ...trade,
                date: trade.date ? new Date(trade.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                time: trade.time || new Date().toISOString().substring(11, 16),
                // Parse notes if they exist
                ...(() => {
                    let parsed = { setup: '', execution: '', improvement: '' };
                    if (trade.notes) {
                        try {
                            // Try parsing as JSON first
                            if (trade.notes.trim().startsWith('{')) {
                                parsed = JSON.parse(trade.notes);
                            } else {
                                // Fallback for legacy plain text notes
                                parsed.setup = trade.notes;
                            }
                        } catch (e) {
                            parsed.setup = trade.notes;
                        }
                    }
                    return parsed;
                })()
            });
        } else {
            // Default empty state
            setFormData({
                market: 'Forex',
                positionType: 'Long',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toISOString().substring(11, 16),
                session: 'London',
                // Add defaults for ratings
                fearToGreed: 5,
                fomoRating: 5,
                executionRating: 5,
                patience: 5,
                confidence: 5,
                rulesFollowed: 'Yes',
                affectedByNews: 'not affected',
                setup: '',
                execution: '',
                improvement: '',
                confluences: ''
            });
        }
    }, [trade, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            return newData;
        });

        // Clear error for this field if exists
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        // Auto-populate based on strategy selection
        if (field === 'strategy') {
            const selectedStrategy = strategies.find(s => s._id === value);
            if (selectedStrategy) {
                setFormData(prev => {
                    const newRisk = selectedStrategy.riskPerTrade || prev.risk; // Use riskPerTrade if available
                    const newRFactor = selectedStrategy.rFactor || prev.rFactor;
                    const initialBalance = selectedStrategy.initialBalance || 0;

                    let newPnL = prev.pnl;
                    const r = parseFloat(newRisk);
                    const rf = parseFloat(newRFactor);

                    if (!isNaN(r) && !isNaN(rf) && initialBalance > 0) {
                        const riskAmount = (initialBalance * r) / 100;
                        newPnL = (riskAmount * rf).toFixed(2);
                    }

                    return {
                        ...prev,
                        strategy: value,
                        strategyName: selectedStrategy.strategyName,
                        setupType: '',
                        entryType: '',
                        pair: (selectedStrategy.tradingPairs && selectedStrategy.tradingPairs.length > 0) ? selectedStrategy.tradingPairs[0] : prev.pair,
                        risk: newRisk,
                        rFactor: newRFactor,
                        // pnl: newPnL, // Removed auto PnL
                        timeFrame: '',
                        confluences: ''
                    };
                });
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['market', 'pair', 'strategy', 'date', 'time', 'session', 'entry', 'exit', 'risk', 'lotSize', 'setupType', 'entryType', 'timeFrame'];

        requiredFields.forEach(field => {
            if (!formData[field]) newErrors[field] = 'This field is required';
        });

        // Ensure numeric fields are valid numbers
        if (formData.entry && isNaN(Number(formData.entry))) newErrors.entry = 'Must be a valid number';
        if (formData.exit && isNaN(Number(formData.exit))) newErrors.exit = 'Must be a valid number';
        if (formData.risk && isNaN(Number(formData.risk))) newErrors.risk = 'Must be a valid number';
        if (formData.lotSize && isNaN(Number(formData.lotSize))) newErrors.lotSize = 'Must be a valid number';
        if (formData.rFactor && isNaN(Number(formData.rFactor))) newErrors.rFactor = 'Must be a valid number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Clean/Transform data before saving
            const dataToSave = {
                ...formData,
                entry: Number(formData.entry),
                exit: Number(formData.exit),
                risk: Number(formData.risk),
                lotSize: Number(formData.lotSize),
                rFactor: Number(formData.rFactor),
                pipsLost: Number(formData.pipsLost || 0),
                pnl: Number(formData.pnl || 0),
                fearToGreed: Number(formData.fearToGreed),
                fomoRating: Number(formData.fomoRating),
                executionRating: Number(formData.executionRating),
                patience: Number(formData.patience),
                confidence: Number(formData.confidence),
                // Bundle structured notes into a JSON string
                notes: JSON.stringify({
                    setup: formData.setup || '',
                    execution: formData.execution || '',
                    improvement: formData.improvement || ''
                })
            };

            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    <style jsx>{`
                        .slider-thumb-custom::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        background: #3b82f6;
                        border-radius: 50%;
                        cursor: pointer;
                        border: 2px solid #1e40af;
                        }
                        .slider-thumb-custom::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        background: #3b82f6;
                        border-radius: 50%;
                        cursor: pointer;
                        border: 2px solid #1e40af;
                        }
                    `}</style>

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] z-[70] bg-[#0F1115] border-l border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0F1115]">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-100">
                                    {isEditMode ? 'Edit Execution' : 'Log Execution'}
                                </h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Trade Parameters</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Core Transaction */}
                            <section>
                                <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">Core Transaction</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <RenderSelect
                                        label="Market"
                                        value={formData.market}
                                        onChange={(val) => handleChange('market', val)}
                                        options={['Forex', 'Crypto', 'Indices', 'Stocks', 'Commodities']}
                                        placeholder="Select Market"
                                        error={errors.market}
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Direction</label>
                                        <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50 h-[46px]">
                                            <button
                                                onClick={() => handleChange('positionType', 'Long')}
                                                className={`flex-1 rounded-lg text-sm font-bold transition-all ${formData.positionType === 'Long'
                                                    ? 'bg-green-600 text-white shadow-lg'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                LONG
                                            </button>
                                            <button
                                                onClick={() => handleChange('positionType', 'Short')}
                                                className={`flex-1 rounded-lg text-sm font-bold transition-all ${formData.positionType === 'Short'
                                                    ? 'bg-red-600 text-white shadow-lg'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                SHORT
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <RenderSelect
                                        label="Strategy"
                                        value={formData.strategy}
                                        onChange={(val) => handleChange('strategy', val)}
                                        options={strategies.map(s => ({ value: s._id, label: s.strategyName }))}
                                        placeholder="Select Strategy"
                                        error={errors.strategy}
                                    />
                                    <RenderSelect
                                        label="Pairs / Ticker"
                                        value={formData.pair}
                                        onChange={(val) => handleChange('pair', val)}
                                        options={(() => {
                                            const selectedStrategy = strategies.find(s => s._id === formData.strategy);
                                            if (selectedStrategy?.tradingPairs && Array.isArray(selectedStrategy.tradingPairs) && selectedStrategy.tradingPairs.length > 0) {
                                                return selectedStrategy.tradingPairs;
                                            }
                                            return getDropdownOptions('pairs');
                                        })()}
                                        placeholder="Select Pair..."
                                        error={errors.pair}
                                    />
                                </div>
                            </section>

                            {/* Timing & Session */}
                            <section>
                                <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">Timing & Session</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <RenderInput
                                        type="date"
                                        label="Date"
                                        value={formData.date}
                                        onChange={(val) => handleChange('date', val)}
                                        error={errors.date}
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={formData.time || ''}
                                                onChange={(e) => handleChange('time', e.target.value)}
                                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-800 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <RenderSelect
                                        label="Session"
                                        value={formData.session}
                                        onChange={(val) => handleChange('session', val)}
                                        options={sessions.map(s => s.sessionName || s)}
                                        placeholder="Select"
                                        error={errors.session}
                                    />
                                </div>
                            </section>

                            {/* Technical Details */}
                            <section>
                                <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">Technical Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <RenderInput
                                        type="number"
                                        label="Entry Price"
                                        value={formData.entry}
                                        onChange={(val) => handleChange('entry', val)}
                                        placeholder="0.00000"
                                        error={errors.entry}
                                    />
                                    <RenderInput
                                        type="number"
                                        label="Exit Price"
                                        value={formData.exit}
                                        onChange={(val) => handleChange('exit', val)}
                                        placeholder="0.00000"
                                        error={errors.exit}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <RenderSelect
                                        label="Setup Type"
                                        value={formData.setupType}
                                        onChange={(val) => handleChange('setupType', val)}
                                        options={(() => {
                                            const selectedStrategy = strategies.find(s => s._id === formData.strategy);
                                            // Ensure options are flat array of strings
                                            if (selectedStrategy?.setupType && Array.isArray(selectedStrategy.setupType)) {
                                                return selectedStrategy.setupType;
                                            }
                                            // Handle case where setupType might be comma-separated string in strategy
                                            if (selectedStrategy?.setupType && typeof selectedStrategy.setupType === 'string') {
                                                return selectedStrategy.setupType.split(',').map(s => s.trim()).filter(Boolean);
                                            }
                                            return getDropdownOptions('setupType');
                                        })()}
                                        placeholder="Select..."
                                        error={errors.setupType}
                                    />
                                    <RenderMultiSelect
                                        label="Entry Type"
                                        value={formData.entryType}
                                        onChange={(val) => handleChange('entryType', val)}
                                        options={(() => {
                                            const selectedStrategy = strategies.find(s => s._id === formData.strategy);
                                            if (selectedStrategy?.entryType && Array.isArray(selectedStrategy.entryType)) {
                                                return selectedStrategy.entryType;
                                            }
                                            if (selectedStrategy?.entryType && typeof selectedStrategy.entryType === 'string') {
                                                return selectedStrategy.entryType.split(',').map(s => s.trim()).filter(Boolean);
                                            }
                                            return getDropdownOptions('entryType');
                                        })()}
                                        placeholder="Select..."
                                        error={errors.entryType}
                                    />
                                    <RenderMultiSelect
                                        label="TF Used"
                                        value={formData.timeFrame}
                                        onChange={(val) => handleChange('timeFrame', val)}
                                        options={(() => {
                                            const selectedStrategy = strategies.find(s => s._id === formData.strategy);
                                            if (selectedStrategy?.timeFrame && Array.isArray(selectedStrategy.timeFrame)) {
                                                return selectedStrategy.timeFrame;
                                            }
                                            if (selectedStrategy?.timeFrame && typeof selectedStrategy.timeFrame === 'string') {
                                                return selectedStrategy.timeFrame.split(',').map(s => s.trim()).filter(Boolean);
                                            }
                                            return getDropdownOptions('timeFrame');
                                        })()}
                                        placeholder="e.g. 15m, 1h"
                                        error={errors.timeFrame}
                                    />
                                </div>
                                <div className="mt-4">
                                    <RenderMultiSelect
                                        label="Confluences"
                                        value={formData.confluences}
                                        onChange={(val) => handleChange('confluences', val)}
                                        options={(() => {
                                            const selectedStrategy = strategies.find(s => s._id === formData.strategy);
                                            if (selectedStrategy?.confluences && Array.isArray(selectedStrategy.confluences)) {
                                                return selectedStrategy.confluences;
                                            }
                                            if (selectedStrategy?.confluences && typeof selectedStrategy.confluences === 'string') {
                                                return selectedStrategy.confluences.split(',').map(s => s.trim()).filter(Boolean);
                                            }
                                            return getDropdownOptions('confluences') || [];
                                        })()}
                                        placeholder="e.g. EMA Crossover, Support Level..."
                                        error={errors.confluences}
                                    />
                                </div>
                            </section>

                            {/* Risk & Size */}
                            <section>
                                <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">Risk & Size</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <RenderInput
                                        type="number"
                                        label="Risk (%)"
                                        value={formData.risk}
                                        onChange={(val) => handleChange('risk', val)}
                                        placeholder="%"
                                        error={errors.risk}
                                    />
                                    <RenderInput
                                        type="number"
                                        label="Lots"
                                        value={formData.lotSize}
                                        onChange={(val) => handleChange('lotSize', val)}
                                        placeholder="0.01"
                                        error={errors.lotSize}
                                    />
                                    <RenderInput
                                        type="number"
                                        label="R Factor"
                                        value={formData.rFactor}
                                        onChange={(val) => handleChange('rFactor', val)}
                                        placeholder="0"
                                        error={errors.rFactor}
                                    />
                                    <RenderInput
                                        type="number"
                                        label="Pips L/C"
                                        value={formData.pipsLost}
                                        onChange={(val) => handleChange('pipsLost', val)}
                                        placeholder="0"
                                        error={errors.pipsLost}
                                    />
                                </div>
                            </section>

                            {/* PnL & Image */}
                            <section>
                                <div className="grid grid-cols-2 gap-4">
                                    <RenderInput
                                        type="number"
                                        label="PnL ($)"
                                        value={formData.pnl}
                                        onChange={(val) => handleChange('pnl', val)}
                                        placeholder="0.00"
                                        error={errors.pnl}
                                        className={formData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trade Images</label>
                                        <CloudinaryImageUpload
                                            onImageUpload={(urls) => {
                                                // handle array or single string from upload component
                                                const newImages = Array.isArray(urls) ? urls : [urls];
                                                handleChange('images', newImages);
                                                // Keep sync backward compat if needed
                                                if (newImages.length > 0) handleChange('image', newImages[0]);
                                            }}
                                            currentImages={formData.images || (formData.image ? [formData.image] : [])}
                                            maxImages={3}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Psychology & News (Unified Analysis) */}
                            <section className="bg-gray-800/20 rounded-2xl p-4 border border-white/5">
                                <h3 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    News and Psychology
                                </h3>

                                {/* News Section */}
                                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-700/50">
                                    <RenderSelect
                                        label="Affected by News?"
                                        value={formData.affectedByNews}
                                        onChange={(val) => handleChange('affectedByNews', val)}
                                        options={getDropdownOptions('affectedByNews')}
                                        error={errors.affectedByNews}
                                    />
                                    {shouldShowNewsField(formData.affectedByNews) && (
                                        <RenderSelect
                                            label="News Event"
                                            value={formData.news}
                                            onChange={(val) => handleChange('news', val)}
                                            options={getDropdownOptions('news')}
                                            placeholder="Select event..."
                                            error={errors.news}
                                        />
                                    )}
                                </div>

                                {/* Psychology Sliders */}
                                <div className="space-y-6">
                                    <RenderSlider label="Fear To Greed" value={formData.fearToGreed} onChange={(val) => handleChange('fearToGreed', val)} minLabel="Fear" maxLabel="Greed" />
                                    <RenderSlider label="FOMO Control" value={formData.fomoRating} onChange={(val) => handleChange('fomoRating', val)} minLabel="Low" maxLabel="High" />
                                    <RenderSlider label="Execution Quality" value={formData.executionRating} onChange={(val) => handleChange('executionRating', val)} minLabel="Poor" maxLabel="Perfect" />
                                    <RenderSlider label="Patience" value={formData.patience} onChange={(val) => handleChange('patience', val)} minLabel="Impulsive" maxLabel="Patient" />
                                    <RenderSlider label="Confidence" value={formData.confidence} onChange={(val) => handleChange('confidence', val)} minLabel="Low" maxLabel="High" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <RenderSelect
                                        label="Rules Followed?"
                                        value={formData.rulesFollowed}
                                        onChange={(val) => handleChange('rulesFollowed', val)}
                                        options={['Yes', 'No', 'Partially']}
                                        error={errors.rulesFollowed}
                                    />
                                </div>

                                <div className="space-y-4 mt-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Why I Took This Trade</label>
                                        <textarea
                                            value={formData.setup || ''}
                                            onChange={(e) => handleChange('setup', e.target.value)}
                                            placeholder="Setup, Confluences, What I saw..."
                                            rows={3}
                                            className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-800 transition-all placeholder:text-gray-600 resize-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">How I Managed It</label>
                                        <textarea
                                            value={formData.execution || ''}
                                            onChange={(e) => handleChange('execution', e.target.value)}
                                            placeholder="Emotions, Decisions, Management..."
                                            rows={3}
                                            className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-gray-800 transition-all placeholder:text-gray-600 resize-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Improvement</label>
                                        <textarea
                                            value={formData.improvement || ''}
                                            onChange={(e) => handleChange('improvement', e.target.value)}
                                            placeholder="One thing to do better next time..."
                                            rows={3}
                                            className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500/50 focus:bg-gray-800 transition-all placeholder:text-gray-600 resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 border-t border-white/5 bg-[#0F1115]">
                            <div className="bg-black/40 rounded-2xl p-4 mb-4 flex justify-between items-center border border-white/5">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Net Result</div>
                                    <div className="text-xs text-gray-400">{formData.pipsLost || 0} PIPS</div>
                                </div>
                                <div className={`text-2xl font-bold ${Number(formData.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${Number(formData.pnl || 0).toFixed(2)}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {onDelete && (
                                    <button
                                        onClick={onDelete}
                                        disabled={isSubmitting}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        title="Delete Trade"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            {isEditMode ? 'Update Trade' : 'Log Trade'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default TradeSideWindow;
