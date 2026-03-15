"use client";

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans">
            <AuthenticateWithRedirectCallback 
                signUpFallbackRedirectUrl="/dashboard"
                signInFallbackRedirectUrl="/dashboard"
            />
        </div>
    );
}
