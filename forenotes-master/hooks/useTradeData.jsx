// Custom hook to fetch existing trades from database
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

export const useTradeData = () => {
  const { getToken, userId } = useAuth();
  const [trades, setTrades] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Enhanced error handling
  const handleAxiosError = useCallback((error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error (${error.response.status})`;
      setError(`${contextMessage}: ${message}`);
    } else if (error.request) {
      setError(`${contextMessage}: No response from server. Please check your connection.`);
    } else {
      setError(`${contextMessage}: ${error.message}`);
    }
  }, []);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/sessions', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setSessions(response.data);
        console.log('Sessions loaded:', response.data.length);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      handleAxiosError(err, 'Failed to load sessions');
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [getToken, handleAxiosError]);

  // Fetch trades
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/trades', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data && Array.isArray(response.data)) {
        // Sort trades by date and time (ascending order - oldest first)
        const sortedTrades = response.data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA - dateB;
        });

        // Process and validate trades
        const processedTrades = sortedTrades.map(trade => {
          const processedTrade = {
            ...trade,
            // Convert session object to sessionId and session name
            sessionId: trade.session?._id || trade.sessionId || '',
            session: trade.session?.sessionName || trade.session || ''
          };

          // Validate numeric fields
          const numericFields = ['entry', 'exit', 'risk', 'rFactor', 'pipsLost', 'pnl'];
          numericFields.forEach(field => {
            if (processedTrade[field] && isNaN(Number(processedTrade[field]))) {
              processedTrade[field] = null;
            }
          });

          return processedTrade;
        });

        setTrades(processedTrades);
        setLastSync(new Date());
        console.log('Trades loaded:', processedTrades.length);
      } else {
        setTrades([]);
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      handleAxiosError(err, 'Failed to load trades');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, handleAxiosError]);

  // Save trades
  const saveTrades = useCallback(async (tradesToSave, isNew = false) => {
    try {
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      };

      if (isNew) {
        // Save new trades
        const newTradesData = tradesToSave.map(trade => ({
          ...trade,
          id: undefined, // Remove temp ID
          sessionId: trade.sessionId,
          // Ensure numeric fields are properly formatted
          entry: trade.entry ? Number(trade.entry) : null,
          exit: trade.exit ? Number(trade.exit) : null,
          risk: trade.risk ? Number(trade.risk) : null,
          rFactor: trade.rFactor ? Number(trade.rFactor) : null,
          pipsLost: trade.pipsLost ? Number(trade.pipsLost) : null,
          pnl: trade.pnl ? Number(trade.pnl) : null,
        }));

        const response = await axios.post('/api/trades', { trades: newTradesData }, config);
        return response.data?.trades || [];
      } else {
        // Update existing trades
        const updatePromises = tradesToSave.map(trade => {
          const updatedTrade = {
            ...trade,
            sessionId: trade.sessionId,
            // Ensure numeric fields are properly formatted
            entry: trade.entry ? Number(trade.entry) : null,
            exit: trade.exit ? Number(trade.exit) : null,
            risk: trade.risk ? Number(trade.risk) : null,
            rFactor: trade.rFactor ? Number(trade.rFactor) : null,
            pipsLost: trade.pipsLost ? Number(trade.pipsLost) : null,
            pnl: trade.pnl ? Number(trade.pnl) : null,
          };
          
          return axios.put(`/api/trades/${trade.id}`, updatedTrade, config);
        });

        await Promise.all(updatePromises);
        return tradesToSave;
      }
    } catch (err) {
      console.error('Error saving trades:', err);
      handleAxiosError(err, 'Failed to save trades');
      throw err;
    }
  }, [getToken, handleAxiosError]);

  // Delete trade
  const deleteTrade = useCallback(async (tradeId) => {
    try {
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`/api/trades/${tradeId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Remove from local state
      setTrades(prev => prev.filter(trade => trade.id !== tradeId));
    } catch (err) {
      console.error('Error deleting trade:', err);
      handleAxiosError(err, 'Failed to delete trade');
      throw err;
    }
  }, [getToken, handleAxiosError]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchSessions(), fetchTrades()]);
  }, [fetchSessions, fetchTrades]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        refreshData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userId, refreshData]);

  // Initial data load
  useEffect(() => {
    if (userId) {
      refreshData();
    }
  }, [userId, refreshData]);

  return {
    trades,
    sessions,
    loading,
    sessionsLoading,
    error,
    lastSync,
    setError,
    fetchTrades,
    fetchSessions,
    saveTrades,
    deleteTrade,
    refreshData
  };
};

// Alternative: Direct fetch function if you prefer not to use a hook
export const fetchTradesFromDB = async () => {
  try {
    const response = await axios.get('/api/trades');
    
    if (response.data && Array.isArray(response.data)) {
      // Sort trades by date and time (newest first)
      const sortedTrades = response.data.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });
      
      return sortedTrades;
    }
    return [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};