// app/api/referral/validate/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import ReferralAccessRequest from '@/models/ReferralAccessRequest';

export const runtime = 'nodejs';

// GET: Validate a referral code (public endpoint)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code || code.length < 4) {
            return NextResponse.json({ valid: false, message: 'Invalid referral code' }, { status: 400 });
        }

        await connectDB();

        let referrerName = 'A friend';
        let referrerImage = '';

        const referrer = await User.findOne({ referralCode: code })
            .select('firstName imageUrl')
            .lean();

        if (referrer) {
            referrerName = referrer.firstName || 'A friend';
            referrerImage = referrer.imageUrl || '';
        } else {
            // Check ReferralAccessRequest as a fallback
            const accessRequest = await ReferralAccessRequest.findOne({ referralCode: code, status: 'APPROVED' })
                .select('name imageUrl clerkUserId')
                .lean();

            if (accessRequest) {
                // Determine first name
                referrerName = accessRequest.name?.split(' ')[0] || 'A friend';
                referrerImage = accessRequest.imageUrl || '';
            } else {
                return NextResponse.json({ valid: false, message: 'Referral code not found' });
            }
        }

        return NextResponse.json({
            valid: true,
            referrerName,
            referrerImage,
        });
    } catch (error) {
        console.error('GET /api/referral/validate error:', error);
        return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 });
    }
}
