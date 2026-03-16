// app/api/referral/purchase/route.js
//
// Handles the full purchase-completion → reward flow using MongoDB transactions.
// This is the core endpoint that processes a qualifying purchase and distributes
// referral rewards according to the admin-configured settings.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import Referral from '@/models/Referral';
import User from '@/models/User';
import Purchase from '@/models/Purchase';
import { getSettings } from '@/models/AdminSettings';

export const runtime = 'nodejs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { clerkUserId, amount, externalPurchaseId } = body;

        // amount should be in paise (integer)
        if (!clerkUserId || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'clerkUserId and amount (paise, positive integer) are required' },
                { status: 400 }
            );
        }

        const amountPaise = Math.floor(amount); // ensure integer

        await connectDB();

        // 1. Fetch admin settings
        const settings = await getSettings();

        // 2. Validate minimum purchase amount
        if (amountPaise < settings.minPurchaseAmount) {
            return NextResponse.json({
                error: `Purchase amount (₹${(amountPaise / 100).toFixed(2)}) is below minimum (₹${(settings.minPurchaseAmount / 100).toFixed(2)})`,
                rewarded: false,
                reason: 'BELOW_THRESHOLD'
            }, { status: 400 });
        }

        // 3. Find PENDING referral for this user
        const pendingReferral = await Referral.findOne({
            referredUserId: clerkUserId,
            status: 'PENDING'
        });

        if (!pendingReferral) {
            // No pending referral — still record the purchase but no reward
            await Purchase.create({
                clerkUserId,
                amount: amountPaise,
                status: 'SUCCESS'
            });

            return NextResponse.json({
                message: 'Purchase recorded but no pending referral found',
                rewarded: false,
                reason: 'NO_PENDING_REFERRAL'
            });
        }

        // 4. Fetch referrer's individual commissionRate (admin-assigned at approval)
        const referrer = await User.findById(pendingReferral.referrerId).lean();
        const referrerCommissionRate = referrer?.commissionRate; // e.g. 10 = 10%

        // 5. Compute reward amount (integer math, paise)
        //    Priority: per-user commissionRate > global settings
        let rewardAmount;
        if (typeof referrerCommissionRate === 'number' && referrerCommissionRate > 0) {
            // Admin assigned a custom commission % to this referrer
            rewardAmount = Math.floor(amountPaise * (referrerCommissionRate / 100));
        } else if (settings.rewardMode === 'percentage') {
            rewardAmount = Math.floor(amountPaise * (settings.percentage / 100));
        } else {
            rewardAmount = settings.fixedAmount;
        }

        // 5. Execute transaction: purchase record + referral update + referrer balance
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // Create purchase record
                const [purchase] = await Purchase.create([{
                    clerkUserId,
                    amount: amountPaise,
                    status: 'SUCCESS'
                }], { session });

                // Transition: PENDING → PURCHASE_COMPLETED → REWARDED
                pendingReferral.status = 'REWARDED';
                pendingReferral.purchaseId = purchase._id;
                pendingReferral.purchaseAmount = amountPaise;
                pendingReferral.purchaseCompletedAt = new Date();
                pendingReferral.rewardAmount = rewardAmount;
                pendingReferral.rewardedAt = new Date();
                await pendingReferral.save({ session });

                // Update referrer stats (atomic increment in paise)
                await User.findByIdAndUpdate(
                    pendingReferral.referrerId,
                    {
                        $inc: {
                            'referralStats.rewardBalance': rewardAmount,
                            'referralStats.completed': 1,
                            'referralStats.pending': -1
                        }
                    },
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        console.log(`🎁 Referral rewarded: referrer=${pendingReferral.referrerId}, amount=${rewardAmount} paise (₹${(rewardAmount / 100).toFixed(2)})`);

        return NextResponse.json({
            success: true,
            rewarded: true,
            message: 'Purchase processed and referral rewarded',
            referralId: pendingReferral._id,
            rewardAmount,
            rewardAmountRupees: (rewardAmount / 100).toFixed(2),
        });

    } catch (error) {
        console.error('POST /api/referral/purchase error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            rewarded: false
        }, { status: 500 });
    }
}
