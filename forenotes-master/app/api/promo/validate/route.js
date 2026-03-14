// app/api/promo/validate/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PromoRedemption from '@/models/PromoRedemption';
import Subscription from '@/models/Subscription';

export async function POST(request) {
    try {
        // Check if promo is enabled
        if (process.env.PROMO_ENABLED !== 'true') {
            return NextResponse.json(
                { error: 'Promotional offer is not available', valid: false },
                { status: 404 }
            );
        }

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', valid: false },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { promoCode } = body;

        if (!promoCode) {
            return NextResponse.json(
                { error: 'Promo code is required', valid: false },
                { status: 400 }
            );
        }

        // Validate promo code against environment variable
        const validPromoCode = process.env.PROMO_CODE;
        if (!validPromoCode || promoCode.toUpperCase() !== validPromoCode.toUpperCase()) {
            return NextResponse.json(
                { error: 'Invalid promo code', valid: false },
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
                { error: 'You already have an active subscription', valid: false },
                { status: 400 }
            );
        }

        // Check if user has already used this promo
        const promo = await PromoRedemption.findOne({
            promoCode: validPromoCode,
            'redemptions.userId': userId,
            'redemptions.status': { $in: ['pending', 'completed'] }
        });

        if (promo) {
            return NextResponse.json(
                { error: 'You have already used this promo code', valid: false },
                { status: 400 }
            );
        }

        // Get or create promo record
        let promoRecord = await PromoRedemption.findOne({ promoCode: validPromoCode });

        if (!promoRecord) {
            // Create promo record if it doesn't exist (first validation)
            promoRecord = await PromoRedemption.create({
                promoCode: validPromoCode,
                description: 'Special 6-Month Offer @ ₹1',
                maxRedemptions: 10,
                currentRedemptions: 0,
                isActive: true,
                offerDetails: {
                    planType: '6_MONTHS',
                    amount: 1,
                    durationMonths: 6
                }
            });
        }

        // Check availability
        if (!promoRecord.isAvailable()) {
            const message = promoRecord.currentRedemptions >= promoRecord.maxRedemptions
                ? 'All promotional slots have been redeemed'
                : 'This promotional offer has expired';

            return NextResponse.json(
                { error: message, valid: false, slotsRemaining: 0 },
                { status: 400 }
            );
        }

        return NextResponse.json({
            valid: true,
            message: 'Promo code is valid!',
            slotsRemaining: promoRecord.remainingSlots(),
            offer: {
                description: promoRecord.description,
                amount: promoRecord.offerDetails.amount,
                durationMonths: promoRecord.offerDetails.durationMonths,
                planType: promoRecord.offerDetails.planType
            }
        });

    } catch (error) {
        console.error('Error validating promo code:', error);
        return NextResponse.json(
            { error: 'Failed to validate promo code', valid: false },
            { status: 500 }
        );
    }
}
