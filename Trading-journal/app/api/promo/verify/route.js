// app/api/promo/verify/route.js
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';
import PromoRedemption from '@/models/PromoRedemption';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized', verified: false },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment details', verified: false },
                { status: 400 }
            );
        }

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

        // Find the subscription
        const subscription = await Subscription.findOne({
            userId,
            razorpayOrderId: razorpay_order_id,
            isPromoOffer: true
        });

        if (!subscription) {
            return NextResponse.json(
                { error: 'Promo subscription not found', verified: false },
                { status: 404 }
            );
        }

        // Check if already verified
        if (subscription.status === 'active') {
            return NextResponse.json({
                success: true,
                verified: true,
                message: 'Payment already verified',
                subscription: {
                    id: subscription._id,
                    status: subscription.status,
                    validUntil: subscription.currentPeriodEnd
                }
            });
        }

        // Update subscription with payment details
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);

        subscription.razorpayPaymentId = razorpay_payment_id;
        subscription.status = 'active';
        subscription.currentPeriodStart = startDate;
        subscription.currentPeriodEnd = endDate;
        subscription.isTrialUsed = true;

        await subscription.save();

        // Complete the promo redemption record
        await PromoRedemption.completeRedemption(
            subscription.promoCode,
            razorpay_order_id,
            razorpay_payment_id,
            subscription._id
        );

        return NextResponse.json({
            success: true,
            verified: true,
            message: 'Payment verified! Your 6-month subscription is now active.',
            subscription: {
                id: subscription._id,
                status: subscription.status,
                validUntil: endDate,
                planType: subscription.planType,
                isPromoOffer: true
            }
        });

    } catch (error) {
        console.error('Error verifying promo payment:', error);
        return NextResponse.json(
            { error: error.message || 'Payment verification failed', verified: false },
            { status: 500 }
        );
    }
}
