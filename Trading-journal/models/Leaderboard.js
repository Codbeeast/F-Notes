import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema({
  // This will be the Clerk User ID
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: ''
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  highestStreak: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Streak history for analytics
  streakHistory: [{
    date: {
      type: Date,
      required: true
    },
    streak: {
      type: Number,
      required: true
    }
  }],
  // Milestone achievements
  milestones: [{
    days: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    achievedAt: {
      type: Date,
      default: Date.now
    },
    reward: String
  }],
  // Current daily streak rank
  dailyStreakRank: {
    name: {
      type: String,
      default: 'Chart Rookie'
    },
    icon: {
      type: String,
      default: 'Calendar'
    },
    theme: {
      type: String,
      default: 'text-gray-500'
    }
  },
  // League sub-level tracking
  league: {
    name: {
      type: String,
      default: 'Bronze'
    },
    subLevel: {
      type: Number,
      default: 1
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  // Performance metrics cache
  performanceCache: {
    winRate: {
      type: Number,
      default: 0
    },
    consistency: {
      type: Number,
      default: 0
    },
    riskManagement: {
      type: Number,
      default: 0
    },
    profitFactor: {
      type: Number,
      default: 0
    },
    profitFactorRating: {
      type: String,
      default: 'No Data'
    },
    profitFactorScore: {
      type: Number,
      default: 0
    },
    isOverOptimized: {
      type: Boolean,
      default: false
    },
    compositeScore: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Monthly performance data for wrapped feature
  monthlyPerformance: {
    month: String,
    year: Number,
    winRate: Number,
    totalTrades: Number,
    profitFactor: Number,
    consistency: Number,
    riskManagement: Number,
    compositeScore: Number
  }
}, { timestamps: true });

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);
