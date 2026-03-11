import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import ReactDOM from 'react-dom';

const TradeNotesModal = ({
  isOpen,
  onClose,
  onSave,
  initialNotes = '',
  tradeData = {},
  isEditable = true
}) => {
  const [notes, setNotes] = useState({
    setup: '',
    execution: '',
    improvement: ''
  });

  useEffect(() => {
    // Reset to empty state when modal opens
    if (isOpen) {
      if (initialNotes && typeof initialNotes === 'string' && initialNotes.trim() !== '') {
        try {
          // Try to parse if it's JSON
          const parsed = JSON.parse(initialNotes);
          setNotes(parsed);
        } catch {
          // If it's plain text, put it in setup field
          setNotes({
            setup: initialNotes,
            execution: '',
            improvement: ''
          });
        }
      } else if (initialNotes && typeof initialNotes === 'object') {
        setNotes(initialNotes);
      } else {
        // Reset to empty if no notes
        setNotes({
          setup: '',
          execution: '',
          improvement: ''
        });
      }
    }
  }, [initialNotes, isOpen]);

  const handleSave = () => {
    // Save as JSON string for database
    const notesString = JSON.stringify(notes);
    onSave(notesString);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/40 to-purple-900/40">
          <div>
            <h2 className="text-2xl font-bold text-white">Trade Notes</h2>
            {tradeData.date && (
              <p className="text-sm text-gray-400 mt-1">
                {new Date(tradeData.date).toLocaleDateString()} 
                {tradeData.pair && ` • ${tradeData.pair}`}
                {tradeData.strategyName && ` • ${tradeData.strategyName}`}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Why I Took This Trade */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-blue-300">
              Why I Took This Trade
              <span className="text-gray-400 font-normal ml-2">(Setup / Reason / What I saw)</span>
            </label>
            <textarea
              value={notes.setup}
              onChange={(e) => isEditable && setNotes({ ...notes, setup: e.target.value })}
              placeholder="Describe your setup, confluences, and what made you take this trade..."
              className={`w-full h-32 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none ${!isEditable ? 'cursor-not-allowed opacity-75' : ''}`}
              readOnly={!isEditable}
            />
          </div>

          {/* How I Managed It */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-purple-300">
              How I Managed It
              <span className="text-gray-400 font-normal ml-2">(Execution, Emotions, Discipline)</span>
            </label>
            <textarea
              value={notes.execution}
              onChange={(e) => isEditable && setNotes({ ...notes, execution: e.target.value })}
              placeholder="E.g., 'Entered early, felt anxious, moved SL too soon'..."
              className={`w-full h-32 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none ${!isEditable ? 'cursor-not-allowed opacity-75' : ''}`}
              readOnly={!isEditable}
            />
          </div>

          {/* What I Can Do Better */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-green-300">
              What I Can Do Better Next Time
              <span className="text-gray-400 font-normal ml-2">(One clear improvement point)</span>
            </label>
            <textarea
              value={notes.improvement}
              onChange={(e) => isEditable && setNotes({ ...notes, improvement: e.target.value })}
              placeholder="Identify one specific thing to improve for next time..."
              className={`w-full h-32 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none ${!isEditable ? 'cursor-not-allowed opacity-75' : ''}`}
              readOnly={!isEditable}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/10 bg-black/20">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
          >
            {isEditable ? 'Cancel' : 'Close'}
          </button>
          {isEditable && (
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all font-medium flex items-center space-x-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Notes</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TradeNotesModal;