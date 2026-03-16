"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Gift,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  XCircle,
  Loader2,
  Activity,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
/* ---------------- Animated Counter ---------------- */
function AnimatedCounter({ value, prefix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }

    let start = display; // Start from current display value to animate smoothly between months
    if (start === end) return;

    const duration = 800;
    const diff = end - start;
    const increment = diff / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      // If we are moving up and passed the end, or moving down and passed the end
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        start = end;
        clearInterval(counter);
      }
      setDisplay(start);
    }, 16);

    return () => clearInterval(counter);
  }, [value]);

  // Determine if we need to show decimals (if the actual target value is a float)
  const isFloat = !Number.isInteger(Number(value));
  const finalDisplay = isFloat ? display.toFixed(2) : Math.floor(display).toLocaleString();

  return (
    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
      {prefix}
      {finalDisplay}
    </span>
  );
}

/* ---------------- Status Badge ---------------- */
function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PURCHASE_COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    REWARDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const labels = {
    PENDING: "Pending",
    PURCHASE_COMPLETED: "Purchased",
    REWARDED: "Rewarded",
    REJECTED: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.PENDING}`}
    >
      {labels[status] || status}
    </span>
  );
}

/* ---------------- Access Request Screen ---------------- */
function AccessRequestScreen({ requestPending, requestStatus, onRequestAccess, requesting, referralCode, origin }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <Navbar />
      <main className="relative z-10 mx-auto px-4 sm:px-8 lg:px-12 pt-36 pb-20 flex flex-col items-center justify-center gap-8 text-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center gap-6 max-w-lg bg-[#0f172a]/40 p-10 md:p-14 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle hover glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />

          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/10 via-indigo-500/20 to-purple-500/10 border border-white/10 flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
            <ShieldCheck className="w-12 h-12 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
          </div>

          <div className="space-y-3 relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-300 bg-clip-text text-transparent pb-1">
              Partner Program
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
              Join our exclusive network. Share your unique referral link to unlock premium rewards for every successful invitation.
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 relative z-10" />

          {/* Show referral code ONLY if they are approved (though AccessRequestScreen usually means they aren't, 
              adding safety check just in case this component is reused) */}
          {referralCode && requestStatus === 'APPROVED' && (
            <div className="w-full bg-[#0f172a]/80 border border-emerald-500/20 rounded-2xl px-6 py-5 relative z-10">
              <p className="text-emerald-400/70 text-xs font-bold uppercase tracking-wider mb-2">Your Referral Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-emerald-400 text-2xl font-black tracking-widest font-mono">{referralCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                  }}
                  className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all"
                >
                  Copy Code
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">Share this code with friends to unlock rewards.</p>
            </div>
          )}

          {requestPending || requestStatus === 'REQUESTED' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 bg-[#0f172a]/80 border border-amber-500/30 rounded-2xl px-6 py-5 w-full justify-center shadow-[0_0_30px_rgba(245,158,11,0.05)] relative z-10"
            >
              <div className="p-2.5 bg-amber-500/10 rounded-xl shrink-0">
                <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-amber-400 font-bold text-base">Application Under Review</p>
                <p className="text-amber-500/70 text-sm font-medium">We'll notify you once approved.</p>
              </div>
            </motion.div>
          ) : requestStatus === 'REJECTED' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 bg-[#0f172a]/80 border border-red-500/30 rounded-2xl px-6 py-5 w-full justify-center shadow-[0_0_30px_rgba(239,68,68,0.05)] relative z-10"
            >
              <div className="p-2.5 bg-red-500/10 rounded-xl shrink-0">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-red-500 font-bold text-base">Application Declined</p>
                <p className="text-red-500/70 text-sm font-medium">You do not meet the partner requirements at this time.</p>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={onRequestAccess}
              disabled={requesting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-lg py-4 px-10 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all transform active:scale-[0.98] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 w-full justify-center relative z-10 overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <div className="relative z-10 flex items-center gap-3">
                {requesting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Request VIP Access</span>
                    <Sparkles className="w-5 h-5 opacity-80" />
                  </>
                )}
              </div>
            </button>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function UserDashboard() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (isLoaded && !userId) router.push("/auth/sign-in");
  }, [isLoaded, userId, router]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      try {
        const res = await fetch("/api/referral");
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setError(false);
        } else {
          console.error("Failed to fetch referral data:", res.status);
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const [selectedMonth, setSelectedMonth] = useState("all");

  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    
    // Generate the last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthYear);
    }
    
    return months;
  }, []);

  const filteredReferrals = useMemo(() => {
    if (!data?.referrals) return [];
    if (selectedMonth === "all") return data.referrals;
    return data.referrals.filter(ref => {
      if (!ref.createdAt) return false;
      const date = new Date(ref.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthYear === selectedMonth;
    });
  }, [data?.referrals, selectedMonth]);

  const dynamicStats = useMemo(() => {
    if (selectedMonth === "all" && data?.stats) {
      return {
        total: data.stats.total,
        completed: data.stats.completed,
        pending: data.stats.pending,
        rewardBalanceRupees: data.rewardBalanceRupees || "0.00"
      };
    }

    let total = 0;
    let completed = 0;
    let pending = 0;
    let rewardPaise = 0;

    filteredReferrals.forEach(ref => {
      total++;
      if (ref.status === "PENDING") pending++;
      else if (ref.status === "PURCHASE_COMPLETED" || ref.status === "REWARDED") {
        completed++;
        rewardPaise += (ref.rewardAmount || 0);
      }
    });

    return {
      total,
      completed,
      pending,
      rewardBalanceRupees: (rewardPaise / 100).toFixed(2)
    };
  }, [filteredReferrals, data, selectedMonth]);

  const conversionRate = useMemo(() => {
    if (!dynamicStats.total) return 0;
    return Math.round((dynamicStats.completed / dynamicStats.total) * 100);
  }, [dynamicStats]);

  const handleCopy = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestAccess = async () => {
    setRequesting(true);
    try {
      const res = await fetch("/api/referral/request-access", {
        method: "POST",
      });
      if (res.ok) {
        setData((prev) => ({ ...prev, requestPending: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="w-12 h-12 border-4 border-[#0f172a] border-t-blue-500 rounded-full animate-spin relative z-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden flex-col gap-4">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />
        <XCircle className="w-16 h-16 text-red-500 mb-2 relative z-10" />
        <h2 className="text-2xl font-bold text-white relative z-10">Connection Error</h2>
        <p className="text-slate-400 max-w-sm text-center relative z-10">We couldn't load your partner dashboard. This is usually temporary (e.g. system clock sync issue).</p>
        <button onClick={() => window.location.reload()} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl border border-white/10 transition-colors relative z-10">
          Try Again
        </button>
      </div>
    );
  }

  // Access gate: show request screen if referral not enabled
  if (data?.accessRequired) {
    return (
      <AccessRequestScreen
        requestPending={data.requestPending}
        requestStatus={data.requestStatus}
        onRequestAccess={handleRequestAccess}
        requesting={requesting}
        referralCode={data.referralCode}
        origin={origin}
      />
    );
  }

  const statCards = [
    {
      label: "Total Referred",
      value: dynamicStats.total || 0,
      prefix: "",
      subInfo: "Total users invited",
      icon: Users,
      color: "blue",
    },
    {
      label: "Successful",
      value: dynamicStats.completed || 0,
      prefix: "",
      subInfo: `${conversionRate}% conversion rate`,
      icon: CheckCircle,
      color: "emerald",
    },
    {
      label: "Pending",
      value: dynamicStats.pending || 0,
      prefix: "",
      subInfo: "Awaiting completion",
      icon: Clock,
      color: "amber",
    },
    {
      label: "Total Earned",
      value: parseFloat(dynamicStats.rewardBalanceRupees),
      prefix: "₹",
      subInfo: "Reward balance",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const colorMap = {
    blue: {
      gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
      text: "text-blue-400",
      border: "border-blue-500/30",
      glow: "from-blue-500 to-indigo-500",
      dot: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]",
    },
    emerald: {
      gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "from-emerald-500 to-teal-500",
      dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
    },
    amber: {
      gradient: "from-amber-500/20 via-amber-400/10 to-transparent",
      text: "text-amber-400",
      border: "border-amber-500/30",
      glow: "from-amber-500 to-yellow-500",
      dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",
    },
    purple: {
      gradient: "from-purple-500/20 via-purple-400/10 to-transparent",
      text: "text-purple-400",
      border: "border-purple-500/30",
      glow: "from-purple-500 to-fuchsia-500",
      dot: "bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]",
    },
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 mx-auto px-4 sm:px-8 lg:px-12 pt-36 pb-20 flex flex-col gap-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 items-center text-center max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              Partner Program
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight bg-gradient-to-b from-white via-blue-50 to-slate-400 bg-clip-text text-transparent pb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Command Center
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed font-medium">
            Scale your network. Track performance. Earn exponential rewards.
          </p>
        </motion.div>

        {/* Filter Section */}
        {availableMonths.length > 0 && (
          <div className="flex items-center justify-between -mb-4">
            <h3 className="text-xl font-bold text-white tracking-tight">Performance</h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#0f172a] border border-white/10 text-slate-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors shadow-lg font-medium"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => {
                const [year, m] = month.split('-');
                const date = new Date(year, parseInt(m) - 1);
                return (
                  <option key={month} value={month}>
                    {date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {statCards.map((stat, index) => {
            const c = colorMap[stat.color];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative group"
              >
                {/* Glow layer */}
                <div
                  className={`absolute -inset-px bg-gradient-to-br ${c.glow} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 rounded-3xl`}
                />

                <div className="relative h-full bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-2xl border border-white/[0.08] rounded-[1.5rem] p-6 sm:p-7 group-hover:border-white/[0.15] transition-all duration-300 shadow-xl overflow-hidden">
                  {/* Subtle top inner shadow */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div
                    className={`w-14 h-14 rounded-[1.2rem] bg-gradient-to-br ${c.gradient} ${c.text} border ${c.border} flex items-center justify-center mb-6 shadow-inner relative`}
                  >
                    <div className={`absolute inset-0 opacity-20 blur-md rounded-full bg-current`} />
                    <stat.icon className="w-6 h-6 relative z-10" />
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase mb-2">
                    {stat.label}
                  </p>

                  <div className="drop-shadow-md">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
                    <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse shrink-0`} />
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {stat.subInfo}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Invite Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/50 via-[#0f172a]/80 to-[#020617] backdrop-blur-2xl border border-white/[0.08] hover:border-blue-500/30 transition-all rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between min-h-[420px] relative overflow-hidden group shadow-2xl">
            {/* Decorative background vectors */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000 -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />

            <div className="flex flex-col gap-6 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-2xl flex items-center justify-center shadow-inner relative">
                <div className="absolute inset-0 bg-blue-400/20 blur-md rounded-full" />
                <Gift className="text-blue-400 w-8 h-8 relative z-10 drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Your Referral Code
                </h2>
                <p className="text-slate-400 text-base leading-relaxed font-medium max-w-sm">
                  Share this code with friends. They can enter it during sign-up on ForeNotes to unlock rewards for both of you.
                </p>
              </div>

              <div className="mt-2 bg-[#020617]/80 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center justify-center relative overflow-hidden group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-transparent -translate-x-full group-hover/input:translate-x-0 transition-transform duration-700 pointer-events-none" />
                <div className="px-4 py-4 text-2xl font-mono text-blue-300 font-black tracking-[0.3em] select-all relative z-10 text-center">
                  {data?.referralCode}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={`mt-8 py-4 px-6 rounded-xl font-black text-[15px] uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] w-full relative z-10 overflow-hidden flex items-center justify-center gap-2 ${copied
                ? "bg-emerald-500 text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                : "bg-white text-slate-900 hover:bg-blue-50 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Code Copied!
                </>
              ) : (
                "Copy Referral Code"
              )}
            </button>
          </div>

          {/* Referrals Ledger */}
          <div className="lg:col-span-7 bg-[#0f172a]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] overflow-hidden min-h-[420px] flex flex-col shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="px-8 sm:px-10 py-8 border-b border-white/[0.04] flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Ledger</h2>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest bg-white/[0.05] text-slate-300 px-4 py-2 rounded-xl border border-white/[0.08] shadow-inner">
                {filteredReferrals?.length || 0} Records
              </div>
            </div>

            {!filteredReferrals?.length ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 py-20 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
                  <Users className="w-8 h-8 opacity-40 text-blue-400" />
                </div>
                <p className="text-lg font-bold text-white tracking-tight">
                  Awaiting Telemetry
                </p>
                <p className="text-sm text-slate-400 font-medium max-w-xs">
                  Your network graph is currently empty. Initialize distribution to populate ledger.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-[#020617]/60">
                    <tr className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                      <th className="px-6 sm:px-8 py-5">Referred User</th>
                      <th className="px-6 sm:px-8 py-5">Status</th>
                      <th className="px-6 sm:px-8 py-5">Plan</th>
                      <th className="px-6 sm:px-8 py-5 text-right">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filteredReferrals.map((ref) => (
                      <tr
                        key={ref._id}
                        className="hover:bg-white/[0.03] transition-colors group cursor-default"
                      >
                        <td className="px-6 sm:px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/10 flex items-center justify-center text-white font-black text-sm uppercase shrink-0 shadow-lg group-hover:border-white/20 transition-all">
                              {ref.referredUser?.firstName?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                                {ref.referredUser?.firstName || "Anonymous"}{" "}
                                {ref.referredUser?.lastName || ""}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                                {new Date(ref.createdAt).toLocaleDateString(undefined, {
                                  month: "short", day: "numeric", year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 py-5">
                          <StatusBadge status={ref.status} />
                        </td>
                        <td className="px-6 sm:px-8 py-5">
                          {ref.referredUserPlan?.planType ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-blue-300">
                                {ref.referredUserPlan.planType.replace(/_/g, ' ')}
                              </span>
                              {ref.referredUserPlan.planAmount > 0 && (
                                <span className="text-[11px] text-slate-500 mt-0.5">
                                  ₹{(ref.referredUserPlan.planAmount / 100).toFixed(0)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 sm:px-8 py-5 text-right">
                          <span className={`font-black tracking-tight text-[15px] ${ref.rewardAmount > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-slate-600'}`}>
                            {ref.rewardAmount > 0
                              ? `₹${ref.rewardAmountRupees}`
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}