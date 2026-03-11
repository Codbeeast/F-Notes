// Emergency diagnostic endpoint
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function GET(request) {
    try {
        // Block in production for security
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Not available' }, { status: 404 });
        }

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get ALL subscriptions for this user
        const allSubscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });

        // Get what findActiveSubscription returns
        const activeSubscription = await Subscription.findActiveSubscription(userId);

        const now = new Date();

        // Analyze each subscription
        const analysis = allSubscriptions.map(sub => {
            const statusMatch = ['trial', 'active'].includes(sub.status);
            const trialCondition = sub.isTrialActive && sub.trialEndDate > now;
            const activeCondition = sub.status === 'active' && sub.currentPeriodEnd > now;
            const shouldMatch = statusMatch && (trialCondition || activeCondition);

            return {
                id: sub._id,
                status: sub.status,
                isTrialActive: sub.isTrialActive,
                trialEndDate: sub.trialEndDate,
                currentPeriodEnd: sub.currentPeriodEnd,
                createdAt: sub.createdAt,
                analysis: {
                    statusMatch,
                    trialCondition,
                    activeCondition,
                    shouldMatch
                }
            };
        });

        return NextResponse.json({
            success: true,
            userId,
            totalSubscriptions: allSubscriptions.length,
            activeSubscription: activeSubscription ? {
                id: activeSubscription._id,
                status: activeSubscription.status,
                isTrialActive: activeSubscription.isTrialActive
            } : null,
            allSubscriptions: analysis,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
