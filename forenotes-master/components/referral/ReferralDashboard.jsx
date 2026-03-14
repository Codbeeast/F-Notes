"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Gift,
    Users,
    Clock,
    CheckCircle,
    Wallet,
    Copy,
    Share2,
    Antenna,
    Rocket,
    Link as LinkIcon,
    UserPlus,
    IndianRupee,
    RefreshCw,
    Check,
    Banknote
} from "lucide-react";

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        bg: "rgba(255, 193, 7, 0.15)",
        color: "#ffc107",
        border: "rgba(255, 193, 7, 0.3)",
    },
    PURCHASE_COMPLETED: {
        label: "Purchased",
        bg: "rgba(33, 150, 243, 0.15)",
        color: "#2196f3",
        border: "rgba(33, 150, 243, 0.3)",
    },
    REWARDED: {
        label: "Rewarded",
        bg: "rgba(0, 255, 136, 0.15)",
        color: "#00ff88",
        border: "rgba(0, 255, 136, 0.3)",
    },
};

export default function ReferralDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [error, setError] = useState(null);

    const fetchReferralData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/referral");
            if (!res.ok) throw new Error("Failed to fetch referral data");
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    const referralLink =
        data?.referralCode && typeof window !== "undefined"
            ? `${window.location.origin}/refer/${data.referralCode}`
            : "";

    const copyToClipboard = async (text, setter) => {
        try {
            await navigator.clipboard.writeText(text);
            setter(true);
            setTimeout(() => setter(false), 2500);
        } catch {
            const input = document.createElement("input");
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setter(true);
            setTimeout(() => setter(false), 2500);
        }
    };

    const handleCopy = () => copyToClipboard(referralLink, setCopied);
    const handleCopyCode = () => copyToClipboard(data?.referralCode || "", setCodeCopied);

    const handleShare = async () => {
        const shareData = {
            title: "Join Trading Journal",
            text: `Hey! Use my referral code ${data?.referralCode} to sign up for Trading Journal. We both win!`,
            url: referralLink,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                handleCopy();
            }
        } catch {
            // user cancelled
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.container, textAlign: "center", padding: "3rem" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ margin: "0 auto", width: 40, height: 40 }}
                >
                    <RefreshCw size={40} color="#00ff88" opacity={0.5} />
                </motion.div>
                <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "1rem" }}>
                    Loading referral data...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.container}
            >
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Gift size={22} color="#818cf8" />
                        <h2 style={styles.title}>Referral Program</h2>
                    </div>
                    <p style={styles.subtitle}>
                        Invite friends and earn ₹30 for every successful referral!
                    </p>
                </div>
                <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                    <Antenna size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.25rem", marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                        Unable to load your referral data right now
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginBottom: "1.25rem" }}>
                        This might be a temporary issue. Give it another try!
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchReferralData}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: "linear-gradient(135deg, #818cf8, #6366f1)",
                            border: "none",
                            borderRadius: 10,
                            padding: "0.6rem 1.75rem",
                            color: "#fff",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                    >
                        <RefreshCw size={18} />
                        Try Again
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    if (!data) return null;

    const stats = [
        {
            label: "Total Referred",
            value: data.stats?.totalReferred ?? 0,
            icon: <Users size={22} />,
            color: "#818cf8",
        },
        {
            label: "Pending",
            value: data.stats?.pending ?? 0,
            icon: <Clock size={22} />,
            color: "#ffc107",
        },
        {
            label: "Rewarded",
            value: data.stats?.rewarded ?? 0,
            icon: <CheckCircle size={22} />,
            color: "#00ff88",
        },
        {
            label: "Reward Balance",
            value: `₹${data.rewardBalance ?? 0}`,
            icon: <Wallet size={22} />,
            color: "#f59e0b",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.container}
        >
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Gift size={22} color="#818cf8" />
                    <h2 style={styles.title}>Referral Program</h2>
                </div>
                <p style={styles.subtitle}>
                    Invite friends and earn ₹30 for every successful referral!
                </p>
            </div>

            {/* Referral Code Badge */}
            {data.referralCode && (
                <div style={styles.codeSection}>
                    <label style={styles.linkLabel}>YOUR REFERRAL CODE</label>
                    <div style={styles.codeRow}>
                        <div style={styles.codeBadge}>
                            <span style={styles.codeText}>{data.referralCode}</span>
                        </div>
                        <motion.button
                            onClick={handleCopyCode}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                ...styles.smallBtn,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: "rgba(255,255,255,0.04)",
                                color: codeCopied ? "#00ff88" : "rgba(255,255,255,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                            {codeCopied ? "Copied" : "Copy"}
                        </motion.button>
                        <motion.button
                            onClick={handleShare}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(129,140,248,0.15)" }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                ...styles.smallBtn,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: "rgba(129,140,248,0.08)",
                                color: "#818cf8",
                                border: "1px solid rgba(129,140,248,0.2)",
                            }}
                        >
                            <Share2 size={14} />
                            Share
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Referral Link */}
            <div style={styles.linkSection}>
                <label style={styles.linkLabel}>YOUR REFERRAL LINK</label>
                <div style={styles.linkRow}>
                    <input
                        type="text"
                        readOnly
                        value={referralLink || "Generating..."}
                        style={styles.linkInput}
                        onClick={(e) => e.target.select()}
                    />
                    <motion.button
                        onClick={handleCopy}
                        whileHover={{ scale: 1.02, backgroundColor: "#4f46e5" }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!referralLink}
                        style={{
                            ...styles.copyBtn,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: copied
                                ? "linear-gradient(135deg, #0cebeb, #20e3b2, #29ffc6)"
                                : "#6366f1",
                        }}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copied!" : "Copy"}
                    </motion.button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                {stats.map((stat) => (
                    <motion.div
                        whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)" }}
                        key={stat.label}
                        style={styles.statCard}
                    >
                        <div style={styles.statLabel}>{stat.label.toUpperCase()}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                            <div
                                style={{
                                    fontSize: "1.75rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                    letterSpacing: "-0.01em"
                                }}
                            >
                                {stat.value}
                            </div>
                            <div style={{ color: stat.color, opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                                {React.cloneElement(stat.icon, { size: 18 })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Referrals Table */}
            {data.referrals && data.referrals.length > 0 && (
                <div style={styles.tableSection}>
                    <h3 style={styles.tableTitle}>Referral History</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Reward</th>
                                    <th style={styles.th}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.referrals.map((ref) => {
                                    const statusInfo =
                                        STATUS_CONFIG[ref.status] || STATUS_CONFIG.PENDING;
                                    return (
                                        <tr key={ref._id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    {ref.referredUser?.imageUrl ? (
                                                        <img
                                                            src={ref.referredUser.imageUrl}
                                                            alt=""
                                                            style={styles.avatar}
                                                        />
                                                    ) : (
                                                        <div style={styles.avatarPlaceholder}>
                                                            {(ref.referredUser?.firstName || "?")[0]}
                                                        </div>
                                                    )}
                                                    <span style={{ color: "#fff" }}>
                                                        {ref.referredUser?.firstName || "User"}{" "}
                                                        {ref.referredUser?.lastName?.[0]
                                                            ? `${ref.referredUser.lastName[0]}.`
                                                            : ""}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: 6,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        background: statusInfo.bg,
                                                        color: statusInfo.color,
                                                        border: `1px solid ${statusInfo.border}`,
                                                    }}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    color: ref.status === "REWARDED" ? "#00ff88" : "rgba(255,255,255,0.4)"
                                                }}>
                                                    {ref.status === "REWARDED" && <IndianRupee size={12} />}
                                                    {ref.status === "REWARDED" ? `${ref.rewardAmount}` : "—"}
                                                </span>
                                            </td>
                                            <td style={{ ...styles.td, color: "rgba(255,255,255,0.4)" }}>
                                                {new Date(ref.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State — Start Referring */}
            {(!data.referrals || data.referrals.length === 0) && (
                <div style={{
                    textAlign: "center",
                    padding: "2rem 1rem 1.5rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.05)",
                }}>
                    <Rocket size={40} color="#818cf8" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: "0.5rem 0 0.5rem" }}>
                        Start Earning with Referrals
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "1.25rem", maxWidth: 400, marginInline: "auto", lineHeight: 1.6 }}>
                        Share your unique link and earn <strong style={{ color: "#00ff88" }}>₹30</strong> for every friend who signs up and subscribes!
                    </p>

                    {/* How it works steps */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1.25rem",
                        flexWrap: "wrap",
                        marginBottom: "1.5rem",
                    }}>
                        {[
                            { step: "1", icon: <LinkIcon size={22} />, text: "Share your link" },
                            { step: "2", icon: <UserPlus size={22} />, text: "Friend signs up" },
                            { step: "3", icon: <IndianRupee size={22} />, text: "You earn ₹30" },
                        ].map((item) => (
                            <div key={item.step} style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.5rem",
                                minWidth: 95,
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    background: "rgba(129,140,248,0.12)",
                                    border: "1px solid rgba(129,140,248,0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#818cf8",
                                }}>
                                    {item.icon}
                                </div>
                                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem", fontWeight: 500 }}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <motion.button
                            onClick={handleCopy}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: copied
                                    ? "linear-gradient(135deg, #00ff88, #00cc6a)"
                                    : "linear-gradient(135deg, #818cf8, #6366f1)",
                                border: "none",
                                borderRadius: 10,
                                padding: "0.7rem 1.75rem",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? "Link Copied!" : "Copy Referral Link"}
                        </motion.button>
                        <motion.button
                            onClick={handleShare}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 10,
                                padding: "0.7rem 1.75rem",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            <Share2 size={18} />
                            Share
                        </motion.button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

const styles = {
    container: {
        background: "rgba(10, 10, 15, 0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 20,
        padding: "2rem",
        marginBottom: "2rem",
        backdropFilter: "blur(16px)",
    },
    header: {
        marginBottom: "2rem",
    },
    title: {
        color: "#fff",
        fontSize: "1.5rem",
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.02em",
    },
    subtitle: {
        color: "rgba(255,255,255,0.4)",
        fontSize: "0.9rem",
        marginTop: "4px",
    },
    codeSection: {
        marginBottom: "1.5rem",
    },
    codeRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
    },
    codeBadge: {
        background: "rgba(0, 255, 136, 0.05)",
        border: "1px solid rgba(0, 255, 136, 0.2)",
        borderRadius: 8,
        padding: "0.5rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    codeText: {
        color: "#00ff88",
        fontSize: "1.25rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        fontFamily: "'Inter', sans-serif",
    },
    smallBtn: {
        borderRadius: 8,
        padding: "0.6rem 1.25rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        border: "none",
    },
    linkSection: {
        marginBottom: "2rem",
    },
    linkLabel: {
        color: "rgba(255,255,255,0.4)",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        marginBottom: "0.75rem",
        display: "block",
    },
    linkRow: {
        display: "flex",
        gap: "0.75rem",
    },
    linkInput: {
        flex: 1,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "0.85rem 1.25rem",
        color: "rgba(255,255,255,0.9)",
        fontSize: "0.9rem",
        outline: "none",
        fontFamily: "'Inter', sans-serif",
        transition: "border-color 0.2s",
    },
    copyBtn: {
        border: "none",
        borderRadius: 12,
        padding: "0 1.75rem",
        color: "#fff",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
    },
    statCard: {
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: 14,
        padding: "1.25rem 1.5rem",
        textAlign: "left",
    },
    statLabel: {
        color: "rgba(255,255,255,0.3)",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        marginBottom: "4px",
    },
    tableSection: {
        marginTop: "1rem",
    },
    tableTitle: {
        color: "#fff",
        fontSize: "1.1rem",
        fontWeight: 600,
        margin: "0 0 1rem",
    },
    tableWrapper: {
        overflowX: "auto",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.05)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        background: "rgba(255,255,255,0.01)",
    },
    th: {
        textAlign: "left",
        padding: "1rem",
        color: "rgba(255,255,255,0.4)",
        fontSize: "0.7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    tr: {
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        transition: "background 0.2s",
    },
    td: {
        padding: "1rem",
        fontSize: "0.9rem",
        color: "rgba(255,255,255,0.8)",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid rgba(255,255,255,0.1)",
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(129,140,248,0.15)",
        color: "#818cf8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        fontWeight: 700,
    },
    spinner: {
        width: 40,
        height: 40,
        border: "3px solid rgba(0,255,136,0.1)",
        borderTopColor: "#00ff88",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto",
    },
};
