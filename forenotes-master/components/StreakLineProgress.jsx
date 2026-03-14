'use client';

import { useState, useEffect } from 'react';
import { Trophy, Award, Star, Flame, Crosshair, Binoculars, Zap, Calendar, Crown, Sparkles, ClubIcon } from 'lucide-react';

// Streak milestones data
const streakMilestones =[
  {
    days: 0,
    title: 'Chart Rookie',
    description: 'You’ve spawned. Let the grind begin!',
    reward: 'Consistency Badge',
  },
  {
    days: 7,
    title: 'Wick Watcher',
    description: 'First boss defeated. Weekly streak unlocked!',
    reward: 'Weekly Streak Badge',
  },
  {
    days: 14,
    title: 'Zone Scout',
    description: 'Two weeks in—your radar’s dialed in.',
    reward: 'Discipline Badge',
  },
  {
    days: 21,
    title: 'Fortnight Fighter',
    description: 'You’ve evolved. Habit mode: activated.',
    reward: 'Habit Badge',
  },
  {
    days: 30,
    title: 'R-Master',
    description: 'One-month mastery. Risk is your weapon.',
    reward: 'Champion Badge',
  },
  {
    days: 50,
    title: 'Setup Sniper',
    description: 'Mid-game unlocked. Precision is your power.',
    reward: 'Hero Badge',
  },
  {
    days: 75,
    title: 'Discipline Beast',
    description: 'You’re a machine. No mercy for missed trades.',
    reward: 'Diamond Badge',
  },
  {
    days: 100,
    title: 'Century Club',
    description: 'Triple digits. You’re now trading royalty.',
    reward: 'Century Badge',
  },
  {
    days: 150,
    title: 'Trader Elite',
    description: 'Legend status approaching. You’re feared.',
    reward: 'Legend Badge',
  },
  {
    days: 200,
    title: 'Legend Status',
    description: 'Immortal grind. You’ve entered myth.',
    reward: 'Immortal Badge',
  },
];

// Milestone icons mapping
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

