// app/api/user/performance/route.js
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';
import Leaderboard from '@/models/Leaderboard';
import { calculateConsistencyStreak, getDailyStreakRank } from '@/lib/streak';

export async function GET(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    await connectDB();

    // Get user's trades and calculate streak in parallel
    const trades = await Trade.find({ userId }).sort({ date: -1 });
    const currentStreak = await calculateConsistencyStreak(userId);

    // Calculate performance metrics
    const metrics = calculatePerformanceMetrics(trades);
    const rank = determineRank(metrics.winRate, metrics.consistency, metrics.riskManagement);
    const dailyStreakRank = getDailyStreakRank(currentStreak);
    const compositeScore = calculateCompositeScore({
      ...metrics,
      weeklyActive: await isWeeklyActive(userId)
    });

    return NextResponse.json({
      ...metrics,
      rank: rank.name,
      currentStreak,
      dailyStreakRank,
      compositeScore,
      // Mock change data for now - in production, you'd calculate from historical data
      winRateChange: Math.floor(Math.random() * 21) - 10, // -10 to +10
      consistencyChange: Math.floor(Math.random() * 21) - 10,
      profitFactorChange: Math.floor(Math.random() * 21) - 10,
      tradesChange: Math.floor(Math.random() * 21) - 10
    });
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

async function isWeeklyActive(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentTrades = await Trade.countDocuments({
    userId,
    date: { $gte: sevenDaysAgo }
  });
  
  return recentTrades > 0;
}

function determineRank(winRate, consistency, riskManagement) {
  const ranks = [
    { name: 'Obsidian', minWinRate: 85, minConsistency: 90, minRiskManagement: 95 },
    { name: 'Diamond', minWinRate: 75, minConsistency: 80, minRiskManagement: 85 },
    { name: 'Platinum', minWinRate: 65, minConsistency: 70, minRiskManagement: 75 },
    { name: 'Gold', minWinRate: 55, minConsistency: 60, minRiskManagement: 65 },
    { name: 'Silver', minWinRate: 45, minConsistency: 50, minRiskManagement: 55 },
    { name: 'Bronze', minWinRate: 0, minConsistency: 0, minRiskManagement: 0 }
  ];

  return ranks.find(rank => 
    winRate >= rank.minWinRate && 
    consistency >= rank.minConsistency && 
    riskManagement >= rank.minRiskManagement
  ) || ranks[ranks.length - 1];
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
      isOverOptimized: false,
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
  const monthlyTrades = trades.filter(trade => new Date(trade.date) >= thirtyDaysAgo);
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
  
  const baseScore = (
    user.winRate * weights.winRate +
    user.consistency * weights.consistency +
    user.riskManagement * weights.riskManagement +
    profitFactorScore * weights.profitFactor +
    experienceFactor * weights.experience +
    weeklyActivityBonus * weights.weeklyActive
  ) * overOptimizationPenalty;
  
  return Math.min(100, Math.max(0, baseScore));
}

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
