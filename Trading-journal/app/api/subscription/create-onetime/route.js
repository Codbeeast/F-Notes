// app/api/subscription/create-onetime/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import { createOrder } from '@/lib/razorpay';

// Price configuration for one-time orders
const ONE_TIME_PRICES = {
    '1_MONTH': { amount: 599, months: 1, billingCycle: 'monthly' },
    'SPECIAL_OFFER': { amount: 1799, months: 6, billingCycle: 'half_yearly' }
};

export async function POST(request) {
    try {
        const user = await currentUser();
        const { userId } = await auth();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body to get planId
        const body = await request.json().catch(() => ({}));
        const planId = body.planId || 'SPECIAL_OFFER';

        // Validate planId
        const priceConfig = ONE_TIME_PRICES[planId];
        if (!priceConfig) {
            return NextResponse.json(
                { error: 'Invalid plan type for one-time payment' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already has an active PAID subscription (allow upgrades from trial)
        // Must also check currentPeriodEnd to exclude expired subscriptions whose status wasn't updated
        const existingSubscription = await Subscription.findOne({
            userId,
            status: 'active',
            isTrialActive: { $ne: true },
            currentPeriodEnd: { $gt: new Date() }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: 'You already have an active subscription' },
                { status: 400 }
            );
        }

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Create Razorpay order
        const razorpayOrder = await createOrder({
            amount: priceConfig.amount,
            currency: 'INR',
            receipt: `rcpt_${userId.slice(-10)}_${Date.now()}`.slice(0, 40),
            notes: {
                userId,
                planType: planId,
                userEmail,
                userName: userName,
                username: username
            }
        });

        // Calculate validity
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setMonth(validUntil.getMonth() + priceConfig.months);

        // Check for existing trial subscription to upgrade
        const existingTrial = await Subscription.findOne({
            userId,
            status: 'trial',
            isTrialActive: true
        });

        let subscription;

        if (existingTrial) {
            // UPDATE existing trial record instead of creating new one
            existingTrial.planType = planId === 'SPECIAL_OFFER' ? '6_MONTHS' : planId;
            existingTrial.razorpayOrderId = razorpayOrder.id;
            existingTrial.planAmount = priceConfig.amount;
            existingTrial.billingCycle = priceConfig.billingCycle;
            existingTrial.billingPeriod = priceConfig.months;
            existingTrial.bonusMonths = 0;
            existingTrial.totalMonths = priceConfig.months;
            existingTrial.isRecurring = false;
            existingTrial.paymentType = 'onetime';
            existingTrial.status = 'created';
            existingTrial.isTrialActive = false;
            existingTrial.currentPeriodStart = now;
            existingTrial.currentPeriodEnd = now; // Will be set after payment

            await existingTrial.save();
            subscription = existingTrial;
        } else {
            // No existing trial, create new subscription record
            subscription = await Subscription.create({
                userId,
                username,
                userEmail: userEmail.toLowerCase(),
                planType: planId === 'SPECIAL_OFFER' ? '6_MONTHS' : planId,
                razorpayOrderId: razorpayOrder.id,
                planAmount: priceConfig.amount,
                billingCycle: priceConfig.billingCycle,
                billingPeriod: priceConfig.months,
                bonusMonths: 0,
                totalMonths: priceConfig.months,
                isRecurring: false,
                paymentType: 'onetime',
                status: 'created',
                currentPeriodStart: now,
                currentPeriodEnd: now // Placeholder, will be set after payment
            });
        }

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: priceConfig.amount,
            planId: planId,
            subscription: {
                id: subscription._id,
                planType: subscription.planType,
                months: priceConfig.months
            }
        });

    } catch (error) {
        console.error('Error creating one-time payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