const StreakLineProgress = ({ 
  currentStreak = 0, 
  className = '',
  showLabels = true,
  showCurrentPosition = true,
  animated = true,
  size = 'default' // 'small', 'default', 'large'
}) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [hoveredMilestone, setHoveredMilestone] = useState(null);

  // Animate the progress
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedStreak(currentStreak);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimatedStreak(currentStreak);
    }
  }, [currentStreak, animated]);

  // Calculate progress percentage for the entire journey (0-200 days)
  const maxDays = 200;
  const progressPercentage = Math.min((animatedStreak / maxDays) * 100, 100);

  // Find achieved and next milestones
  const achievedMilestones = streakMilestones.filter(m => m.days <= currentStreak);
  const nextMilestone = streakMilestones.find(m => m.days > currentStreak);
  const remainingMilestones = streakMilestones.filter(m => m.days > currentStreak).length;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'h-16',
      line: 'h-2',
      milestone: 'w-6 h-6',
      icon: 16,
      text: 'text-xs',
      titleText: 'text-sm'
    },
    default: {
      container: 'h-20',
      line: 'h-3',
      milestone: 'w-8 h-8',
      icon: 20,
      text: 'text-sm',
      titleText: 'text-base'
    },
    large: {
      container: 'h-24',
      line: 'h-4',
      milestone: 'w-10 h-10',
      icon: 24,
      text: 'text-base',
      titleText: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 ${config.titleText}`}>
            Trading Streak Journey
          </h3>
          <p className={`text-gray-400 ${config.text}`}>
            {currentStreak} days • {remainingMilestones} milestones remaining
          </p>
        </div>
        {nextMilestone && (
          <div className="text-right">
            <p className={`text-gray-300 ${config.text} font-medium`}>
              Next: {nextMilestone.title}
            </p>
            <p className={`text-gray-500 text-xs`}>
              {nextMilestone.days - currentStreak} days to go
            </p>
          </div>
        )}
      </div>

      {/* Progress Line Container */}
      <div className={`relative ${config.container} flex items-center`}>
        {/* Background Line */}
        <div className={`absolute w-full ${config.line} bg-gray-700 rounded-full`}>
          {/* Progress Fill */}
          <div 
            className={`${config.line} bg-gradient-to-r from-blue-400 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Shimmer effect */}
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Milestones */}
        {streakMilestones.map((milestone, index) => {
          const position = (milestone.days / maxDays) * 100;
          const isAchieved = milestone.days <= currentStreak;
          const isCurrent = milestone.days === Math.min(...streakMilestones.filter(m => m.days > currentStreak).map(m => m.days));
          const IconComponent = milestoneIcons[milestone.days] || Calendar;
          
          return (
            <div
              key={milestone.days}
              className="absolute transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${position}%` }}
              onMouseEnter={() => setHoveredMilestone(milestone)}
              onMouseLeave={() => setHoveredMilestone(null)}
            >
              {/* Milestone Marker */}
              <div
                className={`
                  ${config.milestone} rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 cursor-pointer relative z-10
                  ${isAchieved 
                    ? `${milestone.color} border-white shadow-lg transform scale-110` 
                    : isCurrent
                    ? 'bg-gray-600 border-yellow-400 animate-pulse'
                    : 'bg-gray-800 border-gray-600'
                  }
                  hover:scale-125 hover:shadow-xl
                `}
              >
                <IconComponent 
                  size={config.icon} 
                  className={`
                    ${isAchieved ? 'text-white' : isCurrent ? 'text-yellow-400' : 'text-gray-500'}
                    transition-colors duration-300
                  `}
                />
                
                {/* Achievement Glow */}
                {isAchieved && animated && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-white/30"></div>
                )}
              </div>

              {/* Labels */}
              {showLabels && (
                <div className="absolute top-full mt-2 text-center whitespace-nowrap">
                  <p className={`${config.text} font-medium ${isAchieved ? 'text-white' : 'text-gray-500'}`}>
                    {milestone.days}d
                  </p>
                </div>
              )}

              {/* Tooltip */}
              {hoveredMilestone?.days === milestone.days && (
                <div className="absolute bottom-full mb-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-2xl z-20 min-w-48">
                  <h4 className="font-bold text-white text-sm">{milestone.title}</h4>
                  <p className="text-gray-300 text-xs mt-1">{milestone.description}</p>
                  <p className="text-yellow-500 text-xs mt-1 font-medium">🏆 {milestone.reward}</p>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-4 border-transparent border-t-black/80"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Current Position Indicator */}
        {showCurrentPosition && currentStreak > 0 && (
          <div
            className="absolute transform -translate-x-1/2 flex flex-col items-center z-20"
            style={{ left: `${Math.min(progressPercentage, 100)}%` }}
          >
            {/* Current Position Marker */}
            <div className="w-4 h-4 bg-white rounded-full border-2 border-blue-400 shadow-lg animate-bounce">
              <div className="w-full h-full bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Current Streak Label */}
            <div className="absolute top-full mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              {currentStreak} days
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex justify-between mt-4 text-center">
        <div>
          <p className={`text-green-400 font-bold ${config.text}`}>
            {achievedMilestones.length}
          </p>
          <p className={`text-gray-500 text-xs`}>Achieved</p>
        </div>
        <div>
          <p className={`text-yellow-400 font-bold ${config.text}`}>
            {Math.round(progressPercentage)}%
          </p>
          <p className={`text-gray-500 text-xs`}>Complete</p>
        </div>
        <div>
          <p className={`text-blue-400 font-bold ${config.text}`}>
            {remainingMilestones}
          </p>
          <p className={`text-gray-500 text-xs`}>Remaining</p>
        </div>
      </div>
    </div>
  );
};

export default StreakLineProgress;