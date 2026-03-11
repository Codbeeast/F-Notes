// app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';
import Leaderboard from '@/models/Leaderboard';

// Helper to compute the start-of-period date
function getPeriodStartDate(period) {
  const now = new Date();
  switch (period) {
    case 'week': {
      const day = now.getDay(); // 0=Sun
      const diff = day === 0 ? 6 : day - 1; // Monday as start
      const start = new Date(now);
      start.setDate(now.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case 'month': {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case 'year': {
      return new Date(now.getFullYear(), 0, 1);
    }
    default:
      return null; // 'all' — no filter
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'composite';
    const period = searchParams.get('period') || 'all'; // week | month | year | all

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    const periodStart = getPeriodStartDate(period);

    // Leaderboard is public - no authentication required
    const leaderboardData = await calculateLeaderboard(page, limit, sortBy, periodStart);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        period
      },
      { status: 500 }
    );
  }
}

async function calculateLeaderboard(page, limit, sortBy, periodStart) {
  try {
    // Build date filter for trades
    const dateFilter = periodStart ? { createdAt: { $gte: periodStart } } : {};

    // Get active user IDs from trades within the selected period
    const activeUserIds = await Trade.distinct('userId', dateFilter);

    if (activeUserIds.length === 0) {
      return {
        users: [],
        totalUsers: 0,
        currentPage: page,
        totalPages: 0
      };
    }

    // Get leaderboard entries for active users
    const leaderboardUsers = await Leaderboard.find({
      userId: { $in: activeUserIds }
    });

    // Create a map for quick lookup
    const leaderboardMap = new Map();
    leaderboardUsers.forEach(user => {
      leaderboardMap.set(user.userId, user);
    });

    // Get Clerk user data with simplified approach
    const clerkUsers = new Map();
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');

      // Fetch Clerk data for each user individually with better error handling
      for (const userId of activeUserIds) {
        try {
          const clerkUser = await clerkClient.users.getUser(userId);
          clerkUsers.set(userId, {
            username: clerkUser.username || clerkUser.fullName || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0],
            imageUrl: clerkUser.imageUrl
          });
        } catch (userError) {
          // Skip users that can't be fetched from Clerk (silent)
        }
      }
    } catch (clerkError) {
      // Failed to initialize Clerk client (silent)
    }

    // Calculate performance metrics for each user
    const userPerformances = await Promise.all(
      activeUserIds.map(async (userId) => {
        try {
          const trades = await Trade.find({ userId, ...dateFilter }).sort({ createdAt: -1 });

          // Skip users with fewer than 5 trades
          if (trades.length < 5) return null;

          const leaderboardEntry = leaderboardMap.get(userId);
          const metrics = calculatePerformanceMetrics(trades);

          // Use Clerk data if available, otherwise use leaderboard data or generate fallback
          const clerkUserData = clerkUsers.get(userId);
          const username = clerkUserData?.username || leaderboardEntry?.username || `Trader ${userId.slice(-4)}`;
          const imageUrl = clerkUserData?.imageUrl || leaderboardEntry?.imageUrl || '/default-avatar.png';


          return {
            userId,
            username,
            imageUrl,
            joinDate: leaderboardEntry?.createdAt || new Date(),
            currentStreak: leaderboardEntry?.currentStreak || 0,
            weeklyActive: await isWeeklyActive(userId),
            ...metrics
          };
        } catch (error) {
          // Error processing user (silent)
          return null;
        }
      })
    );

    // Filter out null results and add composite scores with league info
    const validUsers = userPerformances
      .filter(user => user !== null)
      .map(user => {
        const compositeScore = calculateCompositeScore(user);
        const leagueInfo = getUserLeagueInfo(compositeScore);

        return {
          ...user,
          compositeScore,
          league: leagueInfo.name,
          leagueSubLevel: leagueInfo.subLevel,
          leagueProgress: leagueInfo.progress,
          leagueIcon: leagueInfo.icon,
          leagueColor: leagueInfo.color,
          leagueTextColor: leagueInfo.textColor,
          dailyStreakRank: getDailyStreakRank(user.currentStreak || 0)
        };
      });

    // Sort users based on criteria
    const sortedUsers = sortUsers(validUsers, sortBy);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      totalUsers: sortedUsers.length,
      currentPage: page,
      totalPages: Math.ceil(sortedUsers.length / limit),
      sortBy,
      period: periodStart ? undefined : 'all',
      periodStart: periodStart || undefined
    };
  } catch (error) {
    throw error;
  }
}

