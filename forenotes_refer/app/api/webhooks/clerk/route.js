// app/api/webhooks/clerk/route.js

import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

import User from '@/models/User';
import Referral from '@/models/Referral';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// Helper to pick the primary email
function getPrimaryEmail(data) {
    const primaryId = data.primary_email_address_id;
    const emails = data.email_addresses || [];
    const primary = emails.find(e => e.id === primaryId)?.email_address;
    return (primary || emails[0]?.email_address || '').toLowerCase();
}

// Generate a unique referral code
async function generateUniqueReferralCode() {
    let code;
    let exists = true;
    while (exists) {
        code = nanoid(8);
        exists = await User.findOne({ referralCode: code }).lean();
    }
    return code;
}

export async function POST(req) {
    try {
        // 1. Validate Headers & Payload
        const secret = process.env.CLERK_WEBHOOK_SECRET;
        if (!secret) {
            return NextResponse.json({ success: false, message: 'Missing CLERK_WEBHOOK_SECRET' }, { status: 500 });
        }

        const svixId = req.headers.get('svix-id');
        const svixTs = req.headers.get('svix-timestamp');
        const svixSig = req.headers.get('svix-signature');

        if (!svixId || !svixTs || !svixSig) {
            return NextResponse.json({ success: false, message: 'Missing Svix signature headers' }, { status: 400 });
        }

        const payload = await req.text();
        const wh = new Webhook(secret);

        try {
            wh.verify(payload, {
                'svix-id': svixId,
                'svix-timestamp': svixTs,
                'svix-signature': svixSig,
            });
        } catch (err) {
            return NextResponse.json({ success: false, message: 'Invalid Svix signature' }, { status: 400 });
        }

        // 2. Parse Event & Connect DB
        const { type, data } = JSON.parse(payload);
        await connectDB();

        // 3. Handle Events
        const userId = data.id;

        if (type === 'user.created' || type === 'user.updated') {
            const email = getPrimaryEmail(data);
            const username = data.username || `user_${userId.slice(-8)}`;
            const firstName = data.first_name || '';
            const lastName = data.last_name || '';
            const imageUrl = data.image_url || '';

            // DO NOT generate referral code on user.created
            // Code will be generated only when user requests access or admin approves
            const isNewUser = type === 'user.created';

            // Prepare User update (upsert)
            const userUpdate = {
                $set: {
                    email,
                    username,
                    firstName,
                    lastName,
                    imageUrl,
                },
                $setOnInsert: {
                    role: 'user',
                    referralEnabled: false,
                    chatUsage: {
                        monthlyPromptCount: 0,
                        lastResetDate: new Date(),
                        currentMonth: new Date().toISOString().slice(0, 7)
                    },
                    referralStats: {
                        total: 0,
                        pending: 0,
                        completed: 0,
                        rewardBalance: 0
                    },
                    referredBy: {
                        clerkUserId: null,
                        referralCode: null
                    },
                }
            };

            await User.findByIdAndUpdate(userId, userUpdate, { upsert: true, new: true });

            // Handle referral linking for BOTH new and updated users.
            // Clerk's <SignUp> sets unsafeMetadata AFTER the user is created,
            // so the referral code often arrives in a user.updated event, not user.created.
            const referredByCode = data.unsafe_metadata?.referredBy;
            if (referredByCode) {
                const session = await mongoose.startSession();
                try {
                    await session.withTransaction(async () => {
                        // Check if this user is already linked to a referrer (prevent duplicates)
                        const currentUser = await User.findById(userId).lean();
                        if (currentUser && !currentUser.referredBy?.clerkUserId) {
                            const referrer = await User.findOne({ referralCode: referredByCode }).lean();

                            if (referrer && referrer._id !== userId) {
                                // Link referrer on the new user
                                await User.findByIdAndUpdate(userId, {
                                    $set: {
                                        referredBy: {
                                            clerkUserId: referrer._id, // This is already the clerk ID because User._id = clerkId
                                            referralCode: referredByCode
                                        }
                                    }
                                }, { session });

                                // Create a PENDING referral entry (only if one doesn't already exist)
                                const existingReferral = await Referral.findOne({
                                    referrerId: referrer._id,
                                    referredUserId: userId,
                                }).lean();

                                if (!existingReferral) {
                                    await Referral.create([{
                                        referrerId: referrer._id,
                                        referredUserId: userId,
                                        referralCode: referredByCode,
                                        status: 'PENDING'
                                    }], { session });
                                }

                                // Increment referrer stats
                                await User.findByIdAndUpdate(referrer._id, {
                                    $inc: {
                                        'referralStats.total': 1,
                                        'referralStats.pending': 1
                                    }
                                }, { session });

                                console.log(`🔗 Referral linked: ${userId} referred by ${referrer._id} (code: ${referredByCode})`);
                            }
                        }
                    });
                } catch (refErr) {
                    // Non-blocking: don't fail the webhook for referral errors
                    console.error('⚠️ Referral linking error:', refErr.message);
                } finally {
                    await session.endSession();
                }
            }

            console.log(`✅ Synced User for: ${userId} (${type})`);
            return NextResponse.json({ success: true, message: `Synced user ${userId}` });
        }

        if (type === 'user.deleted') {
            await User.findByIdAndDelete(userId);
            console.log(`🗑️ Deleted User for: ${userId}`);
            return NextResponse.json({ success: true, message: `Deleted user ${userId}` });
        }

        // Ignore other events
        return NextResponse.json({ success: true, message: `Ignored event: ${type}` });

    } catch (err) {
        console.error('❌ Clerk webhook error:', err);
        return NextResponse.json({ success: false, message: err.message || 'Webhook processing failed' }, { status: 500 });
    }
}
