// app/api/admin/referrals/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import User from '@/models/User';
import Referral from '@/models/Referral';

export const runtime = 'nodejs';

// GET: Fetch all referrals for admin dashboard
export async function GET() {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }

        await connectDB();

        // Fetch all referrals
        const referrals = await Referral.find({})
            .sort({ createdAt: -1 })
            .lean();

        // Enrich referrals with referrer and referred user info
        const enrichedReferrals = await Promise.all(
            referrals.map(async (ref) => {
                const referrerUser = await User.findById(ref.referrerId)
                    .select('firstName lastName email')
                    .lean();
                const referredUser = await User.findById(ref.referredUserId)
                    .select('firstName lastName email')
                    .lean();

                return {
                    _id: ref._id,
                    referrer: referrerUser ? {
                        name: `${referrerUser.firstName} ${referrerUser.lastName}`,
                        email: referrerUser.email,
                    } : { name: 'Deleted User', email: '' },
                    referredUser: referredUser ? {
                        name: `${referredUser.firstName} ${referredUser.lastName}`,
                        email: referredUser.email,
                    } : { name: 'Deleted User', email: '' },
                    referralCode: ref.referralCode,
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

        // Compute system-wide stats
        const stats = {
            totalReferrals: referrals.length,
            pending: referrals.filter(r => r.status === 'PENDING').length,
            completed: referrals.filter(r => r.status === 'PURCHASE_COMPLETED').length,
            rewarded: referrals.filter(r => r.status === 'REWARDED').length,
            rejected: referrals.filter(r => r.status === 'REJECTED').length,
            totalRewardsDistributed: referrals
                .filter(r => r.status === 'REWARDED')
                .reduce((sum, curr) => sum + (curr.rewardAmount || 0), 0),
        };

        // Convert total rewards to rupees for display
        stats.totalRewardsDistributedRupees = (stats.totalRewardsDistributed / 100).toFixed(2);

        return NextResponse.json({
            referrals: enrichedReferrals,
            stats,
        });
    } catch (error) {
        console.error('GET /api/admin/referrals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Reject a referral (admin only)
export async function PATCH(req) {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }

        const body = await req.json();
        const { referralId, action } = body;

        if (!referralId || action !== 'REJECTED') {
            return NextResponse.json(
                { error: 'referralId and action ("REJECTED") are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const referral = await Referral.findById(referralId);
        if (!referral) {
            return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
        }

        // Only PENDING referrals can be rejected
        if (referral.status !== 'PENDING') {
            return NextResponse.json(
                { error: `Cannot reject a referral with status ${referral.status}` },
                { status: 400 }
            );
        }

        referral.status = 'REJECTED';
        await referral.save();

        // Decrement referrer's pending count
        await User.findByIdAndUpdate(referral.referrerId, {
            $inc: { 'referralStats.pending': -1 }
        });

        console.log(`❌ Referral ${referralId} rejected by admin ${adminCheck.userId}`);

        return NextResponse.json({
            success: true,
            message: 'Referral rejected successfully',
        });
    } catch (error) {
        console.error('PATCH /api/admin/referrals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
