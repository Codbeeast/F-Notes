import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';

/**
 * Activate trial after Razorpay card authorization
 * Called from frontend after successful card authorization
 */
export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { razorpaySubscriptionId } = body;

        if (!razorpaySubscriptionId) {
            return NextResponse.json(
                { error: 'Razorpay subscription ID required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find subscription by Razorpay ID and user
        const subscription = await Subscription.findOne({
            userId,
            razorpaySubscriptionId
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        // If already activated (by webhook or previous call), return success
        if (subscription.status === 'active' || subscription.status === 'trial') {
            return NextResponse.json({
                success: true,
                message: 'Trial already activated',
                subscription: {
                    status: subscription.status,
                    trialEndDate: subscription.trialEndDate || subscription.currentPeriodEnd,
                    daysRemaining: subscription.daysRemaining()
                }
            });
        }

        // Activate trial
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

        subscription.status = 'trial';
        subscription.isTrialActive = true;
        subscription.trialStartDate = trialStartDate;
        subscription.trialEndDate = trialEndDate;
        subscription.startDate = trialStartDate;
        subscription.currentPeriodStart = trialStartDate;
        subscription.currentPeriodEnd = trialEndDate;

        const savedSubscription = await subscription.save();

        return NextResponse.json({
            success: true,
            message: 'Trial activated successfully',
            subscription: {
                status: savedSubscription.status,
                trialEndDate: savedSubscription.trialEndDate,
                currentPeriodEnd: savedSubscription.currentPeriodEnd,
                daysRemaining: savedSubscription.daysRemaining()
            }
        });

    } catch (error) {
        console.error('Trial activation error:', error);
        return NextResponse.json(
            { error: 'Failed to activate trial', details: error.message },
            { status: 500 }
        );
    }
}
