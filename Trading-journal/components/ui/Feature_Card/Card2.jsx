'use client';
import React from 'react';
import Image from 'next/image';

const Card2 = ({ title, description }) => {
  return (
    <div className="relative w-full h-full">
      {/* Border gradient effect with transparent bottom */}
      <div
        className="absolute inset-0 rounded-[16px]"
        style={{
          background: `linear-gradient(135deg, #b8c5ff 0%, #b8c5ff 30%, transparent 50%, transparent 100%)`,
          padding: '1px',
        }}
      >
        {/* Inner card content */}
        <div
          className="relative flex flex-col justify-start items-start p-3 sm:p-4 lg:p-[20px] rounded-[16px] overflow-hidden w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(96% 96% at 50% 7.5%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
          }}
        >
          {/* Text Content Section */}
          <div className="flex flex-col items-start w-full mb-3">
            {/* Headline */}
            <h2 
              className="text-white font-bold leading-tight mb-1 z-10 text-lg sm:text-xl lg:text-2xl"
              style={{
                fontFamily: '"Inter", "Inter Placeholder", sans-serif',
              }}
            >
              {title || 'Visualize Your Trading Journey'}
            </h2>
            
            {/* Description */}
            <p 
              className="leading-relaxed z-10 text-sm sm:text-base"
              style={{
                fontFamily: '"Inter", sans-serif',
                color: '#E6ECFFB3',
                lineHeight: '1.4',
              }}
            >
              {description || 'Monitor daily performance through a dynamic metrics dashboard to uncover successful strategies and refine your trading approache.'}
            </p>
          </div>
          
          {/* Image Section */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0 relative" style={{ minHeight: '200px' }}>
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Floating orbs */}
              <div 
                className="absolute w-12 h-12 rounded-full opacity-10 animate-pulse"
                style={{
                  background: 'radial-gradient(circle, #b8c5ff 0%, transparent 70%)',
                  top: '10%',
                  right: '15%',
                  animationDelay: '0s',
                  animationDuration: '3s',
                }}
              />
              <div 
                className="absolute w-8 h-8 rounded-full opacity-15 animate-pulse"
                style={{
                  background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)',
                  bottom: '20%',
                  left: '10%',
                  animationDelay: '1.5s',
                  animationDuration: '4s',
                }}
              />
            </div>

            {/* Image with enhanced styling */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Glow effect behind image */}
              <div 
                className="absolute inset-0 opacity-25 blur-2xl"
                style={{
                  background: 'radial-gradient(ellipse at center, #4F46E5 0%, #8B5CF6 30%, transparent 70%)',
                }}
              />
              
              {/* Main image container */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image
                  src="/images/image_2.png"
                  alt="Trading Performance Visualization"
                  width={400}
                  height={300}
                  className="object-contain rounded-lg shadow-2xl transform transition-transform duration-500 hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 25px 50px rgba(79, 70, 229, 0.4)) brightness(1.1) contrast(1.1)',
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </div>
              
              {/* Animated shimmer effect */}
              <div 
                className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(184, 197, 255, 0.1) 50%, transparent 70%)',
                  animation: 'shimmer 6s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional overlay to ensure bottom blends with background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[20px] rounded-b-[16px]"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #000000 80%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </div>
  );
};

export default Card2;
