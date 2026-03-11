// app/api/subscription/cancel-pending/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { cancelSubscription } from '@/lib/razorpay';

export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { subscriptionId, razorpaySubscriptionId } = await request.json();

        await connectDB();

        // Find and delete the pending subscription
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            userId,
            status: 'created' // Only delete if still in 'created' status
        });

        if (subscription) {
            // Cancel on Razorpay's end
            try {
                await cancelSubscription(razorpaySubscriptionId, false);
            } catch (razorpayError) {
                console.error('Error cancelling Razorpay subscription:', razorpayError);
                // Continue with local deletion even if Razorpay fails
            }

            // Delete from our database
            await Subscription.deleteOne({ _id: subscriptionId });
            console.log('Pending subscription cleaned up:', subscriptionId);
        }

        return NextResponse.json({
            success: true,
            message: 'Pending subscription cleaned up'
        });

    } catch (error) {
        console.error('Error cancelling pending subscription:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
