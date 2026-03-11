"use client";

import { SignUp } from '@clerk/nextjs';
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
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Get started with your free account today.
          </p>
          {referralCode && (
            <p className="mt-2 text-sm text-green-500 font-medium">
              🎉 You were referred by a friend!
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                card: "shadow-lg",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
            unsafeMetadata={referralCode ? { referredBy: referralCode } : undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}