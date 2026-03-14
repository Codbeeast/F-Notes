import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';

export async function GET(request) {
    try {
        await connectDB();

        // New Plan IDs from Environment Variables
        const plansToUpdate = [
            {
                planId: '1_MONTH',
                razorpayPlanId: process.env.RAZORPAY_PLAN_1_MONTH,
            },
            {
                planId: '6_MONTHS',
                razorpayPlanId: process.env.RAZORPAY_PLAN_6_MONTHS,
            },
            {
                planId: '12_MONTHS',
                razorpayPlanId: process.env.RAZORPAY_PLAN_12_MONTHS,
            }
        ];

        const results = [];

        for (const plan of plansToUpdate) {
            if (plan.razorpayPlanId) {
                const updatedPlan = await Plan.findOneAndUpdate(
                    { planId: plan.planId },
                    { razorpayPlanId: plan.razorpayPlanId },
                    { new: true }
                );
                results.push({
                    planId: plan.planId,
                    newRazorpayId: plan.razorpayPlanId,
                    updated: !!updatedPlan
                });
            } else {
                results.push({
                    planId: plan.planId,
                    error: "Missing Env Var"
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Plans updated with new IDs',
            results
        });

    } catch (error) {
        console.error('Update plans error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
