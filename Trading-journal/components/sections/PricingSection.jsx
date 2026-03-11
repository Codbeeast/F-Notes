'use client';
import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectionHeader from '@/components/common/SectionHeader';
import PricingCard from '@/components/ui/PricingCard';
import LightRays from '@/components/ui/LightRays';
import PaymentModal from '@/components/payment/PaymentModal';
import SpecialOfferCard from '@/components/subscription/SpecialOfferCard';

function PricingSectionContent({ className = '' }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isTrialEligible, setIsTrialEligible] = useState(false);
  const [processingTrial, setProcessingTrial] = useState(false);
  const [showSpecialOffer, setShowSpecialOffer] = useState(false);
  const [processingSpecialOffer, setProcessingSpecialOffer] = useState(false);

  const { user, isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const checkEligibility = async () => {
      // For logged-out users, assume eligible (they'll sign up and we'll check then)
      if (!isLoaded) return;

      if (!isSignedIn) {
        setIsTrialEligible(true); // Show button for logged-out users
        return;
      }

      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        if (data.success) {
          setIsTrialEligible(data.isTrialEligible);
        }
      } catch (error) {
        console.error('Failed to check trial eligibility:', error);
      }
    };
    checkEligibility();
  }, [isLoaded, isSignedIn]);

  // Handle return from login with plan selected
  React.useEffect(() => {
    const handleReturn = async () => {
      if (isLoaded && isSignedIn) {
        const planFromUrl = searchParams.get('plan');
        if (planFromUrl) {
          // Check if user already has an active subscription
          try {
            const res = await fetch('/api/subscription/status');
            const data = await res.json();

            if (data.success && data.hasAccess) {
              // User already has a plan, redirect to profile
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl); // Clean URL
              router.push('/profile');
              return;
            }
          } catch (error) {
            console.error('Error checking subscription status:', error);
          }

          setSelectedPlan(planFromUrl);
          setShowPaymentModal(true);
          // Optional: Clean URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    };
    handleReturn();
  }, [isLoaded, isSignedIn, searchParams, router]);

  const handleSelectPlan = (planId) => {
    if (!isSignedIn) {
      // Redirect to login with callback to this page + plan param
      const currentPath = window.location.pathname;
      const callbackUrl = `${currentPath}?plan=${planId}`;
      router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    // If user explicitly selects a plan, proceed to payment flow
    // (We removed forced trial here so users can choose to pay immediately if they want)

    // For 1-month plan, use one-time order flow
    if (planId === '1_MONTH') {
      handleMonthlyOrder();
      return;
    }

    // For other plans, show payment modal for subscription
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  // Hassle-free trial activation (no payment required)
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

  // Handle monthly plan as one-time order
  const handleMonthlyOrder = async () => {
    setProcessingTrial(true);

    try {
      const res = await fetch('/api/subscription/create-onetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: '1_MONTH' })
      });

      const data = await res.json();

      if (!data.success) {
        console.error('Order creation failed:', data.error);
        alert(`Order creation failed: ${data.error}`);
        setProcessingTrial(false);
        return;
      }

      // Load Razorpay for one-time payment
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (typeof window.Razorpay === 'undefined') {
          console.error('Razorpay SDK not loaded');
          alert('Razorpay SDK failed to load. Please check your internet connection.');
          setProcessingTrial(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount * 100,
          currency: 'INR',
          order_id: data.orderId,
          name: 'Forenotes',
          description: 'Monthly Plan - 1 Month Access',
          handler: async function (response) {
            // Verify payment
            const verifyRes = await fetch('/api/subscription/verify-onetime', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.verified) {
              router.push('/payment/success');
            }
          },
          prefill: {
            email: user?.emailAddresses?.[0]?.emailAddress || '',
            contact: user?.phoneNumbers?.[0]?.phoneNumber || ''
          },
          theme: {
            color: '#2934FF'
          },
          modal: {
            ondismiss: function () {
              setProcessingTrial(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setProcessingTrial(false);
      };

      setProcessingTrial(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert(`Failed to create order: ${error.message}`);
      setProcessingTrial(false);
    }
  };

  const handleSpecialOfferSelect = async () => {
    if (!isSignedIn) {
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
      return;
    }

    setProcessingSpecialOffer(true);
    try {
      // Create one-time payment order
      const res = await fetch('/api/subscription/create-onetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        // Initialize Razorpay checkout for one-time payment
        initiateSpecialOfferCheckout(data);
      } else {
        console.error('Failed to create order:', data.error);
      }
    } catch (error) {
      console.error('Error creating special offer order:', error);
    } finally {
      setProcessingSpecialOffer(false);
    }
  };

  const initiateSpecialOfferCheckout = (orderData) => {
    if (!window.Razorpay) {
      console.error('Razorpay SDK not loaded');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: 179900, // ₹1799 in paise
      currency: 'INR',
      order_id: orderData.orderId,
      name: 'Trading Journal',
      description: 'Launch Special - 6 Months Access',
      image: '/logo.png',
      handler: async function (response) {
        await verifySpecialOfferPayment(response);
      },
      prefill: {
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || ''
      },
      theme: {
        color: '#10B981' // Green color for special offer
      },
      config: {
        display: {
          preferences: {
            show_default_blocks: true
          }
        }
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifySpecialOfferPayment = async (paymentData) => {
    try {
      const res = await fetch('/api/subscription/verify-onetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      const data = await res.json();

      if (data.success && data.verified) {
        router.push('/payment/success');
      } else {
        console.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const handlePaymentSuccess = (data) => {
    // Redirect to success page or dashboard
    router.push('/payment/success');
  };

  const pricingPlans = [
    {
      planId: '1_MONTH',
      planName: 'Monthly',
      price: 7,
      originalPrice: 12,
      period: '/ month',
      isPopular: false,
      buttonVariant: 'secondary',
      billingPeriod: 1,
      bonusMonths: 0,
      totalMonths: 1,
      isOneTime: true, // One-time order, not subscription
      features: [
        { text: '60 Fono Credits included', included: true },
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
      ],
    },
    {
      planId: '3_MONTHS',
      planName: '3 Months',
      price: 17,
      originalPrice: 20,
      period: '/ 3 months',
      isPopular: true,
      buttonVariant: 'primary',
      billingPeriod: 3,
      bonusMonths: 0,
      badgeText: 'Momentum Plan',
      totalMonths: 3,
      monthlyEquivalent: 5.6,
      savingsPercent: 15,
      features: [
        { text: '80 Fono Credits / month', included: true },
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
      ],
    },
    {
      planId: '12_MONTHS',
      planName: 'Yearly',
      price: 55,
      originalPrice: 84,
      period: '/ year',
      isPopular: false,
      buttonVariant: 'secondary',
      billingPeriod: 12,
      bonusMonths: 0,
      totalMonths: 12,
      monthlyEquivalent: 4.5,
      savingsPercent: 35,
      features: [
        { text: '120 Fono Credits / month', included: true },
        { text: 'Full trading journal access', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'AI-powered trade assistant', included: true },
        { text: 'Performance tracking', included: true },
        { text: 'Psychology analysis', included: true },
        { text: 'Priority support', included: true },
      ],
    },
  ];

  return (
    <>
      {/* Pricing Section */}
      <section id="pricing" className={`relative w-full min-h-screen lg:min-h-[1010px] ${className}`}>
        {/* Light Rays Background */}
        <div className="absolute inset-0 w-full h-full">
          <LightRays
            raysOrigin="top-center"
            raysColor="#4A90E2"
            raysSpeed={1.0}
            lightSpread={1.7}
            rayLength={3.0}
            pulsating={false}
            fadeDistance={0.2}
            saturation={4.0}
            followMouse={false}
            mouseInfluence={0.15}
            noiseAmount={0.1}
            distortion={0.1}
            className="opacity-90"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 lg:gap-[44px] justify-start items-center w-full mx-auto pt-12 sm:pt-16 lg:pt-[99px]">
          {/* Section Header */}
          <div className="flex flex-col justify-start items-center w-full max-w-[800px] px-4">
            {/* Badge */}
            <div className="relative inline-block">
              {/* Gradient Border - matches the design system */}
              <div
                className="absolute overflow-hidden rounded-[22px] opacity-100"
                style={{
                  inset: '-1px -1px -1px -2px',
                  background:
                    'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                  zIndex: 1,
                }}
              ></div>
              {/* Button Content */}
              <div className="relative bg-black rounded-[22px] px-4 py-2" style={{ zIndex: 2 }}>
                <span
                  className="inline-block font-semibold tracking-[-0.02em] leading-[1.6em]"
                  style={{
                    fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundImage:
                      'linear-gradient(105deg, rgb(138, 165, 255) 22.36939136402027%, rgb(133, 77, 255) 180%)',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  PRICING & PLANS
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-row justify-center items-center w-full px-4 mt-2 sm:mt-3 lg:mt-[10px]">
              <h2 className="text-3xl sm:text-4xl md:text-[54px] font-inter font-bold leading-tight text-center text-[#ffffff] whitespace-nowrap bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Flexible Pricing Plans
              </h2>
            </div>

            {/* Description & Info */}
            <div className="flex flex-col justify-center items-center w-full px-4 mt-4">
              <p className="text-medium sm:text-base font-inter font-normal leading-relaxed text-center text-[#e6ecffb2] max-w-xs sm:max-w-md lg:max-w-[500px] mx-auto">
                Empower your performance with the right plan.
              </p>
              <p className="mt-4 text-medium sm:text-base font-medium text-blue-400/90 tracking-wide">
                No credit card details required during free trial
              </p>
            </div>
          </div>

          {/* Pricing Content */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px] justify-start items-center flex-1">
            {/* Free Trial Button - Only show if eligible */}
            {isTrialEligible && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleStartTrial}
                  disabled={processingTrial}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 ease-out bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-green-500/40 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(34, 197, 94, 0.5)'
                  }}
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 overflow-hidden rounded-xl">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                  </span>

                  {/* Button content */}
                  <span className="relative flex items-center gap-2">
                    {processingTrial ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Activating Trial...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🎉</span>
                        <span>Start 7-Day FREE Trial</span>
                      </>
                    )}
                  </span>
                </button>
                <p className="text-sm text-gray-400 font-medium">No credit card required • Cancel anytime</p>
              </div>
            )}

            {/* Special Launch Offer - Conditionally Rendered */}
            {process.env.NEXT_PUBLIC_SHOW_SPECIAL_OFFER === 'true' && (
              <div className="w-full flex justify-center mb-12">
                <SpecialOfferCard
                  onSelect={handleSpecialOfferSelect}
                  isTrialEligible={isTrialEligible}
                  onTrialSelect={handleStartTrial}
                />
              </div>
            )}

            <div className="w-full max-w-[1240px] mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
                {pricingPlans.map((plan, index) => (
                  <div
                    key={index}
                    className="w-full flex h-full"
                  >
                    <PricingCard
                      planName={plan.planName}
                      price={plan.price}
                      originalPrice={plan.originalPrice}
                      period={plan.period}
                      isPopular={plan.isPopular}
                      features={plan.features}
                      buttonVariant={plan.buttonVariant}
                      onSelect={() => handleSelectPlan(plan.planId)}
                      bonusMonths={plan.bonusMonths}
                      monthlyEquivalent={plan.monthlyEquivalent}
                      isOneTime={plan.isOneTime}
                      isTrialEligible={isTrialEligible}
                      onTrialSelect={() => handleStartTrial(plan.planId)}
                      badgeText={plan.badgeText}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HR Separator */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <hr className="w-full max-w-[600px] sm:max-w-[800px] border-t border-gray-600 opacity-30" />
      </div>

      {/* Founder's Note Section */}
      <section className="relative w-full min-h-[320px] sm:min-h-[350px] lg:min-h-[396px] px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        {/* Background Images */}
        <Image
          src="/images/img_bg_shape.png"
          alt=""
          width={884}
          height={332}
          className="absolute top-[120px] sm:top-[250px] lg:top-[324px] left-1/2 transform -translate-x-1/2 w-[85%] sm:w-[78%] lg:w-[72%] rounded-[10px] opacity-80 lg:opacity-100"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-5 lg:gap-[22px] justify-start items-center w-full max-w-[1204px] mx-auto pt-4 sm:pt-2 lg:pt-0">
          <div className="flex flex-row justify-center items-center w-full px-4 sm:px-8 lg:px-[56px]">
            <div className="relative inline-block">
              {/* Gradient Border - matches the design system */}
              <div
                className="absolute overflow-hidden rounded-[22px] opacity-100"
                style={{
                  inset: '-1px -1px -1px -2px',
                  background:
                    'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                  zIndex: 1,
                }}
              ></div>
              {/* Button Content */}
              <div className="relative bg-black rounded-[22px] px-4 py-2" style={{ zIndex: 2 }}>
                <span
                  className="inline-block font-semibold tracking-[-0.02em] leading-[1.6em]"
                  style={{
                    fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundImage:
                      'linear-gradient(105deg, rgb(138, 165, 255) 22.36939136402027%, rgb(133, 77, 255) 180%)',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  FOUNDERS NOTE
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[32px] justify-start items-center w-full px-4 sm:px-8 lg:px-0">
            {/* Two Founder's Notes in a Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 w-full max-w-[1200px]">
              {/* First Founder's Note */}
              <div className="flex flex-col justify-start items-center w-full px-2 sm:px-4 lg:px-[6px]">
                <div className="flex flex-col gap-1 sm:gap-2 lg:gap-[6px] justify-center items-center w-auto">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-inter font-normal leading-tight text-center text-gray-100 tracking-tight">
                    " No matter where you are in your
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span> journey break-even, losing, or already  funded
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>this journal is a mirror.  Use it honestly. Learn from it. We're in this with you."
                  </h3>
                </div>
                <div className="flex flex-row justify-center items-center w-full mt-3 sm:mt-4 lg:mt-[16px]">
                  <div className="flex flex-row justify-center items-center w-auto">
                    <p className="text-sm sm:text-base font-inter font-normal leading-relaxed text-center text-[#e6ecffb2] w-auto">
                      MMK <br />
                      Founder
                    </p>
                  </div>
                </div>
              </div>

              {/* Second Founder's Note */}
              <div className="flex flex-col justify-start items-center w-full px-2 sm:px-4 lg:px-[6px] lg:border-l-2 lg:border-gray-600 lg:pl-8">
                <div className="flex flex-col gap-1 sm:gap-2 lg:gap-[6px] justify-center items-center w-auto">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-inter font-normal leading-tight text-center text-gray-100 tracking-tight">
                    " Forenotes was born from our own
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>struggles with tracking trades and mindset.
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>Our goal is simple: help traders see their journey clearly, learn faster, and trade better. "
                  </h3>
                </div>
                <div className="flex flex-row justify-center items-center w-full mt-3 sm:mt-4 lg:mt-[16px]">
                  <div className="flex flex-row justify-center items-center w-auto">
                    <p className="text-sm sm:text-base font-inter font-normal leading-relaxed text-center text-[#e6ecffb2] w-auto">
                      Atharva Maradwar
                      <br />
                      Founder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          planId={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

// Wrap in Suspense to fix useSearchParams warning
export default function PricingSection(props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading pricing...</div>
      </div>
    }>
      <PricingSectionContent {...props} />
    </Suspense>
  );
}
