// app/api/referral/validate/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

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

        const referrer = await User.findOne({ referralCode: code })
            .select('firstName lastName imageUrl')
            .lean();

        if (!referrer) {
            return NextResponse.json({ valid: false, message: 'Referral code not found' });
        }

        return NextResponse.json({
            valid: true,
            referrerName: referrer.firstName || referrer.lastName || 'A friend',
            referrerImage: referrer.imageUrl || '',
        });
    } catch (error) {
        console.error('GET /api/referral/validate error:', error);
        return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 });
    }
}
