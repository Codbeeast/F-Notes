import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const NewsImpactModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  impactType, 
  currentDetails = '' 
}) => {
  const [impactDetails, setImpactDetails] = useState(currentDetails);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setImpactDetails(currentDetails);
  }, [currentDetails, isOpen]);

  const handleSave = async () => {
    if (!impactDetails.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(impactDetails.trim());
      onClose();
    } catch (error) {
      console.error('Error saving news impact details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isPositive = impactType === 'positively affected';
  const iconColor = isPositive ? 'text-green-400' : 'text-red-400';
  const borderColor = isPositive ? 'border-green-500/30' : 'border-red-500/30';
  const bgColor = isPositive ? 'bg-green-600/10' : 'bg-red-600/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-white/10 ${bgColor}`}>
          <div className="flex items-center gap-3">
            {isPositive ? (
              <TrendingUp className={`w-6 h-6 ${iconColor}`} />
            ) : (
              <TrendingDown className={`w-6 h-6 ${iconColor}`} />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                News Impact Details
              </h3>
              <p className="text-sm text-gray-400">
                How was your trade {impactType}?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Describe the impact:
            </label>
            <textarea
              value={impactDetails}
              onChange={(e) => setImpactDetails(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Explain how the news ${impactType} your trade...`}
              className="w-full h-32 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoFocus
            />
          </div>

          {/* Helper text */}
          <div className="flex items-start gap-2 mb-6 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <p className="font-medium mb-1">Examples:</p>
              <ul className="space-y-1 text-blue-400/80">
                {isPositive ? (
                  <>
                    <li>• "NFP data boosted USD strength, helped my long position"</li>
                    <li>• "ECB dovish stance weakened EUR as expected"</li>
                    <li>• "Risk-on sentiment supported my commodity trade"</li>
                  </>
                ) : (
                  <>
                    <li>• "Unexpected hawkish Fed comments reversed my short"</li>
                    <li>• "Flash crash during news release hit my stop loss"</li>
                    <li>• "Market volatility increased spread and slippage"</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!impactDetails.trim() || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isPositive
                  ? 'bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30'
                  : 'bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Details'}
            </button>
          </div>

          {/* Keyboard shortcuts */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl + Enter</kbd> to save, 
              <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs ml-1">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsImpactModal;
