// app/api/streak/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Leaderboard from '@/models/Leaderboard';
import Trade from '@/models/Trade';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  calculateConsistencyStreak,
  getDailyStreakRank,
  getNextMilestone,
  getAchievedMilestones,
  getMilestoneProgress,
  getNewMilestones,
  dailyStreakRanks,
  streakMilestones
} from '@/lib/streak';

// GET - Fetch user's streak data
export async function GET(req) {
  try {
    await connectDB();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = clerkUser.id;

    // Calculate streak in real-time
    const currentStreak = await calculateConsistencyStreak(userId);

    let userRecord = await Leaderboard.findOne({ userId });

    // If record exists, check if update is needed
    if (userRecord) {
      if (userRecord.currentStreak !== currentStreak) {
        userRecord.currentStreak = currentStreak;
        userRecord.highestStreak = Math.max(userRecord.highestStreak || 0, currentStreak);
        await userRecord.save();
      }
    } else {
      // Create a new record if it doesn't exist
      userRecord = new Leaderboard({
        userId,
        username: clerkUser.username || clerkUser.fullName || `Trader ${userId.slice(-4)}`,
        imageUrl: clerkUser.imageUrl || '',
        currentStreak,
        highestStreak: currentStreak,
        lastLogin: new Date(),
        lastStreakUpdate: new Date(),
      });
      await userRecord.save();
    }

    // Prepare response with fresh data
    const dailyStreakRank = getDailyStreakRank(currentStreak);
    const nextMilestone = getNextMilestone(currentStreak);
    const achievedMilestones = getAchievedMilestones(currentStreak);
    const daysUntilNextMilestone = nextMilestone ? nextMilestone.days - currentStreak : 0;
    const milestoneProgress = getMilestoneProgress(currentStreak);

    return NextResponse.json({
      ...userRecord.toObject(),
      dailyStreakRank,
      nextMilestone,
      achievedMilestones,
      daysUntilNextMilestone,
      milestoneProgress
    });

  } catch (err) {
    return NextResponse.json({
      error: 'Failed to fetch streak data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

// POST - Update user's streak
export async function POST(req) {
  try {
    await connectDB();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = clerkUser.id;

    const body = await req.json();
    let { username, imageUrl } = body;

    // Use Clerk user data if not provided in request
    if (!username || !imageUrl) {
      username = username || clerkUser.username || clerkUser.fullName || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || `Trader ${userId.slice(-4)}`;
      imageUrl = imageUrl || clerkUser.imageUrl || '';
    }

    // Calculate streak based on trading consistency
    const newStreak = await calculateConsistencyStreak(userId);

    let userRecord = await Leaderboard.findOne({ userId });

    // Track milestone achievements
    const previousStreak = userRecord?.currentStreak || 0;

    if (!userRecord) {
      userRecord = new Leaderboard({
        userId,
        username,
        imageUrl,
        currentStreak: newStreak,
        highestStreak: newStreak,
        lastLogin: new Date(),
        lastStreakUpdate: new Date(),
      });
    } else {
      userRecord.username = username;
      userRecord.imageUrl = imageUrl;
      userRecord.currentStreak = newStreak;
      userRecord.highestStreak = Math.max(userRecord.highestStreak || 0, newStreak);
      userRecord.lastStreakUpdate = new Date();
    }

    const newMilestones = getNewMilestones(previousStreak, newStreak);
    if (newMilestones.length > 0) {
      userRecord.achievedMilestones = [...(userRecord.achievedMilestones || []), ...newMilestones];
    }

    await userRecord.save();

    const milestoneReached = newMilestones.length > 0 ? newMilestones[0] : null;

    // Get updated streak data
    const currentStreak = userRecord.currentStreak || 0;
    const dailyStreakRank = getDailyStreakRank(currentStreak);
    const nextMilestone = getNextMilestone(currentStreak);
    const achievedMilestones = getAchievedMilestones(currentStreak);
    const daysUntilNextMilestone = nextMilestone ? nextMilestone.days - currentStreak : 0;
    const milestoneProgress = getMilestoneProgress(currentStreak);

    return NextResponse.json({
      currentStreak,
      highestStreak: userRecord.highestStreak || 0,
      dailyStreakRank,
      nextMilestone,
      achievedMilestones,
      daysUntilNextMilestone,
      milestoneProgress,
      milestoneReached
    });

  } catch (err) {
    return NextResponse.json({
      error: 'Failed to update streak',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

export { dailyStreakRanks, streakMilestones };