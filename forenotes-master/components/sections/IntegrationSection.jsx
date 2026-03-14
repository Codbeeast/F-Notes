'use client';
import React, { useState, useEffect } from 'react';
import { Brain, Network, Lightbulb, Settings } from 'lucide-react';

const IntegrationSection = ({ className = '' }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const integrationFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Connect with Self-Awareness',
      description: 'Understand your habits, emotions & thought patterns that influence trades.',
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'Connect with Psychology Models',
      description: 'Leverage proven psychological frameworks like NLP & emotional journaling.',
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Connect with Your Emotional Data',
      description: 'Track stress, excitement, fear, and confidence during each trading session.',
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Connect with Automation & Reminders',
      description:
        'Set routines, reflection checkpoints & trigger-based nudges to stay disciplined.',
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <section className={`relative w-full bg-black py-6 pb-16 mt-8 sm:mt-12 lg:mt-16 ${className}`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />

      <div
        className="absolute inset-0 pointer-events-none z-5 -top-5"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          // Horizontally stretched (width %, auto height). Adjust % to taste.
          backgroundSize: '100% 30%',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
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
                  INTEGRATIONS
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Master Your Mind, Master The Markets
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto tracking-tight">
            Integrate powerful tools to build unshakable trading psychology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 mb-16">
          {integrationFeatures.map((feature, index) => {
            return (
              <div
                key={index}
                className="px-8 py-24 flex flex-col items-center justify-center text-center relative"
                style={{
                  position: 'relative',
                }}
              >
                {/* Gradient borders using absolutely positioned divs */}
                {index === 0 && (
                  <>
                    <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-black to-gray-600" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-black to-gray-600" />
                  </>
                )}
                {index === 1 && (
                  <>
                    <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-black to-gray-600" />
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-black to-gray-600" />
                  </>
                )}
                {index === 2 && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-black to-gray-600" />
                    <div className="absolute right-0 bottom-0 w-px h-full bg-gradient-to-t from-black to-gray-600" />
                  </>
                )}
                {index === 3 && (
                  <>
                    <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-black to-gray-600" />
                    <div className="absolute left-0 bottom-0 w-px h-full bg-gradient-to-t from-black to-gray-600" />
                  </>
                )}
                {/* Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div
                      className="p-3 text-blue-400"
                      style={{
                        borderRadius: '8px',
                        boxShadow:
                          'rgba(0,0,0,0.17) 0px 0.764039px 0.687635px -0.5px, rgba(0,0,0,0.17) 0px 1.87166px 1.68449px -1px, rgba(0,0,0,0.17) 0px 3.54652px 3.19187px -1.5px, rgba(0,0,0,0.16) 0px 6.19129px 5.57216px -2px, rgba(0,0,0,0.15) 0px 10.7756px 9.69802px -2.5px, rgba(0,0,0,0.12) 0px 19.7367px 17.7631px -3px, rgba(0,0,0,0.08) 0px 39px 35.1px -3.5px, rgba(138,165,255,0.5) 0px 2px 4px 0px inset',
                      }}
                    >
                      {feature.icon}
                    </div>
                    <div
                      className="absolute inset-0 rounded-xl blur-lg"
                      style={{
                        borderRadius: '8px',
                        background:
                          'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="max-w-xs">
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}

          {/* Central animated logo at grid intersection */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ top: '50%', transform: 'translateY(-47%)' }}
          >
            <div className="relative">
              {/* Pulsing rings - symmetric outward growth smallest first */}
              <div className="relative flex items-center justify-center">
                {/* Smallest ring (fires first) */}
                <div className="absolute animate-smooth-pulse-1">
                  <div className="w-14 h-14 rounded-full bg-blue-300/15" />
                </div>
                {/* Next ring */}
                <div className="absolute animate-smooth-pulse-2">
                  <div className="w-20 h-20 rounded-full bg-blue-400/15" />
                </div>
                {/* Next ring */}
                <div className="absolute animate-smooth-pulse-3">
                  <div className="w-28 h-28 rounded-full bg-purple-500/15" />
                </div>
                {/* Largest ring (last) */}
                <div className="absolute animate-smooth-pulse-4">
                  <div className="w-32 h-32 rounded-full bg-blue-500/15" />
                </div>

                {/* Center logo with smaller black background */}
                <div className="relative w-14 h-14 rounded-full bg-black flex items-center justify-center shadow-lg shadow-black/40">
                  <img
                    src="/logo.jpg"
                    alt="Forenotes Logo"
                    width="38"
                    height="38"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            {/* Decorative connection lines */}
            <path
              d="M200 200 Q 600 100 1000 200"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              className="opacity-30"
            />
            <path
              d="M200 600 Q 600 700 1000 600"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="none"
              className="opacity-30"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-auto h-auto pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/bottom-gradient.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom center',
          backgroundSize: 'auto',
          minHeight: '200px',
          minWidth: '100%',
        }}
      />

      {/* Custom CSS for animations */}
      <style>{`
        @-webkit-keyframes smooth-pulse-integration {
          0% {
            -webkit-transform: scale(1) translateZ(0);
            transform: scale(1) translateZ(0);
            opacity: 0.7;
          }
          100% {
            -webkit-transform: scale(2.5) translateZ(0);
            transform: scale(2.5) translateZ(0);
            opacity: 0;
          }
        }
        @keyframes smooth-pulse-integration {
          0% {
            -webkit-transform: scale(1) translateZ(0);
            transform: scale(1) translateZ(0);
            opacity: 0.7;
          }
          100% {
            -webkit-transform: scale(2.5) translateZ(0);
            transform: scale(2.5) translateZ(0);
            opacity: 0;
          }
        }
        
        .animate-smooth-pulse-1, .animate-smooth-pulse-2, .animate-smooth-pulse-3, .animate-smooth-pulse-4 {
          will-change: transform, opacity;
          /* Promote the element to its own layer to force GPU rendering */
          transform: translateZ(0);
        }

        .animate-smooth-pulse-1 {
          -webkit-animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-smooth-pulse-2 {
          -webkit-animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          -webkit-animation-delay: 0.5s;
          animation-delay: 0.5s;
        }
        
        .animate-smooth-pulse-3 {
          -webkit-animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          -webkit-animation-delay: 1s;
          animation-delay: 1s;
        }
        
        .animate-smooth-pulse-4 {
          -webkit-animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation: smooth-pulse-integration 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          -webkit-animation-delay: 1.5s;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
};

export default IntegrationSection;