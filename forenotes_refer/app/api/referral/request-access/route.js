// app/api/referral/request-access/route.js
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import ReferralAccessRequest from '@/models/ReferralAccessRequest';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// POST: User requests referral access
export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();

        // Fetch user details from Clerk Backend API reliably
        let name = 'Unknown';
        let email = '';
        let imageUrl = '';

        try {
            const clerkUser = await client.users.getUser(userId);
            console.log('🔍 Clerk user raw response:', JSON.stringify({
                id: clerkUser?.id,
                firstName: clerkUser?.firstName,
                lastName: clerkUser?.lastName,
                emails: clerkUser?.emailAddresses?.map(e => e.emailAddress),
                imageUrl: clerkUser?.imageUrl,
            }));
            if (clerkUser) {
                const firstName = clerkUser.firstName || '';
                const lastName = clerkUser.lastName || '';
                name = `${firstName} ${lastName}`.trim() || 'Unknown';
                email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
                imageUrl = clerkUser.imageUrl || '';
            }
        } catch (err) {
            console.error(`❌ Failed to fetch Clerk user details for ${userId}:`, err.message, err.stack);
        }

        await connectDB();

        // Check if user already has referral enabled
        const user = await User.findById(userId).select('referralEnabled').lean();
        if (user?.referralEnabled) {
            return NextResponse.json({
                message: 'Referral access already enabled',
                alreadyEnabled: true
            });
        }

        // Check if there's already a pending request
        const existingRequest = await ReferralAccessRequest.findOne({
            clerkUserId: userId,
            status: 'REQUESTED'
        }).lean();

        if (existingRequest) {
            return NextResponse.json({
                message: 'Access request already submitted and pending review',
                alreadyRequested: true,
                requestId: existingRequest._id,
            });
        }

        // Determine the referral code
        let referralCode = user?.referralCode;
        if (!referralCode) {
            let exists = true;
            while (exists) {
                referralCode = nanoid(8);
                const userExists = await User.findOne({ referralCode }).lean();
                const reqExists = await ReferralAccessRequest.findOne({ referralCode }).lean();
                exists = userExists || reqExists;
            }
        }

        // Create new request
        const request = await ReferralAccessRequest.create({
            clerkUserId: userId,
            name,
            email,
            imageUrl,
            status: 'REQUESTED',
            requestedAt: new Date(),
            referralCode,
        });

        console.log(`📝 Referral access requested by ${userId} with code ${referralCode}`);

        return NextResponse.json({
            success: true,
            message: 'Access request submitted successfully',
            requestId: request._id,
            referralCode,
        });
    } catch (error) {
        console.error('POST /api/referral/request-access error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
