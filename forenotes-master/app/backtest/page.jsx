"use client";

import React from "react";
import { motion } from "framer-motion";
import { Beaker, LineChart, Timer } from "lucide-react";

export default function BacktestPage() {
    return (
        <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950/50 rounded-3xl border border-slate-800/50 backdrop-blur-sm p-6 sm:p-12">

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

                {/* Grid Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-8">

                {/* Icon/Badge */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative bg-slate-900 border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
                        <Beaker className="w-12 h-12 text-blue-400" />
                    </div>

                    {/* Floating Orbit Icons */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 -m-8 rounded-full border border-dashed border-slate-700/30"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-1.5 rounded-full border border-slate-700">
                            <LineChart className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-slate-900 p-1.5 rounded-full border border-slate-700">
                            <Timer className="w-4 h-4 text-emerald-400" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Text Content */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight"
                    >
                        Advanced Backtesting
                        <span className="block text-2xl md:text-3xl mt-2 font-medium text-slate-400">
                            Engine Coming Soon
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Simulate your trading strategies with historical data, analyze performance metrics, and optimize your edge before risking real capital.
                    </motion.p>
                </div>


            </div>
        </div>
    );
}
