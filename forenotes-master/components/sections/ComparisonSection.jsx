'use client';
import React from 'react';

// Inline SVG component for the 'Check' icon
const CheckIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Inline SVG component for the 'X' icon
const XIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Inline SVG component for the 'Layers' icon
const LayersIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);


const ComparisonSection = ({ className = '' }) => {
  const forenotesBenefits = [
    'Effortless & Fast Trading',
    'Highly scalable & flexible',
    'Advanced dashboard control',
    'Built-in AI-driven analytics',
    'User-friendly & intuitive design',
  ];

  const othersPlatforms = [
    'Tiresome',
    'Rigid and non-scalable',
    'Basic dashboard functionalities',
    'Lack of advanced analytics',
    'Outdated and complex interfaces',
  ];

  return (
    <section
      className={`relative w-full bg-black py-8 pb-20 ${className}`}
      style={{
        borderBottom: '1px solid transparent',
        borderImage:
          'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 25%, rgb(46, 55, 85) 50%, rgb(0, 0, 0) 75%, rgb(0, 0, 0) 100%) 1',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/30 to-transparent" />

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
                  COMPARISON
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Why Forenotes Stands Out
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto tracking-tight">
            See how we compare against others in performance, growth
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Forenotes Column */}
          <div className="flex flex-col items-center gap-4 h-full">
            {/* Heading outside card: logo and text in one line */}
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Forenotes logo" className="h-9 w-auto" />
              <span className="text-white text-xl font-semibold px-1">Forenotes</span>
            </div>
            {/* Card */}
            <div
              className="relative w-full backdrop-blur-sm p-8 z-10"
              style={{
                border: '1px solid transparent',
                background:
                  'radial-gradient(96% 96% at 50% 7.5%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%) padding-box, radial-gradient(96% 96% at 48.8% -35.7%, rgb(138, 165, 255) 0%, rgb(0, 0, 0) 100%) border-box',
                borderRadius: '16px',
              }}
            >
              {/* Benefits List with dividers */}
              <div className="divide-y divide-gray-800/60">
                {forenotesBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-green-400" />
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Others Column */}
          <div className="flex flex-col items-center gap-4 h-full">
            {/* Heading outside card: icon + text centered */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700/50 border border-gray-600/50 rounded-md flex items-center justify-center">
                <LayersIcon className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white">Others</h3>
            </div>
            {/* Card */}
            <div
              className="relative w-full backdrop-blur-sm p-8 z-10"
              style={{
                border: '1px solid transparent',
                background:
                  'radial-gradient(96% 96% at 50% 7.5%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%) padding-box, radial-gradient(96% 96% at 48.8% -35.7%, rgb(138, 165, 255) 0%, rgb(0, 0, 0) 100%) border-box',
                borderRadius: '16px',
              }}
            >
              {/* Drawbacks List with dividers */}
              <div className="divide-y divide-gray-800/60">
                {othersPlatforms.map((drawback, index) => (
                  <div key={index} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center">
                        <XIcon className="w-3 h-3 text-red-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 leading-relaxed">{drawback}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
    </section>
  );
};

export default ComparisonSection;