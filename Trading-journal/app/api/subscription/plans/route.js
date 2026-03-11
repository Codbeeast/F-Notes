// app/api/subscription/plans/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';
import { DEFAULT_PLANS } from '@/lib/plans-config';

export async function GET(request) {
    try {
        await connectDB();

        // Fetch all active plans
        let plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1 });

        // Check for missing default plans and add them
        let hasChanges = false;
        for (const defaultPlan of DEFAULT_PLANS) {
            const exists = await Plan.findOne({ planId: defaultPlan.planId });
            if (!exists) {
                await Plan.create(defaultPlan);
                hasChanges = true;
            }
        }

        // Re-fetch if changes were made or if we need to ensure sort order
        if (plans.length === 0 || hasChanges) {
            plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1 });
        }

        // Format plans for frontend
        const formattedPlans = plans.map(plan => ({
            id: plan.planId,
            name: plan.name,
            description: plan.planId === '3_MONTHS' ? 'Great for traders getting serious' :
                plan.planId === '6_MONTHS' ? 'Best for committed traders' :
                    plan.planId === '12_MONTHS' ? 'Maximum value for serious traders' :
                        plan.description,
            amount: plan.amount,
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            billingPeriod: plan.billingPeriod,
            bonusMonths: 0,
            totalMonths: plan.billingPeriod,
            monthlyEquivalent: Math.floor(plan.amount / plan.billingPeriod),
            savingsPercentage: (plan.planId === '6_MONTHS' || plan.planId === '12_MONTHS') ? 17 : plan.savingsPercentage,
            features: plan.features,
            isPopular: plan.isPopular,
            trialDays: plan.trialDays,
            displayPrice: `₹${plan.amount.toLocaleString('en-IN')}`,
            bonusDisplay: null
        }));

        return NextResponse.json({
            success: true,
            plans: formattedPlans
        });

    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch plans' },
            { status: 500 }
        );
    }
}
