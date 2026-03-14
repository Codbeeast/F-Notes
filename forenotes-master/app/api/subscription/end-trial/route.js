// app/api/subscription/end-trial/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import { cancelSubscription as cancelRazorpaySubscription, createSubscription } from '@/lib/razorpay';

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find active trial subscription - check multiple conditions
        let subscription = await Subscription.findOne({
            userId,
            status: 'trial',
            isTrialActive: true
        });

        // Also check for subscriptions with valid trial dates even if status is corrupted
        if (!subscription) {
            subscription = await Subscription.findOne({
                userId,
                isTrialActive: true,
                trialEndDate: { $gt: new Date() }
            });
        }

        // Fallback: find any recent subscription that could be a trial
        if (!subscription) {
            subscription = await Subscription.findOne({
                userId,
                trialEndDate: { $gt: new Date() },
                status: { $in: ['trial', 'active', 'created'] }
            });
        }

        if (!subscription) {
            return NextResponse.json(
                { error: 'No active trial found' },
                { status: 404 }
            );
        }

        // Get plan details for billing period calculation
        const plan = await Plan.findOne({ planId: subscription.planType });

        // Calculate billing period based on planType if plan not found
        let monthsToAdd = subscription.totalMonths || subscription.billingPeriod;

        if (plan) {
            monthsToAdd = plan.totalMonths || plan.billingPeriod;
        } else {
            // Fallback: Extract months from planType
            const planTypeMapping = {
                '1_MONTH': 1,
                '6_MONTHS': 6,
                '12_MONTHS': 12
            };
            monthsToAdd = planTypeMapping[subscription.planType] || monthsToAdd;
        }

        // Trigger immediate charge via Razorpay by canceling old and creating new subscription
        let newRazorpaySubscriptionId = subscription.razorpaySubscriptionId;

        if (subscription.razorpaySubscriptionId) {
            try {
                // Step 1: Cancel the existing trial subscription
                await cancelRazorpaySubscription(subscription.razorpaySubscriptionId, false);
                console.log(`Cancelled trial subscription ${subscription.razorpaySubscriptionId}`);

                // Step 2: Create a new subscription WITHOUT trial (immediate start = immediate charge)
                const razorpayPlanId = plan?.razorpayPlanId || subscription.razorpayPlanId;

                if (!razorpayPlanId) {
                    throw new Error('Razorpay plan ID not found');
                }

                const totalCount = Math.floor(120 / (plan?.billingPeriod || subscription.billingPeriod || 1));

                // Create subscription with startTrial=false to trigger immediate charge
                const newRazorpaySub = await createSubscription({
                    planId: razorpayPlanId,
                    totalCount: totalCount,
                    startTrial: false, // This is the key - no trial = immediate charge
                    notes: {
                        userId,
                        planType: subscription.planType,
                        upgradedFromTrial: true,
                        originalSubscriptionId: subscription.razorpaySubscriptionId,
                        createdAt: new Date().toISOString()
                    }
                });

                newRazorpaySubscriptionId = newRazorpaySub.id;
                console.log(`Created new immediate subscription ${newRazorpaySubscriptionId}`);

            } catch (razorpayError) {
                console.error('Failed to cancel/recreate subscription:', razorpayError);
                return NextResponse.json(
                    {
                        error: 'Failed to process payment',
                        message: razorpayError.message
                    },
                    { status: 500 }
                );
            }
        }

        // Calculate new subscription period (starting now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + monthsToAdd);

        // Update subscription to active with new Razorpay ID
        // Preserve billing period data for accurate subscription tracking
        subscription.razorpaySubscriptionId = newRazorpaySubscriptionId;
        subscription.isTrialActive = false;
        subscription.status = 'active';
        subscription.currentPeriodStart = startDate;
        subscription.currentPeriodEnd = endDate;
        subscription.startDate = startDate;
        subscription.trialEndedEarly = true;
        subscription.trialEndedAt = startDate;

        // Ensure billing period data is preserved/set correctly
        if (plan) {
            subscription.billingPeriod = plan.billingPeriod;
            subscription.bonusMonths = plan.bonusMonths || 0;
            subscription.totalMonths = plan.totalMonths || plan.billingPeriod;
        }

        await subscription.save();

        return NextResponse.json({
            success: true,
            message: 'Trial ended successfully. Payment initiated.',
            subscription: {
                id: subscription._id,
                status: subscription.status,
                razorpaySubscriptionId: newRazorpaySubscriptionId,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd
            }
        });

    } catch (error) {
        console.error('Error ending trial:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to end trial' },
            { status: 500 }
        );
    }
}
