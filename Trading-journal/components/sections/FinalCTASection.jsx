'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const FinalCTASection = ({ className = '' }) => {
  const previewRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // animate once
        }
      },
      { root: null, threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`relative w-full min-h-[752px] mt-5 ${className}`}>
      <div
        className="absolute inset-0 pointer-events-none z-5 -top-5"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(41, 52, 255, 0.15) 0%, transparent 40%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundSize: '100% 40%',
        }}
      />
      <div className="relative z-10 flex flex-col gap-[44px] justify-start items-center w-full max-w-[1204px] mx-auto px-4 sm:px-6 lg:px-8 pt-[67px]">
        {/* Section Header */}
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center mb-6">
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
                  WHAT YOU STILL WAITING FOR
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Grow now with Forenotes
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto tracking-tight">
            Unlock the power of AI to Trade smarter and grow Faster with our platform
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10 lg:mb-12 px-4">
          <a
            href="/dashboard"
            className="relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 cursor-pointer w-full max-w-[200px] sm:w-auto"
            style={{
              alignContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgb(41, 52, 255)',
              height: '44px',
              minWidth: '140px',
              borderRadius: '10px',
              boxShadow:
                'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
              display: 'flex',
              justifyContent: 'center',
              padding: '10px 18px',
              textDecoration: 'none',
              willChange: 'transform',
              WebkitFontSmoothing: 'antialiased',
              opacity: 1,
              position: 'relative',
              border: '1.6px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span
              className="text-white font-inter text-sm sm:text-base font-normal tracking-[-0.32px] whitespace-nowrap"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgb(255, 255, 255)',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              Get Started Now
            </span>
          </a>
        </div>

        {/* Product Preview with perspective and glow */}
        <div ref={previewRef} className="relative w-full h-[400px] -mt-[18px] overflow-hidden">
          {/* Requested overlay over the preview area */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(180deg,rgba(0,0,0,0) 55.00000000000001%, rgb(0, 0, 0) 100%)',
            }}
          />
          <div className="absolute inset-0 flex flex-row justify-center items-center translate-y-24 translate-x-12">
            <div
              className={`relative w-[96%] max-w-[1000px] scale-x-90 scale-y-110 transform-gpu will-change-transform transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              {/* Hard light background - wider and more prominent */}
              <div
                className="absolute -inset-12 rounded-[40px] blur-2xl opacity-100"
                style={{
                  background:
                    'radial-gradient(70% 60% at 50% 40%, rgba(255,255,255,0.25) 0%, rgba(200,220,255,0.15) 40%, rgba(0,0,0,0) 80%)',
                  transform:
                    'perspective(2785px) rotate(-11deg) rotateX(13deg) rotateY(9deg) skewX(16deg) skewY(1deg)',
                  transformOrigin: '50% 50% 0px',
                }}
              />

              {/* Soft glow background under the preview */}
              <div
                className="absolute -inset-8 blur-2xl opacity-100"
                style={{
                  background:
                    'radial-gradient(60% 50% at 50% 35%, rgba(41,52,255,0.30) 0%, rgba(138,165,255,0.18) 32%, rgba(0,0,0,0) 70%)',
                  transform:
                    'perspective(2785px) rotate(-11deg) rotateX(13deg) rotateY(9deg) skewX(16deg) skewY(1deg)',
                  transformOrigin: '50% 50% 0px',
                }}
              />

              {/* Perspective wrapper */}
              <div
                className="relative rounded-[24px] overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
                style={{
                  transform:
                    'perspective(2785px) rotate(-11deg) rotateX(13deg) rotateY(9deg) skewX(16deg) skewY(1deg)',
                  transformOrigin: '50% 50% 0px',
                }}
              >
                <Image
                  src="/images/dashboard.png"
                  alt="Product Preview"
                  width={1190}
                  height={722}
                  className="block w-full h-auto"
                  style={{ backfaceVisibility: 'hidden', objectFit: 'fill' }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[396px] bg-[linear-gradient(180deg,#00000000_0%,_#000000_100%)]"></div>
    </section>
  );
};

export default FinalCTASection;