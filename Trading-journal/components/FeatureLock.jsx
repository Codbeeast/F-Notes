'use client';

import React from 'react';
import { Lock, Zap, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * FeatureLock Component - Displays a locked overlay for premium features
 * @param {Object} props
 * @param {string} props.featureName - Name of the locked feature
 * @param {string} props.description - Description of what the feature does
 * @param {string} props.reason - Reason for lock (trial_limitation, no_subscription, expired_subscription)
 * @param {number} props.daysRemaining - Days remaining in trial (if applicable)
 */
const FeatureLock = ({
    featureName = 'Premium Feature',
    description = 'Upgrade to unlock this feature',
    reason = 'no_subscription',
    daysRemaining = 0
}) => {
    const router = useRouter();

    const getMessage = () => {
        switch (reason) {
            case 'trial_limitation':
                return {
                    title: '🔒 Premium Feature',
                    subtitle: `${daysRemaining} days left in your trial`,
                    cta: 'Upgrade to unlock',
                    description: `${featureName} is available in our premium plans. Upgrade now to access this and other advanced features.`
                };
            case 'no_subscription':
                return {
                    title: '🔒 Premium Feature',
                    subtitle: 'Start your journey with a premium plan',
                    cta: 'Get Started',
                    description: `${featureName} requires a subscription. Choose a plan to unlock all features.`
                };
            case 'expired_subscription':
                return {
                    title: '🔒 Subscription Expired',
                    subtitle: 'Your access has ended',
                    cta: 'Renew Subscription',
                    description: 'Renew your subscription to continue using premium features.'
                };
            default:
                return {
                    title: '🔒 Premium Feature',
                    subtitle: 'Upgrade to unlock',
                    cta: 'View Plans',
                    description: description
                };
        }
    };

    const message = getMessage();

    const handleUpgradeClick = () => {
        router.push('/subscription');
    };

    return (
        <div className="relative w-full h-full min-h-[400px] backdrop-blur-sm bg-slate-900/95 rounded-2xl border border-blue-500/20 flex items-center justify-center p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Lock Icon Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Lock className="w-64 h-64 text-blue-400" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-md text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                            <Lock className="w-10 h-10 text-blue-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                            <Crown className="w-4 h-4 text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                        {message.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {message.subtitle}
                    </p>
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed">
                    {message.description}
                </p>

                {/* CTA Button */}
                <button
                    onClick={handleUpgradeClick}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group"
                >
                    <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {message.cta}
                </button>

                {/* Additional Info */}
                {reason === 'trial_limitation' && (
                    <p className="text-xs text-gray-500">
                        Enjoying your trial? Upgrade anytime to unlock all features.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FeatureLock;
