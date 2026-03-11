'use client';
import React from 'react';

const SpecialOfferCard = ({ onSelect, isTrialEligible, onTrialSelect }) => {
    return (
        <div className="relative w-full max-w-[380px] mx-auto group">
            {/* Green Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-xl opacity-70 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            {/* Card Content */}
            <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl p-6 border border-green-500/50 shadow-2xl">
                {/* Launch Day Special Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-bold tracking-wide">LAUNCH DAY SPECIAL</span>
                    </div>
                </div>

                {/* Spacer for badge */}
                <div className="h-6"></div>

                {/* Main Content */}
                <div className="text-center space-y-4">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white">
                        Limited Time Offer
                    </h3>

                    {/* Price */}
                    <div>
                        <div className="flex items-start justify-center gap-1">
                            <span className="text-2xl font-bold text-green-400 mt-1">$</span>
                            <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                21
                            </span>
                        </div>
                        <p className="text-gray-400 mt-1 text-base">
                            6 Months Full Access
                        </p>
                        <p className="text-xs text-green-400 font-semibold mt-0.5">
                            ≈ $3.50/month
                        </p>
                    </div>

                    {/* One-Time Payment Badge */}
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs text-green-400 font-medium">One-time payment, no auto-renewal</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 text-left mt-4">
                        {[
                            'Full trading journal access',
                            'Advanced analytics & insights',
                            'AI-powered trade assistant',
                            'Performance tracking',
                            'Psychology analysis',
                            'Priority support'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs text-gray-300">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onSelect}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/50 mt-4"
                    >
                        Claim Launch Offer
                    </button>



                    {/* Limited Availability Notice */}
                    <p className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Available for first 24 hours only</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SpecialOfferCard;