function sortUsers(users, sortBy) {
  return [...users].sort((a, b) => {
    switch (sortBy) {
      case 'winRate':
        return b.winRate - a.winRate;
      case 'consistency':
        return b.consistency - a.consistency;
      case 'riskManagement':
        return b.riskManagement - a.riskManagement;
      case 'totalTrades':
        return b.totalTrades - a.totalTrades;
      case 'profitFactor':
        return b.profitFactor - a.profitFactor;
      case 'streak':
        return b.currentStreak - a.currentStreak;
      default: // composite
        return b.compositeScore - a.compositeScore;
    }
  });
}

async function isWeeklyActive(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTrades = await Trade.countDocuments({
    userId,
    createdAt: { $gte: sevenDaysAgo }
  });

  return recentTrades > 0;
}

function calculatePerformanceMetrics(trades) {
  if (trades.length === 0) {
    return {
      winRate: 0,
      consistency: 0,
      riskManagement: 0,
      totalTrades: 0,
      profitFactor: 0,
      profitFactorRating: 'No Data',
      profitFactorScore: 0,
      monthlyPnl: 0
    };
  }

  // Calculate win rate
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  const winRate = Math.round((winningTrades.length / trades.length) * 100);

  // Calculate profit factor with enhanced rating system
  const totalGain = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
  const profitFactor = totalLoss > 0 ? +(totalGain / totalLoss).toFixed(2) : totalGain > 0 ? 99 : 0;

  // Enhanced profit factor rating based on the image specifications
  const { rating: profitFactorRating, score: profitFactorScore, isOverOptimized } = getProfitFactorRating(profitFactor);

  // Calculate monthly P&L (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyTrades = trades.filter(trade => new Date(trade.createdAt) >= thirtyDaysAgo);
  const monthlyPnl = Math.round(monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0));

  // Calculate consistency and risk management
  const consistency = calculateConsistency(trades);
  const riskManagement = calculateRiskManagement(trades);

  return {
    winRate,
    consistency: Math.round(consistency),
    riskManagement: Math.round(riskManagement),
    totalTrades: trades.length,
    profitFactor,
    profitFactorRating,
    profitFactorScore,
    isOverOptimized,
    monthlyPnl
  };
}

function calculateConsistency(trades) {
  if (trades.length === 0) return 0;

  const factors = [];

  // Factor 1: Rules followed percentage (40% weight)
  const rulesFollowedTrades = trades.filter(trade => trade.rulesFollowed === 'Yes');
  if (trades.length > 0) {
    const rulesScore = (rulesFollowedTrades.length / trades.length) * 100;
    factors.push(rulesScore * 0.4);
  }

  // Factor 2: Risk consistency - standard deviation of risk percentages (30% weight)
  const risks = trades.filter(trade => trade.risk && trade.risk > 0).map(trade => trade.risk);
  if (risks.length > 1) {
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
    const variance = risks.reduce((sum, risk) => sum + Math.pow(risk - avgRisk, 2), 0) / risks.length;
    const stdDev = Math.sqrt(variance);
    const riskConsistency = Math.max(0, 100 - (stdDev * 10));
    factors.push(riskConsistency * 0.3);
  }

  // Factor 3: Emotional control based on ratings (30% weight)
  const emotionalTrades = trades.filter(trade =>
    trade.fearToGreed && trade.fomoRating && trade.executionRating
  );
  if (emotionalTrades.length > 0) {
    const avgEmotionalControl = emotionalTrades.reduce((sum, trade) => {
      const fearGreedScore = Math.max(0, 10 - Math.abs(trade.fearToGreed - 5.5));
      const fomoScore = Math.max(0, 10 - Math.abs(trade.fomoRating - 3));
      const executionScore = trade.executionRating;
      return sum + (fearGreedScore + fomoScore + executionScore) / 3;
    }, 0) / emotionalTrades.length;
    factors.push((avgEmotionalControl * 10) * 0.3);
  }

  return factors.length === 0 ? 50 : factors.reduce((sum, factor) => sum + factor, 0);
}

