'use client';

import { useEffect } from 'use';
import { useUser } from '@clerk/nextjs';

/**
 * Component to auto-initialize trial for new users
 * Place this in your app layout or root component
 */
export default function TrialInitializer() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const initializeTrial = async () => {
            if (!isLoaded || !user) return;

            // Check if we've already attempted trial initialization for this user
            const trialInitKey = `trial_init_${user.id}`;
            const hasAttempted = localStorage.getItem(trialInitKey);

            if (hasAttempted) return;

            try {
                const response = await fetch('/api/user/init-trial', {
                    method: 'POST'
                });

                const data = await response.json();

                // Mark as attempted regardless of success/failure to prevent loops
                localStorage.setItem(trialInitKey, 'true');

                if (data.success) {
                    console.log('Trial activated:', data.message);
                }
            } catch (error) {
                console.error('Failed to initialize trial:', error);
                // Mark as attempted even on error
                localStorage.setItem(trialInitKey, 'true');
            }
        };

        initializeTrial();
    }, [user, isLoaded]);

    // This component renders nothing
    return null;
}
