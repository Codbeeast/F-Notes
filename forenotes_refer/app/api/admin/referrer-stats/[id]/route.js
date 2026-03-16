import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import User from '@/models/User';
import Referral from '@/models/Referral';

export const runtime = 'nodejs';

export async function GET(req, { params }) {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }
        const { id } = await params;
        const referrerId = id;
        const { searchParams } = new URL(req.url);
        const timeframe = searchParams.get('timeframe') || 'all'; // 'all' or '12months'

        if (!referrerId) {
            return NextResponse.json({ error: 'Referrer ID is required' }, { status: 400 });
        }

        await connectDB();

        // Get user details (for commission rate and referral code)
        const user = await User.findById(referrerId).lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Build date filter
        const query = { referrerId };
        
        if (timeframe !== 'all' && timeframe.includes('-')) {
            const [yearStr, monthStr] = timeframe.split('-');
            const year = parseInt(yearStr, 10);
            const monthIndex = parseInt(monthStr, 10) - 1; // 0-indexed month
            
            if (!isNaN(year) && !isNaN(monthIndex)) {
                // Start of the selected month
                const startDate = new Date(year, monthIndex, 1);
                // End of the selected month (setting day to 0 of the next month gets the last day of the current month)
                const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
                
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        // Fetch referrals
        const referrals = await Referral.find(query).lean();

        // Calculate stats
        const stats = {
            totalReferred: referrals.length,
            pending: referrals.filter(r => r.status === 'PENDING').length,
            successful: referrals.filter(r => r.status === 'PURCHASE_COMPLETED' || r.status === 'REWARDED').length,
            totalEarned: referrals
                .filter(r => r.status === 'REWARDED')
                .reduce((sum, curr) => sum + (curr.rewardAmount || 0), 0)
        };

        return NextResponse.json({
            success: true,
            referralCode: user.referralCode || 'N/A',
            commissionRate: user.commissionRate || 10,
            stats: {
                totalReferred: stats.totalReferred,
                pending: stats.pending,
                successful: stats.successful,
                totalEarnedRupees: (stats.totalEarned / 100).toFixed(2),
            }
        });

    } catch (error) {
        console.error('GET /api/admin/referrer-stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
