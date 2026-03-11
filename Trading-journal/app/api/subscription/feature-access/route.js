// app/api/subscription/feature-access/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { hasFeatureAccess } from '@/lib/subscription';

export async function GET(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { hasAccess: false, reason: 'no_user' },
                { status: 401 }
            );
        }

        // Get feature name from query params
        const { searchParams } = new URL(request.url);
        const featureName = searchParams.get('feature');

        if (!featureName) {
            return NextResponse.json(
                { error: 'Feature name is required' },
                { status: 400 }
            );
        }

        // Check feature access
        const accessInfo = await hasFeatureAccess(userId, featureName);

        return NextResponse.json(accessInfo);
    } catch (error) {
        console.error('Feature access check error:', error);
        return NextResponse.json(
            {
                hasAccess: false,
                reason: 'error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
