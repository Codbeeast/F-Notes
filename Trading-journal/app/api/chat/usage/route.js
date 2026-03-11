import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChatLimit from '@/models/ChatLimit';
import Subscription from '@/models/Subscription';
import { DEFAULT_PLANS } from '@/lib/plans-config';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        await connectDB();

        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // DYNAMIC LIMIT CHECK
        let NEW_MONTHLY_LIMIT = 60;
        try {
            const activeSub = await Subscription.findActiveSubscription(userId);
            if (activeSub) {
                const plan = DEFAULT_PLANS.find(p => p.planId === activeSub.planType);
                if (plan && plan.credits) {
                    NEW_MONTHLY_LIMIT = plan.credits;
                }
            }
        } catch (err) {
            console.error('[Usage API] Error fetching subscription:', err);
        }

        let limitDoc = await ChatLimit.findOne({ userId });

        if (!limitDoc) {
            // Return default values if no document exists yet
            return NextResponse.json({
                success: true,
                data: {
                    promptsUsed: 0,
                    promptsRemaining: NEW_MONTHLY_LIMIT,
                    monthlyLimit: NEW_MONTHLY_LIMIT,
                    limitReached: false
                }
            });
        }

        // AUTO-SYNC: Update user limit to match their plan
        if (limitDoc.monthlyLimit !== NEW_MONTHLY_LIMIT) {
            console.log(`[Usage API] Updating user ${userId} limit from ${limitDoc.monthlyLimit} to ${NEW_MONTHLY_LIMIT}`);
            limitDoc.monthlyLimit = NEW_MONTHLY_LIMIT;
            await limitDoc.save();
        }

        // Check if month needs reset
        let promptsUsed = limitDoc.promptsUsed;
        if (limitDoc.currentMonth !== currentMonthStr) {
            promptsUsed = 0;
        }

        const promptsRemaining = Math.max(0, limitDoc.monthlyLimit - promptsUsed);

        console.log(`[Usage API] User: ${userId} | Used: ${promptsUsed} | Limit: ${limitDoc.monthlyLimit} | Remaining: ${promptsRemaining}`);

        return NextResponse.json({
            success: true,
            data: {
                promptsUsed: promptsUsed,
                promptsRemaining: promptsRemaining,
                monthlyLimit: limitDoc.monthlyLimit,
                // Safety check: only mark as reached if remaining is actually 0 or less
                limitReached: promptsRemaining <= 0 && promptsUsed >= limitDoc.monthlyLimit
            }
        });

    } catch (error) {
        console.error('Error fetching chat usage:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
