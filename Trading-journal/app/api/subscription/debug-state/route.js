
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function GET(request) {
    try {
        // Block in production for security
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Not available' }, { status: 404 });
        }

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({
            count: subscriptions.length,
            subscriptions
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
