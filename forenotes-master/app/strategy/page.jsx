'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Pencil, X, Check, AlertCircle, ChevronDown, Search, DollarSign } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useTrades } from '../../context/TradeContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// --- Enhanced Helper Data ---
const TRADING_PAIRS = [
    // Major Forex Pairs
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD',

    // Important Crosses (high volume minors)
    'EURGBP', 'EURJPY', 'GBPJPY',

    // Precious Metals (safe-haven + hedge assets)
    'XAUUSD', 'XAGUSD',

    // Cryptocurrencies (most liquid + market leaders)
    'BTCUSD', 'ETHUSD', 'BNBUSD', 'XRPUSD', 'SOLUSD', 'ADAUSD', 'LTCUSD'
];

const TIMEFRAMES = ['1min', '5min', '15min', '30min', '1H', '2H', '4H', '6H', '8H', '12H', 'Daily', 'Weekly', 'Monthly'];
const STRATEGY_TYPES = ['Swing', 'Intraday', 'Scalp'];
const SETUP_TYPES = ['Breakout', 'Reversal', 'Pullback', 'Trend Continuation', 'Liquidity Grab'];
const CONFLUENCES = ['Fibonacci', 'Order Block', 'Supply/Demand Zone', 'Trendline', 'Session Timing', 'News Filter'];
const ENTRY_TYPES = ['Candle Confirmation', 'Zone Breakout', 'Retest', 'Price Action Pattern', 'Instant Execution', 'Pending Order'];
const RISK_OPTIONS = ['0.25', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5'];

// --- Enhanced Reusable Components ---

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const Icon = type === 'success' ? Check : AlertCircle;
    return (
        <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 z-[100] animate-fade-in-down`}>
            <Icon size={24} />
            <span className="flex-1 font-medium">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors"><X size={18} /></button>
        </div>
    );
};

const EnhancedMultiSelect = ({
    label,
    options,
    selected,
    onChange,
    error,
    allowCustom = false,
    customItems = [],
    onAddCustom,
    onRemoveCustom,
    onRemoveDefault
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
                setShowCustomInput(false);
                setCustomInput('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Combine custom items first, then predefined options
    const allOptions = [...customItems, ...options].filter(opt => opt && typeof opt === 'string');
    const filteredOptions = allOptions.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (option) => {
        const newSelected = selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option];
        onChange(newSelected);
    };

    const handleAddCustom = () => {
        if (customInput.trim() && !allOptions.includes(customInput.trim())) {
            onAddCustom?.(customInput.trim());
            setCustomInput('');
            setShowCustomInput(false);
        }
    };

    const handleRemoveItem = (item, e) => {
        e.stopPropagation();
        if (customItems.includes(item)) {
            onRemoveCustom?.(item);
        } else if (onRemoveDefault) {
            onRemoveDefault(item);
        }
        // Also remove from selected if it was selected
        if (selected.includes(item)) {
            onChange(selected.filter(selectedItem => selectedItem !== item));
        }
    };

    return (
        <div className="relative" ref={ref} style={{ zIndex: isOpen ? 100000 : 'auto' }}>
            <label className="block text-sm font-medium text-gray-400 mb-2">{label} *</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full p-3 bg-gray-800/50 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors`}>
                <span className="flex-1 truncate pr-2">{selected.length > 0 ? selected.join(', ') : <span className="text-gray-500">Select options...</span>}</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl" style={{ zIndex: 999999, position: 'absolute' }}>
                    <div className="p-2 sticky top-0 bg-gray-900/80">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 bg-gray-800/50 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {allowCustom && (
                            <div className="mt-2">
                                {!showCustomInput ? (
                                    <button
                                        onClick={() => setShowCustomInput(true)}
                                        className="w-full p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add Custom Option
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter custom option..."
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                                            className="flex-1 p-2 bg-gray-800/50 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleAddCustom}
                                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setShowCustomInput(false); setCustomInput(''); }}
                                            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {filteredOptions.map((option, index) => {
                        const isCustom = customItems.includes(option);
                        const isDefault = options.includes(option);
                        return (
                            <div key={option} onClick={() => handleSelect(option)} className="p-3 hover:bg-blue-500/10 cursor-pointer flex items-center gap-3 group">
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={selected.includes(option)}
                                    className="form-checkbox h-4 w-4 bg-gray-700 border-gray-500 rounded text-blue-500 focus:ring-0"
                                />
                                <span className={`flex-1 ${isCustom ? 'text-cyan-300' : ''}`}>
                                    {option}
                                    {isCustom && <span className="ml-2 text-xs text-cyan-400">(Custom)</span>}
                                </span>
                                {(isCustom || (allowCustom && onRemoveDefault && isDefault)) && (
                                    <button
                                        onClick={(e) => handleRemoveItem(option, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                                        title={isCustom ? "Remove custom option" : "Remove default option"}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {customItems.length > 0 && (
                        <div className="border-t border-white/10 p-2">
                            <p className="text-xs text-cyan-400 mb-2">Custom Options ({customItems.length})</p>
                        </div>
                    )}
                </div>
            )}
            {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{error}</p>}
        </div>
    );
};

const EnhancedSelectWithAdd = ({
    label,
    options,
    selected,
    onChange,
    error,
    allowCustom = false,
    customItems = [],
    onAddCustom,
    onRemoveCustom,
    onRemoveDefault
}) => {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customInput, setCustomInput] = useState('');

    // Combine custom items first, then predefined options
    const allOptions = [...customItems, ...options];

    const handleAddCustom = () => {
        if (customInput.trim() && !allOptions.includes(customInput.trim())) {
            onAddCustom?.(customInput.trim());
            setCustomInput('');
            setShowCustomInput(false);
        }
    };

    const handleRemoveItem = (item) => {
        if (customItems.includes(item)) {
            onRemoveCustom?.(item);
        } else if (onRemoveDefault) {
            onRemoveDefault(item);
        }
        // Also update selected if the removed item was selected
        if (selected === item) {
            onChange('');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{label} *</label>
            <div className="space-y-2">
                <select
                    value={selected}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-3 bg-gray-800/50 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    <option value="" className="bg-gray-800">Select {label.toLowerCase()}...</option>
                    {customItems.map(option => (
                        <option key={option} value={option} className="bg-gray-800 text-cyan-300">{option} (Custom)</option>
                    ))}
                    {options.map(option => (
                        <option key={option} value={option} className="bg-gray-800">{option}</option>
                    ))}
                </select>

                {allowCustom && (
                    <div>
                        {!showCustomInput ? (
                            <button
                                type="button"
                                onClick={() => setShowCustomInput(true)}
                                className="w-full p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-blue-500/20"
                            >
                                <Plus size={16} />
                                Add Custom {label}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Enter custom ${label.toLowerCase()}...`}
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                                    className="flex-1 p-2 bg-gray-800/50 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustom}
                                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowCustomInput(false); setCustomInput(''); }}
                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {(customItems.length > 0 || (allowCustom && onRemoveDefault && options.length > 0)) && (
                            <div className="mt-2 space-y-2">
                                {customItems.length > 0 && (
                                    <div>
                                        <p className="text-xs text-cyan-400 mb-1">Custom {label} ({customItems.length}):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {customItems.map(item => (
                                                <span key={item} className="inline-flex items-center gap-2 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs border border-cyan-500/30">
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item)}
                                                        className="text-red-400 hover:text-red-300 transition-colors"
                                                        title="Remove custom option"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {allowCustom && onRemoveDefault && options.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Default Options (click to remove):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {options.map(item => (
                                                <span key={item} className="inline-flex items-center gap-2 px-2 py-1 bg-gray-600/20 text-gray-300 rounded text-xs border border-gray-600/30 hover:bg-red-500/20 hover:border-red-500/30 transition-colors cursor-pointer group">
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item)}
                                                        className="text-gray-400 group-hover:text-red-400 transition-colors"
                                                        title="Remove default option"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{error}</p>}
        </div>
    );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99]">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-400 mb-8">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">{cancelText}</button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const BasicInfoSection = ({ formData, setFormData, errors }) => (
    <>
        <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2">Strategy Basics</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Name *</label>
                <input
                    type="text"
                    placeholder="e.g., Gold 1H Reversal"
                    value={formData.strategyName}
                    onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
                    className={`w-full p-3 bg-gray-800/50 border ${errors.strategyName ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.strategyName && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.strategyName}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Type *</label>
                <select
                    value={formData.strategyType}
                    onChange={(e) => setFormData({ ...formData, strategyType: e.target.value })}
                    className={`w-full p-3 bg-gray-800/50 border ${errors.strategyType ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    <option value="" className="bg-gray-800">Select type...</option>
                    {STRATEGY_TYPES.map(type => <option key={type} value={type} className="bg-gray-800">{type}</option>)}
                </select>
                {errors.strategyType && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.strategyType}</p>}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Description</label>
            <textarea
                placeholder="Write a short summary..."
                value={formData.strategyDescription}
                onChange={(e) => setFormData({ ...formData, strategyDescription: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
            />
        </div>
    </>
);

const MarketDetailsSection = ({
    formData,
    setFormData,
    errors,
    availableTimeframes,
    customTimeframes,
    onAddCustomTimeframe,
    onRemoveCustomTimeframe,
    onRemoveDefaultTimeframe,
    availableTradingPairs,
    customTradingPairs,
    onAddCustomTradingPair,
    onRemoveCustomTradingPair,
    onRemoveDefaultTradingPair
}) => (
    <>
        <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2 pt-4">Market Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <EnhancedMultiSelect
                label="Trading Pairs"
                options={availableTradingPairs}
                selected={formData.tradingPairs}
                onChange={(val) => setFormData({ ...formData, tradingPairs: val })}
                error={errors.tradingPairs}
                allowCustom={true}
                customItems={customTradingPairs}
                onAddCustom={onAddCustomTradingPair}
                onRemoveCustom={onRemoveCustomTradingPair}
                onRemoveDefault={onRemoveDefaultTradingPair}
            />
            <EnhancedMultiSelect
                label="Timeframes"
                options={availableTimeframes}
                selected={formData.timeframes}
                onChange={(val) => setFormData({ ...formData, timeframes: val })}
                error={errors.timeframes}
                allowCustom={true}
                customItems={customTimeframes}
                onAddCustom={onAddCustomTimeframe}
                onRemoveCustom={onRemoveCustomTimeframe}
                onRemoveDefault={onRemoveDefaultTimeframe}
            />
        </div>
    </>
);

const StrategyComponentsSection = ({
    formData,
    setFormData,
    errors,
    availableSetupTypes,
    customSetupTypes,
    onAddCustomSetupType,
    onRemoveCustomSetupType,
    onRemoveDefaultSetupType,
    availableConfluences,
    customConfluences,
    onAddCustomConfluence,
    onRemoveCustomConfluence,
    onRemoveDefaultConfluence,
    availableEntryTypes,
    customEntryTypes,
    onAddCustomEntryType,
    onRemoveCustomEntryType,
    onRemoveDefaultEntryType
}) => (
    <>
        <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2 pt-4">Strategy Components</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnhancedMultiSelect
                label="Setup Type"
                options={availableSetupTypes}
                selected={formData.setupType || []}
                onChange={(val) => setFormData({ ...formData, setupType: val })}
                error={errors.setupType}
                allowCustom={true}
                customItems={customSetupTypes}
                onAddCustom={onAddCustomSetupType}
                onRemoveCustom={onRemoveCustomSetupType}
                onRemoveDefault={onRemoveDefaultSetupType}
            />
            <div className="lg:col-span-2">
                <EnhancedMultiSelect
                    label="Confluences"
                    options={availableConfluences}
                    selected={formData.confluences}
                    onChange={(val) => setFormData({ ...formData, confluences: val })}
                    allowCustom={true}
                    customItems={customConfluences}
                    onAddCustom={onAddCustomConfluence}
                    onRemoveCustom={onRemoveCustomConfluence}
                    onRemoveDefault={onRemoveDefaultConfluence}
                />
            </div>
            <div className="lg:col-span-3">
                <EnhancedMultiSelect
                    label="Entry Types"
                    options={availableEntryTypes}
                    selected={formData.entryType}
                    onChange={(val) => setFormData({ ...formData, entryType: val })}
                    allowCustom={true}
                    customItems={customEntryTypes}
                    onAddCustom={onAddCustomEntryType}
                    onRemoveCustom={onRemoveCustomEntryType}
                    onRemoveDefault={onRemoveDefaultEntryType}
                />
            </div>
        </div>
    </>
);

const RiskSettingsSection = ({
    formData,
    setFormData,
    errors,
    availableRiskOptions,
    customRiskOptions,
    onAddCustomRiskOption,
    onRemoveCustomRiskOption,
    onRemoveDefaultRiskOption
}) => (
    <>
        <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2 pt-4">Risk & Backtest Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Initial Balance *</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="e.g., 10000"
                        value={formData.initialBalance}
                        onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                        className={`w-full p-3 pl-10 bg-gray-800/50 border ${errors.initialBalance ? 'border-red-500/50' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
                {errors.initialBalance && <p className="text-red-400 text-sm mt-2 flex items-center gap-2"><AlertCircle size={16} />{errors.initialBalance}</p>}
            </div>
            <EnhancedMultiSelect
                label="Risk per Trade (%)"
                options={availableRiskOptions.map(r => `${r}%`)}
                selected={formData.riskPerTrade}
                onChange={(val) => setFormData({ ...formData, riskPerTrade: val })}
                error={errors.riskPerTrade}
                allowCustom={true}
                customItems={customRiskOptions.map(r => `${r}%`)}
                onAddCustom={(val) => onAddCustomRiskOption(val.replace('%', ''))}
                onRemoveCustom={(val) => onRemoveCustomRiskOption(val.replace('%', ''))}
                onRemoveDefault={(val) => onRemoveDefaultRiskOption(val.replace('%', ''))}
            />
        </div>
    </>
);

const StrategyCard = ({ strategy, onEdit, onDelete }) => (
    <div className="p-[1px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300">
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-[15px] p-6 shadow-lg animate-fade-in-up">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-white">{strategy.strategyName}</h3>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">{strategy.strategyType}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {strategy.tradingPairs.map(pair => <span key={pair} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-mono">{pair}</span>)}
                        {strategy.timeframes.map(tf => <span key={tf} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-mono">{tf}</span>)}
                    </div>

                    {/* Enhanced Strategy Components Display */}
                    <div className="mb-4 space-y-2">
                        {strategy.setupType && (Array.isArray(strategy.setupType) ? strategy.setupType.length > 0 : strategy.setupType) && (
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-400 font-medium min-w-[80px] mt-1">Setup:</span>
                                <div className="flex flex-wrap gap-1">
                                    {(Array.isArray(strategy.setupType) ? strategy.setupType : [strategy.setupType]).map(setup => (
                                        <span key={setup} className={`px-2 py-1 rounded text-xs font-medium ${SETUP_TYPES.includes(setup)
                                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                            }`}>
                                            {setup}
                                            {!SETUP_TYPES.includes(setup) && (
                                                <span className="ml-1 text-[10px] opacity-70">(Custom)</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {strategy.confluences && strategy.confluences.length > 0 && (
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-400 font-medium min-w-[80px] mt-1">Confluences:</span>
                                <div className="flex flex-wrap gap-1">
                                    {strategy.confluences.map(confluence => (
                                        <span key={confluence} className={`px-2 py-1 rounded text-xs font-medium ${CONFLUENCES.includes(confluence)
                                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                            : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                            }`}>
                                            {confluence}
                                            {!CONFLUENCES.includes(confluence) && (
                                                <span className="ml-1 text-[10px] opacity-70">(Custom)</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {strategy.entryType && strategy.entryType.length > 0 && (
                            <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-400 font-medium min-w-[80px] mt-1">Entry:</span>
                                <div className="flex flex-wrap gap-1">
                                    {strategy.entryType.map(entry => (
                                        <span key={entry} className={`px-2 py-1 rounded text-xs font-medium ${ENTRY_TYPES.includes(entry)
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                            }`}>
                                            {entry}
                                            {!ENTRY_TYPES.includes(entry) && (
                                                <span className="ml-1 text-[10px] opacity-70">(Custom)</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {strategy.strategyDescription && <p className="text-gray-400 mt-2 leading-relaxed max-w-2xl mb-4">{strategy.strategyDescription}</p>}
                </div>
                <div className="flex items-center gap-6 mt-2 sm:mt-0">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium">Balance</p>
                        <p className="font-bold text-lg text-green-400">${(strategy.initialBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium">Risk/Trade</p>
                        <p className="font-bold text-lg text-red-400">
                            {Array.isArray(strategy.riskPerTrade)
                                ? strategy.riskPerTrade.map(risk => `${risk}%`).join(', ')
                                : `${strategy.riskPerTrade || 0}%`
                            }
                        </p>
                    </div>
                    <div className="flex gap-2 ml-4 border-l border-white/10 pl-6">
                        <button onClick={() => onEdit(strategy)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Edit Strategy">
                            <Pencil size={18} />
                        </button>
                        <button onClick={() => onDelete(strategy._id)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Delete Strategy">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Page Component ---
export default function StrategyPage() {
    return (
        <ProtectedRoute>
            <StrategyContent />
        </ProtectedRoute>
    );
}

function StrategyContent() {
    const { userId, isLoaded } = useAuth();
    const {
        strategies,
        strategiesLoading,
        fetchStrategies,
        createStrategy,
        updateStrategy,
        deleteStrategy,
        error: contextError,
        fetchSessions
    } = useTrades();

    const initialFormData = {
        strategyName: '', strategyType: '', strategyDescription: '',
        tradingPairs: [], timeframes: [], setupType: [], confluences: [], entryType: [],
        initialBalance: '', riskPerTrade: [],
    };

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    // Custom items state
    const [customSetupTypes, setCustomSetupTypes] = useState([]);
    const [customConfluences, setCustomConfluences] = useState([]);
    const [customEntryTypes, setCustomEntryTypes] = useState([]);
    const [customTimeframes, setCustomTimeframes] = useState([]);
    const [customTradingPairs, setCustomTradingPairs] = useState([]);
    const [customRiskOptions, setCustomRiskOptions] = useState([]);

    // Default items state (for deletion tracking)
    const [availableSetupTypes, setAvailableSetupTypes] = useState([...SETUP_TYPES]);
    const [availableConfluences, setAvailableConfluences] = useState([...CONFLUENCES]);
    const [availableEntryTypes, setAvailableEntryTypes] = useState([...ENTRY_TYPES]);
    const [availableTimeframes, setAvailableTimeframes] = useState([...TIMEFRAMES]);
    const [availableTradingPairs, setAvailableTradingPairs] = useState([...TRADING_PAIRS]);
    const [availableRiskOptions, setAvailableRiskOptions] = useState([...RISK_OPTIONS]);

    const showToast = (message, type = 'success') => setToast({ message, type });
    const closeToast = () => setToast(null);

    useEffect(() => {
        if (contextError) {
            showToast(contextError, 'error');
        }
    }, [contextError]);

    // Extract custom items from existing strategies
    useEffect(() => {
        if (strategies.length > 0) {
            const allSetupTypes = new Set();
            const allConfluences = new Set();
            const allEntryTypes = new Set();
            const allTimeframes = new Set();
            const allTradingPairs = new Set();
            const allRiskOptions = new Set();

            strategies.forEach(strategy => {
                // Check for custom setup types
                if (strategy.setupType && !SETUP_TYPES.includes(strategy.setupType)) {
                    allSetupTypes.add(strategy.setupType);
                }

                // Check for custom confluences
                strategy.confluences?.forEach(confluence => {
                    if (!CONFLUENCES.includes(confluence)) {
                        allConfluences.add(confluence);
                    }
                });

                // Check for custom entry types
                strategy.entryType?.forEach(entryType => {
                    if (!ENTRY_TYPES.includes(entryType)) {
                        allEntryTypes.add(entryType);
                    }
                });

                // Check for custom timeframes
                strategy.timeframes?.forEach(timeframe => {
                    if (!TIMEFRAMES.includes(timeframe)) {
                        allTimeframes.add(timeframe);
                    }
                });

                // Check for custom trading pairs
                strategy.tradingPairs?.forEach(pair => {
                    if (!TRADING_PAIRS.includes(pair)) {
                        allTradingPairs.add(pair);
                    }
                });

                // Check for custom risk options
                if (Array.isArray(strategy.riskPerTrade)) {
                    strategy.riskPerTrade?.forEach(risk => {
                        const riskStr = risk.toString();
                        if (!RISK_OPTIONS.includes(riskStr)) {
                            allRiskOptions.add(riskStr);
                        }
                    });
                } else if (strategy.riskPerTrade && !RISK_OPTIONS.includes(strategy.riskPerTrade.toString())) {
                    allRiskOptions.add(strategy.riskPerTrade.toString());
                }
            });

            setCustomSetupTypes(Array.from(allSetupTypes));
            setCustomConfluences(Array.from(allConfluences));
            setCustomEntryTypes(Array.from(allEntryTypes));
            setCustomTimeframes(Array.from(allTimeframes));
            setCustomTradingPairs(Array.from(allTradingPairs));
            setCustomRiskOptions(Array.from(allRiskOptions));
        }
    }, [strategies]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.strategyName.trim()) newErrors.strategyName = 'Strategy name is required';
        if (!formData.strategyType) newErrors.strategyType = 'Strategy type is required';
        if (formData.tradingPairs.length === 0) newErrors.tradingPairs = 'Select at least one pair';
        if (formData.timeframes.length === 0) newErrors.timeframes = 'Select at least one timeframe';
        if (!formData.setupType || formData.setupType.length === 0) newErrors.setupType = 'At least one setup type is required';
        if (!formData.initialBalance || parseFloat(formData.initialBalance) <= 0) newErrors.initialBalance = 'A valid balance is required';
        if (!formData.riskPerTrade || formData.riskPerTrade.length === 0) newErrors.riskPerTrade = 'Select at least one risk percentage';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            // Convert risk percentages back to numbers (remove % if present)
            const riskValues = formData.riskPerTrade.map(risk => {
                const cleanRisk = risk.toString().replace('%', '');
                return parseFloat(cleanRisk);
            });
            const submitData = { ...formData, initialBalance: parseFloat(formData.initialBalance), riskPerTrade: riskValues };

            if (editingId) {
                await updateStrategy(editingId, submitData);
                showToast('Strategy updated successfully!');
                fetchSessions();
            } else {
                await createStrategy(submitData);
                showToast('Strategy created successfully!');
                fetchSessions();
            }

            handleCancelForm();
        } catch (err) {
            showToast(err.message || (editingId ? 'Failed to update strategy' : 'Failed to create strategy'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (strategy) => {
        // Handle both array and single value for backward compatibility
        let riskPerTradeArray = [];
        if (Array.isArray(strategy.riskPerTrade)) {
            riskPerTradeArray = strategy.riskPerTrade.map(risk => `${risk}%`);
        } else if (strategy.riskPerTrade) {
            riskPerTradeArray = [`${strategy.riskPerTrade}%`];
        }

        setFormData({
            strategyName: strategy.strategyName || '',
            strategyType: strategy.strategyType || '',
            strategyDescription: strategy.strategyDescription || '',
            tradingPairs: strategy.tradingPairs || [],
            timeframes: strategy.timeframes || [],
            setupType: Array.isArray(strategy.setupType) ? strategy.setupType : (strategy.setupType ? [strategy.setupType] : []),
            confluences: strategy.confluences || [],
            entryType: strategy.entryType || [],
            initialBalance: (strategy.initialBalance || '').toString(),
            riskPerTrade: riskPerTradeArray,
        });
        setEditingId(strategy._id);
        setShowForm(true);
        setErrors({});
    };

    const openDeleteModal = (id) => setDeleteModal({ isOpen: true, id });
    const closeDeleteModal = () => setDeleteModal({ isOpen: false, id: null });

    const handleDelete = async () => {
        const id = deleteModal.id;
        if (!id) return;
        try {
            await deleteStrategy(id);
            showToast('Strategy deleted successfully!');
        } catch (err) {
            showToast(err.message || 'Failed to delete strategy', 'error');
        } finally {
            closeDeleteModal();
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        setErrors({});
    };

    // Custom item handlers
    const handleAddCustomSetupType = (customSetup) => {
        if (!customSetupTypes.includes(customSetup)) {
            setCustomSetupTypes(prev => [...prev, customSetup]);
        }
    };

    const handleRemoveCustomSetupType = (customSetup) => {
        setCustomSetupTypes(prev => prev.filter(item => item !== customSetup));
    };

    const handleRemoveDefaultSetupType = (defaultSetup) => {
        setAvailableSetupTypes(prev => prev.filter(item => item !== defaultSetup));
    };

    const handleAddCustomConfluence = (customConfluence) => {
        if (!customConfluences.includes(customConfluence)) {
            setCustomConfluences(prev => [...prev, customConfluence]);
        }
    };

    const handleRemoveCustomConfluence = (customConfluence) => {
        setCustomConfluences(prev => prev.filter(item => item !== customConfluence));
    };

    const handleRemoveDefaultConfluence = (defaultConfluence) => {
        setAvailableConfluences(prev => prev.filter(item => item !== defaultConfluence));
    };

    const handleAddCustomEntryType = (customEntryType) => {
        if (!customEntryTypes.includes(customEntryType)) {
            setCustomEntryTypes(prev => [...prev, customEntryType]);
        }
    };

    const handleRemoveCustomEntryType = (customEntryType) => {
        setCustomEntryTypes(prev => prev.filter(item => item !== customEntryType));
    };

    const handleRemoveDefaultEntryType = (defaultEntryType) => {
        setAvailableEntryTypes(prev => prev.filter(item => item !== defaultEntryType));
    };

    const handleAddCustomTimeframe = (customTimeframe) => {
        if (!customTimeframes.includes(customTimeframe)) {
            setCustomTimeframes(prev => [...prev, customTimeframe]);
        }
    };

    const handleRemoveCustomTimeframe = (customTimeframe) => {
        setCustomTimeframes(prev => prev.filter(item => item !== customTimeframe));
    };

    const handleRemoveDefaultTimeframe = (defaultTimeframe) => {
        setAvailableTimeframes(prev => prev.filter(item => item !== defaultTimeframe));
    };

    const handleAddCustomTradingPair = (customPair) => {
        if (!customTradingPairs.includes(customPair)) {
            setCustomTradingPairs(prev => [...prev, customPair]);
        }
    };

    const handleRemoveCustomTradingPair = (customPair) => {
        setCustomTradingPairs(prev => prev.filter(item => item !== customPair));
    };

    const handleRemoveDefaultTradingPair = (defaultPair) => {
        setAvailableTradingPairs(prev => prev.filter(item => item !== defaultPair));
    };

    const handleAddCustomRiskOption = (customRisk) => {
        if (!customRiskOptions.includes(customRisk)) {
            setCustomRiskOptions(prev => [...prev, customRisk]);
        }
    };

    const handleRemoveCustomRiskOption = (customRisk) => {
        setCustomRiskOptions(prev => prev.filter(item => item !== customRisk));
    };

    const handleRemoveDefaultRiskOption = (defaultRisk) => {
        setAvailableRiskOptions(prev => prev.filter(item => item !== defaultRisk));
    };

    const renderForm = () => (
        <div className="mb-8 animate-fade-in-up relative z-[50]">
            <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-lg relative">
                <h2 className="text-2xl font-bold mb-6 text-white">{editingId ? 'Edit Strategy' : 'Create New Strategy'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <BasicInfoSection
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                    />

                    <MarketDetailsSection
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        availableTimeframes={availableTimeframes}
                        customTimeframes={customTimeframes}
                        onAddCustomTimeframe={handleAddCustomTimeframe}
                        onRemoveCustomTimeframe={handleRemoveCustomTimeframe}
                        onRemoveDefaultTimeframe={handleRemoveDefaultTimeframe}
                        availableTradingPairs={availableTradingPairs}
                        customTradingPairs={customTradingPairs}
                        onAddCustomTradingPair={handleAddCustomTradingPair}
                        onRemoveCustomTradingPair={handleRemoveCustomTradingPair}
                        onRemoveDefaultTradingPair={handleRemoveDefaultTradingPair}
                    />

                    <StrategyComponentsSection
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        availableSetupTypes={availableSetupTypes}
                        customSetupTypes={customSetupTypes}
                        onAddCustomSetupType={handleAddCustomSetupType}
                        onRemoveCustomSetupType={handleRemoveCustomSetupType}
                        onRemoveDefaultSetupType={handleRemoveDefaultSetupType}
                        availableConfluences={availableConfluences}
                        customConfluences={customConfluences}
                        onAddCustomConfluence={handleAddCustomConfluence}
                        onRemoveCustomConfluence={handleRemoveCustomConfluence}
                        onRemoveDefaultConfluence={handleRemoveDefaultConfluence}
                        availableEntryTypes={availableEntryTypes}
                        customEntryTypes={customEntryTypes}
                        onAddCustomEntryType={handleAddCustomEntryType}
                        onRemoveCustomEntryType={handleRemoveCustomEntryType}
                        onRemoveDefaultEntryType={handleRemoveDefaultEntryType}
                    />

                    <RiskSettingsSection
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        availableRiskOptions={availableRiskOptions}
                        customRiskOptions={customRiskOptions}
                        onAddCustomRiskOption={handleAddCustomRiskOption}
                        onRemoveCustomRiskOption={handleRemoveCustomRiskOption}
                        onRemoveDefaultRiskOption={handleRemoveDefaultRiskOption}
                    />

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed">
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    {editingId ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    {editingId ? 'Update Strategy' : 'Create Strategy'}
                                </>
                            )}
                        </button>
                        <button type="button" onClick={handleCancelForm} className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200">
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderStrategyList = () => (
        <div className="space-y-6">
            {strategiesLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading strategies...</p>
                </div>
            ) : strategies.length === 0 ? (
                <div className="text-center py-20 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Strategies Found</h3>
                    <p className="text-gray-500 mb-6">Click "New Strategy" to build your first one.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {strategies.map((strategy) => (
                        <StrategyCard
                            key={strategy._id}
                            strategy={strategy}
                            onEdit={handleEdit}
                            onDelete={openDeleteModal}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-black text-white relative">
            <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
                <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
            </div>
            <div className="relative z-10">
                {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
                <ConfirmModal isOpen={deleteModal.isOpen} title="Delete Strategy" message="Are you sure you want to delete this strategy? This action cannot be undone." onConfirm={handleDelete} onCancel={closeDeleteModal} />
                <div className="p-4 sm:p-8 max-w-6xl mx-auto">
                    <div className="mb-12">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-bold pb-1 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Strategy Blueprints</h1>
                                <p className="text-gray-400 mt-2">Define, manage, and refine your trading strategies.</p>
                            </div>
                            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 transform hover:scale-105 w-full sm:w-auto">
                                <Plus size={20} />
                                {showForm ? 'Close Form' : 'New Strategy'}
                            </button>
                        </div>
                    </div>
                    {showForm && renderForm()}
                    {renderStrategyList()}
                </div>
            </div>
        </div>
    );
}