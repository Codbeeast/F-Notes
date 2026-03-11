"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";

export default function AdminSignIn() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to authenticate");
            }

            router.push("/admin");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-grid-signin {
                  background-image:
                    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                  background-size: 60px 60px;
                  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
                  -webkit-mask-image: radial-gradient(ellipse at center, black, transparent 80%);
                }
            `}} />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-signin opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#10b981]/[0.05] rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#10b981]/10">
                        <ShieldCheck className="w-8 h-8 text-[#34d399]" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                        Command Access
                    </h1>
                    <p className="text-[#94a3b8] text-sm">
                        Enter your credentials to access the terminal
                    </p>
                </div>

                <div className="bg-[#111827] border border-white/[0.06] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent" />

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider pl-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="w-5 h-5 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#34d399]" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0a0f1e] border border-white/[0.06] rounded-xl py-3 pl-12 pr-4 text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#10b981]/30 focus:border-[#10b981]/50 transition-all font-medium"
                                    placeholder="Batman@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider pl-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="w-5 h-5 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#34d399]" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#0a0f1e] border border-white/[0.06] rounded-xl py-3 pl-12 pr-4 text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#10b981]/30 focus:border-[#10b981]/50 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#34d399] text-[#0f172a] py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-[#10b981]/25"
                        >
                            {isLoading ? "Authenticating..." : "Grant Access"}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/[0.06]">
                        <p className="text-sm text-[#94a3b8]">
                            Need a root account?{" "}
                            <button onClick={() => router.push("/admin/auth/sign-up")} className="text-[#34d399] font-semibold hover:text-[#34d399] transition-colors">
                                Initialize commander
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
