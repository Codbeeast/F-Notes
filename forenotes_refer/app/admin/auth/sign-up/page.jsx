"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Activity, Mail, Lock, User, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AdminSignUp() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        adminSecret: "",
    });

    const isSignupEnabled = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_ENABLED !== "false";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!isSignupEnabled) {
            setError("Admin signup is currently disabled.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            // Mocking a successful response for preview, assuming no backend is connected here
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || "Failed to create admin");
            }

            router.push("/admin");
            router.refresh();
        } catch (err) {
            setError(err.message || "Invalid initialization sequence.");
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants for smooth loading
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                  --color-neon-green: #00ff88;
                  --color-brand-blue: rgb(37, 99, 235);
                  --background: black;
                }
                body {
                  background-color: var(--background);
                  color: rgb(229, 231, 235);
                }
                .bg-grid {
                  background-image:
                    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                  background-size: 60px 60px;
                  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
                  -webkit-mask-image: radial-gradient(ellipse at center, black, transparent 80%);
                }
                .bg-glow-beam {
                  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, transparent 50%);
                  filter: blur(80px);
                }
                .glass-card-dark {
                  background: rgba(10, 10, 10, 0.6);
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
                }
                .btn-brand {
                  background: linear-gradient(135deg, #3b82f6, #2563eb);
                  color: white;
                  font-weight: 600;
                  border: none;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-brand:hover:not(:disabled) {
                  filter: brightness(1.2);
                  box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
                }
            `}} />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid z-0 opacity-60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-beam z-0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                        className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    >
                        <Activity className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                        {isSignupEnabled ? "Commander Initialization" : "Terminal Locked"}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isSignupEnabled
                            ? "Establish root access to the Referral Network"
                            : "New commander registration is currently restricted."}
                    </p>
                </div>

                <div className="glass-card-dark rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                    {(error || !isSignupEnabled) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm shadow-inner ${!isSignupEnabled
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-200"
                                    : "bg-red-500/10 border border-red-500/20 text-red-200"
                                }`}
                        >
                            <ShieldAlert className={`w-5 h-5 shrink-0 ${!isSignupEnabled ? "text-amber-400" : "text-red-400"}`} />
                            <p className="leading-relaxed">
                                {!isSignupEnabled
                                    ? "The administration portal is currently not accepting new registrations. Please contact the high command for clearance."
                                    : error}
                            </p>
                        </motion.div>
                    )}

                    {isSignupEnabled && (
                        <motion.form
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <div className="relative group">
                                    <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="peer w-full bg-slate-900/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:bg-slate-900/60 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                        placeholder="Bruce Wayne"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Admin Email</label>
                                <div className="relative group">
                                    <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="peer w-full bg-slate-900/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:bg-slate-900/60 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                        placeholder="admin@forenotes.com"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Secure Password</label>
                                <div className="relative group">
                                    <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="peer w-full bg-slate-900/40 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:bg-slate-900/60 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-1.5 pt-2">
                                <label className="text-[11px] font-bold text-[#00ff88] uppercase tracking-widest pl-1 flex items-center gap-2">
                                    Creation Secret Key
                                </label>
                                <div className="relative group">
                                    <KeyRound className="w-5 h-5 text-[#00ff88]/60 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#00ff88]" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.adminSecret}
                                        onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                                        className="peer w-full bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl py-3.5 pl-12 pr-4 text-[#00ff88] placeholder:text-[#00ff88]/30 focus:outline-none focus:bg-[#00ff88]/10 focus:border-[#00ff88]/50 focus:ring-4 focus:ring-[#00ff88]/20 transition-all font-mono tracking-wider"
                                        placeholder="Enter root setup key"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-brand w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Provisioning Access...
                                        </>
                                    ) : (
                                        <>
                                            Initialize Command Center
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </motion.form>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-sm text-slate-500">
                            Already have clearance?{" "}
                            <button
                                onClick={() => router.push("/admin/auth/sign-in")}
                                className="text-blue-400 font-semibold hover:text-blue-300 hover:underline underline-offset-4 transition-all"
                            >
                                Access terminal
                            </button>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}