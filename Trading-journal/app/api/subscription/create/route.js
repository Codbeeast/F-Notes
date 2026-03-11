// app/api/subscription/create/route.js
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import { createSubscription } from '@/lib/razorpay';
import { isTrialEligible, createTrialSubscription } from '@/lib/subscription';

export async function POST(request) {
    try {
        // Authenticate user
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { planId, startTrial = true } = await request.json();

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get plan details
        const plan = await Plan.findOne({ planId });
        if (!plan || !plan.isActive) {
            return NextResponse.json(
                { error: 'Invalid or inactive plan' },
                { status: 400 }
            );
        }

        // Check trial eligibility
        const trialEligible = await isTrialEligible(userId);

        const userEmail = user.emailAddresses[0]?.emailAddress || '';
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${userId}`;
        const username = user.username || userEmail.split('@')[0] || userName;

        // If user wants trial and is eligible, create trial subscription
        if (startTrial && trialEligible) {
            const trialSubscription = await createTrialSubscription(userId, planId, username);

            return NextResponse.json({
                success: true,
                isTrial: true,
                subscription: {
                    id: trialSubscription._id,
                    status: trialSubscription.status,
                    planType: trialSubscription.planType,
                    trialEndDate: trialSubscription.trialEndDate,
                    daysRemaining: trialSubscription.daysRemaining()
                },
                message: 'Trial subscription activated successfully'
            });
        }

        // Check if user already has active subscription (ignore 'created' status - payment not completed)
        /* ALLOW NEW SUBSCRIPTION CREATION FOR UPGRADES
        const existingSubscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: 'User already has an active subscription' },
                { status: 400 }
            );
        }
        */

        // Clean up any abandoned 'created' subscriptions (older than 1 hour)
        await Subscription.deleteMany({
            userId,
            status: 'created',
            createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }
        });

        // Check if user has an existing trial subscription to upgrade
        const existingTrial = await Subscription.findOne({
            userId,
            status: 'trial',
            isTrialActive: true
        });

        // Match total count calculation
        // Monthly (1): 120 counts
        // 6 Months (6): 20 counts
        // Yearly (12): 10 counts
        const totalCount = Math.floor(120 / (plan.billingPeriod || 1));

        // Create Razorpay subscription
        const razorpaySubscription = await createSubscription({
            planId: plan.razorpayPlanId,
            totalCount: totalCount,
            // customer field removed as it causes API error "customer is/are not required"
            startTrial: false, // Start immediately without Razorpay trial
            notes: {
                userId,
                planType: planId,
                createdAt: new Date().toISOString(),
                userEmail,
                userName: userName,
                username: username
            }
        });

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.billingPeriod);

        let subscription;

        if (existingTrial) {
            // UPDATE existing trial record instead of creating new one
            // This prevents duplicate records in the database
            existingTrial.razorpaySubscriptionId = razorpaySubscription.id;
            existingTrial.razorpayPlanId = plan.razorpayPlanId;
            existingTrial.planType = planId;
            existingTrial.planAmount = plan.amount;
            existingTrial.billingCycle = plan.billingCycle;
            existingTrial.status = 'created'; // Will be activated by webhook
            existingTrial.isTrialActive = false;
            existingTrial.startDate = currentPeriodStart;
            existingTrial.currentPeriodStart = currentPeriodStart;
            existingTrial.currentPeriodEnd = currentPeriodEnd;
            existingTrial.billingPeriod = plan.billingPeriod;
            existingTrial.bonusMonths = plan.bonusMonths;
            existingTrial.totalMonths = plan.totalMonths;
            existingTrial.autoPayEnabled = true;

            await existingTrial.save();
            subscription = existingTrial;
        } else {
            // No existing trial, create new subscription record
            subscription = await Subscription.create({
                userId,
                username,
                userEmail: userEmail?.toLowerCase(),
                razorpaySubscriptionId: razorpaySubscription.id,
                razorpayPlanId: plan.razorpayPlanId,
                planType: planId,
                planAmount: plan.amount,
                billingCycle: plan.billingCycle,
                status: 'created', // Start as 'created', webhook will activate
                isTrialActive: false,
                isTrialUsed: !trialEligible, // Mark as used if trial was already used
                startDate: currentPeriodStart,
                currentPeriodStart,
                currentPeriodEnd,
                billingPeriod: plan.billingPeriod,
                bonusMonths: plan.bonusMonths,
                totalMonths: plan.totalMonths,
                autoPayEnabled: true
            });
        }

        return NextResponse.json({
            success: true,
            isTrial: false,
            subscription: {
                id: subscription._id,
                razorpaySubscriptionId: razorpaySubscription.id,
                status: subscription.status,
                planType: subscription.planType,
                planAmount: subscription.planAmount,
                shortUrl: razorpaySubscription.short_url, // Payment link
                currentPeriodEnd: subscription.currentPeriodEnd
            },
            message: 'Subscription created successfully'
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
