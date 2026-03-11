'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const PaymentModal = ({ planId, onClose, onSuccess }) => {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [currentSubscription, setCurrentSubscription] = useState(null);

    // Fetch plan details and subscription status
    useEffect(() => {
        if (planId) {
            fetchPlanDetails();
            fetchSubscriptionStatus();
        }

        // Load Razorpay SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            const response = await fetch('/api/subscription/plans');
            const data = await response.json();
            if (data.success) {
                const plan = data.plans.find(p => p.id === planId);
                setPlanDetails(plan);
            }
        } catch (err) {
            console.error('Error fetching plan details:', err);
        }
    };

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await fetch('/api/subscription/status');
            const data = await response.json();
            if (data.success) {
                setSubscriptionStatus(data);
            }
        } catch (err) {
            console.error('Error fetching subscription status:', err);
        }
    };

    const handleStartTrial = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId,
                    startTrial: isTrialEligible
                })
            });

            const data = await response.json();

            if (data.success && data.isTrial) {
                // Trial activated successfully - redirect to success page
                window.location.href = '/payment/success';
            } else if (data.success && !data.isTrial) {
                // Store subscription for cleanup
                setCurrentSubscription(data.subscription);
                // Need to process payment
                initiateRazorpayCheckout(data.subscription);
            } else {
                setError(data.error || 'Failed to create subscription');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error creating subscription:', err);
        } finally {
            setLoading(false);
        }
    };

    const initiateRazorpayCheckout = (subscription) => {
        if (!window.Razorpay) {
            setError('Razorpay SDK not loaded. Please refresh the page.');
            return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            subscription_id: subscription.razorpaySubscriptionId,
            name: 'Forenotes',
            description: `${planDetails?.name} Subscription`,
            image: '/logo.png',
            handler: async function (response) {
                // Payment successful - show verification loader
                setVerifying(true);
                await verifyPayment(response);
            },
            prefill: {
                name: user?.fullName || '',
                email: user?.primaryEmailAddress?.emailAddress || ''
            },
            theme: {
                color: '#2934FF'
            },
            modal: {
                ondismiss: async function () {
                    // Clean up pending subscription when payment is cancelled
                    if (currentSubscription) {
                        try {
                            await fetch('/api/subscription/cancel-pending', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    subscriptionId: currentSubscription.id,
                                    razorpaySubscriptionId: currentSubscription.razorpaySubscriptionId
                                })
                            });
                        } catch (err) {
                            console.error('Error cleaning up pending subscription:', err);
                        }
                    }
                    setLoading(false);
                    console.log('Payment cancelled by user');
                }
            },
            config: {
                display: {
                    preferences: {
                        show_default_blocks: true
                    }
                }
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const verifyPayment = async (paymentData) => {
        try {
            const response = await fetch('/api/subscription/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (data.success && data.verified) {
                // Payment verified successfully - redirect to success page
                window.location.href = '/payment/success';
            } else {
                setVerifying(false);
                setError('Payment verification failed');
            }
        } catch (err) {
            setVerifying(false);
            setError('Payment verification error');
            console.error('Error verifying payment:', err);
        }
    };

    if (!planDetails) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isTrialEligible = subscriptionStatus?.isTrialEligible || false;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 max-w-lg w-full border border-blue-500/30 shadow-2xl animate-slideUp">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isTrialEligible ? 'Start Your Free Trial' : 'Subscribe Now'}
                    </h2>
                    <p className="text-gray-400">
                        {isTrialEligible
                            ? 'Get 7 days of full access - no payment required!'
                            : 'Continue with your subscription'}
                    </p>
                </div>

                {/* Plan Details */}
                <div className="bg-black/50 rounded-xl p-6 mb-6 border border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white">{planDetails.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{planDetails.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">₹{planDetails.amount}</div>
                            <div className="text-sm text-gray-400">{planDetails.period}</div>
                            {planDetails.monthlyEquivalent && (
                                <div className="text-xs text-blue-400 mt-1">
                                    ₹{planDetails.monthlyEquivalent}/mo effective
                                </div>
                            )}
                        </div>
                    </div>

                    {planDetails.bonusDisplay && (
                        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 mb-4">
                            <p className="text-sm text-white font-medium text-center">
                                🎁 {planDetails.bonusDisplay}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-300 mb-2">Includes:</p>
                        {planDetails.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-300">{feature.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trial Info */}
                {isTrialEligible && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm text-white font-medium mb-1">7-Day Free Trial</p>
                                <p className="text-xs text-gray-400">
                                    Access all premium features for 7 days. No payment required.
                                    After your trial ends, choose any plan to continue.
                                </p>
                                <p className="text-xs text-green-400 mt-1 font-medium">CANCEL ANYTIME</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={handleStartTrial}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    style={{
                        backgroundColor: loading ? 'rgb(55, 65, 81)' : 'rgb(41, 52, 255)',
                        boxShadow: loading ? 'none' : 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px'
                    }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <span>{isTrialEligible ? 'Start Free Trial' : 'Subscribe Now'}</span>
                    )}
                </button>

                {/* Cancel Link */}
                <button
                    onClick={onClose}
                    className="w-full text-center text-gray-400 hover:text-white text-sm mt-4 transition-colors"
                >
                    Maybe later
                </button>

                <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium flex items-center gap-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                        </svg>
                        Secured by Razorpay
                    </p>
                </div>
            </div>

            {/* Payment Verification Loader */}
            {verifying && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center">
                    <div className="text-center">
                        {/* Animated Loader */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                            </div>
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Text */}
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Verifying Payment...
                        </h3>
                        <p className="text-gray-400 mb-1">
                            Please wait while we confirm your payment
                        </p>
                        <p className="text-sm text-gray-500">
                            This will only take a moment
                        </p>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentModal;
