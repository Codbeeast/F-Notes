// app/api/subscription/status/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSubscriptionStatus, isTrialEligible } from '@/lib/subscription';

export async function GET(request) {
    try {
        // Authenticate user
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user email for email-based trial eligibility
        const userEmail = user?.emailAddresses?.[0]?.emailAddress || null;

        // Get subscription status
        const status = await getSubscriptionStatus(userId);

        // Check trial eligibility with email
        const trialEligible = await isTrialEligible(userId, userEmail);

        return NextResponse.json(
            {
                success: true,
                ...status,
                isTrialEligible: trialEligible
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch subscription status' },
            { status: 500 }
        );
    }
}
