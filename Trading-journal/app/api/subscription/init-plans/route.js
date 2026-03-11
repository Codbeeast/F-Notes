// app/api/subscription/init-plans/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';

import { DEFAULT_PLANS } from '@/lib/plans-config';

// Plan configurations
const plansData = DEFAULT_PLANS;

export async function POST(request) {
    try {
        await connectDB();

        const results = [];

        for (const planData of plansData) {
            // Check if plan already exists
            const existingPlan = await Plan.findOne({ planId: planData.planId });

            if (existingPlan) {
                // Update existing plan
                const updatedPlan = await Plan.findOneAndUpdate(
                    { planId: planData.planId },
                    planData,
                    { new: true }
                );
                results.push({ planId: planData.planId, action: 'updated', plan: updatedPlan });
            } else {
                // Create new plan
                const newPlan = await Plan.create(planData);
                results.push({ planId: planData.planId, action: 'created', plan: newPlan });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Plans initialized successfully',
            results,
            summary: {
                monthly: `₹${plansData[0].amount}`,
                sixMonths: `₹${plansData[1].amount} (₹${plansData[1].monthlyEquivalent}/month + 1 free month)`,
                yearly: `₹${plansData[2].amount} (₹${plansData[2].monthlyEquivalent}/month + 2 free months)`
            }
        });

    } catch (error) {
        console.error('Error initializing plans:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to initialize plans'
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check if plans are initialized
export async function GET(request) {
    try {
        await connectDB();

        const plans = await Plan.find({}).sort({ displayOrder: 1 });

        return NextResponse.json({
            success: true,
            initialized: plans.length > 0,
            plansCount: plans.length,
            plans: plans.map(p => ({
                planId: p.planId,
                name: p.name,
                amount: p.amount,
                isActive: p.isActive
            }))
        });

    } catch (error) {
        console.error('Error checking plans:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
