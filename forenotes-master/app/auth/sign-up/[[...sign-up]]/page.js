"use client";

import { useState, useEffect, useCallback } from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  const [step, setStep] = useState('ask'); // ask | enter_code | clerk
  const [referralCode, setReferralCode] = useState('');
  const [validationState, setValidationState] = useState('idle'); // idle | validating | valid | invalid
  const [referrerName, setReferrerName] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Check URL params for ?ref=CODE (from legacy link flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setStep('enter_code');
      validateCode(refCode);
    }
  }, []);

  // Store validated code in localStorage so dashboard can pick it up
  useEffect(() => {
    if (validationState === 'valid' && referralCode) {
      localStorage.setItem('fn_referral_code', referralCode);
    } else if (validationState === 'invalid') {
      localStorage.removeItem('fn_referral_code');
    }
  }, [validationState, referralCode]);

  const validateCode = useCallback(async (code) => {
    if (!code || code.trim().length < 4) {
      setValidationState('idle');
      return;
    }

    setValidationState('validating');

    try {
      const res = await fetch(`/api/referral/validate?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (data.valid) {
        setValidationState('valid');
        setReferrerName(data.referrerName || 'A friend');
      } else {
        setValidationState('invalid');
        setReferrerName('');
      }
    } catch {
      setValidationState('invalid');
      setReferrerName('');
    }
  }, []);

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setReferralCode(value);

    // Clear previous timer
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value || value.trim().length < 4) {
      setValidationState('idle');
      localStorage.removeItem('fn_referral_code');
      return;
    }

    // Debounce validation
    const timer = setTimeout(() => validateCode(value), 500);
    setDebounceTimer(timer);
  };

  const skipReferral = () => {
    setReferralCode('');
    setValidationState('idle');
    localStorage.removeItem('fn_referral_code');
    setStep('clerk');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="max-w-md w-full">
        {step !== 'clerk' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Welcome to ForeNotes
              </h2>
              <p className="text-slate-500 text-[15px]">
                Create your account to unlock premium trading journals and analytics.
              </p>
            </div>

            {step === 'ask' && (
              <div className="space-y-4 pt-4">
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Have a Referral Code?</h3>
                  <p className="text-sm text-slate-500">
                    If a friend invited you, enter their code to make sure they get rewarded for referring you.
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  <button
                    onClick={() => setStep('enter_code')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all transform active:scale-[0.98]"
                  >
                    Yes, I have a code
                  </button>
                  <button
                    onClick={skipReferral}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3.5 px-4 rounded-xl border border-slate-200 transition-colors"
                  >
                    No, skip this step
                  </button>
                </div>
              </div>
            )}

            {step === 'enter_code' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <label htmlFor="refCode" className="block text-sm font-semibold text-slate-700">
                    Referral Code
                  </label>
                  <div className="relative">
                    <input
                      id="refCode"
                      type="text"
                      value={referralCode}
                      onChange={handleCodeChange}
                      placeholder="e.g. A1B2C3D4"
                      maxLength={20}
                      className="w-full px-4 py-4 rounded-xl text-base font-mono tracking-wider uppercase transition-all outline-none"
                      style={{
                        background: '#fff',
                        border: `2px solid ${
                          validationState === 'valid'
                            ? '#22c55e'
                            : validationState === 'invalid'
                            ? '#ef4444'
                            : validationState === 'validating'
                            ? '#3b82f6'
                            : '#cbd5e1'
                        }`,
                        color: '#0f172a',
                        boxShadow:
                          validationState === 'valid'
                            ? '0 0 0 4px rgba(34,197,94,0.1)'
                            : validationState === 'invalid'
                            ? '0 0 0 4px rgba(239,68,68,0.1)'
                            : validationState === 'validating'
                            ? '0 0 0 4px rgba(59,130,246,0.1)'
                            : 'none',
                      }}
                      autoComplete="off"
                      autoFocus
                    />

                    {/* Status indicator inside input */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {validationState === 'validating' && (
                        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      )}
                      {validationState === 'valid' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      )}
                      {validationState === 'invalid' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback messages */}
                <div className="min-h-[40px]">
                  {validationState === 'valid' && (
                    <div className="flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      Referred by <strong className="font-extrabold">{referrerName}</strong>
                    </div>
                  )}
                  {validationState === 'invalid' && referralCode.length >= 4 && (
                    <div className="flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-3 bg-red-50 text-red-700 border border-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Invalid code. Please check and try again.
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('ask')}
                    className="px-5 py-3.5 rounded-xl font-medium text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (validationState === 'valid' || referralCode.trim() === '') {
                        setStep('clerk');
                      }
                    }}
                    disabled={validationState === 'validating' || (referralCode.length > 0 && validationState !== 'valid')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all transform active:scale-[0.98] disabled:active:scale-100"
                  >
                    {validationState === 'valid' ? 'Continue' : 'Skip & Continue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clerk Sign-Up Component */}
        {step === 'clerk' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {validationState === 'valid' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Referral Applied</p>
                    <p className="text-sm font-medium text-emerald-900">{referrerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('ask')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-white rounded-lg border border-emerald-200 shadow-sm"
                >
                  Change
                </button>
              </div>
            )}

            <div className="flex justify-center">
              <SignUp
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                    card: "shadow-xl border-0 rounded-3xl",
                    headerTitle: "text-2xl font-bold tracking-tight text-slate-900",
                    headerSubtitle: "text-slate-500",
                  },
                }}
                unsafeMetadata={
                  validationState === 'valid' && referralCode
                    ? { referredBy: referralCode }
                    : undefined
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}