function calculateRiskManagement(trades) {
  if (trades.length === 0) return 0;

  const factors = [];

  // Factor 1: Risk per trade optimization (40% weight)
  const riskyTrades = trades.filter(trade => trade.risk && trade.risk > 0);
  if (riskyTrades.length > 0) {
    const avgRisk = riskyTrades.reduce((sum, trade) => sum + trade.risk, 0) / riskyTrades.length;
    let riskOptimality;
    if (avgRisk >= 1 && avgRisk <= 2) {
      riskOptimality = 100;
    } else if (avgRisk >= 0.5 && avgRisk <= 3) {
      riskOptimality = 80;
    } else if (avgRisk >= 0.1 && avgRisk <= 5) {
      riskOptimality = 60;
    } else {
      riskOptimality = 40;
    }
    factors.push(riskOptimality * 0.4);
  }

  // Factor 2: R-Factor management (30% weight)
  const rFactorTrades = trades.filter(trade => trade.rFactor && trade.rFactor > 0);
  if (rFactorTrades.length > 0) {
    const avgRFactor = rFactorTrades.reduce((sum, trade) => sum + trade.rFactor, 0) / rFactorTrades.length;
    let rFactorScore;
    if (avgRFactor >= 2) {
      rFactorScore = 100;
    } else if (avgRFactor >= 1.5) {
      rFactorScore = 80;
    } else if (avgRFactor >= 1) {
      rFactorScore = 60;
    } else {
      rFactorScore = 40;
    }
    factors.push(rFactorScore * 0.3);
  }

  // Factor 3: Stop loss discipline (30% weight)
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  if (losingTrades.length > 0) {
    const disciplinedLosses = losingTrades.filter(trade => {
      if (!trade.risk) return false;
      const expectedLoss = trade.risk * 100;
      const actualLoss = Math.abs(trade.pnl);
      return actualLoss <= expectedLoss * 1.2;
    });

    const stopLossDiscipline = (disciplinedLosses.length / losingTrades.length) * 100;
    factors.push(stopLossDiscipline * 0.3);
  }

  return factors.length === 0 ? 50 : factors.reduce((sum, factor) => sum + factor, 0);
}

function calculateCompositeScore(user) {
  const weights = {
    winRate: 0.20,
    consistency: 0.25,
    riskManagement: 0.25,
    profitFactor: 0.20,
    experience: 0.05,
    weeklyActive: 0.05
  };

  const experienceFactor = Math.min(user.totalTrades / 100, 1) * 100;

  // Use the enhanced profit factor score instead of simple normalization
  const profitFactorScore = user.profitFactorScore || 0;

  // Apply penalty for over-optimization
  const overOptimizationPenalty = user.isOverOptimized ? 0.85 : 1.0;

  const weeklyActivityBonus = user.weeklyActive ? 100 : 0;

  // Streak bonus: Reward consistency. 0.5 points per day, capped at 15 points (30 days).
  const streakBonus = Math.min(15, (user.currentStreak || 0) * 0.5);

  const baseScore = (
    user.winRate * weights.winRate +
    user.consistency * weights.consistency +
    user.riskManagement * weights.riskManagement +
    profitFactorScore * weights.profitFactor +
    experienceFactor * weights.experience +
    weeklyActivityBonus * weights.weeklyActive
  ) * overOptimizationPenalty;

  // Add streak bonus straight to the score
  return Math.min(100, Math.max(0, baseScore + streakBonus));
}

