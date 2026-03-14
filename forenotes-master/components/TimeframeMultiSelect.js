import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TimeframeMultiSelect = ({
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Select Timeframes",
  rowId,
  field = 'timeFrame', // Add field parameter with default
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse current value into array
  const selectedTimeframes = value ?
    (typeof value === 'string' ? value.split(', ').map(t => t.trim()).filter(t => t) : []) : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle checkbox toggle
  const handleToggle = (timeframe) => {
    if (disabled) return;

    let newTimeframes;
    if (selectedTimeframes.includes(timeframe)) {
      // Remove if already selected
      newTimeframes = selectedTimeframes.filter(t => t !== timeframe);
    } else {
      // Add if not selected
      newTimeframes = [...selectedTimeframes, timeframe];
    }

    const newValue = newTimeframes.join(', ');
    onChange(rowId, field, newValue); // Use dynamic field parameter
  };

  // Display text for the button
  const getDisplayText = () => {
    if (selectedTimeframes.length === 0) {
      return placeholder;
    }
    if (selectedTimeframes.length === 1) {
      return selectedTimeframes[0];
    }
    return `${selectedTimeframes.length} selected`;
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
    >
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${disabled
            ? 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
            : isOpen
              ? 'bg-black/30 text-white border-blue-400 ring-2 ring-blue-400'
              : 'bg-black/30 text-white border-white/10 hover:border-white/20'
          }`}
      >
        <span className={`truncate text-left ${selectedTimeframes.length === 0 ? 'text-gray-400' : ''}`}>
          {getDisplayText()}
        </span>
        {!disabled && (
          isOpen ? <ChevronUp className="w-4 h-4 ml-2 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">
              No timeframes available
            </div>
          ) : (
            options.map((timeframe, idx) => {
              const isSelected = selectedTimeframes.includes(timeframe);
              return (
                <div
                  key={`${timeframe}-${idx}`}
                  onClick={() => handleToggle(timeframe)}
                  className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className={`w-4 h-4 mr-3 border-2 rounded flex items-center justify-center ${isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-400 bg-transparent'
                    }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white">
                    {timeframe}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected timeframes display (optional - shows below the dropdown) */}
      {selectedTimeframes.length > 0 && !isOpen && (
        <div className="mt-1 text-xs text-blue-300 bg-blue-900/30 rounded px-2 py-1 break-words border border-blue-500/30">
          {selectedTimeframes.join(', ')}
        </div>
      )}
    </div>
  );
};

export default TimeframeMultiSelect;