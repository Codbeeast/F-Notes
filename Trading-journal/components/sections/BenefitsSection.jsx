'use client';
import React from 'react';
import Image from 'next/image';
import BenefitCard from '@/components/ui/BenefitCard';
import FeatureMarquee from '@/components/ui/BenefitMarquee';
import LightRays from '@/components/ui/LightRays';

const BenefitsSection = ({ className = '' }) => {
  const benefits = [
    {
      title: 'Unbeatable Value',
      description: 'All-in-one features at a fraction of the cost of other platforms.',
      icon: {
        paths: [
          'M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z',
        ],
        alt: 'Value',
      },
    },
    {
      title: 'Fully Customizable:',
      description:
        'Journal multiple strategies with filters, tags, and a dashboard built your way.',
      icon: {
        paths: [
          'M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2 1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93 0-1.1-.9-2-2-2z',
          'M15 9l.94-2.07L18 6l-2.06-.93L15 3l-.92 2.07L12 6l2.08.93zM3.5 11L4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9z',
        ],
        alt: 'Customizable',
      },
    },
    {
      title: 'Smart AI Insights',
      description:
        'Get personalized analysis to improve your edge and understand your trading behavior.',
      icon: {
        paths: ['M6.23 20.23L8 22l10-10L8 2 6.23 3.77 14.46 12z'],
        alt: 'AI Insights',
      },
    },
    {
      title: 'Earn for Consistency',
      description: 'Get paid for journaling daily your discipline deserves rewards.',
      icon: {
        paths: [
          'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z',
        ],
        alt: 'Consistency',
      },
    },
    {
      title: 'Minimalist & Easy',
      description: 'Clean, intuitive design that works for both beginners and pros.',
      icon: {
        paths: [
          'M9,2V8H7V2H9M17,2V4H15V2H17M12,4.5A7.5,7.5 0 0,1 19.5,12H17.5A5.5,5.5 0 0,0 12,6.5V4.5M12,6.5A5.5,5.5 0 0,1 17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5M12,8.5A3.5,3.5 0 0,0 8.5,12A3.5,3.5 0 0,0 12,15.5A3.5,3.5 0 0,0 15.5,12A3.5,3.5 0 0,0 12,8.5Z',
        ],
        alt: 'Minimalist',
      },
    },
    {
      title: 'Dedicated Support',
      description:
        'Access expert assistance 24/7 to ensure you are never alone on your growth journey.',
      icon: {
        paths: [
          'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z',
        ],
        alt: 'Support',
      },
    },
  ];

  return (
    <section id="benefits" className={`relative w-full min-h-screen lg:min-h-[1174px] ${className}`}>
      {/* Background Images */}
      <Image
        src="/images/img_bg_shape.png"
        alt=""
        width={884}
        height={332}
        className="absolute top-[400px] sm:top-[500px] lg:top-[665px] left-1/2 transform -translate-x-1/2 w-[70%] sm:w-[60%] lg:w-[46%] rounded-[10px] opacity-80 lg:opacity-100"
      />
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

      <div className="relative z-10 flex flex-col gap-6 sm:gap-8 lg:gap-[44px] justify-start items-center w-full max-w-[1204px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-[99px]">
        {/* Styled Benefits Button */}
        <div className="flex flex-col items-center gap-6">
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
                BENEFITS
              </span>
            </div>
          </div>

          {/* Additional Text */}
          <div className="text-center px-4">
            <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-sm sm:text-base md:text-lg font-inter font-normal text-gray-400 leading-relaxed max-w-md sm:max-w-lg mx-auto">
              Innovative AI for trading, powerful insights for profit.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-[1200px] justify-items-center px-2 sm:px-0">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>

        {/* Feature Marquee */}
        <FeatureMarquee className="mt-12 sm:mt-16 lg:mt-[88px]" />
      </div>
    </section>
  );
};

export default BenefitsSection;