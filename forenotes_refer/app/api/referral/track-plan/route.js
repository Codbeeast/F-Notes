// app/api/referral/track-plan/route.js
//
// Server-to-server endpoint called by forenotes-master's subscription webhook
// when a referred user purchases a plan. Updates the referral record with plan
// details and distributes rewards to the referrer.
//
// Auth: validated via x-referral-secret header.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import Referral from '@/models/Referral';
import User from '@/models/User';
import Purchase from '@/models/Purchase';
import { getSettings } from '@/models/AdminSettings';

export const runtime = 'nodejs';

function validateSecret(req) {
    const secret = req.headers.get('x-referral-secret');
    const expected = process.env.REFERRAL_API_SECRET;
    if (!expected) {
        console.error('❌ REFERRAL_API_SECRET not configured');
        return false;
    }
    return secret === expected;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-referral-secret',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
    try {
        console.log('➡️ Received POST to /api/referral/track-plan');

        // 1. Authenticate
        if (!validateSecret(req)) {
            console.error('❌ validateSecret failed in track-plan');
            return NextResponse.json(
                { error: 'Unauthorized — invalid or missing API secret' },
                { status: 401, headers: corsHeaders }
            );
        }

        // 2. Parse body
        const body = await req.json();
        console.log('📦 track-plan body:', JSON.stringify(body));
        const { referredUserId, planType, planAmount, subscriptionId } = body;

        if (!referredUserId || !planType) {
            return NextResponse.json(
                { error: 'referredUserId and planType are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const amountPaise = Math.floor(planAmount || 0);

        await connectDB();

        // 3. Find PENDING referral for this user
        const pendingReferral = await Referral.findOne({
            referredUserId,
            status: 'PENDING',
        });

        if (!pendingReferral) {
            console.log(`⚠️ No PENDING referral found for ${referredUserId}, checking if already rewarded...`);
            // Check if already rewarded (idempotency)
            const existingRewarded = await Referral.findOne({
                referredUserId,
                status: { $in: ['PURCHASE_COMPLETED', 'REWARDED'] },
            }).lean();

            if (existingRewarded) {
                // If it was previously rewarded with 0 (due to test webhooks firing empty),
                // but now we have a real amount, we must retroactively calculate and fund the referrer!
                if (existingRewarded.rewardAmount === 0 && amountPaise > 0) {
                    const settings = await getSettings();
                    const referrer = await User.findById(existingRewarded.referrerId).lean();
                    const referrerCommissionRate = referrer?.commissionRate; 
                    
                    let rewardAmount = settings.fixedAmount;
                    if (typeof referrerCommissionRate === 'number' && referrerCommissionRate > 0) {
                        rewardAmount = Math.floor(amountPaise * (referrerCommissionRate / 100));
                    } else if (settings.rewardMode === 'percentage') {
                        rewardAmount = Math.floor(amountPaise * (settings.percentage / 100));
                    }

                    if (rewardAmount > 0) {
                        const session = await mongoose.startSession();
                        try {
                            await session.withTransaction(async () => {
                                await Referral.findByIdAndUpdate(existingRewarded._id, {
                                    $set: {
                                        rewardAmount,
                                        purchaseAmount: amountPaise,
                                        'referredUserPlan.planType': planType,
                                        'referredUserPlan.planAmount': amountPaise,
                                        'referredUserPlan.subscribedAt': new Date(),
                                        'referredUserPlan.subscriptionId': subscriptionId || null,
                                    }
                                }, { session });

                                await User.findByIdAndUpdate(existingRewarded.referrerId, {
                                    $inc: { 'referralStats.rewardBalance': rewardAmount }
                                }, { session });
                            });
                        } finally {
                            await session.endSession();
                        }
                        console.log(`🎁 Retroactively rewarded ${existingRewarded.referrerId} with ${rewardAmount} paise (previous attempt was 0)`);
                        
                        return NextResponse.json({
                            success: true,
                            message: 'Plan tracking updated and retroactively rewarded',
                            alreadyRewarded: true,
                            retroactiveReward: true,
                        }, { headers: corsHeaders });
                    }
                }

                // Normal already rewarded fallback (just update tracking details)
                await Referral.findByIdAndUpdate(existingRewarded._id, {
                    $set: {
                        'referredUserPlan.planType': planType,
                        'referredUserPlan.planAmount': amountPaise,
                        'referredUserPlan.subscribedAt': new Date(),
                        'referredUserPlan.subscriptionId': subscriptionId || null,
                    }
                });

                return NextResponse.json({
                    success: true,
                    message: 'Plan tracking updated (referral already rewarded with non-zero amount)',
                    alreadyRewarded: true,
                }, { headers: corsHeaders });
            }

            console.error(`❌ No referral found at all for ${referredUserId}`);
            return NextResponse.json({
                success: false,
                message: 'No pending referral found for this user',
                reason: 'NO_PENDING_REFERRAL',
            }, { status: 404, headers: corsHeaders });
        }

        // 4. Fetch admin settings AND referrer's individual commission rate
        const settings = await getSettings();
        const referrer = await User.findById(pendingReferral.referrerId).lean();
        const referrerCommissionRate = referrer?.commissionRate; // e.g. 10 = 10%

        // 5. Compute reward amount
        //    Priority: per-user commissionRate > global settings
        let rewardAmount;
        if (typeof referrerCommissionRate === 'number' && referrerCommissionRate > 0) {
            // Admin assigned a custom commission % to this referrer
            rewardAmount = Math.floor(amountPaise * (referrerCommissionRate / 100));
            console.log(`💰 Using referrer's commissionRate: ${referrerCommissionRate}% → ₹${(rewardAmount/100).toFixed(2)}`);
        } else if (settings.rewardMode === 'percentage') {
            rewardAmount = Math.floor(amountPaise * (settings.percentage / 100));
        } else {
            rewardAmount = settings.fixedAmount;
        }

        // 6. Execute transaction
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                // Create purchase record
                const [purchase] = await Purchase.create([{
                    clerkUserId: referredUserId,
                    amount: amountPaise,
                    status: 'SUCCESS',
                }], { session });

                // Update referral: PENDING → REWARDED + plan tracking
                pendingReferral.status = 'REWARDED';
                pendingReferral.purchaseId = purchase._id;
                pendingReferral.purchaseAmount = amountPaise;
                pendingReferral.purchaseCompletedAt = new Date();
                pendingReferral.rewardAmount = rewardAmount;
                pendingReferral.rewardedAt = new Date();
                pendingReferral.referredUserPlan = {
                    planType,
                    planAmount: amountPaise,
                    subscribedAt: new Date(),
                    subscriptionId: subscriptionId || null,
                };
                await pendingReferral.save({ session });

                // Update referrer stats
                await User.findByIdAndUpdate(
                    pendingReferral.referrerId,
                    {
                        $inc: {
                            'referralStats.rewardBalance': rewardAmount,
                            'referralStats.completed': 1,
                            'referralStats.pending': -1,
                        }
                    },
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        console.log(`🎁 Referral rewarded via plan purchase: referrer=${pendingReferral.referrerId}, referred=${referredUserId}, plan=${planType}, reward=${rewardAmount} paise (₹${(rewardAmount / 100).toFixed(2)})`);

        return NextResponse.json({
            success: true,
            message: 'Plan tracked and referral rewarded',
            referralId: pendingReferral._id,
            rewardAmount,
            rewardAmountRupees: (rewardAmount / 100).toFixed(2),
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('POST /api/referral/track-plan error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
