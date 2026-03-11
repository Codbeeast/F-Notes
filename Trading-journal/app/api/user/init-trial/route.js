import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isTrialEligible } from '@/lib/subscription';
import { createSubscription } from '@/lib/razorpay';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import { DEFAULT_PLANS } from '@/lib/plans-config';

/**
 * Create Razorpay subscription with trial for new users
 * Returns subscription details for Razorpay modal
 */
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

        // Parse request body to get planId
        const body = await request.json().catch(() => ({}));
        const planId = body.planId || '1_MONTH';

        await connectDB();

        // Check if user already has an active subscription
        const existingActive = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (existingActive) {
            return NextResponse.json({
                success: false,
                message: 'You already have an active subscription'
            });
        }

        // Check if user is eligible for trial (first time user)
        const eligible = await isTrialEligible(userId);

        // Check if user has an expired/cancelled subscription (returning user)
        const hasExpiredSubscription = await Subscription.findOne({
            userId,
            status: { $in: ['expired', 'cancelled'] }
        });

        // If not trial eligible and no expired subscription, something is wrong
        // But we'll allow them to proceed as a returning user (immediate charge)
        if (!eligible && !hasExpiredSubscription) {
            // Check if there's a 'created' subscription that was abandoned
            const abandonedSub = await Subscription.findOne({
                userId,
                status: 'created'
            });

            if (abandonedSub) {
                // Delete the abandoned subscription to allow fresh start
                await Subscription.deleteOne({ _id: abandonedSub._id });
                console.log('Deleted abandoned subscription:', abandonedSub._id);
            }
        }

        // Get plan details from database
        let plan = await Plan.findOne({ planId });

        // Auto-initialize plans if not found (Production fix)
        // If the specific plan requested is not found, we check if ANY plans exist.
        // If no plans exist at all, we initialize the defaults.
        // If some plans exist but not this one, strictly speaking it's an error, but let's just try to sync defaults.
        if (!plan) {
            console.log(`Plan ${planId} not found. Attempting to auto-initialize default plans...`);

            for (const defaultPlan of DEFAULT_PLANS) {
                await Plan.findOneAndUpdate(
                    { planId: defaultPlan.planId },
                    defaultPlan,
                    { upsert: true, new: true }
                );
            }

            // Try fetching again
            plan = await Plan.findOne({ planId });
        }

        if (!plan || !plan.isActive) {
            // Detailed error for debugging
            const errorMsg = !plan
                ? `Plan ${planId} could not be found or created.`
                : `Plan ${planId} is marked as inactive.`;

            return NextResponse.json(
                {
                    error: 'Invalid or inactive plan',
                    message: errorMsg, // Ensure 'message' is present for frontend logging
                    details: { planId }
                },
                { status: 400 }
            );
        }

        // Get Razorpay plan ID from environment or Plan model
        const razorpayPlanId = plan.razorpayPlanId;

        if (!razorpayPlanId) {
            return NextResponse.json(
                {
                    error: 'Razorpay plan not configured',
                    message: `Please add ${planId} plan ID to .env.local`
                },
                { status: 500 }
            );
        }

        // Extract user details
        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Use standard Recurring cycle count (120 = 10 years for monthly, adjusted for others if needed)
        // Monthly (1): 120 counts
        // 6 Months (6): 20 counts
        // Yearly (12): 10 counts
        const totalCount = Math.floor(120 / (plan.billingPeriod || 1));

        // Create Razorpay subscription using helper
        // This handles start_at for trial automatically if startTrial is true
        const razorpaySubscription = await createSubscription({
            planId: razorpayPlanId,
            totalCount: totalCount,
            startTrial: eligible, // Only start trial if eligible
            notes: {
                userId,
                planType: planId,
                userEmail,
                userName,
                username,
                createdAt: new Date().toISOString(),
                isReturningUser: !eligible
            }
        });

        // Calculate period end based on plan (approximate, webhook will confirm)
        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + plan.billingPeriod);

        // Create subscription record in database with 'created' status
        const subscription = await Subscription.create({
            userId,
            username,
            razorpaySubscriptionId: razorpaySubscription.id,
            razorpayPlanId,
            planType: planId,
            planAmount: plan.amount,
            billingCycle: plan.billingCycle,
            billingPeriod: plan.billingPeriod,
            bonusMonths: plan.bonusMonths || 0,
            totalMonths: plan.totalMonths || plan.billingPeriod,
            status: 'created',
            isTrialActive: false,
            isTrialUsed: !eligible, // Mark as used if not eligible (immediate billing)
            autoPayEnabled: true,
            startDate: periodStart,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd
        });

        // Return subscription details for Razorpay modal
        const message = eligible
            ? 'Please complete card authorization to start your 7-day trial'
            : 'Please complete payment to activate your subscription';

        return NextResponse.json({
            success: true,
            isReturningUser: !eligible,
            subscription: {
                id: subscription._id,
                razorpaySubscriptionId: razorpaySubscription.id,
                shortUrl: razorpaySubscription.short_url,
                status: razorpaySubscription.status,
                planType: planId
            },
            message
        });

    } catch (error) {
        console.error('Trial initialization error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to initialize trial',
                message: error.message || 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
