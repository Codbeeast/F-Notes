import React, { useRef, useEffect, useState } from 'react';
import { Calendar, Brain, Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import CloudinaryImageUpload from '@/components/CloudinaryImageUpload';
import TimeframeMultiSelect from '@/components/TimeframeMultiSelect';
import TradeNotesModal from '@/components/TradeJournalNotes';

const JournalTable = ({
  rows,
  columns,
  editMode = false,
  sessions,
  strategies,
  editingRows,
  handleChange,
  handleNewsImpactChange,
  removeRow,
  openModelPage,
  openImageViewer,
  getHeaderName,
  getCellType,
  getDropdownOptions,
  shouldShowNewsField,
  weeklyData = null,
  formatWeekRange = null
}) => {

  const scrollContainerRef = useRef(null);

  const [notesModal, setNotesModal] = useState({
    isOpen: false,
    rowId: null,
    currentNotes: '',
    tradeData: {},
    isEditable: true
  });

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';

    try {
      // Handle both ISO strings and Date objects
      let date;
      if (typeof dateValue === 'string') {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }

      if (isNaN(date.getTime())) return '';

      // Format as YYYY-MM-DD for HTML date input
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Handle time change - REMOVED automatic session update
  const handleTimeChange = (rowId, value) => {
    handleChange(rowId, 'time', value);
    // Session is now selected manually - no automatic update
  };

  // Helper function to get strategy-specific options
  const getStrategyOptions = (row, fieldType) => {
    if (!row.strategy || !strategies) return [];

    const selectedStrategy = strategies.find(s => s._id === row.strategy);
    if (!selectedStrategy) return [];

    switch (fieldType) {
      case 'confluences':
        return selectedStrategy.confluences || [];
      case 'setupType':
        return selectedStrategy.setupType || [];
      case 'entryType':
        return selectedStrategy.entryType || [];
      case 'timeframes':
        return selectedStrategy.timeframes || [];
      default:
        return [];
    }
  };

  // Helper function to handle timeframe multi-select
  const handleTimeframeChange = (rowId, selectedValue, currentValue) => {
    console.log('handleTimeframeChange called:', { rowId, selectedValue, currentValue });

    if (!selectedValue) {
      return;
    }

    const currentTimeframes = currentValue ?
      (typeof currentValue === 'string' ?
        currentValue.split(', ').map(t => t.trim()).filter(t => t) :
        [currentValue].filter(t => t)
      ) : [];

    console.log('Current timeframes:', currentTimeframes);

    let newTimeframes;
    if (currentTimeframes.includes(selectedValue)) {
      // Remove if already selected
      newTimeframes = currentTimeframes.filter(t => t !== selectedValue);
      console.log('Removing timeframe:', selectedValue, 'New array:', newTimeframes);
    } else {
      // Add if not selected
      newTimeframes = [...currentTimeframes, selectedValue];
      console.log('Adding timeframe:', selectedValue, 'New array:', newTimeframes);
    }

    const newValue = newTimeframes.join(', ');
    console.log('Final timeframes value:', newValue);
    handleChange(rowId, 'timeFrame', newValue);
  };

  // Helper function to get trade result status
  const getTradeStatus = (row) => {
    if (row.pnl < 0 || row.pipsLost < 0) return { status: 'loss', color: 'text-red-400', icon: TrendingDown };
    if (row.pnl > 0) return { status: 'profit', color: 'text-green-400', icon: TrendingUp };
    return { status: 'neutral', color: 'text-gray-400', icon: null };
  };

  // Helper function to format PnL display
  const formatPnL = (pnl) => {
    if (pnl === null || pnl === undefined) return '-';
    const formatted = parseFloat(pnl).toFixed(2);
    return pnl >= 0 ? `+${formatted}` : `-${Math.abs(formatted)}`;
  };

  // Helper function to get psychology rating color
  const getPsychologyColor = (rating) => {
    if (!rating || rating === 0) return 'text-gray-500';
    if (rating <= 3) return 'text-red-400';
    if (rating <= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  // Helper function to render cell content based on type - Updated to use row ID
  const renderCellContent = (row, col, isEditable) => {
    const cellType = getCellType(col);
    const rowId = row.id || row._id;

    switch (cellType) {
      case 'psychology':
        return (
          <div className="w-20 text-center">
            {row[col] ? (
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${row[col] <= 3 ? 'bg-red-900/70 text-red-300' :
                row[col] <= 6 ? 'bg-yellow-900/70 text-yellow-300' :
                  'bg-green-900/70 text-green-300'
                }`}>
                {row[col]}/10
              </span>
            ) : (
              <span className="text-gray-500 text-xs">-</span>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={formatDateForInput(row[col])}
            onChange={e => handleChange(rowId, col, e.target.value)}
            disabled={!isEditable}
            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-gray-800 text-white border-gray-600 [color-scheme:dark]' :
              'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed [color-scheme:dark]'
              }`}
            placeholder="Select date"
          />
        );

      case 'dropdown':
        if (col === 'session') {
          return (
            <select
              value={row.session || ''}
              onChange={e => handleChange(rowId, 'session', e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">Select Session</option>
              {getDropdownOptions('session').map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }

        if (col === 'strategy') {
          // For display-only mode, show the strategy name
          if (!isEditable && row.strategyName) {
            return (
              <div className="w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 bg-gray-700/40 text-gray-300 border border-gray-600/40">
                {row.strategyName}
              </div>
            );
          }

          // For editable mode, show dropdown
          return (
            <select
              value={row.strategy || ''} // Use the strategy ID
              onChange={e => {
                const selectedStrategyId = e.target.value;
                console.log('Strategy selection changed:', {
                  rowId,
                  oldValue: row.strategy,
                  newValue: selectedStrategyId,
                  selectedStrategy: strategies?.find(s => s._id === selectedStrategyId)
                });

                // Update strategy ID
                handleChange(rowId, 'strategy', selectedStrategyId);

                // Find the selected strategy and update related fields
                const selectedStrategy = strategies?.find(s => s._id === selectedStrategyId);
                if (selectedStrategy) {
                  // Update strategy name
                  handleChange(rowId, 'strategyName', selectedStrategy.strategyName);

                  // Update trading pairs (set first pair as default)
                  if (selectedStrategy.tradingPairs && selectedStrategy.tradingPairs.length > 0) {
                    handleChange(rowId, 'pair', selectedStrategy.tradingPairs[0]);
                    handleChange(rowId, 'pairs', selectedStrategy.tradingPairs[0]);
                  } else {
                    handleChange(rowId, 'pair', '');
                    handleChange(rowId, 'pairs', '');
                  }

                  // ONLY clear these fields, don't populate them - user will select manually
                  handleChange(rowId, 'confluence', '');
                  handleChange(rowId, 'setupType', '');
                  handleChange(rowId, 'entryType', '');
                  handleChange(rowId, 'timeFrame', '');

                } else {
                  // Clear all strategy-related fields if no strategy selected
                  handleChange(rowId, 'strategyName', '');
                  handleChange(rowId, 'pair', '');
                  handleChange(rowId, 'pairs', '');
                  handleChange(rowId, 'confluence', '');
                  handleChange(rowId, 'setupType', '');
                  handleChange(rowId, 'entryType', '');
                  handleChange(rowId, 'timeframes', '');
                }
              }}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">Select Strategy</option>
              {strategies && strategies.length > 0 ? (
                strategies.map(strategy => (
                  <option key={strategy._id} value={strategy._id}>
                    {strategy.strategyName}
                  </option>
                ))
              ) : (
                <option disabled>No strategies available</option>
              )}
            </select>
          );
        }

        // Strategy-dependent fields: setupType, entryType (single select)
        if (['setupType', 'entryType'].includes(col)) {
          const fieldMap = {
            'setupType': 'setupType',
            'entryType': 'entryType'
          };

          const strategyOptions = getStrategyOptions(row, fieldMap[col]);

          return (
            <select
              value={Array.isArray(row[col]) ? row[col].join(', ') : (row[col] || '')}
              onChange={e => handleChange(rowId, col, e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">
                {col === 'setupType' ? 'Select Setup Type' :
                  col === 'entryType' ? 'Select Entry Type' :
                    `Select ${getHeaderName(col) || col}`
                }
              </option>
              {/* Show strategy-specific options only if strategy is selected */}
              {row.strategy && strategyOptions && strategyOptions.length > 0 && strategyOptions.map((option, idx) => (
                <option key={`${option}-${idx}`} value={option}>{option}</option>
              ))}
              {/* If no strategy selected, show generic options from utils */}
              {!row.strategy && getDropdownOptions(col, sessions).map((option, optIdx) => (
                <option key={option || optIdx} value={option}>{option}</option>
              ))}
            </select>
          );
        }

        // Multi-select for confluences (similar to timeframes)
        if (col === 'confluence' || col === 'confluences') {
          const strategyConfluences = getStrategyOptions(row, 'confluences');
          const confluenceOptions = row.strategy && strategyConfluences.length > 0
            ? strategyConfluences
            : getDropdownOptions('confluences', sessions);

          return (
            <TimeframeMultiSelect
              value={Array.isArray(row[col]) ? row[col].join(', ') : (row[col] || '')}
              onChange={handleChange}
              options={confluenceOptions}
              disabled={!isEditable}
              placeholder="Select Confluences"
              rowId={rowId}
              field="confluences"
              className="w-32 md:w-36 lg:w-40"
            />
          );
        }

        // Special handling for timeframes (multi-select with checkboxes)
        if (col === 'timeFrame' || col === 'timeframe') {
          const strategyTimeframes = getStrategyOptions(row, 'timeframes');
          const timeframeOptions = row.strategy && strategyTimeframes.length > 0
            ? strategyTimeframes
            : getDropdownOptions('timeframes', sessions);

          return (
            <TimeframeMultiSelect
              value={row[col] || ''}
              onChange={handleChange}
              options={timeframeOptions}
              disabled={!isEditable}
              placeholder="Select Timeframes"
              rowId={rowId}
              field="timeFrame"
              className="w-32 md:w-36 lg:w-40"
            />
          );
        }

        if (col === 'pair' || col === 'pairs') {
          return (
            <select
              value={row[col] ?? (row.strategy && strategies ? strategies.find(s => s._id === row.strategy)?.tradingPairs?.[0] || '' : '')}
              onChange={e => handleChange(rowId, col, e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">
                {row[col] || (row.strategy && strategies ? strategies.find(s => s._id === row.strategy)?.tradingPairs?.[0] : 'Select Pair')}
              </option>
              {row.strategy && strategies ?
                strategies.find(s => s._id === row.strategy)?.tradingPairs?.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))
                : getDropdownOptions(col, sessions).map((option, optIdx) => (
                  typeof option === 'object' ? (
                    <option key={option.value || optIdx} value={option.value}>{option.label}</option>
                  ) : (
                    <option key={option || optIdx} value={option}>{option}</option>
                  )
                ))
              }
            </select>
          );
        }

        if (col === 'news') {
          // Only show news input if this specific row has news impact
          if (shouldShowNewsField(row.affectedByNews)) {
            return (
              <select
                value={row[col] ?? ''}
                onChange={e => handleChange(rowId, col, e.target.value)}
                disabled={!isEditable}
                className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                  }`}
              >
                <option value="">Select News</option>
                {getDropdownOptions('news').map((option, optIdx) => (
                  <option key={option || optIdx} value={option}>{option}</option>
                ))}
              </select>
            );
          } else {
            return (
              <div className="w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 bg-gray-700/40 text-gray-500 border border-gray-600/40 text-center text-sm">
                -
              </div>
            );
          }
        }

        if (col === 'affectedByNews') {
          return (
            <select
              value={row[col] ?? ''}
              onChange={e => {
                const newValue = e.target.value;
                handleChange(rowId, col, newValue);
                // Clear news field if not affected by news
                if (!shouldShowNewsField(newValue)) {
                  handleChange(rowId, 'news', '');
                }
              }}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
            >
              <option value="">Select Option</option>
              {getDropdownOptions(col, sessions).map((option, optIdx) => (
                typeof option === 'object' ? (
                  <option key={option.value || optIdx} value={option.value}>{option.label}</option>
                ) : (
                  <option key={option || optIdx} value={option}>{option}</option>
                )
              ))}
            </select>
          );
        }

        // Generic dropdown for all other fields
        return (
          <select
            value={Array.isArray(row[col]) ? row[col].join(', ') : (row[col] ?? '')}
            onChange={e => handleChange(rowId, col, e.target.value)}
            disabled={!isEditable}
            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
              'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
              }`}
          >
            <option value="">
              {col === 'affectedByNews' ? 'Select Option' : (row[col] || `Select ${getHeaderName(col) || col}`)}
            </option>
            {getDropdownOptions(col, sessions).map((option, optIdx) => (
              typeof option === 'object' ? (
                <option key={option.value || optIdx} value={option.value}>{option.label}</option>
              ) : (
                <option key={option || optIdx} value={option}>{option}</option>
              )
            ))}
          </select>
        );


      case 'number':
        if (col === 'risk') {
          return (
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={row[col] ?? ''}
                onChange={e => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  // Prevent negative values for risk
                  const finalVal = val !== null && val < 0 ? 0 : val;
                  handleChange(rowId, col, finalVal);
                }}
                disabled={!isEditable}
                className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                  }`}
                placeholder="0"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                %
              </span>
            </div>
          );
        }

        if (col === 'rFactor') {
          return (
            <input
              type="number"
              step="0.5"
              value={row[col] ?? ''}
              onChange={e => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                // Allow negative values for rFactor
                handleChange(rowId, col, val);
              }}
              disabled={!isEditable}
              className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="0"
            />
          );
        }

        // Lot Size field - supports decimal values like 0.01, 0.05, 0.10, 1.50, etc.
        if (col === 'lotSize') {
          return (
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={row[col] ?? ''}
              onChange={e => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                // Ensure lot size is at least 0.01 if a value is entered
                const finalVal = val !== null && val < 0.01 ? 0.01 : val;
                handleChange(rowId, col, finalVal);
              }}
              disabled={!isEditable}
              className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="0.01"
            />
          );
        }

        if (col === 'pipsLost') {
          const pipsValue = row[col] ?? '';
          const isNegative = Number(pipsValue) < 0;

          return (
            <input
              type="number"
              step="1"
              value={pipsValue}
              onChange={e => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                // Simply update pipsLost - let handleChange handle PnL logic
                handleChange(rowId, col, val);
              }}
              disabled={!isEditable}
              className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isNegative ? 'bg-red-900/30 text-white border-red-500/30' :
                isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="0"
            />
          );
        }

        if (col === 'pnl') {
          const pnlValue = row[col] ?? '';
          const isNegative = Number(pnlValue) < 0;

          return (
            <input
              type="number"
              step="1"
              value={pnlValue}
              onChange={e => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                // Simply update PnL - independent of pips unless pips is negative
                handleChange(rowId, col, val);
              }}
              disabled={!isEditable}
              className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isNegative ? 'bg-red-900/30 text-white border-red-500/30' :
                isEditable ? 'bg-black/30 text-white border-white/10' :
                  'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="0"
            />
          );
        }

        // For all other number fields
        return (
          <input
            type="number"
            step="1"
            value={row[col] ?? ''}
            onChange={e => handleChange(rowId, col, e.target.value === '' ? null : Number(e.target.value))}
            disabled={!isEditable}
            className={`w-24 md:w-28 lg:w-32 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
              'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
              }`}
            placeholder="Enter value"
          />
        );

      default:
        if (col === 'time') {
          return (
            <input
              type="time"
              value={row[col] ?? ''}
              onChange={e => handleTimeChange(rowId, e.target.value)}
              disabled={!isEditable}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
                'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
                }`}
              placeholder="Select time"
            />
          );
        }

        if (col === 'notes') {
          const hasNotes = row[col] && row[col].length > 0;
          return (
            <button
              onClick={() => setNotesModal({
                isOpen: true,
                rowId: rowId,
                currentNotes: row[col] || '',
                tradeData: row,
                isEditable: isEditable
              })}
              className={`w-32 md:w-36 lg:w-40 rounded-lg px-3 py-2 text-left transition-all border ${hasNotes
                ? 'bg-blue-900/30 text-blue-300 border-blue-500/30 hover:bg-blue-900/50 hover:border-blue-500/50 cursor-pointer'
                : isEditable
                  ? 'bg-black/30 text-gray-400 border-white/10 hover:bg-black/50 hover:border-white/20 cursor-pointer'
                  : 'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-pointer'
                }`}
              title={hasNotes ? "Click to view/edit notes" : isEditable ? "Click to add notes" : "Click to view notes"}
            >
              {hasNotes ? (
                <span className="text-xs truncate block">📝 View notes...</span>
              ) : (
                <span className="text-xs">{isEditable ? "Add notes..." : "No notes"}</span>
              )}
            </button>
          );
        }

        if (col === 'image' || col === 'images') {
          // Get all images for this trade (combining image and images fields)
          const allTradeImages = [];
          if (row.image) allTradeImages.push(row.image);
          if (row.images && Array.isArray(row.images)) {
            row.images.forEach(img => {
              if (img && !allTradeImages.includes(img)) {
                allTradeImages.push(img);
              }
            });
          }

          return (
            <div className="flex items-center space-x-2">
              <CloudinaryImageUpload
                onImageUpload={(imageData) => {
                  // Handle both single image and array of images
                  if (Array.isArray(imageData)) {
                    handleChange(rowId, 'images', imageData);
                    // Set first image as primary for backward compatibility
                    if (imageData.length > 0) {
                      handleChange(rowId, 'image', imageData[0]);
                    } else {
                      handleChange(rowId, 'image', '');
                    }
                  } else if (imageData) {
                    // Single image - add to images array and set as primary
                    const newImages = allTradeImages.includes(imageData) ? allTradeImages : [...allTradeImages, imageData];
                    handleChange(rowId, 'images', newImages);
                    handleChange(rowId, 'image', imageData);
                  } else {
                    // Clear images
                    handleChange(rowId, 'images', []);
                    handleChange(rowId, 'image', '');
                  }
                }}
                currentImages={allTradeImages}
                disabled={!isEditable}
                maxImages={10}
              />
              {allTradeImages.length > 0 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openImageViewer(allTradeImages, row, 0)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                    title={`View ${allTradeImages.length} image${allTradeImages.length > 1 ? 's' : ''}`}
                  >
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">{allTradeImages.length}</span>
                  </button>
                </div>
              )}
            </div>
          );
        }

        return (
          <input
            type="text"
            value={row[col] ?? ''}
            onChange={e => handleChange(rowId, col, e.target.value)}
            disabled={!isEditable}
            className={`w-32 md:w-36 lg:w-40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 border ${isEditable ? 'bg-black/30 text-white border-white/10' :
              'bg-gray-700/40 text-gray-400 border-gray-600/40 cursor-not-allowed'
              }`}
            placeholder={`Enter ${col}`}
          />
        );
    }
  };

  // Early return for empty state - prevent any rendering of dummy data
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="py-12 text-center text-gray-400">
          <div className="flex flex-col items-center space-y-4">
            <Calendar className="w-12 h-12 text-gray-500" />
            <p>No trades yet. Click "Add Trade" to create your first entry.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out any invalid trades that might be dummy data
  const validRows = rows.filter(row => {
    // Ensure row has required properties and is not dummy data
    return row &&
      typeof row === 'object' &&
      (row.id || row._id) &&
      (!row.userId || row.userId !== 'default-user'); // Filter out default user trades
  });

  // If no valid rows after filtering, show empty state
  if (validRows.length === 0) {
    return (
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="py-12 text-center text-gray-400">
          <div className="flex flex-col items-center space-y-4">
            <Calendar className="w-12 h-12 text-gray-500" />
            <p>No valid trades found. Click "Add Trade" to create your first entry.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we should use weekly grouping
  const shouldUseWeeklyGrouping = weeklyData && Object.keys(weeklyData).length > 0;

  return (
    <div className="relative">
      {/* Top scrollbar (controls the same container) */}
      <div
        className="overflow-x-auto mb-2"
        onScroll={(e) => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = e.target.scrollLeft;
          }
        }}
      >
        {/* clone of table width, but hidden */}
        <div
          style={{
            width: scrollContainerRef.current?.scrollWidth || "2000px",
            height: "1px",
          }}
        />
      </div>

      {/* Real table with bottom scrollbar */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-scroll max-h-[700px] rounded-2xl shadow-lg border border-white/10 bg-black/30 backdrop-blur-xl"
        onScroll={(e) => {
          const top = e.currentTarget.parentElement.querySelector(".top-sync");
          if (top) top.scrollLeft = e.currentTarget.scrollLeft;
        }}
      >
        <div className="min-w-[2000px]">
          <table className="min-w-full text-xs md:text-sm lg:text-base">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900/80 to-gray-700/60 text-white">
                {columns.filter(col => col !== "pipsGain" && col !== "images").map(col => (
                  <th key={col} className="sticky top-0 z-20 py-3 px-4 font-semibold border-b border-white/10 whitespace-nowrap text-center bg-gray-900 shadow-sm">
                    {getHeaderName(col)}
                  </th>
                ))}
                <th className="sticky top-0 z-20 py-3 px-4 font-semibold border-b border-blue-500/30 whitespace-nowrap text-center bg-gray-900 shadow-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shouldUseWeeklyGrouping ? (
                // Render weekly grouped data
                Object.entries(weeklyData).map(([weekKey, weekData]) => (
                  <React.Fragment key={weekKey}>
                    {/* Week header row */}
                    <tr className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-blue-500/30">
                      <td colSpan={columns.filter(col => col !== "pipsGain" && col !== "images").length + 1} className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-300" />
                          <span className="text-blue-300 font-semibold">
                            {formatWeekRange ? formatWeekRange(weekData.weekStart) : `Week of ${weekData.weekStart.toLocaleDateString()}`}
                          </span>
                          <span className="text-blue-400/70 text-sm">
                            ({weekData.trades.length} trade{weekData.trades.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Trades for this week */}
                    {weekData.trades.map((row, idx) => {
                      const isEditable = editMode || (row.id && row.id.toString().startsWith('temp_'));
                      const isBeingEdited = editingRows.has(row.id);
                      const isNewRow = !row.id || row.id.toString().startsWith('temp_');
                      const tradeStatus = getTradeStatus(row);

                      return (
                        <tr
                          key={row.id || idx}
                          className={`hover:bg-gray-900/30 transition-all border-l-4 ${isBeingEdited ? 'bg-gray-900/30 border-l-gray-500/60' :
                            isNewRow ? 'bg-green-900/20 border-l-green-500/60' :
                              tradeStatus.status === 'profit' ? 'border-l-green-500/30' :
                                tradeStatus.status === 'loss' ? 'border-l-red-500/30' :
                                  'border-l-gray-500/30'
                            }`}
                        >
                          {columns.filter(col => col !== "pipsGain" && col !== "images").map(col => (
                            <td key={col} className={`py-3 px-4 border-b border-white/10 border-r ${(col === 'pipsLost' || col === 'pnl') && row[col] < 0 ? 'bg-red-900/30' : ''}`}>
                              {renderCellContent(row, col, isEditable)}
                            </td>
                          ))}
                          <td className="py-3 px-4 border-b border-white/10 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openModelPage(row.id)}
                                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-all"
                                title="Psychology Analysis"
                              >
                                <Brain className="w-4 h-4" />
                              </button>
                              {/* Only show delete button when in edit mode or for new rows */}
                              {isEditable && (
                                <button
                                  onClick={() => removeRow(row.id || row._id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                  title="Delete Trade"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                // Render flat list (original behavior)
                validRows.map((row, idx) => {
                  const isEditable = editMode || (row.id && row.id.toString().startsWith('temp_'));
                  const isBeingEdited = editingRows.has(row.id);
                  const isNewRow = !row.id || row.id.toString().startsWith('temp_');
                  const tradeStatus = getTradeStatus(row);

                  return (
                    <tr
                      key={row.id || idx}
                      className={`hover:bg-gray-900/30 transition-all border-l-4 ${isBeingEdited ? 'bg-gray-900/30 border-l-gray-500/60' :
                        isNewRow ? 'bg-green-900/20 border-l-green-500/60' :
                          tradeStatus.status === 'profit' ? 'border-l-green-500/30' :
                            tradeStatus.status === 'loss' ? 'border-l-red-500/30' :
                              'border-l-gray-500/30'
                        }`}
                    >
                      {columns.filter(col => col !== "pipsGain" && col !== "images").map(col => (
                        <td key={col} className="py-3 px-4 border-b border-white/10 border-r">
                          {renderCellContent(row, col, isEditable)}
                        </td>
                      ))}
                      <td className="py-3 px-4 border-b border-white/10 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openModelPage(row.id)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-all"
                            title="Psychology Analysis"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                          {/* Only show delete button when in edit mode or for new rows */}
                          {isEditable && (
                            <button
                              onClick={() => removeRow(row.id || row._id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete Trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
          if (notesModal.rowId) {
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
    </div>
  );
};

export default JournalTable;
