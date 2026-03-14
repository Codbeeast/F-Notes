'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    Brain,
    Bot,
    Check,
    Zap,
    Loader2,
    Sparkles,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import LightRays from '@/components/ui/LightRays';

const PromoOfferPage = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [offerDetails, setOfferDetails] = useState(null);
    const [isValidated, setIsValidated] = useState(false);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) {
            setError('Please enter a promo code');
            return;
        }

        setValidating(true);
        setError('');

        try {
            const response = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promoCode: promoCode.trim() })
            });

            const data = await response.json();

            if (!response.ok || !data.valid) {
                setError(data.error || 'Invalid promo code');
                setIsValidated(false);
                return;
            }

            setOfferDetails(data.offer);
            setIsValidated(true);
            setError('');
        } catch (err) {
            setError('Failed to validate promo code');
            setIsValidated(false);
        } finally {
            setValidating(false);
        }
    };

    const handleRedeemPromo = async () => {
        if (!isValidated || !promoCode.trim()) {
            setError('Please validate your promo code first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/promo/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promoCode: promoCode.trim() })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error || 'Failed to redeem promo');
                setLoading(false);
                return;
            }

            const options = {
                key: data.razorpayKeyId,
                amount: data.amount * 100,
                currency: data.currency,
                name: 'Trading Journal Pro',
                description: '6-Month Special Promo Offer',
                order_id: data.orderId,
                prefill: data.prefill,
                theme: {
                    color: '#2934FF' // App brand color
                },
                handler: async function (response) {
                    await verifyPayment(response);
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setError('Payment cancelled');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            setError(err.message || 'Failed to process redemption');
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentResponse) => {
        try {
            const response = await fetch('/api/promo/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature
                })
            });

            const data = await response.json();

            if (!response.ok || !data.verified) {
                setError(data.error || 'Payment verification failed');
                setLoading(false);
                return;
            }

            setSuccess('Payment successful! Redirecting...');
            setShowModal(false);
            setLoading(false);

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err) {
            setError('Payment verification failed');
            setLoading(false);
        }
    };

    const resetModal = () => {
        setPromoCode('');
        setError('');
        setIsValidated(false);
        setOfferDetails(null);
    };

    if (!isUserLoaded) {
        return (
            <div className="h-screen w-screen bg-[#000000] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[linear-gradient(180deg,#031457_0%,_#001122_60%,_#000000_100%)] text-white overflow-hidden flex flex-col items-center justify-center relative font-sans selection:bg-blue-600/30">
            {/* Light Rays Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#4A90E2"
                    raysSpeed={0.5}
                    lightSpread={1.5}
                    rayLength={3.0}
                    pulsating={true}
                    className="opacity-70"
                />
            </div>

            <main className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center pt-8">

                {/* Brand Badge */}
                <div className="relative inline-block mb-8 group cursor-default">
                    <div
                        className="absolute overflow-hidden rounded-[22px] opacity-100 transition-opacity"
                        style={{
                            inset: '-1px -1px -1px -2px',
                            background: 'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                            zIndex: 1,
                        }}
                    />
                    <div className="relative bg-black/80 backdrop-blur-sm rounded-[22px] px-4 py-1.5 flex items-center gap-2" style={{ zIndex: 2 }}>
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span
                            className="inline-block font-semibold tracking-[-0.02em] text-sm uppercase"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                backgroundImage: 'linear-gradient(105deg, rgb(138, 165, 255) 22%, rgb(133, 77, 255) 180%)',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Exclusive Access
                        </span>
                    </div>
                </div>

                {/* Hero Title */}
                <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 tracking-tight leading-tight drop-shadow-2xl">
                    <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        Unlock Pro Trading
                    </span>
                </h1>

                <p className="text-lg text-[#e6ecffb2] text-center mb-10 max-w-xl font-normal leading-relaxed">
                    Get 6 months of premium AI insights and psychology tracking.
                </p>

                {/* Content Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8 scale-95 origin-top">

                    {/* Pricing Card */}
                    <div className="md:col-span-5 relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#2934FF] to-purple-600 rounded-2xl opacity-50 blur-sm group-hover:opacity-80 transition-all duration-700"></div>
                        <div className="relative h-full bg-[#050510]/90 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10 backdrop-blur-xl shadow-2xl">

                            <div className="mb-5 relative text-center">
                                <span className="text-gray-500 text-sm line-through absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">₹2,999</span>
                                <div className="flex items-start justify-center gap-1">
                                    <span className="text-2xl font-medium text-[#2934FF] mt-2">₹</span>
                                    <span className="text-7xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(41,52,255,0.5)]">1</span>
                                </div>
                                <div className="mt-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-[#e6ecffb2] font-medium uppercase tracking-wide">
                                    One-time payment
                                </div>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3"></div>

                            <div className="space-y-2 w-max mx-auto">
                                {[
                                    '6 Months Full Access',
                                    'Instant Activation',
                                    'No Recurring Fees'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-[#e6ecff]">
                                        <div className="w-4 h-4 rounded-full bg-[#2934FF]/20 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-[#5C80FF]" />
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="md:col-span-7 flex flex-col justify-between gap-3">
                        {[
                            {
                                icon: BarChart3,
                                label: 'Advanced Analytics',
                                sub: 'Unlimited localized tracking with deep insights',
                                color: 'text-blue-400',
                            },
                            {
                                icon: Bot,
                                label: 'AI Trade Assistant',
                                sub: 'Real-time pattern recognition & strategy checks',
                                color: 'text-purple-400',
                            },
                            {
                                icon: Brain,
                                label: 'Psychology Dashboard',
                                sub: 'Track emotions & discipline for every trade',
                                color: 'text-indigo-400',
                            }
                        ].map((f, i) => (
                            <div key={i} className="group relative flex-1">
                                <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative h-full flex items-center gap-4 p-4 bg-[#0A0A15]/50 border border-white/5 hover:border-[#2934FF]/30 rounded-xl transition-all duration-300 backdrop-blur-sm">
                                    <div className={`w-10 h-10 rounded-lg bg-[#2934FF]/10 border border-[#2934FF]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                                        <f.icon className={`w-5 h-5 ${f.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white mb-0.5">{f.label}</h3>
                                        <p className="text-xs text-[#e6ecffb2]">{f.sub}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Button - Exact Brand Style */}
                <div className="mt-8 w-full max-w-xs flex justify-center">
                    {!success ? (
                        <button
                            onClick={() => { resetModal(); setShowModal(true); }}
                            className="relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 w-full h-[52px] rounded-[10px] sm:w-auto px-8"
                            style={{
                                backgroundColor: 'rgb(41, 52, 255)',
                                boxShadow: 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                                border: '1.6px solid rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            <span className="flex items-center gap-3 font-semibold text-base tracking-[-0.32px]">
                                Redeem Offer <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                    ) : (
                        <div className="w-full h-[52px] bg-[#2934FF]/20 border border-[#2934FF]/50 rounded-[10px] flex items-center justify-center gap-2 text-blue-200 font-semibold animate-pulse">
                            <ShieldCheck className="w-5 h-5" />
                            <span>Activated Successfully</span>
                        </div>
                    )}
                </div>

                <p className="mt-6 text-[10px] text-center text-[#e6ecffb2] opacity-60">
                    Terms apply. Offer valid for one-time use per account.
                </p>

            </main>

            {/* Premium Modal - Clean & Dark */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => !loading && setShowModal(false)}
                    />

                    <div className="relative w-full max-w-sm bg-[#050510] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
                        <button
                            onClick={() => !loading && setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#2934FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2934FF]/20">
                                <Zap className="w-8 h-8 text-[#5C80FF]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Redeem Access</h3>
                            <p className="text-xs text-[#e6ecffb2]">Enter your exclusive promo code</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => {
                                    setPromoCode(e.target.value.toUpperCase());
                                    setIsValidated(false);
                                    setError('');
                                }}
                                placeholder="PROMO CODE"
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-3.5 text-center text-xl tracking-[0.2em] font-mono text-white placeholder-gray-700 outline-none focus:border-[#2934FF]/50 transition-all uppercase"
                                disabled={loading}
                                autoFocus
                            />

                            {isValidated && offerDetails && (
                                <div className="p-4 bg-[#2934FF]/10 border border-[#2934FF]/20 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#5C80FF]" />
                                        <span className="text-white font-medium">Applied: 6 Months</span>
                                    </div>
                                    <span className="text-[#5C80FF] font-bold">₹1.00</span>
                                </div>
                            )}

                            <button
                                onClick={isValidated ? handleRedeemPromo : handleValidatePromo}
                                disabled={loading || validating || !promoCode}
                                className="w-full h-[48px] rounded-[10px] font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                                style={isValidated ? {
                                    backgroundColor: 'rgb(41, 52, 255)',
                                    color: 'white',
                                    boxShadow: '0 4px 20px rgba(41, 52, 255, 0.3)'
                                } : {
                                    backgroundColor: 'white',
                                    color: 'black',
                                }}
                            >
                                {loading || validating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isValidated ? (
                                    'Pay ₹1 & Activate'
                                ) : (
                                    'Validate Code'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoOfferPage;
