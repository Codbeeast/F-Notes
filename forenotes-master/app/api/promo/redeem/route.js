// app/api/promo/redeem/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PromoRedemption from '@/models/PromoRedemption';
import Subscription from '@/models/Subscription';
import { createOrder } from '@/lib/razorpay';

export async function POST(request) {
    try {
        // Check if promo is enabled
        if (process.env.PROMO_ENABLED !== 'true') {
            return NextResponse.json(
                { error: 'Promotional offer is not available' },
                { status: 404 }
            );
        }

        const user = await currentUser();
        const { userId } = await auth();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { promoCode } = body;

        if (!promoCode) {
            return NextResponse.json(
                { error: 'Promo code is required' },
                { status: 400 }
            );
        }

        // Validate promo code against environment variable
        const validPromoCode = process.env.PROMO_CODE;
        if (!validPromoCode || promoCode.toUpperCase() !== validPromoCode.toUpperCase()) {
            return NextResponse.json(
                { error: 'Invalid promo code' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already has an active subscription
        const existingSubscription = await Subscription.findOne({
            userId,
            status: 'active',
            currentPeriodEnd: { $gt: new Date() }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: 'You already have an active subscription' },
                { status: 400 }
            );
        }

        // Check if user has already used this promo
        const existingRedemption = await PromoRedemption.findOne({
            promoCode: validPromoCode,
            'redemptions.userId': userId,
            'redemptions.status': { $in: ['pending', 'completed'] }
        });

        if (existingRedemption) {
            return NextResponse.json(
                { error: 'You have already used this promo code' },
                { status: 400 }
            );
        }

        // Get user details
        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // Create Razorpay order for ₹1
        const razorpayOrder = await createOrder({
            amount: 1, // ₹1 (will be converted to 100 paise by createOrder)
            currency: 'INR',
            receipt: `promo_${userId.slice(-10)}_${Date.now()}`.slice(0, 40),
            notes: {
                userId,
                planType: 'PROMO_6_MONTHS',
                promoCode: validPromoCode,
                userEmail,
                userName,
                username,
                isPromoOffer: 'true'
            }
        });

        // Atomically reserve a slot
        const reservedPromo = await PromoRedemption.reserveSlot(
            validPromoCode,
            userId,
            razorpayOrder.id
        );

        if (!reservedPromo) {
            return NextResponse.json(
                { error: 'No promotional slots available. All slots have been redeemed.' },
                { status: 400 }
            );
        }

        // Calculate validity (6 months)
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setMonth(validUntil.getMonth() + 6);

        // Create subscription in "created" status (pending payment)
        const subscription = await Subscription.create({
            userId,
            username,
            planType: '6_MONTHS',
            razorpayOrderId: razorpayOrder.id,
            planAmount: 1, // ₹1
            billingCycle: 'one_time',
            billingPeriod: 6,
            bonusMonths: 0,
            totalMonths: 6,
            isRecurring: false,
            paymentType: 'onetime',
            status: 'created',
            currentPeriodStart: now,
            currentPeriodEnd: now, // Will be updated on payment verification
            isPromoOffer: true,
            promoCode: validPromoCode
        });

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: 1,
            currency: 'INR',
            slotsRemaining: reservedPromo.remainingSlots(),
            subscription: {
                id: subscription._id,
                planType: subscription.planType,
                isPromoOffer: true
            },
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            prefill: {
                name: userName,
                email: userEmail
            }
        });

    } catch (error) {
        console.error('Error redeeming promo:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to redeem promo' },
            { status: 500 }
        );
    }
}
