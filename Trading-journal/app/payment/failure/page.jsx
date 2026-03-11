'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailurePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Failure Card */}
                <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 md:p-12 border border-red-500/30 shadow-2xl">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
                            <div className="relative bg-red-500/10 rounded-full p-6 border border-red-500/30">
                                <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Payment Failed
                        </h1>
                        <p className="text-xl text-gray-300 mb-2">
                            We couldn&apos;t process your payment
                        </p>
                        <p className="text-gray-400">
                            Don&apos;t worry, no charges were made to your account
                        </p>
                    </div>

                    {/* Common Reasons */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Common Reasons for Payment Failures:</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-gray-300">Insufficient funds in your account</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-gray-300">Incorrect card details or expired card</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-gray-300">Bank declined the transaction</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-gray-300">Network or connection issues</p>
                            </div>
                        </div>
                    </div>

                    {/* Alternative Methods */}
                    <div className="bg-black/50 rounded-xl p-6 mb-8 border border-blue-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4">Try These Solutions:</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-300">Verify your card details and try again</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-300">Try using a different payment method (UPI, Net Banking)</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-300">Contact your bank to authorize the transaction</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/pricing"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-center"
                            style={{
                                backgroundColor: 'rgb(41, 52, 255)',
                                boxShadow: 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px'
                            }}
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 text-center border border-gray-700"
                        >
                            Return Home
                        </Link>
                    </div>

                    {/* Support Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Still having issues? <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Support</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
