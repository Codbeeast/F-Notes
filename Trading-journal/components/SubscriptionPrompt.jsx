'use client';

import React from 'react';
import { Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * SubscriptionPrompt Component - Friendly prompt to encourage subscription
 * @param {Object} props
 * @param {boolean} props.isTrialEligible - Whether user is eligible for trial
 * @param {string} props.variant - Display variant (full, compact)
 */
const SubscriptionPrompt = ({
    isTrialEligible = false,
    variant = 'full'
}) => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/subscription');
    };

    const handleViewProfile = () => {
        router.push('/profile');
    };

    if (variant === 'compact') {
        return (
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-white font-medium text-sm">Premium Feature</p>
                            <p className="text-gray-400 text-xs">Upgrade to unlock</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGetStarted}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-2xl w-full">
                <div className="backdrop-blur-xl bg-slate-900/80 border border-blue-500/30 rounded-2xl p-8 md:p-12 shadow-2xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                        {isTrialEligible ? 'Start Your Free Trial' : 'Unlock Full Access'}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-300 text-center text-lg mb-8 leading-relaxed">
                        {isTrialEligible
                            ? 'Get started with a 7-day free trial and experience the power of AI-driven trading insights.'
                            : 'Subscribe to continue using our advanced trading journal features and AI-powered analytics.'}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                        {[
                            'Advanced trade tracking & analytics',
                            'Performance insights & reports',
                            'Leaderboard & streak tracking',
                            isTrialEligible ? '7 days free, cancel anytime' : 'Unlock all premium features'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span className="text-gray-300">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Premium Features Callout */}
                    {isTrialEligible && (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-yellow-200 font-medium text-sm mb-1">Premium Features</p>
                                    <p className="text-gray-300 text-sm">
                                        Unlock Fono AI and Psychology Analysis after upgrading from trial
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleGetStarted}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group"
                        >
                            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {isTrialEligible ? 'Start Free Trial' : 'View Plans'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={handleViewProfile}
                            className="w-full px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-gray-300 font-medium rounded-xl transition-all duration-300 border border-slate-700"
                        >
                            Manage Account
                        </button>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center text-gray-500 text-sm mt-6">
                        {isTrialEligible
                            ? 'No credit card required for trial'
                            : 'Manage your subscription anytime from your profile'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPrompt;
