// lib/subscription.js
import { connectDB } from './db';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';

/**
 * Check if user has an active subscription or trial
 * @param {string} userId - User ID (Clerk ID)
 * @returns {Promise<Object|null>} Active subscription or null
 */
export async function getActiveSubscription(userId) {
    try {
        await connectDB();
        const subscription = await Subscription.findActiveSubscription(userId);
        return subscription;
    } catch (error) {
        console.error('Error fetching active subscription:', error);
        return null;
    }
}

/**
 * Check if user has access to premium features
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has access
 */
export async function hasActiveAccess(userId) {
    try {
        const subscription = await getActiveSubscription(userId);

        if (!subscription) {
            // No active subscription found
            // DO NOT grant access to 'created' status - payment not confirmed
            return false;
        }

        // Check if trial is active and not expired
        if (subscription.isTrialActive) {
            return !subscription.isTrialExpired();
        }

        // Check if subscription is active and not expired
        return subscription.status === 'active' && subscription.currentPeriodEnd > new Date();
    } catch (error) {
        console.error('Error checking access:', error);
        return false;
    }
}

/**
 * Create a new trial subscription for user
 * @param {string} userId - User ID
 * @param {string} planType - Plan type (TRIAL, 1_MONTH, etc.)
 * @param {string} username - Username (optional)
 * @param {string} userEmail - User email for trial tracking
 * @returns {Promise<Object>} Created subscription
 */
export async function createTrialSubscription(userId, planType = 'TRIAL', username = null, userEmail = null) {
    try {
        await connectDB();

        // Check if email already used trial (one trial per email lifetime)
        if (userEmail) {
            const emailTrialUsed = await Subscription.findOne({
                userEmail: userEmail.toLowerCase(),
                isTrialUsed: true
            });
            if (emailTrialUsed) {
                throw new Error('Trial already used for this email');
            }
        }

        // Also check by userId for backward compatibility
        const existingSubscription = await Subscription.findOne({ userId, isTrialUsed: true });
        if (existingSubscription) {
            throw new Error('Trial already used for this user');
        }

        // For TRIAL plan type, use default trial values
        // User will choose actual plan after trial ends
        let planDetails = {
            amount: 0,
            billingCycle: 'monthly',
            billingPeriod: 0,
            bonusMonths: 0,
            totalMonths: 0
        };

        // If a specific plan type is provided (not TRIAL), fetch plan details
        if (planType !== 'TRIAL') {
            const plan = await Plan.findOne({ planId: planType });
            if (plan) {
                planDetails = {
                    amount: plan.amount,
                    billingCycle: plan.billingCycle,
                    billingPeriod: plan.billingPeriod,
                    bonusMonths: plan.bonusMonths || 0,
                    totalMonths: plan.totalMonths || plan.billingPeriod
                };
            }
        }

        // Calculate trial dates
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

        // Create subscription with trial status
        const subscription = await Subscription.create({
            userId,
            username,
            userEmail: userEmail?.toLowerCase(), // Store email for trial tracking
            planType,
            planAmount: planDetails.amount,
            billingCycle: planDetails.billingCycle,
            billingPeriod: planDetails.billingPeriod,
            bonusMonths: planDetails.bonusMonths,
            totalMonths: planDetails.totalMonths,
            isTrialActive: true,
            isTrialUsed: true,
            trialStartDate,
            trialEndDate,
            status: 'trial',
            startDate: trialStartDate,
            currentPeriodStart: trialStartDate,
            currentPeriodEnd: trialEndDate,
            autoPayEnabled: false
        });

        return subscription;
    } catch (error) {
        console.error('Error creating trial subscription:', error);
        throw error;
    }
}

/**
 * Activate paid subscription after trial
 * @param {string} subscriptionId - MongoDB subscription ID
 * @param {Object} razorpayData - Razorpay subscription data
 * @returns {Promise<Object>} Updated subscription
 */
export async function activatePaidSubscription(subscriptionId, razorpayData) {
    try {
        await connectDB();

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();

        // Set end date based on plan
        const plan = await Plan.findOne({ planId: subscription.planType });
        if (plan) {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.billingPeriod);
        }

        // Update subscription
        subscription.razorpaySubscriptionId = razorpayData.id;
        subscription.razorpayPlanId = razorpayData.plan_id;
        subscription.isTrialActive = false;
        subscription.status = 'active';
        subscription.currentPeriodStart = currentPeriodStart;
        subscription.currentPeriodEnd = currentPeriodEnd;
        subscription.autoPayEnabled = true;
        subscription.paymentMethod = razorpayData.payment_method || null;

        // Set next billing date
        if (razorpayData.charge_at) {
            subscription.nextBillingDate = new Date(razorpayData.charge_at * 1000);
        }

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error activating paid subscription:', error);
        throw error;
    }
}

