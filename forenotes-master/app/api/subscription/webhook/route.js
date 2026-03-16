// app/api/subscription/webhook/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(request) {
    try {
        // Get raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            console.error('Missing webhook signature');
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature);
        if (!isValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Parse webhook payload
        const payload = JSON.parse(body);
        const { event, payload: eventPayload } = payload;

        console.log('Received Razorpay webhook:', event);

        await connectDB();

        // Handle different webhook events
        switch (event) {
            case 'subscription.activated':
                await handleSubscriptionActivated(eventPayload);
                break;

            case 'subscription.charged':
                await handleSubscriptionCharged(eventPayload);
                break;

            case 'subscription.completed':
                await handleSubscriptionCompleted(eventPayload);
                break;

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(eventPayload);
                break;

            case 'subscription.paused':
                await handleSubscriptionPaused(eventPayload);
                break;

            case 'subscription.resumed':
                await handleSubscriptionResumed(eventPayload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(eventPayload);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        return NextResponse.json({ success: true, received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle subscription activated
async function handleSubscriptionActivated(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        const now = new Date();

        // Check if this is a trial subscription that's still within trial period
        const isTrialActive = dbSubscription.isTrialActive &&
            dbSubscription.trialEndDate &&
            dbSubscription.trialEndDate > now;

        if (isTrialActive) {
            // Preserve trial status - don't override with 'active'
            console.log('Subscription activated but trial still active, preserving trial status:', subscription.id);
            // Only update billing date if provided
            if (subscription.charge_at) {
                dbSubscription.nextBillingDate = new Date(subscription.charge_at * 1000);
                await dbSubscription.save();
            }
            return;
        }

        // IMPORTANT: Expire any other trial subscriptions for this user
        // This prevents duplicate active subscriptions
        await Subscription.updateMany(
            {
                userId: dbSubscription.userId,
                _id: { $ne: dbSubscription._id }, // Exclude current subscription
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

        // Not on trial, set to active with Razorpay dates
        dbSubscription.status = 'active';
        dbSubscription.isTrialActive = false;

        if (subscription.current_start) {
            dbSubscription.currentPeriodStart = new Date(subscription.current_start * 1000);
        }
        if (subscription.current_end) {
            dbSubscription.currentPeriodEnd = new Date(subscription.current_end * 1000);
        }
        if (subscription.charge_at) {
            dbSubscription.nextBillingDate = new Date(subscription.charge_at * 1000);
        }

        await dbSubscription.save();
        console.log('Subscription activated:', subscription.id);
    }
}

// Handle subscription charged
async function handleSubscriptionCharged(data) {
    const { payment, subscription } = data;

    // Find subscription
    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.entity.id
    });

    if (!dbSubscription) {
        console.error('Subscription not found:', subscription.entity.id);
        return;
    }

    // Check if payment already exists (Idempotency)
    const existingPayment = await Payment.findOne({ razorpayPaymentId: payment.entity.id });
    if (existingPayment) {
        console.log('Payment already processed:', payment.entity.id);
        return;
    }

    // Create payment record
    const paymentRecord = await Payment.create({
        userId: dbSubscription.userId,
        subscriptionId: dbSubscription._id,
        razorpayPaymentId: payment.entity.id,
        razorpaySubscriptionId: subscription.entity.id,
        amount: payment.entity.amount / 100,
        currency: payment.entity.currency,
        status: payment.entity.status === 'captured' ? 'captured' : 'authorized',
        method: payment.entity.method,
        methodDetails: {
            cardType: payment.entity.card?.type,
            cardNetwork: payment.entity.card?.network,
            cardLast4: payment.entity.card?.last4,
            upiId: payment.entity.vpa,
            bank: payment.entity.bank,
            wallet: payment.entity.wallet
        },
        webhookEvent: 'subscription.charged',
        webhookData: data,
        capturedAt: payment.entity.status === 'captured' ? new Date() : null,
        firstName: subscription.entity.notes?.userName?.split(' ')[0] || (await User.findById(dbSubscription.userId))?.firstName,
        lastName: subscription.entity.notes?.userName?.split(' ').slice(1).join(' ') || (await User.findById(dbSubscription.userId))?.lastName,
        email: subscription.entity.notes?.userEmail || (await User.findById(dbSubscription.userId))?.email
    });

    // Update subscription
    dbSubscription.paymentIds.push(paymentRecord._id);
    dbSubscription.status = 'active';
    dbSubscription.currentPeriodStart = new Date(subscription.entity.current_start * 1000);
    dbSubscription.currentPeriodEnd = new Date(subscription.entity.current_end * 1000);
    if (subscription.entity.charge_at) {
        dbSubscription.nextBillingDate = new Date(subscription.entity.charge_at * 1000);
    }

    await dbSubscription.save();
    console.log('Subscription charged successfully:', payment.entity.id);
}

// Handle subscription completed
async function handleSubscriptionCompleted(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        const now = new Date();

        // Check if trial is still active
        const isTrialActive = dbSubscription.isTrialActive &&
            dbSubscription.trialEndDate &&
            dbSubscription.trialEndDate > now;

        // Check if subscription period is still valid
        const isPeriodActive = dbSubscription.currentPeriodEnd &&
            dbSubscription.currentPeriodEnd > now;

        if (isTrialActive || isPeriodActive) {
            // Don't mark as expired if still within valid period
            console.log('Subscription completed but still within valid period:', {
                subscriptionId: subscription.id,
                isTrialActive,
                isPeriodActive,
                trialEndDate: dbSubscription.trialEndDate,
                currentPeriodEnd: dbSubscription.currentPeriodEnd
            });
            return;
        }

        // Only mark as expired if truly expired
        dbSubscription.status = 'expired';
        await dbSubscription.save();
        console.log('Subscription completed and marked expired:', subscription.id);
    }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        // Update subscription status
        dbSubscription.status = 'cancelled';
        dbSubscription.cancelledAt = new Date();

        // Add cancellation reason from webhook if available
        if (subscription.notes?.cancellation_reason) {
            dbSubscription.cancelReason = subscription.notes.cancellation_reason;
        } else {
            dbSubscription.cancelReason = 'Cancelled from Razorpay Dashboard';
        }

        await dbSubscription.save();

        console.log('Subscription cancelled:', {
            subscriptionId: subscription.id,
            userId: dbSubscription.userId,
            cancelledAt: dbSubscription.cancelledAt,
            reason: dbSubscription.cancelReason
        });
    } else {
        console.error('Subscription not found for cancellation:', subscription.id);
    }
}

// Handle subscription paused
async function handleSubscriptionPaused(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'past_due';
        await dbSubscription.save();
        console.log('Subscription paused:', subscription.id);
    }
}

// Handle subscription resumed
async function handleSubscriptionResumed(data) {
    const { subscription } = data;

    const dbSubscription = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (dbSubscription) {
        dbSubscription.status = 'active';
        await dbSubscription.save();
        console.log('Subscription resumed:', subscription.id);
    }
}

// Handle payment failed
async function handlePaymentFailed(data) {
    const { payment } = data;

    // Extract subscription ID from payment notes if available
    const subscriptionId = payment.entity.notes?.razorpay_subscription_id;

    if (subscriptionId) {
        const dbSubscription = await Subscription.findOne({
            razorpaySubscriptionId: subscriptionId
        });

        if (dbSubscription) {
            // Check if payment already exists (Idempotency)
            const existingPayment = await Payment.findOne({ razorpayPaymentId: payment.entity.id });
            if (existingPayment) {
                console.log('Payment failure already processed:', payment.entity.id);
                return;
            }

            // Create failed payment record
            await Payment.create({
                userId: dbSubscription.userId,
                subscriptionId: dbSubscription._id,
                razorpayPaymentId: payment.entity.id,
                razorpaySubscriptionId: subscriptionId,
                amount: payment.entity.amount / 100,
                currency: payment.entity.currency,
                status: 'failed',
                method: payment.entity.method,
                webhookEvent: 'payment.failed',
                webhookData: data,
                errorCode: payment.entity.error_code,
                errorDescription: payment.entity.error_description,
                errorReason: payment.entity.error_reason,
                failedAt: new Date(),
                firstName: (await User.findById(dbSubscription.userId))?.firstName,
                lastName: (await User.findById(dbSubscription.userId))?.lastName,
                email: (await User.findById(dbSubscription.userId))?.email
            });

            // Update subscription status to past_due
            dbSubscription.status = 'past_due';
            await dbSubscription.save();

            console.log('Payment failed, subscription marked as past_due:', payment.entity.id);
        }
    }
}
