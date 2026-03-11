import React from 'react';
import { Plus } from 'lucide-react';

const AddTradeButton = ({ onAddRow, tradesCount, sessionsCount, showAllMonths }) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={onAddRow}
        className="flex items-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-600 text-white px-8 py-3 rounded-2xl shadow-xl hover:from-gray-900 hover:to-gray-700 transition-all font-bold text-lg drop-shadow-lg mr-4"
        style={{ order: 0 }}
      >
        <Plus className="w-7 h-7" />
        <span>Add Trade</span>
      </button>
      <div className="text-sm text-gray-400" style={{ order: 1 }}>
        {tradesCount} trades • {sessionsCount} sessions available
        {!showAllMonths && (
          <span className="ml-2 px-2 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded text-xs">
            Current Month Only
          </span>
        )}
      </div>
    </div>
  );
};

export default AddTradeButton;