/**
 * Check if user is eligible for trial
 * @param {string} userId - User ID
 * @param {string} userEmail - User email (optional, for email-based check)
 * @returns {Promise<boolean>} True if eligible
 */
export async function isTrialEligible(userId, userEmail = null) {
    try {
        await connectDB();

        // Check by email first (one trial per email lifetime)
        if (userEmail) {
            const emailTrialUsed = await Subscription.findOne({
                userEmail: userEmail.toLowerCase(),
                isTrialUsed: true
            });
            if (emailTrialUsed) return false;
        }

        // Also check by userId for backward compatibility
        const subscription = await Subscription.findOne({ userId, isTrialUsed: true });
        return !subscription; // Eligible if no trial used yet
    } catch (error) {
        console.error('Error checking trial eligibility:', error);
        return false;
    }
}

/**
 * Check if user has access to a specific premium feature
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name (fono, notesSummary, etc.)
 * @returns {Promise<Object>} Access status and reason
 */
export async function hasFeatureAccess(userId, featureName) {
    try {
        const subscription = await getActiveSubscription(userId);

        // No active subscription - DO NOT check 'created' status
        // 'created' means payment not completed yet
        if (!subscription) {
            return { hasAccess: false, reason: 'no_subscription', isTrialEligible: await isTrialEligible(userId) };
        }

        // Features locked during trial period
        const trialLockedFeatures = ['fono', 'notesSummary'];

        // If user is on trial and feature is locked
        if (subscription.isTrialActive && trialLockedFeatures.includes(featureName)) {
            return {
                hasAccess: false,
                reason: 'trial_limitation',
                daysRemaining: subscription.daysRemaining()
            };
        }

        // Active paid subscription
        if (subscription.status === 'active' && subscription.currentPeriodEnd > new Date()) {
            return { hasAccess: true, reason: 'active_subscription' };
        }

        // Trial active for non-locked features
        if (subscription.isTrialActive && !subscription.isTrialExpired()) {
            return { hasAccess: true, reason: 'trial_active', daysRemaining: subscription.daysRemaining() };
        }

        return { hasAccess: false, reason: 'expired_subscription' };
    } catch (error) {
        console.error('Error checking feature access:', error);
        return { hasAccess: false, reason: 'error' };
    }
}

import { fetchSubscription } from '@/lib/razorpay';

/**
 * Get subscription status summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription status summary
 */
