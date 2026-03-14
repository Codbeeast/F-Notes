// lib/middleware/subscriptionCheck.js
import { connectDB } from '../db';
import { hasActiveAccess } from '../subscription';

/**
 * Check if user has active subscription or trial
 * Used in middleware to protect premium routes
 * @param {string} userId - User ID from Clerk
 * @returns {Promise<Object>} Subscription check result
 */
export async function checkSubscriptionAccess(userId) {
    try {
        if (!userId) {
            return {
                hasAccess: false,
                reason: 'unauthenticated',
                message: 'User not authenticated'
            };
        }

        await connectDB();
        const hasAccess = await hasActiveAccess(userId);

        if (hasAccess) {
            return {
                hasAccess: true,
                message: 'User has active subscription or trial'
            };
        }

        return {
            hasAccess: false,
            reason: 'no_subscription',
            message: 'No active subscription found'
        };
    } catch (error) {
        console.error('Error checking subscription access:', error);
        // In case of error, allow access to prevent blocking users
        return {
            hasAccess: true,
            reason: 'error',
            message: 'Error checking subscription, allowing access'
        };
    }
}

export default checkSubscriptionAccess;
