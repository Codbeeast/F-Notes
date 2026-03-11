import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, TrendingUp, TrendingDown, Edit3, Trash2, ExternalLink, Brain } from 'lucide-react';
import TradeNotesModal from '@/components/TradeJournalNotes';

const JournalListView = ({ trades, strategies = [], handleChange, onEdit, onDelete }) => {
    const [notesModal, setNotesModal] = useState({
        isOpen: false,
        rowId: null,
        currentNotes: '',
        tradeData: {},
        isEditable: true
    });

    // Helper to get strategy name
    const getStrategyName = (trade) => {
        if (trade.strategyName) return trade.strategyName;
        if (!trade.strategy) return 'N/A';

        // If strategy is an object (populated), return its name
        if (typeof trade.strategy === 'object' && trade.strategy.strategyName) {
            return trade.strategy.strategyName;
        }

        // If strategy is an ID string, find it in the strategies list
        const strategyId = trade.strategy;
        const foundStrategy = strategies.find(s => s._id === strategyId || s.id === strategyId);
        return foundStrategy ? foundStrategy.strategyName : strategyId.substring(0, 8) + '...';
    };

    if (!trades || trades.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10">
                <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-300">No Trades Found</h3>
                <p className="text-gray-500 mt-2">Start your journey by adding your first trade.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {trades.map((trade, index) => {
                    const isWin = (Number(trade.pnl) || 0) > 0;
                    const pnlColor = isWin ? 'text-green-400' : (Number(trade.pnl) || 0) < 0 ? 'text-red-400' : 'text-gray-400';
                    const hasNotes = trade.notes && trade.notes.length > 0;
                    const bgGradient = isWin
                        ? 'from-green-500/10 to-green-900/5'
                        : (Number(trade.pnl) || 0) < 0
                            ? 'from-red-500/10 to-red-900/5'
                            : 'from-gray-800/20 to-gray-900/20';

                    // Get the first image if available
                    const tradeImage = trade.image || (trade.images && trade.images.length > 0 ? trade.images[0] : null);

                    return (
                        <motion.div
                            key={trade.id || trade._id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10"
                        >
                            {/* Header / Image Area */}
                            <div className="relative h-48 w-full overflow-hidden bg-gray-900/50">
                                {tradeImage ? (
                                    <img
                                        src={tradeImage}
                                        alt={`${trade.pair} Chart`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                        <TrendingUp className="w-12 h-12 text-gray-700" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${trade.rulesFollowed === 'Yes'
                                        ? 'bg-green-500/80 text-white'
                                        : trade.rulesFollowed === 'No'
                                            ? 'bg-red-500/80 text-white'
                                            : 'bg-yellow-500/80 text-black'
                                        }`}>
                                        {trade.rulesFollowed === 'Yes' ? 'Disciplined' : 'Undisciplined'}
                                    </span>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className={`p-6 bg-gradient-to-b ${bgGradient}`}>
                                {/* Top Row: Pair & Session */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">{trade.pair}</h3>
                                            <span className="px-2 py-0.5 rounded-full border border-white/20 text-[10px] text-gray-400 uppercase tracking-widest">
                                                {trade.assetClass || 'Forex'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                            <span>{trade.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span>{trade.session?.replace(/session/i, '').trim()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span>{trade.time} UTC</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase text-white shadow-lg text-center ${trade.positionType === 'Long' ? 'bg-green-600' : 'bg-red-600'
                                            }`}>
                                            {trade.positionType}
                                        </div>
                                        <button
                                            onClick={() => onEdit(trade)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Edit3 className="w-3 h-3" /> EDIT
                                        </button>
                                    </div>
                                </div>

                                {/* Strategy & Metrics Grid */}
                                <div className="grid grid-cols-4 gap-y-4 gap-x-2 border-t border-white/5 py-4 mb-4">
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Strategy</div>
                                        <div className="text-sm font-semibold text-gray-200 break-words leading-tight" title={getStrategyName(trade)}>
                                            {getStrategyName(trade)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Entry Type</div>
                                        <div className="text-sm font-semibold text-gray-200 break-words leading-tight" title={Array.isArray(trade.entryType) ? trade.entryType.join(', ') : trade.entryType}>{Array.isArray(trade.entryType) ? trade.entryType.join(', ') : trade.entryType || '-'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risk</div>
                                        <div className="text-sm font-semibold text-gray-200">${trade.risk}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">R-Factor</div>
                                        <div className="text-sm font-semibold text-gray-200">{trade.rFactor}R</div>
                                    </div>
                                </div>

                                {/* Trade Details Card */}
                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Entry</div>
                                            <div className="text-lg font-mono font-bold text-white">{trade.entry}</div>
                                            <div className="text-[10px] text-gray-500 mt-3 uppercase tracking-wider mb-1">Setup</div>
                                            <div className="text-sm text-gray-300 break-words leading-tight" title={Array.isArray(trade.setupType) ? trade.setupType.join(', ') : trade.setupType || '-'}>
                                                {Array.isArray(trade.setupType) ? trade.setupType.join(', ') : trade.setupType || '-'}
                                            </div>
                                        </div>
                                        <div className="border-l border-white/10 pl-4">
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Size / Lots</div>
                                            <div className="text-lg font-mono font-bold text-white">{trade.lotSize}L</div>
                                            <div className="text-[10px] text-gray-500 mt-3 uppercase tracking-wider mb-1">TF Used</div>
                                            <div className="text-sm text-gray-300 break-words leading-tight" title={Array.isArray(trade.timeFrame) ? trade.timeFrame.join(', ') : trade.timeFrame || '-'}>
                                                {Array.isArray(trade.timeFrame) ? trade.timeFrame.join(', ') : trade.timeFrame || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Execution Analysis / Notes */}
                                <div className="mb-6">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 text-center">Execution Analysis</div>
                                    <button
                                        onClick={() => setNotesModal({
                                            isOpen: true,
                                            rowId: trade.id || trade._id,
                                            currentNotes: trade.notes || '',
                                            tradeData: trade,
                                            isEditable: true
                                        })}
                                        className={`w-full py-2 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${hasNotes
                                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <Brain className="w-3.5 h-3.5" />
                                        {hasNotes ? 'View Analysis' : 'Add Analysis'}
                                    </button>
                                </div>

                                {/* Footer PnL */}
                                <div className="bg-black/60 rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-inner relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">PnL</div>
                                        <div className="text-xs text-gray-400">{Math.abs(trade.pipsLost || 0)} Pips</div>
                                    </div>
                                    <div className={`relative z-10 text-2xl font-bold flex items-center gap-1 ${pnlColor}`}>
                                        {isWin ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        ${Math.abs(trade.pnl).toLocaleString()}
                                    </div>

                                    {/* Background glow effect */}
                                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${isWin ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <TradeNotesModal
                isOpen={notesModal.isOpen}
                onClose={() => setNotesModal({
                    isOpen: false,
                    rowId: null,
                    currentNotes: '',
                    tradeData: {},
                    isEditable: true
                })}
                onSave={(notesString) => {
                    if (notesModal.rowId && handleChange) {
                        handleChange(notesModal.rowId, 'notes', notesString);
                    }
                    // Reset the modal state after saving
                    setNotesModal({
                        isOpen: false,
                        rowId: null,
                        currentNotes: '',
                        tradeData: {},
                        isEditable: true
                    });
                }}
                initialNotes={notesModal.currentNotes}
                tradeData={notesModal.tradeData || {}}
                isEditable={notesModal.isEditable !== undefined ? notesModal.isEditable : true}
            />
        </>
    );
};

export default JournalListView;
