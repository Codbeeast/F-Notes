'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Brain,
    Bot,
    Check,
    Zap,
    Loader2,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Lock
} from 'lucide-react';
import LightRays from '@/components/ui/LightRays';

const EventDiscountPage = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handlePurchase = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Create order
            const response = await fetch('/api/subscription/create-onetime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: 'SPECIAL_OFFER' })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error || 'Failed to create order');
                setLoading(false);
                return;
            }

            // 2. Open Razorpay checkout modal
            const options = {
                key: data.razorpayKeyId,
                amount: data.amount * 100,
                currency: 'INR',
                name: 'Trading Journal Pro',
                description: '6-Month Event Special Discount',
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
            setError(err.message || 'Failed to process checkout');
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentResponse) => {
        setLoading(true);
        try {
            const response = await fetch('/api/subscription/verify-onetime', {
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

            setSuccess('Payment successful! Your account is upgraded.');
            setLoading(false);

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err) {
            setError('Payment verification failed');
            setLoading(false);
        }
    };

    if (!isUserLoaded) {
        return (
            <div className="h-screen w-screen bg-[#000000] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-[linear-gradient(180deg,#031457_0%,_#001122_60%,_#000000_100%)] text-white overflow-x-hidden flex flex-col items-center justify-center relative font-sans selection:bg-blue-600/30">
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

            <main className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center py-12 md:py-20">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative inline-block mb-8 group cursor-default"
                >
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
                            Event Special Discount
                        </span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-4xl md:text-7xl font-bold text-center mb-4 tracking-tight leading-tight drop-shadow-2xl"
                >
                    <span className="bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                        Forenotes × tradefluenza
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-[#e6ecffb2] text-center mb-12 max-w-2xl font-normal leading-relaxed"
                >
                    Enhance your trading with 6 months of premium AI insights, psychological tracking, and advanced analytics for just ₹1,799.
                </motion.p>

                <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-8 max-w-5xl">

                    {/* Pricing Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="md:col-span-5 relative group"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#2934FF] to-purple-600 rounded-3xl opacity-50 blur-md group-hover:opacity-80 transition-all duration-700"></div>
                        <div className="relative h-full bg-[#050510]/90 rounded-3xl p-8 flex flex-col items-center justify-center border border-white/10 backdrop-blur-xl shadow-2xl">

                            <div className="mb-6 relative text-center">
                                <span className="text-gray-500 text-lg line-through absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">₹3,594</span>
                                <div className="flex items-start justify-center gap-1">
                                    <span className="text-3xl font-medium text-[#2934FF] mt-2">₹</span>
                                    <span className="text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(41,52,255,0.5)]">1799</span>
                                </div>
                                <div className="mt-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-xs text-[#e6ecffb2] font-medium uppercase tracking-wide inline-flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-[#5C80FF] fill-current" />
                                    6 Months Access
                                </div>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>

                            <div className="flex flex-col gap-3 sm:gap-4 justify-start items-start w-full px-4">
                                {[
                                    '120 Fono Credits / month',
                                    'Full trading journal access',
                                    'Advanced analytics & insights',
                                    'AI-powered trade assistant',
                                    'Performance tracking',
                                    'Psychology analysis',
                                    'Priority support',
                                    'No auto-renewal (One-time)'
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-row justify-start items-start w-full gap-2">
                                        <img
                                            src="/images/img_component_1_white_a700_22x22.svg"
                                            alt="Check"
                                            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
                                        />
                                        <p className="text-sm sm:text-base font-inter font-normal text-gray-300 leading-relaxed">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Features and Action */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="md:col-span-7 flex flex-col justify-center gap-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: BarChart3,
                                    label: 'Advanced Analytics',
                                    sub: 'Unlimited tracking with deep insights',
                                    color: 'text-blue-400',
                                },
                                {
                                    icon: Bot,
                                    label: 'AI Trade Assistant',
                                    sub: 'Real-time pattern recognition checks',
                                    color: 'text-purple-400',
                                },
                                {
                                    icon: Brain,
                                    label: 'Psychology Dashboard',
                                    sub: 'Navigate emotions & manage discipline',
                                    color: 'text-indigo-400',
                                },
                                {
                                    icon: Lock,
                                    label: 'Secure Access',
                                    sub: 'Bank-grade encryption & privacy',
                                    color: 'text-cyan-400',
                                }
                            ].map((f, i) => (
                                <div key={i} className="group relative">
                                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative h-full flex items-start gap-4 p-5 bg-[#0A0A15]/50 border border-white/5 hover:border-[#2934FF]/30 rounded-2xl transition-all duration-300 backdrop-blur-sm">
                                        <div className={`w-12 h-12 rounded-xl bg-[#2934FF]/10 border border-[#2934FF]/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#2934FF]/20 transition-all duration-300`}>
                                            <f.icon className={`w-6 h-6 ${f.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors">{f.label}</h3>
                                            <p className="text-sm text-[#e6ecffb2] leading-snug">{f.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm overflow-hidden"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CTA Button */}
                        <div className="mt-4">
                            {!success ? (
                                <button
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className="relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-[1.02] w-full h-[60px] rounded-2xl sm:w-auto px-10 disabled:opacity-70 disabled:cursor-not-allowed group"
                                    style={{
                                        backgroundColor: 'rgb(41, 52, 255)',
                                        boxShadow: 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                                        border: '1.6px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-3 font-semibold text-lg">
                                            <Loader2 className="w-5 h-5 animate-spin" /> Processing Securely
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-3 font-semibold text-lg tracking-[-0.32px]">
                                            Unlock Premium Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full sm:w-auto h-[60px] px-10 bg-[#2934FF]/20 border border-[#2934FF]/50 rounded-2xl flex items-center justify-center gap-3 text-blue-200 font-semibold shadow-[0_0_20px_rgba(41,52,255,0.3)] animate-pulse"
                                >
                                    <ShieldCheck className="w-6 h-6" />
                                    <span className="text-lg">Account Upgraded</span>
                                </motion.div>
                            )}

                            <p className="mt-4 text-xs text-[#e6ecffb2] opacity-60 flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" /> Secure checkout powered by Razorpay.
                            </p>
                        </div>

                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default EventDiscountPage;
