'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook to guard routes based on subscription status
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireSubscription - Whether route requires active subscription
 * @param {string[]} options.exemptPaths - Paths that don't require subscription check
 * @returns {Object} Subscription status and loading state
 */
export function useSubscriptionGuard(options = {}) {
    const { requireSubscription = true, exemptPaths = [] } = options;
    const { user, isLoaded: userLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [subscriptionStatus, setSubscriptionStatus] = useState({
        hasAccess: false,
        loading: true,
        status: null
    });

    useEffect(() => {
        const checkSubscription = async () => {
            // Wait for user to load
            if (!userLoaded) return;

            // Check if current path is exempt
            const isExempt = exemptPaths.some(path => pathname.startsWith(path));
            if (isExempt) {
                setSubscriptionStatus({ hasAccess: true, loading: false, status: 'exempt' });
                return;
            }

            // If no user and subscription is required, redirect to sign-in
            if (!user && requireSubscription) {
                router.push('/sign-in');
                return;
            }

            // If user exists, check subscription
            if (user) {
                try {
                    const response = await fetch('/api/subscription/status');
                    const data = await response.json();

                    setSubscriptionStatus({
                        ...data,
                        loading: false
                    });

                    // Redirect to subscription page if no access and not already there
                    if (!data.hasAccess && !pathname.startsWith('/subscription') && requireSubscription) {
                        router.push('/subscription');
                    }
                } catch (error) {
                    console.error('Error checking subscription:', error);
                    setSubscriptionStatus({
                        hasAccess: false,
                        loading: false,
                        status: 'error'
                    });
                }
            } else {
                setSubscriptionStatus({
                    hasAccess: false,
                    loading: false,
                    status: 'no_user'
                });
            }
        };

        checkSubscription();
    }, [user, userLoaded, router, pathname, requireSubscription, exemptPaths]);

    return subscriptionStatus;
}

/**
 * Component wrapper that enforces subscription requirements
 * Shows loading state while checking subscription
 */
export function SubscriptionGuard({ children, exemptPaths = [] }) {
    const subscriptionStatus = useSubscriptionGuard({
        requireSubscription: true,
        exemptPaths: ['/subscription', '/profile', '/payment', ...exemptPaths]
    });

    if (subscriptionStatus.loading) {
        return (
            <div className="min-h-screen w-full bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return children;
}
