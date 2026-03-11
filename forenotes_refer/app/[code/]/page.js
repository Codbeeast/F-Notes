"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, TrendingUp, Shield, Zap, BarChart3, User, Play } from "lucide-react";

export default function ReferralPage({ params }) {
    const { code } = use(params);
    const [status, setStatus] = useState("loading"); // loading, valid, invalid, error
    const [referrer, setReferrer] = useState(null);
    const customEasing = [0.4, 0, 0.2, 1];

    useEffect(() => {
        const validateCode = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/referral/validate?code=${code}`
                );
                const data = await response.json();

                if (response.ok && data.valid) {
                    setReferrer(data.referrer);
                    setStatus("valid");
                } else {
                    setStatus("invalid");
                }
            } catch (error) {
                console.error("Validation error:", error);
                setStatus("error");
            }
        };

        if (code) {
            validateCode();
        }
    }, [code, code]);

    const handleClaim = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/auth/sign-up?ref=${code}`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                ease: customEasing,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: customEasing }
        },
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center bg-[#020617] overflow-hidden font-sans">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[100%] bg-glow-beam pointer-events-none opacity-40" />
            </div>

            {/* Navbar (Internal version for landing) */}
            <nav className="relative z-20 w-full max-w-7xl px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-white w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight text-white uppercase">ForeNotes</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="/" className="hover:text-white transition-colors text-glow-blue">Home</a>
                    <a href="#" className="hover:text-white transition-colors">ForeNotes Affiliate System</a>
                </div>

                <div className="flex items-center gap-4">
                    <button className="btn-brand px-6 py-2 rounded-lg text-sm">
                        Dashboard
                    </button>
                </div>
            </nav>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-2xl px-6 pt-12 flex flex-col items-center flex-grow"
            >
                <div className="glass-card-dark rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden w-full border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                    <AnimatePresence mode="wait">
                        {status === "loading" && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-16"
                            >
                                <Loader2 className="w-14 h-14 text-blue-500 animate-spin mb-6" />
                                <p className="text-gray-muted text-lg animate-pulse">Authenticating Referral...</p>
                            </motion.div>
                        )}

                        {status === "valid" && (
                            <motion.div
                                key="valid"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8 text-center"
                            >
                                <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
                                        <User className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                                        Exclusive <br /> <span className="text-glow-blue text-blue-400">Invitation</span>
                                    </h1>
                                </motion.div>

                                <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
                                    {referrer?.name ? (
                                        <>You&apos;ve been invited by <span className="text-white font-semibold">{referrer.name}</span> to experience ForeNotes AI Journaling.</>
                                    ) : (
                                        "You've been invited to experience the next generation of AI-driven trading journaling."
                                    )}
                                </motion.p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
                                    <div className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <Zap className="w-6 h-6 text-blue-400" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 opacity-60">Speed</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <BarChart3 className="w-6 h-6 text-blue-400" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 opacity-60">Insights</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <Shield className="w-6 h-6 text-blue-400" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 opacity-60">Elite</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleClaim}
                                    className="btn-brand w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-xl shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-6 h-6" />
                                </motion.button>

                                <p className="text-sm text-gray-500">
                                    Join 1,200+ elite traders today.
                                </p>
                            </motion.div>
                        )}

                        {(status === "invalid" || status === "error") && (
                            <motion.div
                                key="invalid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-8 py-12"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-bold text-white tracking-tight">Access Denied</h1>
                                    <p className="text-gray-400 text-lg max-w-sm mx-auto">
                                        This referral code is invalid or has expired. Join the waitlist or contact support.
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/auth/sign-up`}
                                    className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    Join ForeNotes Directly
                                    <ArrowRight className="w-6 h-6" />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Improved Social Proof at bottom of card context */}
                <motion.div
                    variants={itemVariants}
                    className="mt-16 w-full grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center opacity-40 mb-20"
                >
                    {["CLARITY", "DISCIPLINE", "INSIGHT", "PSYCHOLOGY", "STRATEGY"].map((word) => (
                        <span key={word} className="text-[10px] font-bold tracking-[0.2em] text-white text-center">
                            {word}
                        </span>
                    ))}
                </motion.div>
            </motion.div>

            {/* Decorative Blob */}
            <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[150%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
        </div>
    );
}
