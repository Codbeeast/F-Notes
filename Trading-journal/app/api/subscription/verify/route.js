// app/api/subscription/verify/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Payment from '@/models/Payment';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { verifyPaymentSignature, fetchPayment, fetchSubscription } from '@/lib/razorpay';

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
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        } = await request.json();

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification parameters' },
                { status: 400 }
            );
        }

        // Verify payment signature
        const isValid = verifyPaymentSignature({
            razorpayPaymentId: razorpay_payment_id,
            razorpaySubscriptionId: razorpay_subscription_id,
            razorpaySignature: razorpay_signature
        });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find subscription
        const subscription = await Subscription.findOne({
            razorpaySubscriptionId: razorpay_subscription_id,
            userId
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await fetchPayment(razorpay_payment_id);

        // Check if payment already exists (Idempotency check)
        const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
        let payment;

        if (existingPayment) {
            // Payment already processed, use existing record
            console.log('Payment already processed:', razorpay_payment_id);
            payment = existingPayment;
        } else {
            // Create payment record
            payment = await Payment.create({
                userId,
                subscriptionId: subscription._id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySubscriptionId: razorpay_subscription_id,
                razorpaySignature: razorpay_signature,
                amount: paymentDetails.amount / 100, // Convert from paise to rupees
                currency: paymentDetails.currency,
                status: paymentDetails.status === 'captured' ? 'captured' : 'authorized',
                method: paymentDetails.method,
                methodDetails: {
                    cardType: paymentDetails.card?.type,
                    cardNetwork: paymentDetails.card?.network,
                    cardLast4: paymentDetails.card?.last4,
                    upiId: paymentDetails.vpa,
                    bank: paymentDetails.bank,
                    wallet: paymentDetails.wallet
                },
                capturedAt: paymentDetails.status === 'captured' ? new Date() : null
            });
        }

        // Update subscription with payment (avoid duplicate IDs)
        if (!existingPayment && !subscription.paymentIds.includes(payment._id)) {
            subscription.paymentIds.push(payment._id);
        }

        // Cancel ANY other active/trial subscriptions for this user to avoid double billing/status conflict
        // This handles upgrades/downgrades effectively
        await Subscription.updateMany(
            {
                userId,
                _id: { $ne: subscription._id },
                status: { $in: ['active', 'trial'] }
            },
            {
                $set: {
                    status: 'cancelled',
                    cancelledAt: new Date(),
                    cancelReason: 'Plan upgrade/change'
                }
            }
        );

        // Fetch latest subscription details from Razorpay to get accurate dates
        // This ensures meaningful dates are set even if webhook is delayed
        try {
            const razorpaySubscription = await fetchSubscription(razorpay_subscription_id);

            if (razorpaySubscription) {
                // Check if this is a trial authorization (status 'authenticated' means card saved but not charged)
                const isTrialAuth = razorpaySubscription.status === 'authenticated' ||
                    (razorpaySubscription.status === 'active' && !razorpaySubscription.paid_count);

                if (isTrialAuth) {
                    // This is a trial activation - set trial dates
                    const trialStartDate = new Date();
                    const trialEndDate = new Date();
                    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

                    subscription.status = 'trial';
                    subscription.isTrialActive = true;
                    subscription.trialStartDate = trialStartDate;
                    subscription.trialEndDate = trialEndDate;
                    subscription.currentPeriodStart = trialStartDate;
                    subscription.currentPeriodEnd = trialEndDate;
                    subscription.autoPayEnabled = true;
                    subscription.paymentMethod = paymentDetails.method;
                } else {
                    // This is a paid subscription - use Razorpay dates
                    const statusMapping = {
                        'authenticated': 'active',
                        'active': 'active',
                        'pending': 'active',
                        'halted': 'past_due',
                        'cancelled': 'cancelled',
                        'completed': 'active', // Don't set to expired if still within period
                        'expired': 'expired'
                    };

                    subscription.status = statusMapping[razorpaySubscription.status] || razorpaySubscription.status;
                    subscription.isTrialActive = false;

                    // Update period dates if available
                    if (razorpaySubscription.current_start) {
                        subscription.currentPeriodStart = new Date(razorpaySubscription.current_start * 1000);
                    }
                    if (razorpaySubscription.current_end) {
                        subscription.currentPeriodEnd = new Date(razorpaySubscription.current_end * 1000);
                    }
                    if (razorpaySubscription.charge_at) {
                        subscription.nextBillingDate = new Date(razorpaySubscription.charge_at * 1000);
                    }

                    subscription.autoPayEnabled = true;
                    subscription.paymentMethod = paymentDetails.method;
                }
            }
        } catch (fetchError) {
            console.error('Error fetching subscription details during verify:', fetchError);
            // Fallback: manually activate as trial if fetch fails
            const trialStartDate = new Date();
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);

            subscription.status = 'trial';
            subscription.isTrialActive = true;
            subscription.trialStartDate = trialStartDate;
            subscription.trialEndDate = trialEndDate;
            subscription.currentPeriodStart = trialStartDate;
            subscription.currentPeriodEnd = trialEndDate;
            subscription.autoPayEnabled = true;
            subscription.paymentMethod = paymentDetails.method;
        }

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
            payment: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                method: payment.method
            },
            subscription: {
                id: subscription._id,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd
            },
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
