'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    UserButton,
    useUser
} from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { dark } from '@clerk/themes';

export default function Navbar() {
    const { user } = useUser();

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/50 backdrop-blur-xl border-b border-white/10"
        >
            <div className="container mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/forenotes.png"
                            alt="Forenotes Logo"
                            className="h-8 w-auto cursor-pointer"
                        />
                    </Link>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-white">
                                {user?.firstName}
                            </span>
                            <span className="text-xs text-slate-400">Ambassador</span>
                        </div>

                        <UserButton
                            afterSignOutUrl="/auth/sign-in"
                            appearance={{
                                baseTheme: dark,
                                variables: {
                                    colorPrimary: '#3b82f6',
                                    colorBackground: '#020617',
                                    colorText: '#ffffff',
                                    colorInputBackground: '#0f172a',
                                    colorInputText: '#ffffff',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
