"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReferralLandingPage() {
    const params = useParams();
    const router = useRouter();
    const code = params?.code;
    const [status, setStatus] = useState("validating"); // validating | valid | invalid
    const [referrerName, setReferrerName] = useState("");

    useEffect(() => {
        if (!code) {
            setStatus("invalid");
            return;
        }

        async function validateAndRedirect() {
            try {
                const res = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`);
                if (!res.ok) {
                    setStatus("invalid");
                    return;
                }
                const data = await res.json();

                if (data.valid) {
                    setReferrerName(data.referrerName || "A friend");
                    setStatus("valid");

                    // Set referral cookie (30 days)
                    document.cookie = `ref=${code}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

                    // Redirect to sign-up after a short delay
                    setTimeout(() => {
                        router.push(`/auth/sign-up?ref=${code}`);
                    }, 2000);
                } else {
                    setStatus("invalid");
                }
            } catch {
                setStatus("invalid");
            }
        }

        validateAndRedirect();
    }, [code, router]);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #000 0%, #0a1628 50%, #000 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: 480,
                    width: "100%",
                    textAlign: "center",
                    padding: "3rem 2rem",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                }}
            >
                {status === "validating" && (
                    <>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                border: "3px solid rgba(0,255,136,0.2)",
                                borderTopColor: "#00ff88",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                margin: "0 auto 1.5rem",
                            }}
                        />
                        <h2 style={{ color: "#fff", fontSize: "1.5rem", margin: 0 }}>
                            Validating referral...
                        </h2>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </>
                )}

                {status === "valid" && (
                    <>
                        <div
                            style={{
                                fontSize: "3rem",
                                marginBottom: "1rem",
                            }}
                        >
                            🎉
                        </div>
                        <h2
                            style={{
                                color: "#fff",
                                fontSize: "1.5rem",
                                marginBottom: "0.5rem",
                            }}
                        >
                            You&apos;ve been invited!
                        </h2>
                        <p
                            style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "1rem",
                                marginBottom: "1.5rem",
                                lineHeight: 1.6,
                            }}
                        >
                            <strong style={{ color: "#00ff88" }}>{referrerName}</strong> invited
                            you to join Trading Journal. Sign up now to get started!
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
                            Redirecting to sign-up...
                        </p>
                    </>
                )}

                {status === "invalid" && (
                    <>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
                        <h2
                            style={{
                                color: "#fff",
                                fontSize: "1.5rem",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Invalid referral link
                        </h2>
                        <p
                            style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "1rem",
                                marginBottom: "1.5rem",
                            }}
                        >
                            This referral code is not valid or has expired.
                        </p>
                        <button
                            onClick={() => router.push("/auth/sign-up")}
                            style={{
                                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                                color: "#000",
                                border: "none",
                                padding: "0.75rem 2rem",
                                borderRadius: 10,
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Sign up anyway
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
