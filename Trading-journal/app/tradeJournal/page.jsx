"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from 'framer-motion';
import { AlertCircle, Edit3, Calendar, Brain, Trash2 } from 'lucide-react';
import ModelPage from '@/components/ModalPage';
import { ImageViewer } from '@/components/ImageViewer';
import PopNotification from '@/components/PopNotification';
import { useTrades } from '../../context/TradeContext';
import CloudinaryImageUpload from '@/components/CloudinaryImageUpload';
import JournalCards from '@/components/journal/JournalCards';
import ActionButtons from '@/components/journal/ActionButtons';
import JournalTable from '@/components/journal/JournalTable';
import JournalListView from '@/components/journal/JournalListView';
import TradeSideWindow from '@/components/journal/TradeSideWindow';
import AddTradeButton from '@/components/journal/AddTradeButton';
import NewsImpactModal from '@/components/journal/NewsImpactModal';
import JournalHeader from "@/components/journal/JournalHeader";
import StreakLineProgress from '@/components/StreakLineProgress';
import Tutorial from '@/components/Tutorial';
import TimelineSidebar from '@/components/journal/TimelineSidebar';
// Import utilities
import {
  initialTrade,
  getDropdownOptions,
  getFieldType,
  isRequiredField,
  getFilteredColumns,
  getHeaderName,
  getCellType,
  shouldShowNewsField,
  cleanTradeData,
} from '../../components/journal/journalUtils';

