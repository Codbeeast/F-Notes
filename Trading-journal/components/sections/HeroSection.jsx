'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const HeroSection = ({ className = '' }) => {
  const router = useRouter();
  const [customerCount, setCustomerCount] = useState(20000);
  const [hasAccess, setHasAccess] = useState(false);
  const [isTrialEligible, setIsTrialEligible] = useState(false); // Default to false to be conservative
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [processingTrial, setProcessingTrial] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const targetCount = 1200;

  const { isLoaded, isSignedIn } = useUser();

  // Check subscription status
  useEffect(() => {
    const checkStatus = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setIsTrialEligible(true); // Logged out users are eligible by default (until we check email)
        setHasAccess(false);
        setIsLoadingSubscription(false);
        return;
      }

      setIsLoadingSubscription(true);
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        if (data.success) {
          setHasAccess(data.hasAccess);
          setIsTrialEligible(data.isTrialEligible);
          setSubscriptionStatus(data.status);

          // Debugging log
          console.log('Subscription Status:', {
            hasAccess: data.hasAccess,
            isTrialEligible: data.isTrialEligible,
            status: data.status
          });
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };
    checkStatus();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const startCount = 500;
    const increment = (targetCount - startCount) / (duration / 50); // Update every 50ms

    let currentCount = startCount;
    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= targetCount) {
        setCustomerCount(targetCount);
        clearInterval(timer);
      } else {
        setCustomerCount(Math.floor(currentCount));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [targetCount]);

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const handleStartTrial = async () => {
    if (!isSignedIn) {
      router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
      return;
    }

    setProcessingTrial(true);

    try {
      // Activate trial without any payment
      const res = await fetch('/api/subscription/start-free-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (!data.success) {
        console.error('Trial activation failed:', data.error);
        setProcessingTrial(false);
        return;
      }

      // Trial activated successfully - redirect to dashboard
      setProcessingTrial(false);
      router.push('/dashboard');
      router.refresh();

    } catch (error) {
      console.error('Failed to start trial:', error);
      setProcessingTrial(false);
    }
  };

  // Determine CTA button text and href
  const getCTAConfig = () => {
    // 1. Loading state
    if (!isLoaded || isLoadingSubscription) {
      return {
        text: 'Loading...',
        href: null,
        showTrial: false,
        onClick: null,
        isLoading: true
      };
    }

    // 2. Logged in & Has Access (Active Plan)
    if (isSignedIn && hasAccess) {
      return {
        text: 'Go to Dashboard',
        href: '/dashboard',
        showTrial: false,
        onClick: null
      };
    }

    // 2b. Logged in & Status says 'active' but hasAccess is false (e.g. slight sync issue)?
    // Trust 'active' status if present to avoid showing Trial button to paid users
    if (isSignedIn && subscriptionStatus === 'active') {
      return {
        text: 'Go to Dashboard',
        href: '/dashboard',
        showTrial: false,
        onClick: null
      };
    }

    // 3. Logged in & No Access & Eligible for Trial
    if (isSignedIn && !hasAccess && isTrialEligible) {
      return {
        text: processingTrial ? 'Activating...' : 'Start 7-Day Free Trial',
        href: null,
        showTrial: true,
        onClick: handleStartTrial
      };
    }

    // 4. Logged in & No Access & NOT Eligible (Trial used, expired)
    // Or if default state (false) persists
    if (isSignedIn && (!isTrialEligible || !hasAccess)) {
      return {
        text: 'Get Started',
        href: '/dashboard', // User requested to go to dashboard instead of pricing
        showTrial: false,
        onClick: null
      };
    }

    // 5. Not signed in (Default to Trial CTA)
    return {
      text: processingTrial ? 'Activating...' : 'Start 7-Day Free Trial',
      href: null, // We handle redirect in onClick
      showTrial: true,
      onClick: handleStartTrial
    };
  };

  const ctaConfig = getCTAConfig();

  return (
    <>
      <section
        id="hero"
        className={`relative w-full bg-[linear-gradient(180deg,#031457_0%,_#001122_60%,_#000000_100%)] min-h-screen flex items-center justify-center ${className}`}
      >
        {/* Background Images */}
        <div className="absolute inset-0">
          <img
            src="/images/img_component_1_black_900_426x1920.png"
            alt=""
            width={1920}
            height={426}
            className="w-full h-[200px] sm:h-[300px] lg:h-[426px] object-cover"
          />
          <img
            src="/images/img_blur_mask_group.png"
            alt=""
            width={1260}
            height={1714}
            className="absolute top-[40px] sm:top-[68px] left-0 w-[80%] sm:w-[66%] h-auto max-h-full object-cover opacity-60 sm:opacity-100"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Social Proof Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-[10px] mb-6 sm:mb-8 w-full max-w-[720px] px-4">
            {/* Customer Avatars */}
            <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
              {/* Images Container - Simplified for mobile */}
              <div className="flex items-center -space-x-2 sm:-space-x-3">
                {/* Avatar 1 */}
                <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[4]">
                  <img
                    className="w-full h-full object-cover"
                    src="/Testimonial/Shivam.png"
                    alt="Customer profile"
                    width={28}
                    height={28}
                  />
                </div>

                {/* Avatar 2 */}
                <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[3]">
                  <img
                    className="w-full h-full object-cover"
                    src="/Testimonial/Ayush.png"
                    alt="Customer profile"
                    width={28}
                    height={28}
                  />
                </div>

                {/* Avatar 3 */}
                <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[2]">
                  <img
                    className="w-full h-full object-cover"
                    src="/Testimonial/Choin.png"
                    alt="Customer profile"
                    width={28}
                    height={28}
                  />
                </div>

                {/* Avatar 4 */}
                <div className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border-2 border-white/20 relative z-[1]">
                  <img
                    className="w-full h-full object-cover"
                    src="/Testimonial/Zainul.png"
                    alt="Customer profile"
                    width={28}
                    height={28}
                  />
                </div>
              </div>
            </div>

            {/* Text Container */}
            <div className="flex flex-wrap items-center justify-center gap-1 text-center sm:text-left">
              <span className="text-sm sm:text-[16px] font-inter font-normal text-[rgba(230,236,255,0.7)] tracking-[-0.32px]">
                Join
              </span>
              <span className="text-sm sm:text-[16px] font-inter font-normal text-white tracking-[-0.32px]">
                {formatNumber(customerCount)}+
              </span>
              <span className="text-sm sm:text-[16px] font-inter font-normal text-[rgba(230,236,255,0.7)] tracking-[-0.32px]">
                other loving customers
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              AI journal that actually helps you
            </h1>
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-inter font-normal text-gray-300 leading-relaxed max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto">
              Forenotes connects emotion, execution, and outcome AI <br />
              translates your trading journey into measurable improvement
            </h3>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            {/* Primary CTA Button */}
            {ctaConfig.href ? (
              <a
                href={ctaConfig.href}
                className="group relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: 'rgb(41, 52, 255)',
                  height: '48px',
                  minWidth: '200px',
                  borderRadius: '12px',
                  boxShadow: 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  border: '1.6px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                </span>

                <span className="relative flex items-center gap-2 text-white font-inter text-sm sm:text-base font-semibold tracking-[-0.32px] whitespace-nowrap">
                  {ctaConfig.showTrial && <span>🎉</span>}
                  {ctaConfig.text}
                </span>
              </a>
            ) : (
              <button
                onClick={ctaConfig.onClick}
                disabled={processingTrial}
                className="group relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor: 'rgb(41, 52, 255)',
                  height: '48px',
                  minWidth: '200px',
                  borderRadius: '12px',
                  boxShadow: 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  border: '1.6px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                </span>

                <span className="relative flex items-center gap-2 text-white font-inter text-sm sm:text-base font-semibold tracking-[-0.32px] whitespace-nowrap">
                  {processingTrial ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {ctaConfig.text}
                    </>
                  ) : (
                    <>
                      {ctaConfig.showTrial && <span>🎉</span>}
                      {ctaConfig.text}
                    </>
                  )}
                </span>
              </button>
            )}

            {/* Watch Demo Button */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="group inline-flex items-center justify-center gap-2 text-white/90 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl px-6 py-3 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span className="font-inter text-sm sm:text-base font-medium">Watch Demo</span>
            </button>
          </div>

          {/* No Credit Card Required Text */}
          <p className="mt-4 mb-8 sm:mb-10 lg:mb-12 text-lg text-gray-300 font-inter tracking-wide opacity-80">
            No card details required
          </p>

          {/* Trading Keywords SVG Marquee */}
          <div className="w-full overflow-hidden px-4">
            <div
              className="w-full overflow-hidden relative"
              style={{
                maskImage:
                  'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
              }}
            >
              <div
                className="flex items-center gap-8 sm:gap-12 lg:gap-[100px] animate-scroll"
                style={{
                  width: 'max-content',
                  transform: 'translateX(0px)',
                  willChange: 'transform',
                }}
              >
                {/* First set of words as SVG */}
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 85 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="42.5"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      CLARITY
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 100 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="50"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      DISCIPLINE
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 85 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="42.5"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      INSIGHT
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 110 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="55"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      PSYCHOLOGY
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 95 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="47.5"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      STRATEGY
                    </text>
                  </svg>
                </div>

                {/* Duplicate set for seamless scrolling */}
                <div className="flex-shrink-0" aria-hidden="true">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 85 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="42.5"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      CLARITY
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0" aria-hidden="true">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 100 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="50"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      DISCIPLINE
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0" aria-hidden="true">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 85 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="42.5"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      INSIGHT
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0" aria-hidden="true">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 110 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="55"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      PSYCHOLOGY
                    </text>
                  </svg>
                </div>

                <div className="flex-shrink-0" aria-hidden="true">
                  <svg
                    className="h-6 sm:h-7 lg:h-8 w-auto"
                    viewBox="0 0 95 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'brightness(1.3) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }}
                  >
                    <text
                      x="47.5"
                      y="15"
                      textAnchor="middle"
                      className="font-inter font-semibold tracking-wider"
                      style={{
                        fontSize: '14px',
                        fill: '#ffffff',
                        letterSpacing: '0.1em',
                      }}
                    >
                      STRATEGY
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Demo Modal */}
      {showDemoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowDemoModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">Watch Demo</h3>
              <p className="text-sm text-gray-400">See how Forenotes can transform your trading</p>
            </div>

            {/* YouTube Iframe */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/ECk9AkmKpRI?autoplay=1&rel=0"
                title="Forenotes Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;
