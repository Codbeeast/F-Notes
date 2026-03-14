// app/api/referral/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// GET: Fetch referral dashboard data for the authenticated user
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        let user = await User.findById(userId).lean();

        // If user doesn't exist in DB yet (signed up before referral system),
        // return a zero-state with a temporary code — the webhook will create the real doc
        if (!user) {
            let code;
            let exists = true;
            while (exists) {
                code = nanoid(8);
                exists = await User.findOne({ referralCode: code }).lean();
            }

            return NextResponse.json({
                referralCode: code,
                rewardBalance: 0,
                referrals: [],
                stats: { totalReferred: 0, pending: 0, completed: 0, rewarded: 0 },
                isTemporary: true,
            });
        }

        // Generate referral code for existing users who don't have one
        if (!user.referralCode) {
            let code;
            let exists = true;
            while (exists) {
                code = nanoid(8);
                exists = await User.findOne({ referralCode: code }).lean();
            }
            await User.findByIdAndUpdate(userId, { $set: { referralCode: code } });
            user.referralCode = code;
        }

        // Fetch referrals where this user is the referrer
        const referrals = await Referral.find({ referrerId: userId })
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
                    createdAt: ref.createdAt,
                    rewardedAt: ref.rewardedAt,
                };
            })
        );

        // Compute stats
        const stats = {
            totalReferred: referrals.length,
            pending: referrals.filter(r => r.status === 'PENDING').length,
            completed: referrals.filter(r => r.status === 'PURCHASE_COMPLETED').length,
            rewarded: referrals.filter(r => r.status === 'REWARDED').length,
        };

        return NextResponse.json({
            referralCode: user.referralCode,
            rewardBalance: user.rewardBalance || 0,
            referrals: enrichedReferrals,
            stats,
        });
    } catch (error) {
        console.error('GET /api/referral error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