// Helper function to format date consistently
const formatDateForDatabase = (dateValue) => {
  if (!dateValue) return null;

  try {
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;

    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDateFormatted = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper function to generate unique temp ID
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const TradeJournalContent = () => {
  // Use TradeContext for real data management
  const {
    trades,
    loading,
    error,
    fetchTrades,
    createTrade,
    updateTrade,
    deleteTrade,
    strategies,
    strategiesLoading,
    sessions,
    sessionsLoading
  } = useTrades();

  // Local state management - Properly separate actual trades from temporary ones
  const [actualTrades, setActualTrades] = useState([]);
  const [tempTrades, setTempTrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRows, setEditingRows] = useState(new Set());
  const [showModelPage, setShowModelPage] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [timeFilter, setTimeFilter] = useState(() => {
    const now = new Date();
    return {
      type: 'month',
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  });
  const [showNewsImpactModal, setShowNewsImpactModal] = useState(false);
  const [newsImpactData, setNewsImpactData] = useState({ tradeIndex: null, impactType: '', currentDetails: '' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState({ type: 'all' });

  // New State for View Mode and Side Panel
  const [viewMode, setViewMode] = useState('classic'); // 'classic' | 'new'
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sideWindowTrade, setSideWindowTrade] = useState(null); // null means new trade
  const [sideWindowMode, setSideWindowMode] = useState('add'); // 'add' | 'edit'

  const setHasUnsavedChangesWithLog = useCallback((value) => {
    console.log('SETTING hasUnsavedChanges to:', value);
    console.trace('Call stack:'); // This shows where the call came from
    setHasUnsavedChanges(value);
  }, []);

  // New state for current streak
  const [currentStreak, setCurrentStreak] = useState(0);

  // Notification state
  const [pop, setPop] = useState({ show: false, type: 'info', message: '' });



  // Combine actual trades and temp trades properly
  const allTrades = useMemo(() => {
    const combined = [...actualTrades, ...tempTrades];
    console.log('🔄 allTrades computed:', {
      actual: actualTrades.length,
      temp: tempTrades.length,
      combined: combined.length,
      actualIds: actualTrades.map(t => t.id || t._id),
      tempIds: tempTrades.map(t => t.id)
    });
    return combined;
  }, [actualTrades, tempTrades]);

  // Enhanced error handling
  const handleAxiosError = useCallback((error, contextMessage) => {
    console.error(`${contextMessage}:`, error);

    if (error.response) {
      const message = error.response.data?.message ||
        error.response.data?.error ||
        `Server error (${error.response.status})`;
      setPop({ show: true, type: 'error', message: `${contextMessage}: ${message}` });
    } else if (error.request) {
      setPop({ show: true, type: 'error', message: `${contextMessage}: No response from server. Please check your connection.` });
    } else {
      setPop({ show: true, type: 'error', message: `${contextMessage}: ${error.message}` });
    }
  }, []);

  // Filtered trades using combined trades
  const filteredTrades = useMemo(() => {
    // 1. Priority: Sidebar Filter
    if (sidebarFilter.type !== 'all') {
      console.log('🔍 Filtering by Sidebar:', sidebarFilter);
      return allTrades.filter(trade => {
        if (!trade.date) return false;
        const tradeDate = new Date(trade.date);
        const tradeYear = tradeDate.getFullYear();
        const tradeMonth = tradeDate.getMonth() + 1;
        const tradeDayFull = tradeDate.toISOString().split('T')[0];

        if (sidebarFilter.type === 'year') {
          return tradeYear === sidebarFilter.year;
        }
        if (sidebarFilter.type === 'month') {
          return tradeYear === sidebarFilter.year && tradeMonth === sidebarFilter.month;
        }
        if (sidebarFilter.type === 'day') {
          return tradeDayFull === sidebarFilter.day;
        }
        // week logic can be added if sidebar sends week filter
        return true;
      });
    }


    if (timeFilter.type === 'all') {
      console.log('🔍 filteredTrades (no filter):', {
        total: allTrades.length,
        ids: allTrades.map(t => t.id || t._id),
        hasDuplicateIds: allTrades.length !== new Set(allTrades.map(t => t.id || t._id)).size
      });
      return allTrades;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    const filtered = allTrades.filter(trade => {
      if (!trade.date) return false;

      const tradeDate = new Date(trade.date);
      const tradeYear = tradeDate.getFullYear();
      const tradeMonth = tradeDate.getMonth() + 1;
      const tradeQuarter = Math.ceil(tradeMonth / 3);

      switch (timeFilter.type) {
        case 'month':
          return tradeYear === timeFilter.year && tradeMonth === timeFilter.month;
        case 'quarter':
          return tradeYear === timeFilter.year && tradeQuarter === timeFilter.quarter;
        case 'year':
          return tradeYear === timeFilter.year;
        default:
          return true;
      }
    });

    console.log('🔍 filteredTrades computed:', {
      total: filtered.length,
      ids: filtered.map(t => t.id || t._id),
      hasDuplicateIds: filtered.length !== new Set(filtered.map(t => t.id || t._id)).size
    });

    return filtered;
  }, [allTrades, timeFilter, sidebarFilter]);

  // Group trades by week
  const tradesByWeek = useMemo(() => {
    const grouped = {};

    filteredTrades.forEach(trade => {
      if (!trade.date) return;

      const tradeDate = new Date(trade.date);
      const weekStart = new Date(tradeDate);
      weekStart.setDate(tradeDate.getDate() - tradeDate.getDay() + 1); // Start of week (Monday)

      const weekKey = weekStart.toISOString().split('T')[0];

      if (!grouped[weekKey]) {
        grouped[weekKey] = {
          weekStart: weekStart,
          trades: []
        };
      }
      grouped[weekKey].trades.push(trade);
    });

    // Sort weeks in descending order (newest first)
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }, [filteredTrades]);

  // Format week range for display
  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Update actual trades when API data changes - Fixed to prevent dummy data
  useEffect(() => {
    if (loading) return; // Don't update while loading

    console.log('Trades data updated from API:', trades?.length || 0, 'trades');

    if (Array.isArray(trades) && trades.length >= 0) {
      // Only process trades that have valid user data
      const validTrades = trades.filter(trade => {
        // Ensure trade has required fields and is not dummy data
        return trade &&
          (trade._id || trade.id) &&
          trade.userId &&
          trade.userId !== 'default-user'; // Filter out any default user trades
      });

      const formattedTrades = validTrades.map(trade => {
        let formattedDate = null;
        if (trade.date) {
          try {
            const dateObj = typeof trade.date === 'string' ? new Date(trade.date) : trade.date;
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0];
            }
          } catch (error) {
            console.error('Error formatting date for trade:', trade._id, error);
          }
        }

        return {
          ...trade,
          id: trade._id || trade.id,
          date: formattedDate,
          strategy: trade.strategy?._id || trade.strategy || '',
          strategyName: trade.strategy?.strategyName || '',
          sessionName: trade.session || ''
        };
      });

      console.log('Setting actual trades:', formattedTrades.length);
      setActualTrades(formattedTrades);

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }

    } else if (!loading && isInitialLoad) {
      // If no trades found, set empty array
      setActualTrades([]);
      setIsInitialLoad(false);
    }
  }, [trades, loading, isInitialLoad]);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check user's total trades and trigger tutorial - FIXED to wait for data loading
  useEffect(() => {
    // Don't show tutorial until component is mounted, data is loaded, and initial load is complete
    if (!isMounted || loading || isInitialLoad) {
      console.log('Tutorial check skipped - waiting for data to load:', {
        isMounted,
        loading,
        isInitialLoad,
        actualTradesLength: actualTrades.length
      });
      return;
    }

    console.log('Checking trades for tutorial after data loaded:', actualTrades.length);

    // If user has zero trades after loading is complete, show tutorial
    if (actualTrades.length === 0) {
      console.log('Zero trades found after loading, showing tutorial');
      setShowTutorial(true);
    } else {
      // Hide tutorial if user has trades
      console.log('User has trades, hiding tutorial');
      setShowTutorial(false);
    }
  }, [isMounted, loading, isInitialLoad, actualTrades.length]);

  // Fetch current streak from API
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streak');
        if (!response.ok) {
          console.error('Failed to fetch streak:', response.status);
          return;
        }
        const data = await response.json();
        if (data.currentStreak !== undefined) {
          setCurrentStreak(data.currentStreak);
        }
      } catch (error) {
        console.error('Failed to fetch streak data:', error);
      }
    };
    fetchStreak();
  }, []);

  // Refresh data function
  const refreshData = useCallback(async () => {
    console.log('Manual refresh triggered');
    setTempTrades([]); // Clear temp trades on refresh
    setEditingRows(new Set());
    setHasUnsavedChanges(false);
    fetchTrades();

    // Also refresh streak data
    try {
      const response = await fetch('/api/streak');
      if (response.ok) {
        const data = await response.json();
        if (data.currentStreak !== undefined) {
          setCurrentStreak(data.currentStreak);
        }
      }
    } catch (error) {
      console.error('Failed to refresh streak data:', error);
    }
  }, [fetchTrades]);

  // Handle change with proper trade identification
  // Fixed handleChange function - replace in your main component

  const handleChange = useCallback((rowId, field, value) => {
    // Find the trade by ID instead of using index
    const trade = filteredTrades.find(t => (t.id || t._id) === rowId);
    if (!trade) {
      console.error('Trade not found for ID:', rowId);
      return;
    }

    const isTemp = trade.id && trade.id.toString().startsWith('temp_');

    if (isTemp) {
      // Update temp trades
      setTempTrades(prevTemp => {
        const updated = prevTemp.map(t =>
          t.id === trade.id ? { ...t, [field]: value } : t
        );
        console.log('Updated temp trades:', updated);
        return updated;
      });
    } else {
      // Update actual trades
      setActualTrades(prevActual => {
        const updated = prevActual.map(t =>
          (t.id || t._id) === rowId ? { ...t, [field]: value } : t
        );
        return updated;
      });

      // Mark for editing if in edit mode
      if (editMode && trade.id) {
        setEditingRows(prev => new Set(prev.add(trade.id)));
      }
    }

    // FIXED: Make PnL negative when pips is negative
    if (field === 'pipsLost') {
      const pipsValue = typeof value === 'number' ? value : parseFloat(value);

      // When pips is negative, make PnL negative too
      if (pipsValue < 0) {
        if (isTemp) {
          setTempTrades(prevTemp =>
            prevTemp.map(t => {
              if (t.id === trade.id) {
                let currentPnl = t['pnl'];
                // If PnL is empty or 0, set it to negative of the pips value
                if (currentPnl === null || currentPnl === undefined || currentPnl === '' || currentPnl === 0) {
                  return { ...t, pnl: pipsValue }; // Use the same negative value as pips
                }
                // If PnL has a value, make it negative
                const pnlValue = typeof currentPnl === 'number' ? currentPnl : parseFloat(currentPnl) || 0;
                const absPnlValue = Math.abs(pnlValue);
                return { ...t, pnl: -absPnlValue };
              }
              return t;
            })
          );
        } else {
          setActualTrades(prevActual =>
            prevActual.map(t => {
              if ((t.id || t._id) === rowId) {
                let currentPnl = t['pnl'];
                // If PnL is empty or 0, set it to negative of the pips value
                if (currentPnl === null || currentPnl === undefined || currentPnl === '' || currentPnl === 0) {
                  return { ...t, pnl: pipsValue }; // Use the same negative value as pips
                }
                // If PnL has a value, make it negative
                const pnlValue = typeof currentPnl === 'number' ? currentPnl : parseFloat(currentPnl) || 0;
                const absPnlValue = Math.abs(pnlValue);
                return { ...t, pnl: -absPnlValue };
              }
              return t;
            })
          );
          if (editMode && trade.id) {
            setEditingRows(prev => new Set(prev.add(trade.id)));
          }
        }
      }
      // When pips becomes positive or zero, make PnL positive if it was negative
      else if (pipsValue >= 0) {
        if (isTemp) {
          setTempTrades(prevTemp =>
            prevTemp.map(t => {
              if (t.id === trade.id) {
                let currentPnl = t['pnl'];
                if (currentPnl !== null && currentPnl !== undefined && currentPnl !== '' && currentPnl < 0) {
                  const absPnlValue = Math.abs(currentPnl);
                  return { ...t, pnl: absPnlValue };
                }
              }
              return t;
            })
          );
        } else {
          setActualTrades(prevActual =>
            prevActual.map(t => {
              if ((t.id || t._id) === rowId) {
                let currentPnl = t['pnl'];
                if (currentPnl !== null && currentPnl !== undefined && currentPnl !== '' && currentPnl < 0) {
                  const absPnlValue = Math.abs(currentPnl);
                  return { ...t, pnl: absPnlValue };
                }
              }
              return t;
            })
          );
          if (editMode && trade.id) {
            setEditingRows(prev => new Set(prev.add(trade.id)));
          }
        }
      }
    }

    // Handle strategy selection auto-population (unchanged)
    if (field === 'strategy' && value && strategies) {
      const selectedStrategy = strategies.find(s => s._id === value);
      if (selectedStrategy) {
        console.log("Selected Strategy:", selectedStrategy);

        const updateFields = {};
        if (selectedStrategy.setupType && !trade.setupType) {
          updateFields.setupType = selectedStrategy.setupType;
        }
        if (selectedStrategy.entryType && !trade.entryType) {
          updateFields.entryType = Array.isArray(selectedStrategy.entryType)
            ? selectedStrategy.entryType.join(', ')
            : selectedStrategy.entryType;
        }
        // Confluences are NOT auto-populated - user must manually select them
        if (selectedStrategy.tradingPairs && selectedStrategy.tradingPairs.length > 0 && !trade.pair) {
          updateFields.pair = selectedStrategy.tradingPairs[0];
        }
        if (selectedStrategy.risk && !trade.risk) {
          updateFields.risk = selectedStrategy.risk;
        }
        if (selectedStrategy.rFactor && !trade.rFactor) {
          updateFields.rFactor = selectedStrategy.rFactor;
        }
        if (selectedStrategy.timeFrame && !trade.timeFrame) {
          updateFields.timeFrame = selectedStrategy.timeFrame;
        }

        // Apply all updates at once
        if (Object.keys(updateFields).length > 0) {
          console.log('Auto-populating fields:', updateFields);

          if (isTemp) {
            setTempTrades(prevTemp =>
              prevTemp.map(t =>
                t.id === trade.id ? { ...t, ...updateFields } : t
              )
            );
          } else {
            setActualTrades(prevActual =>
              prevActual.map(t =>
                (t.id || t._id) === rowId ? { ...t, ...updateFields } : t
              )
            );
          }
        }
      }
    }

    // Handle session and time updates (unchanged)
    if (field === 'session') {
      const updateData = { [field]: value };
      if (['Asian', 'London', 'New York'].includes(value)) {
        updateData.session = value;
      } else {
        const selectedSession = sessions.find(s => s._id === value);
        updateData.sessionId = value;
        updateData.session = selectedSession?.sessionName || value;
      }

      if (isTemp) {
        setTempTrades(prevTemp =>
          prevTemp.map(t =>
            t.id === trade.id ? { ...t, ...updateData } : t
          )
        );
      } else {
        setActualTrades(prevActual =>
          prevActual.map(t =>
            (t.id || t._id) === rowId ? { ...t, ...updateData } : t
          )
        );
      }
    }

    setHasUnsavedChanges(true);
  }, [filteredTrades, editMode, strategies, sessions]);

  useEffect(() => {
    console.log('hasUnsavedChanges STATE CHANGED TO:', hasUnsavedChanges);
  }, [hasUnsavedChanges]);



  // Handle Side Window Save
  const handleSideWindowSave = useCallback(async (tradeData) => {
    try {
      console.log('Saving from Side Window:', tradeData);

      // Clean data
      const cleanData = cleanTradeData({
        ...tradeData,
        date: formatDateForDatabase(tradeData.date)
      });
      delete cleanData.id;
      delete cleanData._id;

      if (sideWindowMode === 'add') {
        await createTrade(cleanData, false); // No optimistic update as we refresh
      } else {
        const tradeId = sideWindowTrade.id || sideWindowTrade._id;
        await updateTrade(tradeId, cleanData);
      }

      // Refresh data
      await refreshData();

      setPop({ show: true, type: 'success', message: `Trade ${sideWindowMode === 'add' ? 'added' : 'updated'} successfully!` });
      setTimeout(() => setPop({ show: false, type: 'info', message: '' }), 3000);

    } catch (error) {
      console.error('Error saving from side window:', error);
      handleAxiosError(error, `Failed to ${sideWindowMode} trade`);
      throw error; // Propagate to formatting inside component if needed
    }
  }, [createTrade, updateTrade, refreshData, handleAxiosError, sideWindowMode, sideWindowTrade]);





  // Add new row function (Modified for Toggle)
  const addRow = useCallback(() => {
    if (viewMode === 'new') {
      setSideWindowTrade(null);
      setSideWindowMode('add');
      setIsSidePanelOpen(true);
      return;
    }

    const now = new Date();
    const utcTime = now.toISOString().substr(11, 5);
    const todayDate = getCurrentDateFormatted();

    const newRow = {
      ...initialTrade,
      id: generateTempId(),
      date: todayDate,
      time: utcTime,
      session: " "
    };

    console.log('Adding new temp trade:', newRow.id);
    setTempTrades(prev => [...prev, newRow]);
    setHasUnsavedChanges(true);

  }, [viewMode]);

  // Remove row function
  const removeRow = useCallback(async (tradeId) => {
    console.log('Removing trade:', tradeId);

    const isTemp = tradeId.toString().startsWith('temp_');



    if (isTemp) {
      // Remove from temp trades
      setTempTrades(prev => prev.filter(trade => trade.id !== tradeId));
      setHasUnsavedChanges(true);
      return;
    }

    // For actual trades, delete from backend
    const tradeToDelete = actualTrades.find(row => row.id === tradeId || row._id === tradeId);

    if (!tradeToDelete) {
      console.error('Trade not found for deletion');
      return;
    }

    try {
      await deleteTrade(tradeToDelete._id || tradeToDelete.id);
      console.log('Trade deleted successfully from backend');

      // Remove from actual trades
      setActualTrades(prev => prev.filter(trade => trade.id !== tradeId && trade._id !== tradeId));
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error("Delete error:", err);
      handleAxiosError(err, 'Failed to delete trade from backend');
    }
  }, [actualTrades, deleteTrade, handleAxiosError]);


  // Handle Side Window Delete
  const handleSideWindowDelete = useCallback(async () => {
    if (!sideWindowTrade) return;

    const tradeId = sideWindowTrade.id || sideWindowTrade._id;
    if (!tradeId) return;

    if (window.confirm("Are you sure you want to delete this trade? This action cannot be undone.")) {
      try {
        await removeRow(tradeId);
        setIsSidePanelOpen(false);
        setSideWindowTrade(null);
        setPop({ show: true, type: 'success', message: 'Trade deleted successfully' });
      } catch (error) {
        console.error("Error deleting trade from side window:", error);
        // Error handling is already done in removeRow but we can add extra feedback if needed
      }
    }
  }, [sideWindowTrade, removeRow]);

  // Enhanced save function
  const handleSave = useCallback(async () => {
    setSaving(true);
    setPop({ show: false, type: 'info', message: '' });

    try {
      console.log('Starting save process...');
      console.log('Temp trades to save:', tempTrades.length);
      console.log('Edited actual trades:', editingRows.size);

      // Enhanced validation with specific field checking
      const allTradesToValidate = [...tempTrades, ...actualTrades.filter(t => editingRows.has(t.id))];
      const validationErrors = [];
      const requiredFields = [
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'session', label: 'Session' },
        { key: 'pair', label: 'Trading Pair' },
        { key: 'positionType', label: 'Position Type' },
        { key: 'entry', label: 'Entry Price' },
        { key: 'exit', label: 'Exit Price' },
        { key: 'setupType', label: 'Setup Type' },
        { key: 'confluences', label: 'Confluences' },
        { key: 'entryType', label: 'Entry Type' },
        { key: 'timeFrame', label: 'Time Frame' },
        { key: 'risk', label: 'Risk' },
        { key: 'lotSize', label: 'Lot Size' },
        { key: 'rFactor', label: 'R Factor' },
        { key: 'rulesFollowed', label: 'Rules Followed' },
        { key: 'pnl', label: 'P&L' }
      ];

      allTradesToValidate.forEach((trade, tradeIndex) => {
        // Skip completely empty trades
        const hasAnyData = Object.keys(trade).some(key =>
          key !== 'id' && trade[key] !== null && trade[key] !== undefined && trade[key] !== ''
        );

        if (!hasAnyData) return;

        // Check for missing required fields
        const missingFields = [];
        requiredFields.forEach(({ key, label }) => {
          if (!trade[key] && trade[key] !== 0) {
            missingFields.push(label);
          }
        });

        if (missingFields.length > 0) {
          const tradeIdentifier = trade.date ?
            `Trade on ${new Date(trade.date).toLocaleDateString()}` :
            `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Missing required fields - ${missingFields.join(', ')}`);
        }

        // Business logic validation
        if (trade.entry && trade.exit && Number(trade.entry) === Number(trade.exit)) {
          const tradeIdentifier = trade.date ?
            `Trade on ${new Date(trade.date).toLocaleDateString()}` :
            `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Entry and exit prices cannot be the same`);
        }

        if (trade.risk && Number(trade.risk) < 0) {
          const tradeIdentifier = trade.date ?
            `Trade on ${new Date(trade.date).toLocaleDateString()}` :
            `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Risk cannot be negative`);
        }

        // Removed rFactor negative validation - now allows negative values

        if (trade.lotSize && Number(trade.lotSize) < 0.01) {
          const tradeIdentifier = trade.date ?
            `Trade on ${new Date(trade.date).toLocaleDateString()}` :
            `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Lot size must be at least 0.01`);
        }

        // Additional validations
        if (trade.entry && isNaN(Number(trade.entry))) {
          const tradeIdentifier = trade.date ?
            `Trade on ${new Date(trade.date).toLocaleDateString()}` :
            `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Entry price must be a valid number`);
        }

        if (trade.exit && isNaN(Number(trade.exit))) {
          const tradeIdentifier = trade.date ?
            `Trade on ${new Date(trade.date).toLocaleDateString()}` :
            `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Exit price must be a valid number`);
        }

        if (trade.date && !formatDateForDatabase(trade.date)) {
          const tradeIdentifier = `Trade #${tradeIndex + 1}`;
          validationErrors.push(`${tradeIdentifier}: Invalid date format`);
        }
      });

      // Show validation errors if any
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.length === 1 ?
          validationErrors[0] :
          `Please fix the following issues:\n• ${validationErrors.join('\n• ')}`;

        setPop({
          show: true,
          type: 'error',
          message: errorMessage
        });
        return;
      }

      // If validation passes, continue with save logic...
      // If validation passes, continue with saving
      const newTradesToSave = tempTrades.filter(trade => {
        return Object.keys(trade).some(key =>
          key !== 'id' && trade[key] !== null && trade[key] !== undefined && trade[key] !== ''
        );
      });

      console.log('Saving new trades:', newTradesToSave.length);
      for (const trade of newTradesToSave) {
        try {
          // Prepare trade data for backend
          const cleanTrade = cleanTradeData({
            ...trade,
            date: formatDateForDatabase(trade.date)
          });

          const tempId = trade.id; // Store temp ID for removal
          delete cleanTrade.id; // Remove temp ID before sending to backend

          console.log('📤 Attempting to save trade:', {
            date: cleanTrade.date,
            pair: cleanTrade.pair,
            pnl: cleanTrade.pnl
          });


          // Pass false to skip optimistic state update since we refresh data immediately after
          const result = await createTrade(cleanTrade, false);
          console.log('✅ Trade saved successfully:', result);

          // Remove this specific trade from tempTrades immediately to prevent duplication
          setTempTrades(current => current.filter(t => t.id !== tempId));

        } catch (err) {
          console.error('❌ Error saving individual trade:', err);
          console.error('Error details:', err.response?.data);
          // Show specific error message
          const errorMessage = err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to save trade. Please check all required fields are filled correctly.';
          setPop({
            show: true,
            type: 'error',
            message: `Error saving trade: ${errorMessage}`
          });
          throw err;
        }
      }

      // Update existing trades
      const existingTradesToUpdate = actualTrades.filter(trade =>
        editingRows.has(trade.id)
      ).map(trade => cleanTradeData({
        ...trade,
        date: formatDateForDatabase(trade.date)
      }));

      console.log('Updating existing trades:', existingTradesToUpdate.length);
      for (const trade of existingTradesToUpdate) {
        try {
          const tradeId = trade._id || trade.id;
          await updateTrade(tradeId, trade);
        } catch (err) {
          console.error('Error updating individual trade:', err);
          // Show specific error message instead of generic 500 error
          const errorMessage = err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to update trade. Please check all required fields are filled correctly.';
          setPop({
            show: true,
            type: 'error',
            message: `Error updating trade: ${errorMessage}`
          });
          throw err;
        }
      }

      // Clear temp trades and refresh data
      setTempTrades([]);
      setEditingRows(new Set());
      setEditMode(false);

      // Refresh data from backend
      console.log('Refreshing trades data...');
      await fetchTrades();

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 3000);

      setPop({ show: true, type: 'success', message: 'Trades saved successfully!' });

    } catch (err) {
      console.error('Error saving trades:', err);

      // Enhanced error handling to show meaningful messages
      let errorMessage = 'Failed to save trades. ';

      if (err.response?.status === 500) {
        errorMessage += 'Server error occurred. Please check that all required fields are properly filled and try again.';
      } else if (err.response?.status === 400) {
        errorMessage += err.response.data?.message || 'Invalid data provided. Please check your entries.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage += 'Permission denied. You may not have access to modify these trades.';
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please ensure all required fields are filled correctly.';
      }

      setPop({
        show: true,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSaving(false);
    }
  }, [tempTrades, actualTrades, editingRows, createTrade, updateTrade, fetchTrades, handleAxiosError]);

  // Save and exit edit mode
  const saveAndExit = useCallback(async () => {
    try {
      await handleSave();
      setEditMode(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [handleSave]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (editMode) {
      // Exiting edit mode
      if (hasUnsavedChanges) {
        const confirmExit = window.confirm(
          "You have unsaved changes. Do you want to save before exiting edit mode?"
        );
        if (confirmExit) {
          handleSave().then(() => {
            setEditMode(false);
          });
          return;
        } else {
          // User chose not to save, ask if they want to discard changes
          const confirmDiscard = window.confirm(
            "Are you sure you want to discard your changes?"
          );
          if (!confirmDiscard) return;

          // Discard changes
          setTempTrades([]);
          setEditingRows(new Set());
          setEditMode(false);
          setHasUnsavedChanges(false);
        }
      }
      setEditMode(false);
    } else {
      // Entering edit mode
      setEditMode(true);
    }
  }, [editMode, hasUnsavedChanges, handleSave]);

  // Modal handlers
  const openModelPage = useCallback((tradeId) => {
    const trade = allTrades.find(row => row.id === tradeId);
    if (trade) {
      setSelectedTrade(trade);
      setShowModelPage(true);
    }
  }, [allTrades]);

  // Tutorial completion handler
  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    // Tutorial will show again if user has zero trades
  }, []);

  const openImageViewer = useCallback((imageUrl, trade, initialIndex = 0) => {
    if (imageUrl) {
      const tradeDate = trade.date ? new Date(trade.date).toISOString().split('T')[0] : 'Unknown Date';
      const title = `Images for Trade (${tradeDate})`;

      setSelectedImage({
        url: imageUrl, // Can be single URL or array of URLs
        title: title,
        initialIndex: initialIndex
      });
      setShowImageViewer(true);
    }
  }, []);

  // Final fixed handleModelSave with correct psychology field names
  const handleModelSave = useCallback(async (ratings) => {
    try {
      setSaving(true);

      const updatedTrade = { ...selectedTrade, ...ratings };
      const isTemp = updatedTrade.id && updatedTrade.id.toString().startsWith('temp_');

      if (isTemp) {
        console.log('📝 Psychology save for TEMP trade:', updatedTrade.id);
        // Update temp trades state first
        setTempTrades(prevTemp => {
          const updated = prevTemp.map(trade =>
            trade.id === updatedTrade.id ? updatedTrade : trade
          );
          console.log('Updated temp trades with psychology:', updated.length, 'trades');
          return updated;
        });

        // Prepare complete trade data - INCLUDE ALL FIELDS FROM THE TRADE
        const completeTradeData = {
          // Basic trade information
          date: formatDateForDatabase(updatedTrade.date),
          time: updatedTrade.time,
          session: updatedTrade.session,
          sessionId: updatedTrade.sessionId,
          pair: updatedTrade.pair,
          positionType: updatedTrade.positionType,
          entry: updatedTrade.entry,
          exit: updatedTrade.exit,
          setupType: updatedTrade.setupType,
          confluences: updatedTrade.confluences,
          entryType: updatedTrade.entryType,
          timeFrame: updatedTrade.timeFrame,
          risk: updatedTrade.risk,
          lotSize: updatedTrade.lotSize,
          rFactor: updatedTrade.rFactor,
          rulesFollowed: updatedTrade.rulesFollowed,
          pnl: updatedTrade.pnl,
          pipsLost: updatedTrade.pipsLost,

          // Strategy information
          strategy: updatedTrade.strategy,
          strategyName: updatedTrade.strategyName,

          // News impact - ADD THE MISSING NEWS FIELD
          affectedByNews: updatedTrade.affectedByNews,
          newsImpactDetails: updatedTrade.newsImpactDetails,
          news: updatedTrade.news || updatedTrade.newsImpactDetails, // Add this line!

          // Images
          images: updatedTrade.images || [],
          image: updatedTrade.image, // Also include single image field

          // Psychology ratings
          fearToGreed: updatedTrade.fearToGreed,
          fomoRating: updatedTrade.fomoRating,
          executionRating: updatedTrade.executionRating,
          patience: updatedTrade.patience,
          confidence: updatedTrade.confidence,

          // Include any other fields that might be in the trade
          notes: updatedTrade.notes,
          // Add any other custom fields your trade might have
        };

        // Debug logging to see what's being saved
        console.log('Saving complete trade data:', completeTradeData);
        console.log('News fields in save data:', {
          affectedByNews: completeTradeData.affectedByNews,
          newsImpactDetails: completeTradeData.newsImpactDetails,
          news: completeTradeData.news
        });

        // Validate required fields
        const requiredFields = ['date', 'time', 'session', 'pair', 'positionType', 'entry', 'exit', 'setupType', 'confluences', 'entryType', 'timeFrame', 'risk', 'lotSize', 'rFactor', 'rulesFollowed', 'pnl'];
        const missingFields = requiredFields.filter(field =>
          !completeTradeData[field] && completeTradeData[field] !== 0
        );

        if (missingFields.length > 0) {
          setPop({
            show: true,
            type: 'error',
            message: `Please fill in required fields: ${missingFields.join(', ')}`
          });
          setSaving(false);
          return;
        }

        // Pass false to skip optimistic state update
        console.log('💾 Saving temp trade to DB...');
        const savedTrade = await createTrade(completeTradeData, false);
        console.log('✅ Trade saved to DB:', savedTrade.id || savedTrade._id);

        // Remove from temp trades
        console.log('🗑️ Removing from tempTrades:', updatedTrade.id);
        setTempTrades(prevTemp => {
          const filtered = prevTemp.filter(trade => trade.id !== updatedTrade.id);
          console.log('tempTrades after removal:', filtered.length, 'trades');
          return filtered;
        });

        // Refresh data from backend
        console.log('🔄 Fetching all trades from backend...');
        await fetchTrades();
        console.log('✅ Fetch complete');

        // Update states
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 3000);

        setPop({
          show: true,
          type: 'success',
          message: 'Trade with psychology ratings saved successfully!'
        });

      } else {
        // For existing trades - also ensure news fields are included
        const tradeId = updatedTrade._id || updatedTrade.id;

        // Make sure all fields including news are in the update
        const updateData = {
          ...updatedTrade,
          news: updatedTrade.news || updatedTrade.newsImpactDetails // Ensure news field is included
        };

        await updateTrade(tradeId, updateData);

        setActualTrades(prevActual =>
          prevActual.map(trade =>
            (trade.id === updatedTrade.id || trade._id === updatedTrade.id) ? updateData : trade
          )
        );

        setLastSaved(new Date());
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 3000);

        setPop({
          show: true,
          type: 'success',
          message: 'Psychology ratings updated successfully!'
        });
      }

      setSelectedTrade(updatedTrade);

    } catch (error) {
      console.error('Error saving psychology ratings:', error);
      console.error('Error details:', error.response?.data);

      let errorMessage = 'Failed to save psychology ratings. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }

      setPop({
        show: true,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSaving(false);
    }
  }, [
    selectedTrade,
    createTrade,
    updateTrade,
    fetchTrades,
    setTempTrades,
    setActualTrades,
    setSelectedTrade,
    setHasUnsavedChanges,
    setLastSaved,
    setShowSaveIndicator,
    setPop,
    setSaving,
    formatDateForDatabase
  ]);
  // News impact handlers

  const handleNewsImpactChange = useCallback((idx, value) => {
    if (value === 'affected') {
      const currentTrade = filteredTrades[idx];
      setNewsImpactData({
        tradeIndex: idx,
        impactType: value,
        currentDetails: currentTrade.newsImpactDetails || ''
      });
      setShowNewsImpactModal(true);
    } else {
      handleChange(idx, 'affectedByNews', value);
      handleChange(idx, 'newsImpactDetails', '');
    }
  }, [filteredTrades, handleChange]);

  const handleNewsImpactSave = useCallback(async (impactDetails) => {
    const { tradeIndex, impactType } = newsImpactData;
    handleChange(tradeIndex, 'affectedByNews', impactType);
    handleChange(tradeIndex, 'newsImpactDetails', impactDetails);
    setShowNewsImpactModal(false);
  }, [newsImpactData, handleChange]);

  // Utility functions
  const hasIncompleteRequiredFields = useCallback(() => {
    return allTrades.some(trade => {
      if (!trade.date && !trade.pair && !trade.entry && !trade.exit && !trade.pnl) {
        return false; // Skip empty rows
      }

      const requiredFields = [
        'date', 'time', 'session', 'pair', 'positionType', 'entry', 'exit',
        'setupType', 'confluences', 'entryType', 'timeFrame', 'risk', 'rFactor',
        'rulesFollowed', 'pipsLost', 'pnl'
      ];

      return requiredFields.some(field => !trade[field] && trade[field] !== 0);
    });
  }, [allTrades]);

  // Add these handlers after your existing handlers
  const handleToggleEdit = useCallback(() => {
    if (!editMode) {
      setEditMode(true);
    }
  }, [editMode]);

  const handleCancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel and lose your changes?"
      );
      if (!confirmCancel) return;

      // Clear temp trades and reset editing state
      setTempTrades([]);
      setEditingRows(new Set());
    }

    setEditMode(false);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);

  // Event handlers
  const handlePopClose = useCallback(() => {
    setPop(prev => ({ ...prev, show: false }));
  }, []);

  const handleTimeFilterChange = useCallback((filter) => {
    setTimeFilter(filter);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAllMonths(prev => !prev);
  }, []);

  // Error handling effects
  useEffect(() => {
    if (error) {
      setPop({ show: true, type: 'error', message: error });
    }
  }, [error]);

  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0) {
      setPop({
        show: true,
        type: 'warning',
        message: 'No trading sessions found. Create sessions in the Strategy page to organize your trades better.'
      });
    }
  }, [sessionsLoading, sessions]);

  return (
    <div className="min-h-screen w-full bg-black text-white relative">
      {/* Enhanced Background with advanced glassmorphism effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pulsing central glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.08) 40%, transparent 70%)', }}
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }} />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.2),rgba(255,255,255,0))]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.2),rgba(255,255,255,0))]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(16,185,129,0.1),rgba(255,255,255,0))]"></div>
        </div>
      </div>

      {/* PopNotification for error and warning */}
      {pop.show && (
        <PopNotification
          type={pop.type}
          message={pop.message}
          onClose={handlePopClose}
          duration={4000} />
      )}

      {/* Tutorial Component - Show when user has zero trades */}
      {showTutorial && (
        <Tutorial onComplete={handleTutorialComplete} />
      )}

      {/* Main Content - Hide when tutorial is showing */}
      {!showTutorial && (
        <div className="flex w-full min-h-screen">
          {/* Timeline Sidebar - Desktop Only */}
          <div className="hidden lg:block relative z-30">
            <TimelineSidebar
              trades={allTrades}
              activeFilter={sidebarFilter}
              onSelectFilter={(type, value) => {
                if (type === 'all') {
                  setSidebarFilter({ type: 'all' });
                } else if (type === 'year') {
                  setSidebarFilter({ type: 'year', year: value });
                } else if (type === 'month') {
                  // value is { year, month }
                  setSidebarFilter({ type: 'month', ...value });
                } else if (type === 'day') {
                  setSidebarFilter({ type: 'day', day: value });
                }
              }}
            />
          </div>

          <div className="flex-1 relative z-10 max-w-7xl mx-auto space-y-8 p-4 md:p-8 overflow-hidden min-w-0">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center">
              <JournalHeader />
            </motion.div>

            {/* Streak Line Progress */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
              className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-red-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl">
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[22px] p-6">
                  <StreakLineProgress
                    currentStreak={currentStreak}
                    className="w-full"
                    showLabels={true}
                    showCurrentPosition={true}
                    animated={true}
                    size="default" />
                </div>
              </div>
            </motion.div>

            {/* Metrics Cards with enhanced glassmorphism and staggered animation */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl">
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[22px] p-6">
                  <JournalCards rows={filteredTrades} sessions={sessions} />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons, Table, and Add Trade Button Container */}
            <div className="relative z-20 space-y-8">
              {/* Action Buttons */}
              <div className="w-full mx-auto">
                <ActionButtons
                  loading={loading}
                  sessionsLoading={sessionsLoading}
                  strategiesLoading={strategiesLoading}
                  editMode={editMode}
                  saving={saving}
                  hasUnsavedChanges={hasUnsavedChanges}
                  hasIncompleteRequiredFields={hasIncompleteRequiredFields}
                  showSaveIndicator={showSaveIndicator} // Add this line
                  onRefresh={refreshData}
                  onToggleEdit={handleToggleEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={saveAndExit}
                  onTimeFilterChange={handleTimeFilterChange}
                  viewMode={viewMode}
                  onToggleView={setViewMode}
                />
              </div>

              {/* Add Trade Button */}
              <AddTradeButton
                onAddRow={addRow}
                tradesCount={filteredTrades.filter(r => r.date || r.pnl).length}
                sessionsCount={sessions.length}
                showAllMonths={showAllMonths} />

              {/* Loading States with enhanced glassmorphism */}
              {strategiesLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative max-w-4xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-purple-600/10 to-purple-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-black/30 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400/30 border-t-purple-400"></div>
                        <div className="absolute inset-0 animate-pulse rounded-full bg-purple-400/20"></div>
                      </div>
                      <p className="text-purple-300 font-medium">Loading strategies...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {sessionsLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative max-w-4xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-black/30 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400/30 border-t-blue-400"></div>
                        <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20"></div>
                      </div>
                      <p className="text-blue-300 font-medium">Loading sessions...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Edit Mode Indicator with enhanced styling */}
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative max-w-4xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-black/30 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Edit3 className="w-8 h-8 text-blue-400" />
                        <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20 blur-md"></div>
                      </div>
                      <div>
                        <p className="text-blue-300 font-medium text-lg">Edit Mode Active</p>
                        <p className="text-blue-400/80 text-sm">You can now modify existing trade records. Click "Cancel Edit" to exit without saving.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Main Loading State with enhanced animation */}
              {loading && isInitialLoad && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-blue-500/30 rounded-3xl blur-2xl"></div>
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-400/30 border-t-blue-400"></div>
                          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20"></div>
                        </div>
                        <div>
                          <p className="text-blue-300 font-semibold text-xl">Loading Trades</p>
                          <p className="text-blue-400/70">Fetching your trading data...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status Messages with enhanced glassmorphism */}

              {!strategiesLoading && strategies.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative max-w-4xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-purple-500/15 rounded-2xl blur-xl"></div>
                  <div className="relative bg-black/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-4">
                      <AlertCircle className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-purple-300 font-medium">No Strategies Found</p>
                        <p className="text-purple-400/80 text-sm">Create strategies in the Strategy page to begin.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Empty State with enhanced styling */}
              {!loading && !isInitialLoad && allTrades.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-20">
                  <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 via-gray-600/10 to-gray-500/20 rounded-3xl blur-2xl"></div>
                    <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
                      <div className="relative">
                        <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <div className="absolute inset-0 animate-pulse rounded-full bg-gray-400/10 blur-xl"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-300 mb-3">No Trades Found</h3>
                      <p className="text-gray-400 mb-6">Start your trading journey by adding your first trade entry.</p>
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm">
                        Click "Add Trade" to get started
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Journal Table with enhanced glassmorphism container */}
              {!isInitialLoad && allTrades.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="relative w-full mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-emerald-500/10 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl">
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[22px] p-6">
                      {viewMode === 'classic' ? (
                        <JournalTable
                          rows={filteredTrades}
                          columns={getFilteredColumns(filteredTrades)}
                          sessions={sessions}
                          strategies={strategies}
                          editingRows={editingRows}
                          handleChange={handleChange}
                          handleNewsImpactChange={handleNewsImpactChange}
                          removeRow={removeRow}
                          openModelPage={openModelPage}
                          openImageViewer={openImageViewer}
                          getHeaderName={getHeaderName}
                          getCellType={getCellType}
                          getDropdownOptions={getDropdownOptions}
                          CloudinaryImageUpload={CloudinaryImageUpload}
                          shouldShowNewsField={shouldShowNewsField}
                          weeklyData={tradesByWeek}
                          editMode={editMode}
                          formatWeekRange={formatWeekRange}
                        />
                      ) : (
                        <JournalListView
                          trades={filteredTrades}
                          strategies={strategies}
                          handleChange={handleChange}
                          onEdit={(trade) => {
                            setSideWindowTrade(trade);
                            setSideWindowMode('edit');
                            setIsSidePanelOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModelPage && selectedTrade && (
        <ModelPage
          trade={selectedTrade}
          onClose={() => {
            setShowModelPage(false);
            setSelectedTrade(null);
          }}
          onSave={handleModelSave}
          onAutoSave={handleSave} />
      )}

      <ImageViewer
        imageUrl={selectedImage.url}
        title={selectedImage.title}
        initialIndex={selectedImage.initialIndex || 0}
        isOpen={showImageViewer}
        onClose={() => {
          setShowImageViewer(false);
          setSelectedImage({ url: '', title: '', initialIndex: 0 });
        }} />

      <NewsImpactModal
        isOpen={showNewsImpactModal}
        onClose={() => setShowNewsImpactModal(false)}
        onSave={handleNewsImpactSave}
        impactType={newsImpactData.impactType}
        currentDetails={newsImpactData.currentDetails} />

      <TradeSideWindow
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        trade={sideWindowTrade}
        isEditMode={sideWindowMode === 'edit'}
        sessions={sessions}
        strategies={strategies}
        onSave={handleSideWindowSave}
        onDelete={handleSideWindowDelete}
      />
    </div>
  );

}

import ProtectedRoute from '@/components/ProtectedRoute';

export default function TradeJournal() {
  return (
    <ProtectedRoute>
      <TradeJournalContent />
    </ProtectedRoute>
  );
}    