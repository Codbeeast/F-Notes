// app/api/referral/validate/route.js
//
// Proxies referral code validation to forenotes_refer's authoritative endpoint.
// This ensures codes are always validated against the correct database.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET: Validate a referral code (public endpoint)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code || code.trim().length < 4) {
            return NextResponse.json(
                { valid: false, message: 'Invalid referral code' },
                { status: 400 }
            );
        }

        const referAppUrl = process.env.REFER_APP_URL?.replace(/\/$/, ""); // Remove trailing slash if any
        if (!referAppUrl) {
            console.error('❌ REFER_APP_URL not configured');
            return NextResponse.json(
                { valid: false, message: 'Referral service not configured' },
                { status: 500 }
            );
        }

        const targetUrl = `${referAppUrl}/api/referral/validate?code=${encodeURIComponent(code.trim())}`;
        console.log(`[Referral Proxy] Fetching: ${targetUrl}`);

        // Forward to forenotes_refer's validate endpoint
        const res = await fetch(targetUrl, { cache: 'no-store' });

        const responseText = await res.text();
        console.log(`[Referral Proxy] Response Status: ${res.status}`);
        console.log(`[Referral Proxy] Response Body:`, responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('[Referral Proxy] Failed to parse JSON:', e);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
        }

        return NextResponse.json({
            valid: data.valid || false,
            referrerName: data.referrerName,
            referrerImage: data.referrerImage || '',
            message: data.message || '',
        });

    } catch (error) {
        console.error('GET /api/referral/validate error:', error);
        return NextResponse.json(
            { valid: false, message: 'Validation service temporarily unavailable' },
            { status: 500 }
        );
    }
}
