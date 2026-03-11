export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ReferralAccessRequest from '@/models/ReferralAccessRequest';
import User from '@/models/User';

export async function GET() {
    try {
        await connectDB();
        const reqs = await ReferralAccessRequest.find({}).lean();
        const results = [];

        for (const r of reqs) {
            const u = await User.findById(r.clerkUserId).lean();
            results.push({
                request: r,
                userFound: !!u,
                userData: u
            });
        }

        const allUsers = await User.find({}).select('_id clerkUserId email firstName lastName').lean();

        return NextResponse.json({
            matchingResults: results,
            totalUsersInDb: allUsers.length,
            allUsers: allUsers,
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
