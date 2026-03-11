// app/api/subscription/verify-onetime/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Referral from '@/models/Referral';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json(
                { error: 'Invalid payment signature', verified: false },
                { status: 400 }
            );
        }

        await connectDB();

        // Find and update subscription
        const subscription = await Subscription.findOne({
            userId,
            razorpayOrderId: razorpay_order_id
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found', verified: false },
                { status: 404 }
            );
        }

        // IMPORTANT: Expire any existing trial subscriptions for this user
        // This prevents duplicate active subscriptions
        await Subscription.updateMany(
            {
                userId,
                _id: { $ne: subscription._id }, // Exclude current subscription
                status: 'trial',
                isTrialActive: true
            },
            {
                $set: {
                    status: 'expired',
                    isTrialActive: false,
                    cancelledAt: new Date(),
                    cancelReason: 'Upgraded to paid subscription'
                }
            }
        );

        // Update subscription with payment details
        const startDate = new Date();
        const endDate = new Date();
        // Use the subscription's saved totalMonths instead of hardcoded value
        const monthsToAdd = subscription.totalMonths || subscription.billingPeriod || 6;
        endDate.setMonth(endDate.getMonth() + monthsToAdd);

        subscription.razorpayPaymentId = razorpay_payment_id;
        subscription.status = 'active';
        subscription.isTrialActive = false; // Ensure trial flag is off
        subscription.currentPeriodStart = startDate;
        subscription.currentPeriodEnd = endDate;
        subscription.isTrialUsed = true; // Mark trial as used since they paid

        await subscription.save();

        // Process referral reward
        try {
            const pendingReferral = await Referral.findOne({
                referredUserId: userId,
                status: 'PENDING'
            });

            if (pendingReferral) {
                pendingReferral.status = 'REWARDED';
                pendingReferral.purchaseId = subscription._id;
                pendingReferral.rewardedAt = new Date();
                await pendingReferral.save();

                // Increment referrer's reward balance
                await User.findByIdAndUpdate(
                    pendingReferral.referrerId,
                    { $inc: { rewardBalance: pendingReferral.rewardAmount } }
                );

                console.log(`🎁 Referral rewarded: referrer=${pendingReferral.referrerId}, amount=${pendingReferral.rewardAmount}`);
            }
        } catch (refErr) {
            console.error('⚠️ Referral reward error (non-blocking):', refErr.message);
        }

        return NextResponse.json({
            success: true,
            verified: true,
            subscription: {
                id: subscription._id,
                status: subscription.status,
                validUntil: endDate
            }
        });

    } catch (error) {
        console.error('Error verifying one-time payment:', error);
        return NextResponse.json(
            { error: error.message || 'Payment verification failed', verified: false },
            { status: 500 }
        );
    }
}
