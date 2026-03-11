'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TestimonialCard from '@/components/ui/TestimonialCard';
import LightRays from '@/components/ui/LightRays';

const TestimonialsSection = ({ className = '' }) => {
  const testimonials = [
    {
      quote: 'I’ve been using ForeNotes for a month it’s super easy, and the AI assistant helps me spot mistakes and improve my trading much faster.',
      rating: 5.0,
      user: {
        name: 'Shivam',
        title: 'Trader',
        avatar: '/Testimonial/Shivam.png',
      },
    },
    {
      quote: 'Great journal tool to review your progress and fasten your journey as a trader.Best thing about this one is your persosal Ai assistant loved it',
      rating: 5.0,
      user: {
        name: 'Ayush',
        title: 'Trader',
        avatar: '/Testimonial/Ayush.png',
      },
    },
    {
      quote: 'Forenotes helping me to track my records of trades flawlessly and made me a tough disciplined guy and result is quite impressive in positive way.',
      rating: 4.9,
      user: {
        name: 'Choin',
        title: 'Day Trader',
        avatar: '/Testimonial/Choin.png',
      },
    },
    {
      quote: 'This trading journal eliminated the mess that used to stop me from journaling. Now my trading is organized and I see patterns and decisions with clarity.',
      rating: 5.0,
      user: {
        name: 'Zainul',
        title: 'Swing Trader',
        avatar: '/Testimonial/Zainul.png',
      },
    },
    {
      quote: 'Clean and easy to use platform that helps me stay organized and consistent with my trading. It’s been a game changer for tracking.',
      rating: 4.8,
      user: {
        name: 'Abdul',
        title: 'SB Growth',
        avatar: '/Testimonial/Abdul.png',
      },
    },
    {
      quote: 'Forenotes has brought clarity and consistency to my trading journey. While The Ai assistant has been a game changer.',
      rating: 5.0,
      user: {
        name: 'Amir',
        title: 'Options Trader',
        avatar: '/Testimonial/Amir.png',
      },
    },
  ];

  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
    >
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

      <div className="relative z-10 flex flex-col justify-start items-center w-full pt-10 pb-20">

        {/* Section Header */}
        <div className="flex flex-col items-center w-full max-w-4xl px-4 sm:px-8 mb-12 text-center">
          <div className="relative inline-block mb-6">
            {/* Gradient Border */}
            <div
              className="absolute inset-0 rounded-[22px] p-[1px]"
              style={{
                background: 'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                pointerEvents: 'none',
              }}
            ></div>

            {/* Button Content */}
            <div className="relative bg-black rounded-[22px] px-5 py-2">
              <span
                className="inline-block font-semibold text-sm tracking-wide bg-gradient-to-r from-[rgb(138,165,255)] to-[rgb(133,77,255)] bg-clip-text text-transparent"
              >
                WALL OF LOVE
              </span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Loved by Traders
          </h2>

          <p className="text-gray-400 text-lg">
            Here’s what people worldwide are saying about us
          </p>
        </div>

        {/* Marquee Container */}
        <div
          className="w-full relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Gradient Masks for fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

          {/* Scrolling Content */}
          <div className="flex overflow-hidden mt-4">
            <motion.div
              className="flex gap-6 flex-nowrap"
              animate={{
                x: ["0%", "-50%"]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              style={{
                width: "fit-content",
              }}
            >
              {/* Render duplicate sets */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={index} className="w-[320px] sm:w-[380px] flex-shrink-0">
                  <TestimonialCard
                    quote={testimonial.quote}
                    rating={testimonial.rating}
                    user={testimonial.user}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* HR Separator */}
        <hr className="w-full max-w-[800px] border-t border-gray-800 mt-20 opacity-50" />
      </div>
    </section>
  );
};

export default TestimonialsSection;