// League sub-levels configuration
const leagueSubLevels = {
  Obsidian: { levels: 3, icon: '💎', color: 'from-purple-900 to-black', textColor: 'text-purple-300' },
  Diamond: { levels: 3, icon: '🔷', color: 'from-blue-400 to-cyan-300', textColor: 'text-cyan-300' },
  Platinum: { levels: 3, icon: '🔶', color: 'from-gray-300 to-gray-500', textColor: 'text-gray-300' },
  Gold: { levels: 3, icon: '🥇', color: 'from-yellow-400 to-orange-400', textColor: 'text-yellow-300' },
  Silver: { levels: 3, icon: '🥈', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-400' },
  Bronze: { levels: 3, icon: '🥉', color: 'from-orange-600 to-red-600', textColor: 'text-orange-400' },
};

// Determine league sub-level based on composite score
function determineLeagueSubLevel(compositeScore, leagueName) {
  const league = leagueSubLevels[leagueName];
  if (!league) return { subLevel: 1, progress: 0 };

  const leagueRanges = {
    Obsidian: { min: 95, max: 100 },
    Diamond: { min: 85, max: 94.9 },
    Platinum: { min: 75, max: 84.9 },
    Gold: { min: 65, max: 74.9 },
    Silver: { min: 45, max: 64.9 },
    Bronze: { min: 0, max: 44.9 }
  };

  const range = leagueRanges[leagueName];
  const scoreInRange = Math.max(0, compositeScore - range.min);
  const rangeSize = range.max - range.min;
  const progress = (scoreInRange / rangeSize) * 100;

  const subLevel = Math.min(league.levels, Math.ceil((progress / 100) * league.levels));

  return {
    subLevel,
    progress: Math.min(100, Math.max(0, progress))
  };
}

function getUserLeagueInfo(compositeScore) {
  const leagues = [
    { name: 'Obsidian', minScore: 95 },
    { name: 'Diamond', minScore: 85 },
    { name: 'Platinum', minScore: 75 },
    { name: 'Gold', minScore: 65 },
    { name: 'Silver', minScore: 45 },
    { name: 'Bronze', minScore: 0 }
  ];

  const league = leagues.find(l => compositeScore >= l.minScore) || leagues[leagues.length - 1];
  const subLevelInfo = determineLeagueSubLevel(compositeScore, league.name);
  const leagueConfig = leagueSubLevels[league.name];

  return {
    name: league.name,
    subLevel: subLevelInfo.subLevel,
    progress: subLevelInfo.progress,
    icon: leagueConfig?.icon || '📊',
    color: leagueConfig?.color || 'from-gray-400 to-gray-600',
    textColor: leagueConfig?.textColor || 'text-gray-400'
  };
}

// Daily streak ranks with proper icons - synced with lib/streak.js
const dailyStreakRanks = [
  { name: 'Legend Status', minDays: 200, icon: 'Trophy', theme: 'text-yellow-400', bgGradient: 'from-yellow-400 to-orange-500' },
  { name: 'Trader Elite', minDays: 150, icon: 'Award', theme: 'text-purple-400', bgGradient: 'from-purple-400 to-pink-500' },
  { name: 'Century Club', minDays: 100, icon: 'Star', theme: 'text-blue-400', bgGradient: 'from-blue-400 to-cyan-500' },
  { name: 'Discipline Beast', minDays: 75, icon: 'Flame', theme: 'text-red-400', bgGradient: 'from-red-400 to-pink-500' },
  { name: 'Setup Sniper', minDays: 50, icon: 'Target', theme: 'text-orange-400', bgGradient: 'from-orange-400 to-red-500' },
  { name: 'R-Master', minDays: 30, icon: 'BarChart3', theme: 'text-green-400', bgGradient: 'from-green-400 to-emerald-500' },
  { name: 'Fortnight Fighter', minDays: 21, icon: 'TrendingUp', theme: 'text-teal-400', bgGradient: 'from-teal-400 to-blue-500' },
  { name: 'Zone Scout', minDays: 14, icon: 'Search', theme: 'text-cyan-400', bgGradient: 'from-cyan-400 to-teal-500' },
  { name: 'Wick Watcher', minDays: 7, icon: 'Zap', theme: 'text-gray-400', bgGradient: 'from-gray-400 to-gray-600' },
  { name: 'Chart Rookie', minDays: 0, icon: 'Calendar', theme: 'text-gray-500', bgGradient: 'from-gray-500 to-gray-700' },
];

// Enhanced profit factor rating system based on the image specifications
function getProfitFactorRating(profitFactor) {
  if (profitFactor === 0) {
    return { rating: 'No Profit', score: 0, isOverOptimized: false };
  } else if (profitFactor > 0 && profitFactor < 1.0) {
    return { rating: 'Losing Strategy', score: 20, isOverOptimized: false };
  } else if (profitFactor >= 1.0 && profitFactor < 1.75) {
    return { rating: 'Barely Profitable', score: 50, isOverOptimized: false };
  } else if (profitFactor >= 1.75 && profitFactor <= 3.0) {
    return { rating: 'Strong Performance', score: 85, isOverOptimized: false };
  } else if (profitFactor > 3.0 && profitFactor <= 5.0) {
    return { rating: 'Outstanding Performance', score: 95, isOverOptimized: false };
  } else if (profitFactor > 5.0) {
    // Over-optimization concern as per the image
    return {
      rating: 'Potentially Over-Optimized',
      score: 70, // Reduced score due to over-optimization risk
      isOverOptimized: true
    };
  }
  return { rating: 'Unknown', score: 0, isOverOptimized: false };
}

// Helper function to get daily streak rank
function getDailyStreakRank(dayStreak) {
  return dailyStreakRanks.find(rank => dayStreak >= rank.minDays) || dailyStreakRanks[dailyStreakRanks.length - 1];
}