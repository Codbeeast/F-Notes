// app/api/referral/record-signup/route.js
//
// Server-to-server endpoint called by forenotes-master when a new user
// signs up with a referral code. Creates a PENDING Referral record and
// updates the referrer's stats.
//
// Auth: validated via x-referral-secret header (shared API secret).

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import Referral from '@/models/Referral';
import ReferralAccessRequest from '@/models/ReferralAccessRequest';

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

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
    try {
        console.log("➡️ Received POST to /api/referral/record-signup");

        // 1. Authenticate server-to-server call
        if (!validateSecret(req)) {
            console.error("❌ validateSecret failed for incoming request");
            return NextResponse.json(
                { error: 'Unauthorized — invalid or missing API secret' },
                { status: 401, headers: corsHeaders }
            );
        }

        // 2. Parse body
        const body = await req.json();
        console.log("📦 Parsed body for record-signup:", JSON.stringify(body));
        const { referralCode, referredUserId, referredUserEmail, referredUserName } = body;

        if (!referralCode || !referredUserId) {
            console.error("❌ Missing required fields in body");
            return NextResponse.json(
                { error: 'referralCode and referredUserId are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        await connectDB();

        // 3. Find the referrer by referral code
        //    Check User collection first, then ReferralAccessRequest as fallback
        let referrer = await User.findOne({ referralCode }).lean();
        let referrerIdForRecord; // separate variable to track who the referrerId is

        if (!referrer) {
            // Fallback: check approved access requests
            const accessReq = await ReferralAccessRequest.findOne({
                referralCode,
                status: 'APPROVED'
            }).lean();

            if (accessReq) {
                // Try to get the User doc for stats update, but don't require it
                referrer = await User.findById(accessReq.clerkUserId).lean();

                if (!referrer) {
                    // User doc doesn't exist yet in this app's DB — use the accessReq data directly
                    // This is fine because we only need the clerkUserId for Referral.referrerId
                    console.log(`✅ Referrer found via ReferralAccessRequest (no User doc): ${accessReq.clerkUserId}`);
                    referrerIdForRecord = accessReq.clerkUserId;
                }
            }
        }

        // If we found a full referrer User doc, use their _id
        if (referrer && referrer._id) {
            referrerIdForRecord = referrer._id;
        }

        if (!referrerIdForRecord) {
            console.error(`❌ Referrer not found for code: ${referralCode}`);
            return NextResponse.json(
                { error: 'Referral code not found or not associated with an active referrer' },
                { status: 404, headers: corsHeaders }
            );
        }

        // 4. Prevent self-referral
        if (referrerIdForRecord === referredUserId) {
            console.error(`❌ Self-referral blocked: ${referrerIdForRecord}`);
            return NextResponse.json(
                { error: 'Cannot use your own referral code' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 5. Check for duplicate — idempotency guard
        const existingReferral = await Referral.findOne({
            referredUserId,
        }).lean();

        if (existingReferral) {
            console.log(`⚠️ Duplicate referral attempt for referredUserId: ${referredUserId}`);
            return NextResponse.json({
                success: true,
                message: 'Referral already recorded for this user',
                referrerId: existingReferral.referrerId,
                duplicate: true,
            }, { headers: corsHeaders });
        }

        // 6. Transaction: create referral + upsert referred user + update referrer stats
        const session = await mongoose.startSession();

        let referralDoc;
        try {
            await session.withTransaction(async () => {
                // Create Referral record
                [referralDoc] = await Referral.create([{
                    referrerId: referrerIdForRecord,
                    referredUserId,
                    referralCode,
                    status: 'PENDING',
                }], { session });

                // Upsert the referred user so their info is available in the dashboard
                const nameParts = (referredUserName || 'Unknown User').split(' ');
                const firstName = nameParts[0] || 'Unknown';
                const lastName = nameParts.slice(1).join(' ') || '';

                await User.findByIdAndUpdate(
                    referredUserId,
                    {
                        $setOnInsert: {
                            email: referredUserEmail || '',
                            username: `user_${referredUserId.slice(-8)}`,
                            firstName,
                            lastName,
                            imageUrl: '',
                            role: 'user',
                            referralEnabled: false,
                            referralStats: { total: 0, pending: 0, completed: 0, rewardBalance: 0 },
                            chatUsage: {
                                monthlyPromptCount: 0,
                                monthlyLimit: 60,
                                lastResetDate: new Date(),
                                currentMonth: new Date().toISOString().slice(0, 7)
                            },
                        },
                        $set: {
                            referredBy: {
                                clerkUserId: referrerIdForRecord,
                                referralCode,
                            }
                        }
                    },
                    { upsert: true, session }
                );

                // Update referrer stats (upsert so it works even if User doc is missing)
                await User.findByIdAndUpdate(
                    referrerIdForRecord,
                    {
                        $inc: {
                            'referralStats.total': 1,
                            'referralStats.pending': 1,
                        }
                    },
                    { session } // no upsert here — only increment if doc exists
                );
            });
        } finally {
            await session.endSession();
        }

        console.log(`🔗 Referral recorded: ${referredUserId} referred by ${referrerIdForRecord} (code: ${referralCode})`);

        return NextResponse.json({
            success: true,
            message: 'Referral recorded successfully',
            referrerId: referrerIdForRecord,
            referralId: referralDoc?._id,
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('POST /api/referral/record-signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
