"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// Create the context
export const TradeContext = createContext(null);

// Provider component
export const TradeProvider = ({ children }) => {
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();

  const [trades, setTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategiesLoading, setStrategiesLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState(null);

  // Helper function to get authenticated axios config
  const getAuthConfig = useCallback(async () => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      return {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
    } catch (error) {
      console.error('Error getting auth config:', error);
      throw new Error('Authentication failed');
    }
  }, [getToken, isSignedIn, userId]);

  // Fetch all trades from API (user-specific)
  const fetchTrades = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      setTrades([]);
      setAllTrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const config = await getAuthConfig();
      const response = await axios.get('/api/trades', config);

      const tradesData = Array.isArray(response.data) ? response.data : [];
      setTrades(tradesData);
      setAllTrades(tradesData);
      setCurrentStrategy(null);

      console.log(`Fetched ${tradesData.length} trades for user:`, userId);
    } catch (error) {
      console.error('Error fetching trades:', error);

      // Handle 401 specifically for auth issues
      if (error.response?.status === 401) {
        console.log('Authentication failed, clearing trades');
        setError('Authentication required. Please sign in again.');
      } else {
        setError(error.response?.data?.message || error.message);
      }

      setTrades([]);
      setAllTrades([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, userId, getAuthConfig]);

  // Fetch trades by strategy
  const fetchTradesByStrategy = useCallback(async (strategyId) => {
    if (!isSignedIn || !userId) {
      setTrades([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching trades for strategy ID:', strategyId);

      const config = await getAuthConfig();
      const response = await axios.get(`/api/trades/by-strategy/${strategyId}`, config);

      const strategyTrades = response.data;

      setTrades(strategyTrades);
      setCurrentStrategy(strategyId);

      console.log(`Fetched ${strategyTrades.length} trades for strategy:`, strategyId);
      return strategyTrades;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching trades by strategy:", err);
      setTrades([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, userId, getAuthConfig]);

  // Filter trades locally
  const filterTradesByStrategy = useCallback((strategyId) => {
    if (!strategyId) {
      setTrades(allTrades);
      setCurrentStrategy(null);
      return;
    }

    const filtered = allTrades.filter(trade => trade.strategy?._id === strategyId);
    setTrades(filtered);
    setCurrentStrategy(strategyId);
    console.log('Filtered trades locally:', filtered.length);
  }, [allTrades]);

  const createTrade = useCallback(async (tradeData, shouldUpdateState = true) => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🔄 CreateTrade called with data:', {
        keys: Object.keys(tradeData),
        date: tradeData.date,
        pair: tradeData.pair,
        shouldUpdateState
      });

      setLoading(true);
      setError(null); // Clear any previous errors

      const cleanTradeData = { ...tradeData };
      delete cleanTradeData._id;

      const config = await getAuthConfig();
      console.log('📡 Sending POST request to /api/trades');
      const response = await axios.post('/api/trades', cleanTradeData, config);

      console.log('✅ Trade created successfully:', response.data);

      if (shouldUpdateState) {
        setAllTrades(prev => [response.data, ...prev]);

        if (!currentStrategy || response.data.strategy?._id === currentStrategy) {
          setTrades(prev => [response.data, ...prev]);
        }
      }

      console.log('Created trade for user:', userId);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating trade:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Set error state for all errors
      setError(error.response?.data?.message || error.message);

      // Re-throw the error so calling code knows it failed
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, userId, currentStrategy, getAuthConfig]);

  // Update trade
  const updateTrade = useCallback(async (tradeId, tradeData) => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      const config = await getAuthConfig();
      const response = await axios.put(`/api/trades?id=${tradeId}`, tradeData, config);

      const updatedTrade = response.data;

      setAllTrades(prev => prev.map(trade =>
        trade._id === tradeId ? updatedTrade : trade
      ));

      setTrades(prev => prev.map(trade =>
        trade._id === tradeId ? updatedTrade : trade
      ));

      console.log('Updated trade for user:', userId);
      return updatedTrade;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error updating trade:", err);
      throw err;
    }
  }, [isSignedIn, userId, getAuthConfig]);

  // Delete trade
  const deleteTrade = useCallback(async (tradeId) => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      const config = await getAuthConfig();
      await axios.delete(`/api/trades?id=${tradeId}`, config);

      setAllTrades(prev => prev.filter(trade => trade._id !== tradeId));
      setTrades(prev => prev.filter(trade => trade._id !== tradeId));

      console.log('Deleted trade for user:', userId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error deleting trade:", err);
      throw err;
    }
  }, [isSignedIn, userId, getAuthConfig]);

  // Fetch strategies (user-specific)
  const fetchStrategies = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      setStrategies([]);
      setStrategiesLoading(false);
      return;
    }

    try {
      setStrategiesLoading(true);
      setError(null);

      const config = await getAuthConfig();
      const response = await axios.get("/api/strategies", config);

      setStrategies(response.data);
      console.log(`Fetched ${response.data.length} strategies for user:`, userId);
    } catch (err) {
      console.error("Error fetching strategies:", err);
      setError(err.response?.data?.message || err.message);
      setStrategies([]);
    } finally {
      setStrategiesLoading(false);
    }
  }, [isLoaded, isSignedIn, userId, getAuthConfig]);

  // Create strategy
  const createStrategy = useCallback(async (strategyData) => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      const config = await getAuthConfig();
      const response = await axios.post("/api/strategies", strategyData, config);

      const newStrategy = response.data;
      setStrategies(prev => [newStrategy, ...prev]);

      console.log('Created strategy for user:', userId);
      return newStrategy;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error creating strategy:", err);
      throw err;
    }
  }, [isSignedIn, userId, getAuthConfig]);

  // Update strategy
  const updateStrategy = useCallback(async (strategyId, strategyData) => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      const config = await getAuthConfig();
      const response = await axios.put(`/api/strategies?id=${strategyId}`, strategyData, config);

      const updatedStrategy = response.data;
      setStrategies(prev => prev.map(strategy =>
        strategy._id === strategyId ? updatedStrategy : strategy
      ));

      console.log('Updated strategy for user:', userId);
      return updatedStrategy;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error updating strategy:", err);
      throw err;
    }
  }, [isSignedIn, userId, getAuthConfig]);

  // Delete strategy
  const deleteStrategy = useCallback(async (strategyId) => {
    if (!isSignedIn || !userId) {
      throw new Error('User not authenticated');
    }

    try {
      const config = await getAuthConfig();
      await axios.delete(`/api/strategies?id=${strategyId}`, config);

      setStrategies(prev => prev.filter(strategy => strategy._id !== strategyId));

      if (currentStrategy === strategyId) {
        setTrades(allTrades);
        setCurrentStrategy(null);
      }

      console.log('Deleted strategy for user:', userId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error deleting strategy:", err);
      throw err;
    }
  }, [isSignedIn, userId, currentStrategy, allTrades, getAuthConfig]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      setSessions([]);
      setSessionsLoading(false);
      return;
    }

    try {
      setSessionsLoading(true);

      // Mock sessions for now - replace with actual API when ready
      const mockSessions = [
        { _id: 'london-1', sessionName: 'London Session', pair: 'EUR/USD', userId },
        { _id: 'ny-1', sessionName: 'New York Session', pair: 'GBP/USD', userId },
        { _id: 'tokyo-1', sessionName: 'Tokyo Session', pair: 'USD/JPY', userId }
      ];
      setSessions(mockSessions);

      console.log(`Fetched ${mockSessions.length} sessions for user:`, userId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching sessions:", err);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [isLoaded, isSignedIn, userId]);

  // Fetch data when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && userId) {
        // Add a small delay to ensure auth is fully ready
        const timer = setTimeout(() => {
          fetchTrades();
          fetchStrategies();
          fetchSessions();
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Reset all data when user signs out
        setTrades([]);
        setAllTrades([]);
        setStrategies([]);
        setSessions([]);
        setCurrentStrategy(null);
        setLoading(false);
        setStrategiesLoading(false);
        setSessionsLoading(false);
        setError(null);
      }
    }
  }, [isLoaded, isSignedIn, userId, fetchTrades, fetchStrategies, fetchSessions]);

  // Get strategy data for auto-population
  const getStrategyData = useCallback((strategyId) => {
    return strategies.find(strategy => strategy._id === strategyId);
  }, [strategies]);

  // Context value
  const contextValue = React.useMemo(
    () => ({
      // Auth state
      userId,
      isLoaded,
      isSignedIn,

      // Trade methods
      trades,
      allTrades,
      loading,
      error,
      fetchTrades,
      fetchTradesByStrategy,
      filterTradesByStrategy,
      createTrade,
      updateTrade,
      deleteTrade,

      // Strategy methods
      strategies,
      strategiesLoading,
      fetchStrategies,
      createStrategy,
      updateStrategy,
      deleteStrategy,
      getStrategyData,

      // Session methods
      sessions,
      sessionsLoading,
      fetchSessions,

      // Filter state
      currentStrategy,

      // Utility methods
      getAuthConfig,
    }),
    [
      userId, isLoaded, isSignedIn,
      trades, allTrades, loading, error, fetchTrades, fetchTradesByStrategy, filterTradesByStrategy,
      createTrade, updateTrade, deleteTrade,
      strategies, strategiesLoading, fetchStrategies, createStrategy, updateStrategy, deleteStrategy, getStrategyData,
      sessions, sessionsLoading, fetchSessions,
      currentStrategy, getAuthConfig
    ]
  );

  return (
    <TradeContext.Provider value={contextValue}>
      {children}
    </TradeContext.Provider>
  );
};

// Hook to use the context
export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTrades must be used within a TradeProvider");
  }
  return context;
};