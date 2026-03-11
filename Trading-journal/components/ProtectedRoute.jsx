'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import SubscriptionPrompt from './SubscriptionPrompt';

/**
 * ProtectedRoute - Wrapper component to protect routes requiring subscription
 * Checks both authentication AND subscription status
 */
export default function ProtectedRoute({ children, fallback = null }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [subscriptionCheck, setSubscriptionCheck] = useState({
    loading: true,
    hasAccess: false,
    isTrialEligible: false
  });

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isLoaded) return;

      // First check if user is authenticated
      if (!userId) {
        router.push('/sign-in');
        return;
      }

      // Then check subscription status
      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();

        setSubscriptionCheck({
          loading: false,
          hasAccess: data.hasAccess || false,
          isTrialEligible: data.isTrialEligible || false,
          status: data.status
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionCheck({
          loading: false,
          hasAccess: false,
          isTrialEligible: false
        });
      }
    };

    checkSubscription();
  }, [isLoaded, userId, router]);

  // Show loading state while checking
  if (!isLoaded || subscriptionCheck.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400/30 border-t-blue-400"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!userId) {
    return fallback || null;
  }

  // Authenticated but no subscription
  if (!subscriptionCheck.hasAccess) {
    return <SubscriptionPrompt isTrialEligible={subscriptionCheck.isTrialEligible} />;
  }

  // Has access - render children
  return children;
}