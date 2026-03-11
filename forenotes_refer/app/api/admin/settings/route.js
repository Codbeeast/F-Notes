// app/api/admin/settings/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import AdminSettings, { getSettings } from '@/models/AdminSettings';

export const runtime = 'nodejs';

// GET: Fetch current referral settings
export async function GET() {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }

        await connectDB();
        const settings = await getSettings();

        return NextResponse.json({
            rewardMode: settings.rewardMode,
            fixedAmount: settings.fixedAmount,
            percentage: settings.percentage,
            minPurchaseAmount: settings.minPurchaseAmount,
            applyFrom: settings.applyFrom,
            updatedAt: settings.updatedAt,
            updatedBy: settings.updatedBy,
        });
    } catch (error) {
        console.error('GET /api/admin/settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update referral settings (admin only)
export async function PUT(req) {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }

        const body = await req.json();
        const { rewardMode, fixedAmount, percentage, minPurchaseAmount } = body;

        await connectDB();

        const updateFields = {
            updatedAt: new Date(),
            updatedBy: adminCheck.userId,
            applyFrom: new Date(), // changes apply from now
        };

        if (rewardMode && ['fixed', 'percentage'].includes(rewardMode)) {
            updateFields.rewardMode = rewardMode;
        }
        if (typeof fixedAmount === 'number' && fixedAmount >= 0) {
            updateFields.fixedAmount = Math.floor(fixedAmount); // must be integer paise
        }
        if (typeof percentage === 'number' && percentage >= 0 && percentage <= 100) {
            updateFields.percentage = percentage;
        }
        if (typeof minPurchaseAmount === 'number' && minPurchaseAmount >= 0) {
            updateFields.minPurchaseAmount = Math.floor(minPurchaseAmount); // integer paise
        }

        const updated = await AdminSettings.findByIdAndUpdate(
            'referral_settings',
            { $set: updateFields },
            { new: true, upsert: true }
        ).lean();

        console.log(`⚙️ Admin settings updated by ${adminCheck.userId}:`, updateFields);

        return NextResponse.json({
            success: true,
            settings: updated,
        });
    } catch (error) {
        console.error('PUT /api/admin/settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
