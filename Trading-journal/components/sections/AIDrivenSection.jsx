'use client';
import React from 'react';
import { RefreshCw, Shield, TrendingUp, BarChart3, Users, CheckCircle } from 'lucide-react';
import RadarComponent from '../ui/RadarComponent';

const AIDrivenSection = ({ className = '' }) => {

  const mainFeatures = [
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Effortless Integration',
      description:
        'Your data is synced in real-time across devices, ensuring you stay connected and informed.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Scalable',
      description:
        'Enterprise-grade encryption protects your information, while flexible tools adapt to your needs.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Actionable Insights',
      description:
        'Leverage AI-powered analytics to identify trends, predict outcomes, and optimize your trading effortlessly.',
    },
  ];

  const bottomFeatures = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Smart Analytics',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Leaderboard Motivation',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Fast trading',
    },
  ];

  // Reusable icon container mimicking BenefitCard decorative gradients
  const IconContainer = ({ size = 'lg', children }) => {
    const dim = size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
    const innerPad = size === 'lg' ? 'p-2.5' : 'p-2';
    const iconColor = 'text-[#8AA5FF]';
    return (
      <div className={`relative ${dim}`}>
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: 'linear-gradient(303deg, rgb(41, 52, 255) 0%, rgba(171, 171, 171, 0) 25%)',
          }}
        />
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: 'linear-gradient(140deg, rgb(41, 52, 255) -4%, rgba(0, 0, 0, 0) 25%)',
          }}
        />
        <div className="relative z-10 w-full h-full flex justify-center items-center p-[2px] rounded-md overflow-hidden">
          <div
            className={`w-full h-full bg-black rounded-md flex items-center justify-center ${innerPad} ${iconColor}`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`relative w-full bg-black py-6 overflow-hidden ${className}`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

      {/* Animated background rays */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-32 bg-gradient-to-t from-transparent via-blue-500/20 to-transparent"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: '50% 200px',
                animation: `spin 20s linear infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Section background image overlay (centered, not stretched) */}
      <div
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundSize: 'auto',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Radar positioned above bottom decorative gradient */}
        <div className="relative z-[2]">
          <RadarComponent />
        </div>

        {/* Header layered above radar */}
        <div className="relative z-10 text-center mb-16 pt-52 md:pt-64 lg:pt-72">
          {/* Badge */}
          <div className="inline-flex items-center mb-5 md:mb-6">
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
                  AI DRIVEN EFFICIENCY
                </span>
              </div>
            </div>
          </div>

          {/* Title (reduced size) */}
          <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Never Miss an Opportunity
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto tracking-tight">
            Capture Trades, Analyze Trends, Centralize Insights.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-8"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'transparent',
                borderImageSource:
                  'radial-gradient(96% 96% at 48.8% -35.7%, var(--token-6da9d50d-e927-4dcf-93ed-bf3b8039528b, rgb(138, 165, 255)) 0%, var(--token-6d7bfc0f-867f-43f5-837b-f61a13bf9490, rgb(0, 0, 0)) 100%)',
                borderImageSlice: 1,
                borderRadius: '16px',
              }}
            >
              {/* Icon using BenefitCard container styling */}
              <div className="mb-6">
                <IconContainer size="lg">{feature.icon}</IconContainer>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>

              {/* Removed hover overlay */}
            </div>
          ))}
        </div>

        {/* Bottom Features Row */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 mb-16">
          {bottomFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div>
                <IconContainer size="sm">{feature.icon}</IconContainer>
              </div>
              <span className="text-gray-300 font-medium">{feature.title}</span>
            </div>
          ))}
        </div>

        {/* Background decoration */}
        {/* <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-blue-950/20 to-transparent" /> */}
      </div>
      {/* Bottom decorative gradient pushed back & softened */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden">
        <div
          className="w-full h-[260px] relative"
          style={{
            backgroundImage: "url('/images/bottom-gradient.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom center',
            backgroundSize: 'cover',
            filter: 'blur(2px)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 88%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 88%)',
            opacity: 0.7,
          }}
        />
        {/* Additional subtle top fade to remove harsh edge */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black via-black/80 to-transparent" />
      </div>
    </section>
  );
};

export default AIDrivenSection;
