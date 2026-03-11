'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { ClubIcon, Trophy, Target, Flame, Award, Star, TrendingUp, Binoculars, Zap, BarChart3, Loader2, AlertCircle, Crown, Sparkles, Crosshair, Calendar } from 'lucide-react';

// Milestone icons mapping (matching StreakLineProgress)
const milestoneIcons = {
  0: ClubIcon,
  7: Zap,
  14: Binoculars,
  21: Flame,
  30: Star,
  50: Crosshair,
  75: Award,
  100: Trophy,
  150: Sparkles,
  200: Crown
};

// Daily streak ranks with proper icons and reasonable milestones
const dailyStreakRanks = [
  { name: 'Legend Status', minDays: 200, icon: Crown, theme: 'text-yellow-400', bgGradient: 'from-yellow-400 to-orange-500', color: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' },
  { name: 'Trader Elite', minDays: 150, icon: Sparkles, theme: 'text-purple-400', bgGradient: 'from-purple-400 to-pink-500', color: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' },
  { name: 'Century Club', minDays: 100, icon: Trophy, theme: 'text-blue-400', bgGradient: 'from-blue-400 to-cyan-500', color: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' },
  { name: 'Discipline Beast', minDays: 75, icon: Award, theme: 'text-red-400', bgGradient: 'from-red-400 to-pink-500', color: 'bg-gradient-to-br from-red-500/20 to-pink-500/20' },
  { name: 'Setup Sniper', minDays: 50, icon: Crosshair, theme: 'text-orange-400', bgGradient: 'from-orange-400 to-red-500', color: 'bg-gradient-to-br from-orange-500/20 to-red-500/20' },
  { name: 'R-Master', minDays: 30, icon: Star, theme: 'text-green-400', bgGradient: 'from-green-400 to-emerald-500', color: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' },
  { name: 'Fortnight Fighter', minDays: 21, icon: Flame, theme: 'text-teal-400', bgGradient: 'from-teal-400 to-blue-500', color: 'bg-gradient-to-br from-teal-500/20 to-blue-500/20' },
  { name: 'Zone Scout', minDays: 14, icon: Binoculars, theme: 'text-cyan-400', bgGradient: 'from-cyan-400 to-teal-500', color: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20' },
  { name: 'Wick Watcher', minDays: 7, icon: Zap, theme: 'text-gray-400', bgGradient: 'from-gray-400 to-gray-600', color: 'bg-gradient-to-br from-gray-500/20 to-gray-600/20' },
  { name: 'Chart Rookie', minDays: 0, icon: ClubIcon, theme: 'text-gray-500', bgGradient: 'from-gray-500 to-gray-700', color: 'bg-gradient-to-br from-gray-600/20 to-gray-700/20' },
];

// Streak milestones with rewards and achievements (matching StreakLineProgress exactly)
const streakMilestones = [
  { days: 0, title: 'Chart Rookie', description: 'You\'ve spawned. Let the grind begin!', reward: 'Consistency Badge', icon: ClubIcon },
  { days: 7, title: 'Wick Watcher', description: 'First boss defeated. Weekly streak unlocked!', reward: 'Weekly Streak Badge', icon: Zap },
  { days: 14, title: 'Zone Scout', description: 'Two weeks in—your radar\'s dialed in.', reward: 'Discipline Badge', icon: Binoculars },
  { days: 21, title: 'Fortnight Fighter', description: 'You\'ve evolved. Habit mode: activated.', reward: 'Habit Badge', icon: Flame },
  { days: 30, title: 'R-Master', description: 'One-month mastery. Risk is your weapon.', reward: 'Champion Badge', icon: Star },
  { days: 50, title: 'Setup Sniper', description: 'Mid-game unlocked. Precision is your power.', reward: 'Hero Badge', icon: Crosshair },
  { days: 75, title: 'Discipline Beast', description: 'You\'re a machine. No mercy for missed trades.', reward: 'Diamond Badge', icon: Award },
  { days: 100, title: 'Century Club', description: 'Triple digits. You\'re now trading royalty.', reward: 'Century Badge', icon: Trophy },
  { days: 150, title: 'Trader Elite', description: 'Legend status approaching. You\'re feared.', reward: 'Legend Badge', icon: Sparkles },
  { days: 200, title: 'Legend Status', description: 'Immortal grind. You\'ve entered myth.', reward: 'Immortal Badge', icon: Crown },
];

const StreakUpdater = ({ currentStreak = 0, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-gray-800 border border-gray-700 flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-gray-400" size={32} />
        <p className="ml-3 text-gray-400">Loading Streak...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-red-900/20 border border-red-700 flex items-center justify-center h-40">
        <AlertCircle className="text-red-500" size={32} />
        <p className="ml-3 text-red-400">{error}</p>
      </div>
    );
  }

  // Use the passed currentStreak prop directly
  const currentRank = getDailyStreakRank(currentStreak);
  const RankIcon = currentRank?.icon || ClubIcon;
  const achieved = streakMilestones.filter(m => m.days <= currentStreak);
  const next = streakMilestones.find(m => m.days > currentStreak);
  const remaining = streakMilestones.filter(m => m.days > currentStreak).length;
  const maxDays = 200;
  const progressPercentage = Math.min((currentStreak / maxDays) * 100, 100);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 text-base">
            Trading Streak Journey
          </h3>
          <p className="text-gray-400 text-sm">
            {currentStreak} days • {remaining} milestones remaining
          </p>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-gray-300 text-sm font-medium">
              Next: {next.title}
            </p>
            <p className="text-gray-500 text-xs">
              {next.days - currentStreak} days to go
            </p>
          </div>
        )}
      </div>

      {/* Current Streak Display */}
      <div className={`p-4 rounded-lg shadow-lg text-white mb-4 ${currentRank?.color || 'bg-gradient-to-br from-gray-600/20 to-gray-700/20'} border border-white/10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RankIcon className={`mr-3 ${currentRank?.theme || 'text-gray-400'}`} size={28} />
            <div>
              <p className="font-bold text-lg">{currentRank?.name || 'Chart Rookie'}</p>
              <p className="text-sm opacity-80">Current Streak: {currentStreak} Days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{currentStreak}</p>
            <p className="text-xs opacity-80">DAYS</p>
          </div>
        </div>
      </div>

      {/* Next Milestone Only */}
      {next && (
        <div className="mb-4">
          <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center animate-pulse">
                <next.icon size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{next.title}</p>
                <p className="text-yellow-400 text-xs">Next Milestone</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-bold text-xs">{next.days - currentStreak}d</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between mt-4 text-center">
        <div>
          <p className="text-green-400 font-bold text-sm">
            {achieved.length}
          </p>
          <p className="text-gray-500 text-xs">Achieved</p>
        </div>
        <div>
          <p className="text-yellow-400 font-bold text-sm">
            {Math.round(progressPercentage)}%
          </p>
          <p className="text-gray-500 text-xs">Complete</p>
        </div>
        <div>
          <p className="text-blue-400 font-bold text-sm">
            {remaining}
          </p>
          <p className="text-gray-500 text-xs">Remaining</p>
        </div>
      </div>

      {/* Weekend Protection Notice */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <p className="text-xs text-blue-300">
            Weekend Protection: Your streak won't break on Saturday or Sunday
          </p>
        </div>
      </div>
    </div>
  );
};


// Helper function to get daily streak rank
export function getDailyStreakRank(dayStreak) {
  return dailyStreakRanks.find(rank => dayStreak >= rank.minDays) || dailyStreakRanks[dailyStreakRanks.length - 1];
}

// Helper function to get next milestone
export function getNextMilestone(currentStreak) {
  return streakMilestones.find(milestone => milestone.days > currentStreak) || null;
}

// Helper function to get achieved milestones
export function getAchievedMilestones(currentStreak) {
  return streakMilestones.filter(milestone => milestone.days <= currentStreak);
}

// Helper function to calculate days until next milestone
export function getDaysUntilNextMilestone(currentStreak) {
  const nextMilestone = getNextMilestone(currentStreak);
  return nextMilestone ? nextMilestone.days - currentStreak : 0;
}

// Helper function to calculate milestone progress percentage
export function getMilestoneProgress(currentStreak) {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return 100;
  
  const previousMilestone = streakMilestones
    .filter(m => m.days <= currentStreak)
    .pop();
  
  const startPoint = previousMilestone ? previousMilestone.days : 0;
  const progress = ((currentStreak - startPoint) / (nextMilestone.days - startPoint)) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

export { dailyStreakRanks, streakMilestones };

export default StreakUpdater;