export async function getSubscriptionStatus(userId) {
    try {
        // First check for active/trial subscriptions
        let subscription = await getActiveSubscription(userId);

        if (subscription && subscription.razorpaySubscriptionId) {
            // Verify status with Razorpay (Active Check)
            try {
                const remoteSub = await fetchSubscription(subscription.razorpaySubscriptionId);

                // Map Razorpay status to our status
                // Note: 'completed' means all billing cycles done, but access continues until currentPeriodEnd
                // The logic below checks if period is still valid before denying access
                const statusMapping = {
                    'authenticated': 'active',
                    'active': 'active',
                    'pending': 'active',
                    'halted': 'past_due',
                    'cancelled': 'cancelled',
                    'completed': 'active', // Keep as active - period end date determines actual access
                    'expired': 'expired'
                };

                const mappedStatus = statusMapping[remoteSub.status] || remoteSub.status;

                // If status changed or period updated, sync DB
                let needsSave = false;

                if (subscription.status !== mappedStatus) {
                    // Special case: Don't override 'trial' with 'active' if we are tracking trial locally
                    // UNLESS remote says cancelled/expired/halted
                    const criticalStates = ['cancelled', 'expired', 'past_due', 'halted'];
                    if (subscription.status !== 'trial' || criticalStates.includes(mappedStatus)) {
                        console.log(`Syncing status for ${subscription.razorpaySubscriptionId}: ${subscription.status} -> ${mappedStatus}`);
                        subscription.status = mappedStatus;
                        needsSave = true;
                    }
                }

                if (remoteSub.current_end && new Date(remoteSub.current_end * 1000).getTime() !== subscription.currentPeriodEnd.getTime()) {
                    subscription.currentPeriodEnd = new Date(remoteSub.current_end * 1000);
                    needsSave = true;
                }

                if (needsSave) {
                    if (mappedStatus === 'cancelled' && !subscription.cancelledAt) {
                        subscription.cancelledAt = new Date();
                        subscription.cancelReason = 'Cancelled externally (Sync)';
                    }
                    await subscription.save();
                }

            } catch (err) {
                console.warn('Failed to sync with Razorpay:', err.message);
                // Continue with local data if sync fails
            }
        }

        if (!subscription || subscription.status === 'cancelled' || subscription.status === 'expired') {
            // Re-fetch to be sure or just use the updated object? 
            // If it became cancelled above, we might want to fall through to "no access" logic
            // BUT getActiveSubscription might perform specific query.
            // Let's just re-evaluate access based on the (possibly updated) 'subscription' object.

            // If strictly no access (e.g. expired/cancelled and period over)
            if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trial' && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd < new Date()))) {
                const isEligible = await isTrialEligible(userId);
                return {
                    hasAccess: false,
                    isTrialEligible: isEligible,
                    status: subscription ? subscription.status : 'no_subscription',
                    message: isEligible ? 'Start your 7-day free trial' : 'No active subscription'
                };
            }
        }

        const daysRemaining = subscription.daysRemaining();
        const isInTrial = subscription.isTrialActive;

        return {
            hasAccess: true,
            isInTrial,
            status: subscription.status,
            planType: subscription.planType,
            planAmount: subscription.planAmount,
            billingPeriod: subscription.billingPeriod,
            bonusMonths: subscription.bonusMonths,
            totalMonths: subscription.totalMonths,
            daysRemaining,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            nextBillingDate: subscription.nextBillingDate,
            autoPayEnabled: subscription.autoPayEnabled,
            message: isInTrial
                ? `${daysRemaining} days left in trial`
                : `Active until ${subscription.currentPeriodEnd.toLocaleDateString()}`
        };
    } catch (error) {
        console.error('Error getting subscription status:', error);
        return {
            hasAccess: false,
            status: 'error',
            message: 'Unable to fetch subscription status'
        };
    }
}

/**
 * Cancel user subscription
 * @param {string} userId - User ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated subscription
 */
export async function cancelUserSubscription(userId, reason = null) {
    try {
        await connectDB();

        const subscription = await Subscription.findOne({
            userId,
            status: { $in: ['trial', 'active'] }
        });

        if (!subscription) {
            throw new Error('No active subscription found');
        }

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancelReason = reason;

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
}

/**
 * Update subscription status from webhook
 * @param {string} razorpaySubscriptionId - Razorpay subscription ID
 * @param {string} status - New status
 * @param {Object} webhookData - Webhook payload
 * @returns {Promise<Object>} Updated subscription
 */
export async function updateSubscriptionFromWebhook(razorpaySubscriptionId, status, webhookData) {
    try {
        await connectDB();

        const subscription = await Subscription.findOne({ razorpaySubscriptionId });
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Map Razorpay status to our status
        // 'completed' maps to 'active' - period end date determines actual access
        const statusMapping = {
            'authenticated': 'active',
            'active': 'active',
            'pending': 'active',
            'halted': 'past_due',
            'cancelled': 'cancelled',
            'completed': 'active',
            'expired': 'expired'
        };

        subscription.status = statusMapping[status] || status;

        // Update period dates if available
        if (webhookData.current_start) {
            subscription.currentPeriodStart = new Date(webhookData.current_start * 1000);
        }
        if (webhookData.current_end) {
            subscription.currentPeriodEnd = new Date(webhookData.current_end * 1000);
        }
        if (webhookData.charge_at) {
            subscription.nextBillingDate = new Date(webhookData.charge_at * 1000);
        }

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error updating subscription from webhook:', error);
        throw error;
    }
}

const subscriptionUtils = {
    getActiveSubscription,
    hasActiveAccess,
    hasFeatureAccess,
    createTrialSubscription,
    activatePaidSubscription,
    isTrialEligible,
    getSubscriptionStatus,
    cancelUserSubscription,
    updateSubscriptionFromWebhook
};

export default subscriptionUtils;
