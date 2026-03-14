import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { isTrialEligible } from '@/lib/subscription';

export async function POST(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Check if user already has ANY subscription (active, trial, cancelled, expired)
        // We only want to auto-create a trial if they have absolutely nothing.
        // Check if user already has ANY subscription
        // We use findActiveSubscription to get the most relevant one (Active > Created > Trial)
        // This ensures that if a user upgraded, we don't return the old trial
        const existingSubscription = await Subscription.findActiveSubscription(userId);

        if (existingSubscription) {
            // Found a relevant subscription, return it
            return NextResponse.json({
                success: true,
                message: 'Subscription already exists',
                subscription: existingSubscription
            });
        }

        // If no active/relevant subscription found, check if there's ANY history (like an old expired trial)
        // that findActiveSubscription might have skipped if it was strictly looking for active ones.
        // Actually, findActiveSubscription returns null if nothing "active" or "repairable" is found.
        // But we want to know if they *ever* had a trial to decide eligibility.

        const hasUsedTrial = await Subscription.findOne({ userId, isTrialUsed: true });
        if (hasUsedTrial) {
            // User had a trial before but now has no active subscription. 
            // Return the last known state (even if expired) so UI can show "Expired" instead of creating new trial.
            // We should fetch the latest interaction.
            const lastSubscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });
            return NextResponse.json({
                success: true,
                message: 'Trial already used',
                subscription: lastSubscription
            });
        }

        // Double check eligibility (though if no subscription exists, they should be eligible)
        // We can be lenient here: if they have no subscription record in OUR db, give them a trial.

        const now = new Date();
        const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Extract user details
        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Create the TRIAL subscription
        const newSubscription = await Subscription.create({
            userId,
            username,
            planType: 'TRIAL',
            planAmount: 0,
            billingCycle: 'one_time',
            billingPeriod: 0,
            status: 'trial',
            isTrialActive: true,
            isTrialUsed: true, // Mark as used to prevent multiple trials
            trialStartDate: now,
            trialEndDate: trialEndDate,
            startDate: now,
            currentPeriodStart: now,
            currentPeriodEnd: trialEndDate,
            paymentType: 'subscription' // or 'trial' if schema allows, but 'subscription' is safe default
        });

        return NextResponse.json({
            success: true,
            message: '7-Day Free Trial activated successfully',
            subscription: newSubscription
        });

    } catch (error) {
        console.error('Error ensuring trial subscription:', error);
        return NextResponse.json(
            { error: 'Failed to ensure trial subscription' },
            { status: 500 }
        );
    }
}
