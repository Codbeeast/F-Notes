// Emergency cleanup endpoint for abandoned subscriptions
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { subscriptionId } = body;

        await connectDB();

        // Delete only 'created' status subscriptions (not authorized)
        const result = await Subscription.deleteOne({
            _id: subscriptionId,
            userId,
            status: 'created' // Only delete unauthorized subscriptions
        });

        return NextResponse.json({
            success: true,
            deleted: result.deletedCount > 0
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json(
            { error: 'Cleanup failed' },
            { status: 500 }
        );
    }
}
