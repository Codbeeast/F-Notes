// app/api/referral/submit/route.js
//
// Called by the frontend after a new user signs up with a referral code.
// Validates the code against forenotes_refer and records the referral
// in both the local DB and forenotes_refer's DB.

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import ReferralSignup from '@/models/ReferralSignup';

export const runtime = 'nodejs';

export async function POST(req) {
    try {
        // 1. Authenticate user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse body
        const body = await req.json();
        const { referralCode } = body;

        if (!referralCode || referralCode.trim().length < 4) {
            return NextResponse.json(
                { error: 'A valid referral code is required' },
                { status: 400 }
            );
        }

        const code = referralCode.trim();

        await connectDB();

        // 3. Check if user already has a referral RECORDED (only block on success, not on failed attempts)
        const existingSignup = await ReferralSignup.findOne({ userId, status: 'RECORDED' }).lean();
        if (existingSignup) {
            return NextResponse.json({
                success: true,
                message: 'Referral already recorded for your account',
                duplicate: true,
                referralCode: existingSignup.referralCode,
            });
        }
        
        // 4. Validate code against forenotes_refer
        const referAppUrl = process.env.REFER_APP_URL || 'http://localhost:3000'; // Default to localhost:3000 if not set

        const validateRes = await fetch(
            `${referAppUrl}/api/referral/validate?code=${encodeURIComponent(code)}`,
            { cache: 'no-store' }
        );
        const validateData = await validateRes.json();

        if (!validateData.valid) {
            return NextResponse.json({
                success: false,
                message: validateData.message || 'Invalid referral code',
            }, { status: 400 });
        }

        // 5. Get user info to send to forenotes_refer
        let user = await User.findById(userId).lean();
        let userName = 'Unknown User';
        let userEmail = '';

        if (user) {
            userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
            userEmail = user.email || '';
        } else {
            try {
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(userId);
                userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User';
                userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || '';
            } catch (clerkErr) {
            }
        }
        
        // 6. Record the referral in forenotes_refer via server-to-server call
        const apiSecret = process.env.REFERRAL_API_SECRET;
        if (!apiSecret) {
            return NextResponse.json(
                { error: 'Referral service not configured' },
                { status: 500 }
            );
        }

        const recordRes = await fetch(`${referAppUrl}/api/referral/record-signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-referral-secret': apiSecret,
            },
            body: JSON.stringify({
                referralCode: code,
                referredUserId: userId,
                referredUserEmail: userEmail,
                referredUserName: userName,
            }),
            cache: 'no-store',
        });

        const recordResText = await recordRes.text();
        
        let recordData;
        try {
            recordData = JSON.parse(recordResText);
        } catch (e) {
            recordData = { error: 'Invalid response from referral service', raw: recordResText };
        }

        if (!recordRes.ok && !recordData.duplicate) {
            // Record failed locally with FAILED status for debugging
            await ReferralSignup.create({
                userId,
                referralCode: code,
                referrerId: null,
                status: 'FAILED',
                errorMessage: recordData.error || 'Failed to record referral',
                processedAt: new Date(),
            });

            return NextResponse.json({
                success: false,
                message: recordData.error || 'Failed to record referral',
            }, { status: 400 });
        }

        // 7. Create local audit record
        const signupRecord = await ReferralSignup.create({
            userId,
            referralCode: code,
            referrerId: recordData.referrerId || null,
            status: 'RECORDED',
            processedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Referral recorded successfully!',
            referrerName: validateData.referrerName,
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
