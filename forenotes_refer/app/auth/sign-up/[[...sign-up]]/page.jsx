"use client";

import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function SignUpForm() {
  const [referralCode, setReferralCode] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const codeFromUrl = searchParams.get('ref');
    const codeFromCookie = getCookie('ref');
    const code = codeFromUrl || codeFromCookie;

    if (code) {
      setReferralCode(code);
    }
    // Set ready to true so the component renders `<SignUp>` with the final `unsafeMetadata`
    setIsReady(true);
  }, [searchParams]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#020617]">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Layer with glow effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-blue-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] bg-purple-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <img
            src="/forenotes.png"
            alt="ForeNotes Logo"
            className="h-10 w-auto object-contain mb-4 mx-auto"
          />
          <h2 className="text-3xl font-bold text-white mb-2">
            Create your account
          </h2>
          <p className="text-slate-400">
            Get started with your free account today.
          </p>
          {referralCode && (
            <p className="mt-2 text-sm text-emerald-400 font-medium">
              🎉 You were referred by a friend!
            </p>
          )}
        </div>
        <div className="flex justify-center w-full">
          <SignUp
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-2xl backdrop-blur-xl rounded-2xl border border-white/10",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all rounded-xl",
                socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border border-white/10 transition-all",
                formFieldInput: "bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl transition-colors",
                footerActionLink: "text-blue-400 hover:text-blue-300 font-medium",
              },
              variables: {
                colorPrimary: "#2563eb",
                colorBackground: "rgba(15, 23, 42, 0.7)",
              }
            }}
            unsafeMetadata={referralCode ? { referredBy: referralCode } : undefined}
            path="/auth/sign-up"
            routing="path"
            signInUrl="/auth/sign-in"
          />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#020617]">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
