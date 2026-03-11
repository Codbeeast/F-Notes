import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { isTrialEligible, createTrialSubscription } from '@/lib/subscription';

/**
 * POST /api/subscription/start-free-trial
 * 
 * Hassle-free trial activation - no payment details required.
 * Just requires user to be signed in.
 * One email can only get trial once in its lifetime.
 */
export async function POST(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userEmail = user.emailAddresses[0]?.emailAddress;
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail?.split('@')[0] || userName;

        if (!userEmail) {
            return NextResponse.json(
                { success: false, error: 'Email address required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already has an active subscription
        const existingActive = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (existingActive) {
            return NextResponse.json({
                success: false,
                error: 'You already have an active subscription',
                hasActiveSubscription: true
            });
        }

        // Check trial eligibility (by email AND userId)
        const eligible = await isTrialEligible(userId, userEmail);

        if (!eligible) {
            return NextResponse.json({
                success: false,
                error: 'You have already used your free trial',
                isTrialUsed: true
            });
        }

        // Create trial subscription without any payment
        // Use TRIAL as plan type - user will choose actual plan after trial ends
        const trialSubscription = await createTrialSubscription(
            userId,
            'TRIAL',
            username,
            userEmail
        );

        return NextResponse.json({
            success: true,
            message: 'Free trial activated successfully!',
            subscription: {
                id: trialSubscription._id,
                status: trialSubscription.status,
                planType: trialSubscription.planType,
                trialStartDate: trialSubscription.trialStartDate,
                trialEndDate: trialSubscription.trialEndDate,
                daysRemaining: trialSubscription.daysRemaining()
            }
        });

    } catch (error) {
        console.error('Free trial activation error:', error);

        // Handle specific error messages
        if (error.message?.includes('Trial already used')) {
            return NextResponse.json({
                success: false,
                error: 'You have already used your free trial',
                isTrialUsed: true
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to activate free trial',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
