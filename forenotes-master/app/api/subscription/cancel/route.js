// app/api/subscription/cancel/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { cancelSubscription as cancelRazorpaySubscription } from '@/lib/razorpay';

export async function POST(request) {
    try {
        // Authenticate user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { reason = null, cancelImmediately = false } = await request.json();

        await connectDB();

        // Find active subscription
        const subscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // If Razorpay subscription exists, cancel it
        if (subscription.razorpaySubscriptionId) {
            try {
                await cancelRazorpaySubscription(
                    subscription.razorpaySubscriptionId,
                    !cancelImmediately // Cancel at cycle end if not immediate
                );
            } catch (error) {
                console.error('Error cancelling Razorpay subscription:', error);
                // Continue to update database even if Razorpay call fails
            }
        }

        // Update subscription in database
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancelReason = reason;

        // If cancelling immediately, set current period end to now
        if (cancelImmediately) {
            subscription.currentPeriodEnd = new Date();
        }

        await subscription.save();

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription._id,
                status: subscription.status,
                cancelledAt: subscription.cancelledAt,
                accessUntil: subscription.currentPeriodEnd
            },
            message: cancelImmediately
                ? 'Subscription cancelled immediately'
                : 'Subscription will be cancelled at the end of current period'
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
