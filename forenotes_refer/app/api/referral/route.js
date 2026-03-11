// app/api/referral/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Referral from '@/models/Referral';
import ReferralAccessRequest from '@/models/ReferralAccessRequest';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// GET: Fetch referral dashboard data for the authenticated user
export async function GET(req) {
    try {
        const { userId } = await auth();
        
        // If auth fails, try to extract userId from headers if in dev mode (simplistic fallback)
        if (!userId) {
            // Check if clock skew is the issue (Clerk might fail auth but still pass some headers)
            console.warn("API: auth() returned no userId. This might be due to clock skew.");
            return NextResponse.json({ error: 'Unauthorized - Clock Skew Possible' }, { status: 401 });
        }

        await connectDB();

        let user = await User.findById(userId).lean();
        let userLookedUpById = !!user;

        // Fallback: If local MongoDB has an old ID but matching email, find them.
        if (!user) {
            try {
                const { clerkClient } = await import('@clerk/nextjs/server');
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(userId);
                const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
                if (email) {
                    user = await User.findOne({
                        email: { $regex: new RegExp('^' + email + '$', 'i') }
                    }).lean();
                }
            } catch (err) {
                console.warn('Fallback clerk user lookup failed:', err.message);
            }
        }

        // Fetch their latest request regardless of user document state
        const latestRequest = await ReferralAccessRequest.findOne({ clerkUserId: userId })
            .sort({ requestedAt: -1 })
            .lean();

        // If they're explicitly approved via a request, they should have access
        const isApprovedViaRequest = latestRequest?.status === 'APPROVED';

        // Generate referral code for ANY user who doesn't have one yet.
        // This ensures codes are available even before access approval.
        if (user && (!user.referralCode || user.referralCode.trim() === '')) {
            let code;
            let exists = true;
            while (exists) {
                code = nanoid(8);
                exists = await User.findOne({ referralCode: code }).lean();
            }
            // Save the code to the database
            try {
                await User.findByIdAndUpdate(user._id, { $set: { referralCode: code } });
                user.referralCode = code;
                console.log(`✅ Generated referral code ${code} for user ${user._id}`);
            } catch (updateErr) {
                console.error(`❌ Failed to save referral code for user ${user._id}:`, updateErr.message);
                // Still set it locally so the response includes it
                user.referralCode = code;
            }
        }

        // Check if referral is enabled for this user
        const hasAccess = user?.referralEnabled || isApprovedViaRequest;

        // Debug log for troubleshooting
        console.log(`🔍 Referral API: userId=${userId}, userFound=${!!user}, referralCode=${user?.referralCode || 'null'}, referralEnabled=${user?.referralEnabled}, hasAccess=${hasAccess}, isApprovedViaRequest=${isApprovedViaRequest}`);

        // If user doesn't exist in DB yet (signed up before referral system),
        // return a zero-state. 
        if (!user && !isApprovedViaRequest) {
            return NextResponse.json({
                referralCode: null,
                rewardBalance: 0,
                referrals: [],
                stats: { total: 0, pending: 0, completed: 0 },
                isTemporary: true,
                accessRequired: true,
                requestPending: latestRequest?.status === 'REQUESTED',
                requestStatus: latestRequest?.status || null,
            });
        }

        const finalCode = user?.referralCode || latestRequest?.referralCode;

        if (!hasAccess) {
            return NextResponse.json({
                accessRequired: true,
                requestPending: latestRequest?.status === 'REQUESTED',
                requestStatus: latestRequest?.status || null,
                referralCode: finalCode || null,
            });
        }

        // Fetch referrals where this user is the referrer
        const referrals = await Referral.find({ referrerId: userLookedUpById ? userId : user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Enrich referrals with referred user info
        const enrichedReferrals = await Promise.all(
            referrals.map(async (ref) => {
                const referredUser = await User.findById(ref.referredUserId)
                    .select('firstName lastName imageUrl createdAt')
                    .lean();
                return {
                    _id: ref._id,
                    referredUser: referredUser ? {
                        firstName: referredUser.firstName,
                        lastName: referredUser.lastName,
                        imageUrl: referredUser.imageUrl,
                    } : { firstName: 'Deleted', lastName: 'User', imageUrl: '' },
                    status: ref.status,
                    rewardAmount: ref.rewardAmount,
                    rewardAmountRupees: (ref.rewardAmount / 100).toFixed(2),
                    purchaseAmount: ref.purchaseAmount,
                    createdAt: ref.createdAt,
                    purchaseCompletedAt: ref.purchaseCompletedAt,
                    rewardedAt: ref.rewardedAt,
                };
            })
        );

        // Compute stats DIRECTLY from the Referral collection (source of truth)
        // This is more reliable than counter fields which may not be updated by all webhook handlers
        const referrerId = userLookedUpById ? userId : user._id;
        const totalReferrals = await Referral.countDocuments({ referrerId });
        const pendingReferrals = await Referral.countDocuments({ referrerId, status: 'PENDING' });
        const completedReferrals = await Referral.countDocuments({ referrerId, status: { $in: ['PURCHASE_COMPLETED', 'REWARDED'] } });

        const stats = {
            total: totalReferrals,
            pending: pendingReferrals,
            completed: completedReferrals,
        };

        // Sum reward amounts from completed/rewarded referrals
        const rewardAgg = await Referral.aggregate([
            { $match: { referrerId, status: { $in: ['PURCHASE_COMPLETED', 'REWARDED'] } } },
            { $group: { _id: null, total: { $sum: '$rewardAmount' } } }
        ]);
        const rewardBalancePaise = rewardAgg[0]?.total || user?.referralStats?.rewardBalance || 0;

        return NextResponse.json({
            referralCode: finalCode,
            rewardBalance: rewardBalancePaise,
            rewardBalanceRupees: (rewardBalancePaise / 100).toFixed(2),
            referrals: enrichedReferrals,
            stats,
            accessRequired: false,
        });
    } catch (error) {
        console.error('GET /api/referral error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
