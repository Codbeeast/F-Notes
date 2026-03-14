import React, { useState, useEffect } from 'react';
import { Brain, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import ReactDOM from "react-dom";

const ModelPage = ({ trade, onClose, onSave, onAutoSave }) => {
  const [formData, setFormData] = useState({
    fearToGreed: trade?.fearToGreed || 5,
    fomoRating: trade?.fomoRating || 5,
    executionRating: trade?.executionRating || 5,
    patience: trade?.patience || 5,
    confidence: trade?.confidence || 5
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset form when trade changes
  useEffect(() => {
    setFormData({
      fearToGreed: trade?.fearToGreed || 5,
      fomoRating: trade?.fomoRating || 5,
      executionRating: trade?.executionRating || 5,
      patience: trade?.patience || 5,
      confidence: trade?.confidence || 5
    });
  }, [trade]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Call the parent's save function
      await onSave(formData);
      setSuccess(true);

      // Note: The onSave (handleModelSave) already saves the trade to DB,
      // so we don't need to call onAutoSave here. Calling it would create a duplicate.

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to save ratings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating <= 3) return 'text-red-400';
    if (rating <= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRatingLabel = (rating) => {
    if (rating <= 3) return 'Low';
    if (rating <= 6) return 'Medium';
    return 'High';
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-7 h-7 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Trading Psychology</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trade Info */}
        {trade && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-blue-500/20">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">{trade.pair}</span> •
              <span className="ml-2">{trade.date}</span> •
              <span className="ml-2">{trade.time}</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">Ratings saved successfully!</span>
            </div>
          </div>
        )}

        {/* Rating Controls */}
        <div className="space-y-6">
          {/* Fear to Greed */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Fear to Greed Rating</label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400 w-8">Fear</span>
              <input type="range" min="1" max="10" value={formData.fearToGreed} onChange={e => handleChange('fearToGreed', e.target.value)} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
              <span className="text-xs text-gray-400 w-8">Greed</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current: {formData.fearToGreed}/10</span>
              <span className={`text-sm font-semibold ${getRatingColor(formData.fearToGreed)}`}>{getRatingLabel(formData.fearToGreed)}</span>
            </div>
          </div>
          {/* FOMO Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">FOMO Control</label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400 w-8">Low</span>
              <input type="range" min="1" max="10" value={formData.fomoRating} onChange={e => handleChange('fomoRating', e.target.value)} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
              <span className="text-xs text-gray-400 w-8">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current: {formData.fomoRating}/10</span>
              <span className={`text-sm font-semibold ${getRatingColor(formData.fomoRating)}`}>{getRatingLabel(formData.fomoRating)}</span>
            </div>
          </div>
          {/* Execution Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Execution Rating</label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400 w-8">Poor</span>
              <input type="range" min="1" max="10" value={formData.executionRating} onChange={e => handleChange('executionRating', e.target.value)} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
              <span className="text-xs text-gray-400 w-8">Great</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current: {formData.executionRating}/10</span>
              <span className={`text-sm font-semibold ${getRatingColor(formData.executionRating)}`}>{getRatingLabel(formData.executionRating)}</span>
            </div>
          </div>
          {/* Patience Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Patience</label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400 w-8">Low</span>
              <input type="range" min="1" max="10" value={formData.patience} onChange={e => handleChange('patience', e.target.value)} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
              <span className="text-xs text-gray-400 w-8">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current: {formData.patience}/10</span>
              <span className={`text-sm font-semibold ${getRatingColor(formData.patience)}`}>{getRatingLabel(formData.patience)}</span>
            </div>
          </div>
          {/* Confidence Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Confidence</label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400 w-8">Low</span>
              <input type="range" min="1" max="10" value={formData.confidence} onChange={e => handleChange('confidence', e.target.value)} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
              <span className="text-xs text-gray-400 w-8">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current: {formData.confidence}/10</span>
              <span className={`text-sm font-semibold ${getRatingColor(formData.confidence)}`}>{getRatingLabel(formData.confidence)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${saving
                ? 'bg-yellow-600 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Ratings</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          background: #475569;
          border-radius: 4px;
        }
        
        .slider::-moz-range-track {
          background: #475569;
          border-radius: 4px;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ModelPage;