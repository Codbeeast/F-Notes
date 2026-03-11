'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SpeedometerGrid from '@/components/Speedometer';
import WeeklyPsychProfile from '@/components/PsycProfile';
import DailyTrades from '@/components/DailyTrades';
import WeeklyRiskStatus from '@/components/WeeklyRiskStatus';
import NoteSummary from '@/components/NoteSummary'
import RegulationChart from '@/components/RegulationChart'

import { useTrades } from '@/context/TradeContext';

// --- Reusable Dashboard Card Component ---
const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-black/20 backdrop-blur-lg  rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

const PsychologyDashboard = () => {
  const [metrics, setMetrics] = useState({
    fomo: 25,
    execution: 75,
    patience: 60,
    confidence: 85,
    fearGreed: 40
  });

  const { trades, fetchTrades } = useTrades();

  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_farthest-side,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative z-10 max-w-full mx-auto space-y-8 p-4 md:p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl md:text-5xl pb-1 font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Psychology
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Monitor and optimize your trading psychology metrics
          </p>
        </div>

        {/* Each component is wrapped in a motion div for animation and a DashboardCard for styling */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DashboardCard>
            <SpeedometerGrid onMetricsChange={setMetrics} />
          </DashboardCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DashboardCard>
            <WeeklyPsychProfile />
          </DashboardCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DashboardCard>
            <DailyTrades trades={trades} />
          </DashboardCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DashboardCard>
            <WeeklyRiskStatus trades={trades} />
          </DashboardCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DashboardCard>
            <RegulationChart trades={trades} />
          </DashboardCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DashboardCard>
            <NoteSummary />
          </DashboardCard>
        </motion.div>
      </div>
    </div>
  );
};

import ProtectedRoute from '@/components/ProtectedRoute';

const PsychologyPage = () => {
  return (
    <ProtectedRoute>
      <PsychologyDashboard />
    </ProtectedRoute>
  );
};

export default PsychologyPage;
