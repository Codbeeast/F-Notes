"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    CheckCircle,
    Clock,
    Gift,
    Search,
    Activity,
    AlertCircle,
    Settings,
    ShieldCheck,
    XCircle,
    Loader2,
    Check,
    X,
    TrendingUp,
    ArrowRight,
    Sparkles,
    LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Tabs ─── */
const TABS = [
    { key: "referrals", label: "Network", icon: Activity },
    { key: "settings", label: "Configuration", icon: Settings },
    { key: "access", label: "Requests", icon: ShieldCheck },
];

export default function AdminDashboard() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("referrals");

    // Referrals state
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [rejecting, setRejecting] = useState(null);

    // Settings state
    const [settings, setSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        rewardMode: "fixed",
        fixedAmount: "",
        percentage: "",
        minPurchaseAmount: "",
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Access requests state
    const [accessRequests, setAccessRequests] = useState([]);
    const [accessLoading, setAccessLoading] = useState(false);
    const [processingRequest, setProcessingRequest] = useState(null);

    const handleLogout = async () => {
        try {
            await fetch("/api/admin/auth/logout", { method: "POST" });
            router.push("/admin/auth/sign-in");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Fetch referrals
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/referrals");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else if (res.status === 401 || res.status === 403) {
                    router.push("/admin/auth/sign-in");
                }
            } catch (error) {
                console.error("Failed to fetch admin referral data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [router]);

    // Fetch settings when settings tab is active
    useEffect(() => {
        if (activeTab !== "settings" || settings) return;
        async function fetchSettings() {
            setSettingsLoading(true);
            try {
                const res = await fetch("/api/admin/settings");
                if (res.ok) {
                    const json = await res.json();
                    setSettings(json);
                    setSettingsForm({
                        rewardMode: json.rewardMode || "fixed",
                        fixedAmount: json.fixedAmount != null ? String(json.fixedAmount / 100) : "",
                        percentage: json.percentage != null ? String(json.percentage) : "",
                        minPurchaseAmount: json.minPurchaseAmount != null ? String(json.minPurchaseAmount / 100) : "",
                    });
                } else if (res.status === 401 || res.status === 403) {
                    router.push("/admin/auth/sign-in");
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            } finally {
                setSettingsLoading(false);
            }
        }
        fetchSettings();
    }, [activeTab, settings, router]);

    // Fetch access requests when access tab is active
    useEffect(() => {
        if (activeTab !== "access") return;
        async function fetchAccess() {
            setAccessLoading(true);
            try {
                const res = await fetch("/api/admin/access-requests");
                if (res.ok) {
                    const json = await res.json();
                    setAccessRequests(json.requests || []);
                } else if (res.status === 401 || res.status === 403) {
                    router.push("/admin/auth/sign-in");
                }
            } catch (err) {
                console.error("Failed to fetch access requests:", err);
            } finally {
                setAccessLoading(false);
            }
        }
        fetchAccess();
    }, [activeTab, router]);

    // Save settings
    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const payload = {
                rewardMode: settingsForm.rewardMode,
                fixedAmount: Math.round(parseFloat(settingsForm.fixedAmount || "0") * 100),
                percentage: parseFloat(settingsForm.percentage || "0"),
                minPurchaseAmount: Math.round(parseFloat(settingsForm.minPurchaseAmount || "0") * 100),
            };
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const json = await res.json();
                setSettings(json.settings);
            }
        } catch (err) {
            console.error("Failed to save settings:", err);
        } finally {
            setSavingSettings(false);
        }
    };

    // Reject referral
    const handleRejectReferral = async (referralId) => {
        setRejecting(referralId);
        try {
            const res = await fetch("/api/admin/referrals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ referralId, action: "REJECTED" }),
            });
            if (res.ok) {
                setData((prev) => ({
                    ...prev,
                    referrals: prev.referrals.map((r) =>
                        r._id === referralId ? { ...r, status: "REJECTED" } : r
                    ),
                }));
            }
        } catch (err) {
            console.error("Failed to reject referral:", err);
        } finally {
            setRejecting(null);
        }
    };

    // Handle access request action
    const handleAccessAction = async (requestId, action) => {
        setProcessingRequest(requestId);
        try {
            const res = await fetch("/api/admin/access-requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });
            if (res.ok) {
                setAccessRequests((prev) =>
                    prev.map((r) =>
                        r._id === requestId ? { ...r, status: action } : r
                    )
                );
            }
        } catch (err) {
            console.error("Failed to process access request:", err);
        } finally {
            setProcessingRequest(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Referrals",
            value: data?.stats?.totalReferrals || 0,
            icon: Users,
            accent: "from-blue-500 to-cyan-400",
            bg: "bg-blue-500/10",
            iconColor: "text-blue-400",
            borderColor: "border-blue-500/20",
        },
        {
            label: "Pending",
            value: data?.stats?.pending || 0,
            icon: Clock,
            accent: "from-amber-500 to-orange-400",
            bg: "bg-amber-500/10",
            iconColor: "text-amber-400",
            borderColor: "border-amber-500/20",
        },
        {
            label: "Rewarded",
            value: data?.stats?.rewarded || 0,
            icon: CheckCircle,
            accent: "from-emerald-500 to-teal-400",
            bg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
            borderColor: "border-emerald-500/20",
        },
        {
            label: "Distributed",
            value: `₹${data?.stats?.totalRewardsDistributedRupees || "0.00"}`,
            icon: Gift,
            accent: "from-purple-500 to-pink-400",
            bg: "bg-purple-500/10",
            iconColor: "text-purple-400",
            borderColor: "border-purple-500/20",
        },
    ];

    const filteredReferrals =
        data?.referrals?.filter((ref) => {
            const s = searchTerm.toLowerCase();
            return (
                ref.referrer.name.toLowerCase().includes(s) ||
                ref.referrer.email.toLowerCase().includes(s) ||
                ref.referredUser.name.toLowerCase().includes(s) ||
                ref.referredUser.email.toLowerCase().includes(s) ||
                ref.referralCode.toLowerCase().includes(s)
            );
        }) || [];

    const statusConfig = {
        PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
        PURCHASE_COMPLETED: { label: "Purchased", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
        REWARDED: { label: "Rewarded", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
        REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
    };

    const accessStatusConfig = {
        REQUESTED: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
        APPROVED: { label: "Approved", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
        REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-300 font-sans">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0f1e]/80 backdrop-blur-2xl">
                <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push("/")}>
                        <img src="/forenotes.png" alt="ForeNotes" className="h-7 w-auto object-contain" />
                        <div className="h-5 w-px bg-white/10" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
                            Admin
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-lg hover:shadow-red-500/10"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </nav>

            {/* ── Main ── */}
            <main className="w-full flex-col flex items-center pt-10 pb-14">
                <div className="w-full max-w-5xl px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-10 flex flex-col items-center text-center"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                Referral Command Center
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm">
                            Monitor network growth, configure reward logic, and manage partner access.
                        </p>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex justify-center w-full mb-10">
                        <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 w-fit border border-white/[0.06]">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── TAB: Referrals ─── */}
                    <AnimatePresence mode="wait">
                        {activeTab === "referrals" && (
                            <motion.div
                                key="referrals"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {stats.map((stat, idx) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: idx * 0.06 }}
                                            className="group relative bg-[#111827] rounded-2xl border border-white/[0.06] px-6 py-7 hover:border-white/[0.12] transition-all duration-300 overflow-hidden"
                                        >
                                            {/* Gradient accent bar */}
                                            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.accent}`} />

                                            <div className="flex flex-col items-center text-center">
                                                <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.iconColor} border ${stat.borderColor} flex items-center justify-center mb-4`}>
                                                    <stat.icon className="w-5 h-5" />
                                                </div>
                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    {stat.label}
                                                </p>
                                                <p className="text-4xl font-extrabold text-white tracking-tight">
                                                    {stat.value}
                                                </p>
                                            </div>
                                            <TrendingUp className="absolute top-6 right-6 w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Table */}
                                <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden min-h-[350px] flex flex-col">
                                    {/* Table Header with Search */}
                                    <div className="px-6 py-5 border-b border-white/[0.06] space-y-4 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <Activity className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-semibold text-white leading-tight">Transaction Ledger</h2>
                                                    <p className="text-xs text-slate-500 mt-0.5">{filteredReferrals.length} records</p>
                                                </div>
                                            </div>
                                            <div className="relative w-72">
                                                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Search referrals..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all placeholder:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!filteredReferrals.length ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                                <AlertCircle className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <h3 className="text-sm font-medium text-slate-300 mb-1">No referrals found</h3>
                                            <p className="text-sm text-slate-500 max-w-xs">
                                                {searchTerm
                                                    ? "Try adjusting your search criteria."
                                                    : "Referrals will appear here once users start sharing links."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left min-w-[900px]">
                                                <thead>
                                                    <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                                                        <th className="py-3.5 pl-6 font-semibold">Referrer</th>
                                                        <th className="py-3.5 font-semibold">Referred User</th>
                                                        <th className="py-3.5 font-semibold">Code</th>
                                                        <th className="py-3.5 font-semibold">Status</th>
                                                        <th className="py-3.5 font-semibold">Reward</th>
                                                        <th className="py-3.5 font-semibold">Date</th>
                                                        <th className="py-3.5 pr-6 text-right font-semibold">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.03]">
                                                    {filteredReferrals.map((ref) => {
                                                        const sc = statusConfig[ref.status] || statusConfig.PENDING;
                                                        return (
                                                            <tr key={ref._id} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="py-4 pl-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                                                                            {ref.referrer.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-200 leading-tight">{ref.referrer.name}</p>
                                                                            <p className="text-[12px] text-slate-500 leading-tight mt-0.5">{ref.referrer.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-200 leading-tight">{ref.referredUser.name}</p>
                                                                        <p className="text-[12px] text-slate-500 leading-tight mt-0.5">{ref.referredUser.email}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4">
                                                                    <code className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
                                                                        {ref.referralCode}
                                                                    </code>
                                                                </td>
                                                                <td className="py-4">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                                        {sc.label}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4">
                                                                    <span className="text-sm font-semibold text-white">
                                                                        {ref.rewardAmount > 0 ? `₹${ref.rewardAmountRupees}` : "—"}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4">
                                                                    <span className="text-xs text-slate-500">
                                                                        {new Date(ref.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 pr-6 text-right">
                                                                    {ref.status === "PENDING" && (
                                                                        <button
                                                                            onClick={() => handleRejectReferral(ref._id)}
                                                                            disabled={rejecting === ref._id}
                                                                            className="text-xs font-medium text-red-400/60 hover:text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                                                        >
                                                                            {rejecting === ref._id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Reject"}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ─── TAB: Settings ─── */}
                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-2xl mx-auto w-full"
                            >
                                {settingsLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                    </div>
                                ) : (
                                    <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden">
                                        {/* Settings Header */}
                                        <div className="flex items-center gap-3 px-8 py-6 border-b border-white/[0.06]">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <Settings className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">Referral Settings</h2>
                                                <p className="text-xs text-slate-500 mt-0.5">Configure reward computation and thresholds</p>
                                            </div>
                                        </div>

                                        <div className="px-8 py-6 space-y-6">
                                            {/* Reward Mode */}
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-slate-300">Reward Computation</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { mode: "fixed", icon: Gift, desc: "Flat amount per referral" },
                                                        { mode: "percentage", icon: TrendingUp, desc: "% of purchase" },
                                                    ].map(({ mode, icon: Icon, desc }) => (
                                                        <button
                                                            key={mode}
                                                            onClick={() => setSettingsForm((f) => ({ ...f, rewardMode: mode }))}
                                                            className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${settingsForm.rewardMode === mode
                                                                ? "bg-emerald-500/[0.08] border-emerald-500/30 ring-1 ring-emerald-500/20"
                                                                : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Icon className={`w-5 h-5 ${settingsForm.rewardMode === mode ? "text-emerald-400" : "text-slate-500"}`} />
                                                                <span className={`text-sm font-semibold capitalize ${settingsForm.rewardMode === mode ? "text-emerald-400" : "text-slate-300"}`}>
                                                                    {mode}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500">{desc}</p>
                                                            {settingsForm.rewardMode === mode && (
                                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px bg-white/[0.04]" />

                                            {/* Fixed Amount */}
                                            {settingsForm.rewardMode === "fixed" && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300">Fixed Reward Amount</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                                                        <input
                                                            type="number"
                                                            value={settingsForm.fixedAmount}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, fixedAmount: e.target.value }))}
                                                            placeholder="30"
                                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all font-mono placeholder:text-slate-600"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500">Amount rewarded per successful referral</p>
                                                </div>
                                            )}

                                            {/* Percentage */}
                                            {settingsForm.rewardMode === "percentage" && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300">Reward Percentage</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={settingsForm.percentage}
                                                            onChange={(e) => setSettingsForm((f) => ({ ...f, percentage: e.target.value }))}
                                                            placeholder="10"
                                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all font-mono placeholder:text-slate-600"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">%</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">Percentage of purchase amount rewarded</p>
                                                </div>
                                            )}

                                            {/* Min Purchase */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Minimum Qualifying Purchase</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                                                    <input
                                                        type="number"
                                                        value={settingsForm.minPurchaseAmount}
                                                        onChange={(e) => setSettingsForm((f) => ({ ...f, minPurchaseAmount: e.target.value }))}
                                                        placeholder="100"
                                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all font-mono placeholder:text-slate-600"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500">Transactions below this amount will not trigger a reward</p>
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <div className="px-8 py-5 border-t border-white/[0.06] bg-white/[0.01]">
                                            <button
                                                onClick={handleSaveSettings}
                                                disabled={savingSettings}
                                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                                            >
                                                {savingSettings ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" /> Save Configuration
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ─── TAB: Access Requests ─── */}
                        {activeTab === "access" && (
                            <motion.div
                                key="access"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-4xl mx-auto w-full"
                            >
                                {accessLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                    </div>
                                ) : !accessRequests.length ? (
                                    <div className="flex flex-col items-center justify-center text-center py-24">
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                            <ShieldCheck className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-300 mb-1">No access requests</h3>
                                        <p className="text-sm text-slate-500 max-w-xs">
                                            Users will appear here once they request referral access.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden">
                                        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <h2 className="text-base font-semibold text-white">Partner Access Requests</h2>
                                            <span className="ml-auto text-xs font-medium text-slate-500 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                                                {accessRequests.length} total
                                            </span>
                                        </div>
                                        <div className="divide-y divide-white/[0.04]">
                                            {accessRequests.map((req) => {
                                                const asc = accessStatusConfig[req.status] || accessStatusConfig.REQUESTED;
                                                return (
                                                    <div
                                                        key={req._id}
                                                        className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {req.user.imageUrl ? (
                                                                <img src={req.user.imageUrl} alt="" className="w-10 h-10 rounded-xl border border-white/[0.08] object-cover" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center text-white font-semibold text-sm">
                                                                    {req.user.name?.charAt(0) || "?"}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-200">{req.user.name}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5">{req.user.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${asc.bg} ${asc.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${asc.dot}`} />
                                                                {asc.label}
                                                            </span>

                                                            {req.status === "REQUESTED" && (
                                                                <div className="flex gap-1.5">
                                                                    <button
                                                                        onClick={() => handleAccessAction(req._id, "APPROVED")}
                                                                        disabled={processingRequest === req._id}
                                                                        className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center"
                                                                        title="Approve"
                                                                    >
                                                                        {processingRequest === req._id ? (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAccessAction(req._id, "REJECTED")}
                                                                        disabled={processingRequest === req._id}
                                                                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
