// app/api/subscription/init/route.js
// This endpoint auto-initializes plans on first access
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';
import { DEFAULT_PLANS } from '@/lib/plans-config';

export async function GET(request) {
    try {
        await connectDB();

        // Check if plans exist
        const existingPlans = await Plan.countDocuments();

        if (existingPlans === 0) {
            // Auto-initialize plans if they don't exist
            await Plan.insertMany(DEFAULT_PLANS);

            return NextResponse.json({
                success: true,
                initialized: true,
                message: 'Plans auto-initialized successfully'
            });
        }

        return NextResponse.json({
            success: true,
            initialized: false,
            message: 'Plans already exist'
        });

    } catch (error) {
        console.error('Auto-init error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
